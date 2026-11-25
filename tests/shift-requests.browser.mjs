// Run with node --test tests/shift-requests.browser.mjs. Requires Playwright;
// PLAYWRIGHT_MODULE may point to an existing installation's index.mjs.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import {
  localDate,
  requestPayload,
  validateRequest,
} from "../src/modules/schedule/utils/shiftRequest.utils.js";

let browser;
let server;
let origin;
const day = (offset) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return localDate(value);
};
const staff = {
  employeeId: 101,
  userId: 101,
  role: "CASHIER",
  storeId: 3,
  fullName: "Nhân viên thử nghiệm",
};
const manager = {
  employeeId: 301,
  userId: 301,
  role: "STORE_MANAGER",
  storeId: 3,
  fullName: "Quản lý thử nghiệm",
};
const shift = {
  assignmentId: 11,
  storeId: 3,
  workDate: day(1),
  date: day(1),
  shiftName: "Ca Sáng",
  startTime: "08:00",
  endTime: "12:00",
};
const request = (id, extra = {}) => ({
  swapRequestId: id,
  requestType: "SWAP",
  requesterEmployeeId: 101,
  targetEmployeeId: 201,
  requesterName: "Người gửi",
  targetName: "Đồng nghiệp",
  requesterShiftName: "Ca Sáng",
  requesterWorkDate: day(1),
  requesterTimeRange: "08:00 - 12:00",
  targetShiftName: "Ca Chiều",
  targetWorkDate: day(2),
  targetTimeRange: "13:00 - 17:00",
  reason: "Có việc cá nhân",
  createdAt: new Date().toISOString(),
  status: "PENDING",
  ...extra,
});

before(async () => {
  const playwright = process.env.PLAYWRIGHT_MODULE
    ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
    : await import("playwright");
  server = await createServer({
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "error",
  });
  await server.listen();
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await playwright.chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });
});
after(async () => {
  await browser?.close();
  await server?.close();
});

async function fixture({
  user = staff,
  options = {},
  scenario = "",
  myRequests,
  storeRequests,
} = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const state = {
    calls: [],
    initiators: [],
    created: [],
    failCreate: false,
    failHistory: false,
    failReview: false,
    delayColleague: 0,
    delayCreate: 0,
    myRequests: myRequests || [
      request(1),
      request(2, {
        requesterEmployeeId: 201,
        targetEmployeeId: 101,
        status: "PENDING_PEER",
      }),
    ],
    storeRequests: storeRequests || [request(1)],
  };
  const devtools = await context.newCDPSession(page);
  await devtools.send("Debugger.enable");
  await devtools.send("Debugger.setAsyncCallStackDepth", { maxDepth: 32 });
  await devtools.send("Network.enable");
  devtools.on("Network.requestWillBeSent", (event) => {
    if (!event.request.url.includes("/api/")) return;
    const frames = [];
    let stack = event.initiator.stack;
    while (stack) {
      frames.push(...stack.callFrames);
      stack = stack.parent;
    }
    state.initiators.push({
      url: event.request.url,
      method: event.request.method,
      frames,
    });
  });
  await context.addInitScript(
    ({ user, options }) => {
      localStorage.setItem("user", JSON.stringify(user));
      window.testOptions = options;
    },
    { user, options },
  );
  await page.route("**/api/**", async (route) => {
    const incoming = route.request();
    const url = new URL(incoming.url());
    const method = incoming.method();
    const body = incoming.postDataJSON();
    state.calls.push({
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      method,
      body,
    });
    let data = [];
    let status = 200;
    let message;
    if (url.pathname.endsWith("/Auth/me")) data = user;
    else if (url.pathname.endsWith("/my-shifts"))
      data = [
        shift,
        { ...shift, assignmentId: 12, storeId: 7, workDate: day(2) },
        { ...shift, assignmentId: 13, status: "CANCELLED" },
      ];
    else if (url.pathname.endsWith("/my-swap-requests")) {
      data = state.myRequests;
      if (state.failHistory) {
        status = 500;
        message = "Không tải được lịch sử thử nghiệm";
      }
    } else if (/\/colleagues\/\d+$/.test(url.pathname)) {
      data = [
        { employeeId: 201, fullName: "Đồng nghiệp A", roleName: "Thu ngân" },
        { employeeId: 202, fullName: "Đồng nghiệp B", roleName: "Thu ngân" },
      ];
    } else if (/\/colleague-shifts\/\d+$/.test(url.pathname)) {
      const employee = Number(url.pathname.split("/").at(-1));
      if (employee === 201 && state.delayColleague)
        await new Promise((resolve) =>
          setTimeout(resolve, state.delayColleague),
        );
      data = [
        {
          assignmentId: employee + 100,
          workDate: day(2),
          shiftName: `Ca ${employee}`,
          timeRange: "13:00 - 17:00",
        },
      ];
    } else if (/\/swap-requests\/\d+$/.test(url.pathname))
      data = state.storeRequests;
    else if (url.pathname.endsWith("/swap-request") && method === "POST") {
      state.created.push(body);
      if (state.delayCreate)
        await new Promise((resolve) => setTimeout(resolve, state.delayCreate));
      if (state.failCreate) {
        status = 400;
        message = "Ca trực này đang có đơn chờ xử lý.";
      } else {
        data = request(99, { requestType: body.requestType });
        state.myRequests.push(data);
      }
    } else if (url.pathname.endsWith("/swap-peer-review")) {
      const item = state.myRequests.find(
        (entry) => entry.swapRequestId === body.swapRequestId,
      );
      item.status = body.isAccepted ? "PENDING" : "REJECTED";
      data = true;
    } else if (/\/swap-cancel\/\d+$/.test(url.pathname)) {
      state.myRequests.find(
        (entry) =>
          entry.swapRequestId === Number(url.pathname.split("/").at(-1)),
      ).status = "CANCELLED";
      data = true;
    } else if (url.pathname.endsWith("/swap-review")) {
      if (state.failReview) {
        status = 400;
        message = "Lịch đã thay đổi, không thể duyệt.";
      } else
        state.storeRequests.find(
          (entry) => entry.swapRequestId === body.swapRequestId,
        ).status = body.isApproved ? "APPROVED" : "REJECTED";
      data = true;
    }
    await route.fulfill({
      status,
      json: { success: status === 200, message, data },
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, X-RWFM-Request",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  });
  await page.goto(
    scenario === "app"
      ? `${origin}/employee/shift-requests`
      : `${origin}/tests/shift-requests.html?scenario=${scenario}`,
  );
  if (!scenario)
    await page.waitForFunction(
      () => window.requestModel && window.setTestOptions,
    );
  return {
    page,
    state,
    async close() {
      await context.close();
      assert.deepEqual(errors, []);
    },
  };
}

async function waitModel(page, predicate) {
  await page.waitForFunction(predicate);
}

test("request views do not import services or perform filtering and pagination", async () => {
  const views = [
    "src/modules/schedule/pages/ShiftRequestsPage/index.jsx",
    "src/modules/schedule/components/ShiftRequestsWorkspace/index.jsx",
    "src/modules/schedule/components/ShiftRequestForm/index.jsx",
    "src/modules/schedule/components/MySwapRequestList/index.jsx",
    "src/modules/schedule/components/StoreSwapRequestReview/index.jsx",
    "src/modules/schedule/components/ShiftRequestStats/index.jsx",
    "src/modules/schedule/components/ShiftSwapModal.jsx",
    "src/modules/schedule/components/MySwapRequestsModal.jsx",
    "src/modules/schedule/components/ShiftSwapReviewModal.jsx",
  ];
  for (const file of views) {
    const source = await readFile(
      new URL("../" + file, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /from\s+['"][^'"]*(?:services\/|axios)|\bfetch\s*\(/,
      file,
    );
    assert.doesNotMatch(
      source,
      /\.(?:filter|slice)\s*\(|Math\.ceil\s*\(/,
      file,
    );
    assert.doesNotMatch(
      source,
      /\bmodel\s*=|\{\.\.\.(?:model|requests)\}/,
      file,
    );
  }
});

test("real page restores authentication and filters/paginates locally through hook handlers", async () => {
  const entries = Array.from({ length: 12 }, (_, i) =>
    request(i + 1, {
      requesterName: i === 0 ? "Nhân viên cần tìm" : `Nhân viên ${i + 1}`,
      status: i === 11 ? "APPROVED" : "PENDING",
    }),
  );
  const f = await fixture({
    user: manager,
    scenario: "app",
    storeRequests: entries,
  });
  await f.page
    .getByText("Phê Duyệt Đơn Xin Nghỉ & Đổi Ca Chi Nhánh", { exact: true })
    .waitFor();
  await f.page.getByText("#SR-0001", { exact: true }).waitFor();
  const count = f.state.calls.filter((entry) =>
    entry.path.includes("/shifts/"),
  ).length;
  await f.page.getByRole("button", { name: "Trang tiếp" }).click();
  await f.page.getByText("#SR-0011", { exact: true }).waitFor();
  await f.page.getByRole("button", { name: /^Đã Phê Duyệt/ }).click();
  await f.page.getByText("#SR-0012", { exact: true }).waitFor();
  assert.equal(await f.page.getByText("#SR-0011", { exact: true }).count(), 0);
  await f.page.getByRole("button", { name: /^Tất Cả/ }).click();
  await f.page
    .getByPlaceholder("Tìm nhân viên, ca làm, lý do...")
    .fill("Nhân viên cần tìm");
  await f.page.getByText("#SR-0001", { exact: true }).waitFor();
  assert.equal(await f.page.getByRole("row").count(), 2);
  assert.equal(
    f.state.calls.filter((entry) => entry.path.includes("/shifts/")).length,
    count,
  );
  const initiator = f.state.initiators.find((entry) =>
    entry.url.includes("/swap-requests/"),
  );
  assert.ok(
    initiator?.frames.some(
      (frame) =>
        frame.functionName === "fetchStoreRequests" &&
        frame.url.includes("useShiftRequests.js"),
    ),
    "Network stack must include the named hook fetch",
  );
  assert.ok(f.state.calls.some((entry) => entry.path.endsWith("/Auth/me")));
  if (process.env.SHIFT_REQUESTS_SCREENSHOT_PATH)
    await f.page.screenshot({
      path: process.env.SHIFT_REQUESTS_SCREENSHOT_PATH,
      fullPage: true,
    });
  await f.close();
});

test("real employee page sends SWAP through named hook action and refreshes history", async () => {
  const f = await fixture({ scenario: "app" });
  await f.page
    .getByLabel("Chọn ca trực của bạn cần điều chỉnh (*)")
    .selectOption("11");
  await f.page.getByRole("button", { name: /Đổi Ca Cho Đồng Nghiệp/ }).click();
  const colleague = f.page.getByLabel("Chọn đồng nghiệp cùng chi nhánh (*)");
  await colleague.selectOption("202");
  await f.page
    .getByLabel("Chọn ca trực của đồng nghiệp để đổi (*)")
    .selectOption("302");
  await f.page.getByRole("button", { name: "Gửi Đơn Yêu Cầu" }).click();
  await f.page.locator(".toast--success").waitFor();
  assert.deepEqual(f.state.created[0], {
    requestType: "SWAP",
    assignmentId: 11,
    targetEmployeeId: 202,
    targetAssignmentId: 302,
    reason: "",
  });
  const initiator = f.state.initiators.find(
    (entry) =>
      entry.method === "POST" &&
      /\/swap-request$/.test(new URL(entry.url).pathname),
  );
  assert.ok(
    initiator?.frames.some(
      (frame) =>
        frame.functionName === "submitRequest" &&
        frame.url.includes("useShiftRequests.js"),
    ),
    "Network stack must include submitRequest: " +
      JSON.stringify(
        initiator?.frames.map(({ functionName, url }) => ({
          functionName,
          url,
        })),
      ),
  );
  await f.page.getByRole("button", { name: /Lịch Sử Đơn Của Tôi/ }).click();
  await f.page.getByRole("button", { name: /Đơn Cần Tôi Duyệt/ }).waitFor();
  await f.close();
});

test("selecting the current request type or colleague again does not clear valid lookup data", async () => {
  const f = await fixture({ options: { mode: "create", shift } });
  await f.page.evaluate(() => window.requestModel.setRequestType("SWAP"));
  await waitModel(f.page, () => window.requestModel.colleagues.length === 2);
  await f.page.evaluate(() =>
    window.requestModel.setSelectedColleagueId("202"),
  );
  await waitModel(
    f.page,
    () => window.requestModel.colleagueShifts.length === 1,
  );
  await f.page.evaluate(() => {
    window.requestModel.setRequestType("SWAP");
    window.requestModel.setSelectedColleagueId("202");
  });
  await waitModel(
    f.page,
    () =>
      window.requestModel.colleagues.length === 2 &&
      window.requestModel.colleagueShifts.length === 1,
  );
  await f.close();
});

test("LEAVE clears stale target payload and validates local date boundaries", () => {
  const form = {
    requestType: "LEAVE",
    assignmentId: "11",
    targetEmployeeId: "201",
    targetAssignmentId: "301",
    reason: " Nghỉ ",
  };
  assert.deepEqual(requestPayload(form), {
    requestType: "LEAVE",
    assignmentId: 11,
    targetEmployeeId: null,
    targetAssignmentId: null,
    reason: "Nghỉ",
  });
  assert.deepEqual(validateRequest(form, shift, day(0)), {});
  assert.ok(
    validateRequest(form, { ...shift, workDate: day(0) }, day(0)).assignmentId,
  );
});

test("closed create modal fetches nothing; opening loads only required colleagues and swaps", async () => {
  const f = await fixture({
    options: { mode: "create", enabled: false, shift },
  });
  assert.equal(f.state.calls.length, 0);
  await f.page.evaluate(() =>
    window.setTestOptions((previous) => ({ ...previous, enabled: true })),
  );
  await f.page.evaluate(() => window.requestModel.setRequestType("SWAP"));
  await waitModel(f.page, () => window.requestModel.colleagues.length === 2);
  const call = f.state.calls.find((entry) =>
    entry.path.endsWith("/colleagues/3"),
  );
  assert.equal(call.query.workDate, day(1));
  assert.ok(
    f.state.calls.every(
      (entry) => !/my-shifts|my-swap-requests|swap-requests/.test(entry.path),
    ),
  );
  await f.close();
});

test("frontend validation does not submit and backend failure preserves form", async () => {
  const f = await fixture({ options: { mode: "create", shift } });
  const invalid = await f.page.evaluate(() =>
    window.requestModel.submitRequest(),
  );
  assert.equal(invalid.success, false);
  assert.equal(f.state.created.length, 0);
  await f.page.evaluate(() =>
    window.requestModel.setReason("Giữ nội dung này"),
  );
  await waitModel(
    f.page,
    () => window.requestModel.reason === "Giữ nội dung này",
  );
  f.state.failCreate = true;
  const failure = await f.page.evaluate(() =>
    window.requestModel.submitRequest(),
  );
  assert.equal(failure.message, "Ca trực này đang có đơn chờ xử lý.");
  assert.equal(
    await f.page.evaluate(() => window.requestModel.reason),
    "Giữ nội dung này",
  );
  f.state.failCreate = false;
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.submitRequest())).success,
    true,
  );
  await waitModel(f.page, () => window.requestModel.reason === "");
  assert.equal(f.state.created.at(-1).targetEmployeeId, null);
  await f.close();
});

test("SWAP selectors reset dependent fields and stale colleague responses cannot overwrite current results", async () => {
  const f = await fixture({ options: { mode: "create", shift } });
  f.state.delayColleague = 200;
  await f.page.evaluate(() => window.requestModel.setRequestType("SWAP"));
  await waitModel(f.page, () => window.requestModel.colleagues.length === 2);
  await f.page.evaluate(() =>
    window.requestModel.setSelectedColleagueId("201"),
  );
  await f.page.waitForRequest((req) =>
    req.url().includes("colleague-shifts/201"),
  );
  await f.page.evaluate(() =>
    window.requestModel.setSelectedColleagueId("202"),
  );
  await waitModel(
    f.page,
    () => window.requestModel.colleagueShifts[0]?.assignmentId === 302,
  );
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(
    await f.page.evaluate(
      () => window.requestModel.colleagueShifts[0].assignmentId,
    ),
    302,
  );
  await f.page.evaluate(() =>
    window.requestModel.setSelectedTargetAssignmentId("302"),
  );
  await waitModel(
    f.page,
    () => window.requestModel.selectedTargetAssignmentId === "302",
  );
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.submitRequest())).success,
    true,
  );
  assert.deepEqual(f.state.created[0], {
    requestType: "SWAP",
    assignmentId: 11,
    targetEmployeeId: 202,
    targetAssignmentId: 302,
    reason: "",
  });
  await f.page.evaluate(() => window.requestModel.setRequestType("LEAVE"));
  await waitModel(
    f.page,
    () =>
      window.requestModel.selectedTargetAssignmentId === "" &&
      window.requestModel.selectedColleagueId === "",
  );
  await f.close();
});

test("duplicate submit issues only one POST", async () => {
  const f = await fixture({ options: { mode: "create", shift } });
  await f.page.evaluate(() => window.requestModel.setReason("Lý do"));
  await waitModel(f.page, () => window.requestModel.reason === "Lý do");
  const results = await f.page.evaluate(() =>
    Promise.all([
      window.requestModel.submitRequest(),
      window.requestModel.submitRequest(),
    ]),
  );
  assert.equal(f.state.created.length, 1);
  assert.equal(results.filter((entry) => entry.busy).length, 1);
  await f.close();
});

test("history handles peer response, cancellation, errors and retries without unrelated requests", async () => {
  const f = await fixture({ options: { mode: "history" } });
  await waitModel(f.page, () => window.requestModel.myRequests.length === 2);
  assert.equal(
    await f.page.evaluate(() => window.requestModel.receivedPendingCount),
    1,
  );
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.respondToRequest(2, true)))
      .success,
    true,
  );
  await waitModel(f.page, () => window.requestModel.receivedPendingCount === 0);
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.cancelRequest(1))).success,
    true,
  );
  await waitModel(
    f.page,
    () => window.requestModel.sentRequests[0].status === "CANCELLED",
  );
  f.state.failHistory = true;
  await f.page.evaluate(() => window.requestModel.fetchMyRequests());
  await waitModel(f.page, () => Boolean(window.requestModel.myRequestsError));
  f.state.failHistory = false;
  await f.page.evaluate(() => window.requestModel.fetchMyRequests());
  await waitModel(f.page, () => !window.requestModel.myRequestsError);
  assert.ok(
    f.state.calls.every(
      (entry) => !/my-shifts|colleagues|swap-requests\/3/.test(entry.path),
    ),
  );
  await f.close();
});

test("manager filters, reviews, totals and last-page clamping update together", async () => {
  const f = await fixture({
    user: manager,
    options: { mode: "review", initialReviewFilter: "PENDING" },
    storeRequests: Array.from({ length: 11 }, (_, i) => request(i + 1)),
  });
  await waitModel(
    f.page,
    () => window.requestModel.reviewStats.pendingCount === 11,
  );
  await f.page.evaluate(() => window.requestModel.setReviewPage(2));
  await waitModel(f.page, () => window.requestModel.reviewPage === 2);
  f.state.failReview = true;
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.reviewRequest(11, true)))
      .success,
    false,
  );
  assert.equal(
    await f.page.evaluate(() => window.requestModel.reviewStats.pendingCount),
    11,
  );
  f.state.failReview = false;
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.reviewRequest(11, true)))
      .success,
    true,
  );
  await waitModel(
    f.page,
    () =>
      window.requestModel.reviewStats.pendingCount === 10 &&
      window.requestModel.reviewStats.approvedCount === 1 &&
      window.requestModel.reviewPage === 1,
  );
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.reviewRequest(1, false)))
      .success,
    true,
  );
  await waitModel(
    f.page,
    () => window.requestModel.reviewStats.rejectedCount === 1,
  );
  assert.ok(
    f.state.calls.every(
      (entry) => !/my-shifts|my-swap-requests|colleagues/.test(entry.path),
    ),
  );
  await f.close();
});

test("empty received tab renders its own empty state even when sent requests exist", async () => {
  const f = await fixture({
    scenario: "workspace",
    myRequests: Array.from({ length: 12 }, (_, i) => request(i + 1)),
  });
  await f.page.getByText("Lịch Sử Đơn Của Tôi", { exact: true }).click();
  await f.page.getByRole("button", { name: "Đơn Cần Tôi Duyệt" }).click();
  await f.page
    .getByText("Không có đơn nào chờ bạn duyệt.", { exact: true })
    .waitFor();
  await f.close();
});

test("workspace uses the selected shift store/date and clears dependent selections when changing assignments", async () => {
  const f = await fixture();
  await waitModel(
    f.page,
    () => window.requestModel.myUpcomingShifts.length === 2,
  );
  await f.page.evaluate(() => {
    window.requestModel.setRequestType("SWAP");
    window.requestModel.setSelectedMyAssignmentId("12");
  });
  await waitModel(f.page, () => window.requestModel.colleagues.length === 2);
  const call = f.state.calls.find((entry) =>
    entry.path.endsWith("/colleagues/7"),
  );
  assert.equal(call.query.workDate, day(2));
  await f.page.evaluate(() =>
    window.requestModel.setSelectedColleagueId("202"),
  );
  await waitModel(
    f.page,
    () => window.requestModel.colleagueShifts.length === 1,
  );
  await f.page.evaluate(() =>
    window.requestModel.setSelectedTargetAssignmentId("302"),
  );
  await waitModel(
    f.page,
    () => window.requestModel.selectedTargetAssignmentId === "302",
  );
  await f.page.evaluate(() =>
    window.requestModel.setSelectedMyAssignmentId("11"),
  );
  await waitModel(
    f.page,
    () =>
      window.requestModel.selectedColleagueId === "" &&
      window.requestModel.selectedTargetAssignmentId === "",
  );
  await f.close();
});

test("changing history tabs resets the page and unrelated users cannot respond to sent requests", async () => {
  const f = await fixture({
    options: { mode: "history" },
    myRequests: Array.from({ length: 12 }, (_, i) => request(i + 1)),
  });
  await waitModel(f.page, () => window.requestModel.sentRequests.length === 12);
  await f.page.evaluate(() => window.requestModel.setMyPage(2));
  await waitModel(f.page, () => window.requestModel.myPage === 2);
  await f.page.evaluate(() => window.requestModel.setMyTab("RECEIVED"));
  await waitModel(
    f.page,
    () =>
      window.requestModel.myPage === 1 &&
      window.requestModel.filteredMyRequests.length === 0,
  );
  assert.equal(
    (await f.page.evaluate(() => window.requestModel.respondToRequest(1, true)))
      .success,
    false,
  );
  assert.equal(
    f.state.calls.filter((entry) => entry.method === "POST").length,
    0,
  );
  await f.close();
});

test("closing a form during submission ignores the obsolete result and starts no refresh queries", async () => {
  const f = await fixture({ options: { mode: "create", shift } });
  f.state.delayCreate = 200;
  await f.page.evaluate(() => window.requestModel.setReason("Lý do"));
  await waitModel(f.page, () => window.requestModel.reason === "Lý do");
  const posted = f.page.waitForRequest((req) => req.method() === "POST");
  await f.page.evaluate(() => {
    window.pendingSubmit = window.requestModel.submitRequest();
  });
  await posted;
  await f.page.evaluate(() =>
    window.setTestOptions((previous) => ({ ...previous, enabled: false })),
  );
  const result = await f.page.evaluate(() => window.pendingSubmit);
  assert.equal(result.stale, true);
  assert.equal(
    f.state.calls.filter((entry) => entry.method === "GET").length,
    0,
  );
  await f.close();
});

test("shared create modal keeps failures open, emits one success toast and notifies parent once", async () => {
  const f = await fixture({ scenario: "create-modal", options: { shift } });
  await f.page.locator("textarea").fill("Có việc bận");
  f.state.failCreate = true;
  await f.page.getByRole("button", { name: "Gửi Đơn Yêu Cầu" }).click();
  await f.page
    .getByText("Ca trực này đang có đơn chờ xử lý.", { exact: true })
    .waitFor();
  assert.equal(await f.page.locator("textarea").inputValue(), "Có việc bận");
  f.state.failCreate = false;
  await f.page.getByRole("button", { name: "Gửi Đơn Yêu Cầu" }).click();
  await f.page.waitForFunction(() => window.changeCount === 1);
  assert.equal(await f.page.locator(".toast--success").count(), 1);
  assert.equal(await f.page.locator("textarea").count(), 0);
  await f.close();
});

test("history modal cancellation requires confirmation", async () => {
  const f = await fixture({ scenario: "history-modal" });
  await f.page.getByRole("button", { name: "Hủy Đơn", exact: true }).click();
  assert.equal(
    f.state.calls.filter((entry) => entry.path.includes("swap-cancel")).length,
    0,
  );
  await f.page
    .getByRole("button", { name: "Hủy đơn", exact: true })
    .last()
    .click();
  await f.page.getByText("Đã Hủy", { exact: true }).waitFor();
  assert.equal(
    f.state.calls.filter((entry) => entry.path.includes("swap-cancel")).length,
    1,
  );
  await f.close();
});

test("past or current shift cannot be submitted from calendar modal", async () => {
  const f = await fixture({
    scenario: "create-modal",
    options: { shift: { ...shift, workDate: day(0), date: day(0) } },
  });
  await f.page
    .getByText(
      "Đơn xin đổi/nghỉ ca phải được gửi trước ngày làm việc ít nhất 1 ngày.",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await f.page.getByRole("button", { name: "Gửi Đơn Yêu Cầu" }).isDisabled(),
    true,
  );
  assert.equal(f.state.created.length, 0);
  await f.close();
});

test("review modal calls parent only after a successful backend review", async () => {
  const f = await fixture({ user: manager, scenario: "review-modal" });
  await f.page.getByRole("button", { name: "Duyệt", exact: true }).click();
  await f.page.waitForFunction(() => window.changeCount === 1);
  assert.equal(f.state.storeRequests[0].status, "APPROVED");
  await f.close();
});
