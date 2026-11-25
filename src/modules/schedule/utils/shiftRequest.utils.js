export function readRequestUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export function getRequestIdentity(user) {
  const role = (user?.role || user?.Role || "").toUpperCase();
  const roleName = (user?.roleName || user?.RoleName || "").toLowerCase();
  return {
    // Auth maps EmployeeId and UserId to Users.Id, also used by swap DTOs.
    employeeId:
      user?.employeeId ||
      user?.EmployeeId ||
      user?.userId ||
      user?.UserId ||
      user?.id ||
      user?.Id,
    branchId:
      user?.storeId || user?.StoreId || user?.branchId || user?.homeBranchId,
    isStoreManager:
      ["STORE_MANAGER", "OPERATIONS_ADMIN", "BUSINESS_OWNER"].includes(role) ||
      (roleName.includes("quản lý") && !roleName.includes("trưởng ca")),
  };
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function normalizeRequest(request) {
  return {
    ...request,
    status: request.status === "EXPRIED" ? "EXPIRED" : request.status,
  };
}

export function requestError(error, fallback = "Không thể xử lý yêu cầu.") {
  return error?.response?.data?.message || error?.message || fallback;
}

export function validateRequest(form, shift, today = localDate()) {
  const errors = {};
  if (!["LEAVE", "SWAP"].includes(form.requestType))
    errors.requestType = "Hình thức yêu cầu không hợp lệ.";
  if (
    !Number.isSafeInteger(Number(form.assignmentId)) ||
    Number(form.assignmentId) <= 0 ||
    !shift
  ) {
    errors.assignmentId = "Vui lòng chọn ca trực của bạn cần điều chỉnh.";
  } else if (!(shift.workDate > today)) {
    errors.assignmentId =
      "Đơn xin đổi/nghỉ ca phải được gửi trước ngày làm việc ít nhất 1 ngày.";
  }
  if (form.requestType === "LEAVE" && !form.reason.trim()) {
    errors.reason =
      "Vui lòng nhập lý do xin nghỉ ca trực để Cửa hàng trưởng xem xét.";
  }
  if (form.requestType === "SWAP") {
    if (
      !Number.isSafeInteger(Number(form.targetEmployeeId)) ||
      Number(form.targetEmployeeId) <= 0
    ) {
      errors.targetEmployeeId = "Vui lòng chọn đồng nghiệp tiếp nhận đổi ca.";
    }
    if (
      !Number.isSafeInteger(Number(form.targetAssignmentId)) ||
      Number(form.targetAssignmentId) <= 0
    ) {
      errors.targetAssignmentId =
        "Vui lòng chọn ca trực tương ứng của đồng nghiệp để tráo đổi.";
    }
  }
  return errors;
}

export function requestPayload(form) {
  return {
    requestType: form.requestType,
    assignmentId: Number(form.assignmentId),
    targetEmployeeId:
      form.requestType === "SWAP" ? Number(form.targetEmployeeId) : null,
    targetAssignmentId:
      form.requestType === "SWAP" ? Number(form.targetAssignmentId) : null,
    reason: form.reason.trim(),
  };
}

export function requestList(response) {
  if (response?.success === false)
    throw new Error(response.message || "Không thể tải dữ liệu.");
  const items = response?.data ?? response;
  if (!Array.isArray(items)) throw new Error("Dữ liệu trả về không hợp lệ.");
  return items;
}

export function requestPage(response) {
  if (response?.success === false)
    throw new Error(response.message || "Không thể tải dữ liệu.");
  const data = response?.data;
  if (
    !Array.isArray(data?.items) ||
    !Number.isInteger(data.totalItems) ||
    data.totalItems < 0 ||
    !Number.isInteger(data.page) ||
    data.page < 1 ||
    !Number.isInteger(data.pageSize) ||
    data.pageSize < 1 ||
    ![
      "totalCount",
      "pendingCount",
      "approvedCount",
      "rejectedCount",
      "expiredCount",
    ].every(
      (key) =>
        Number.isInteger(data.statistics?.[key]) && data.statistics[key] >= 0,
    )
  )
    throw new Error("Dữ liệu phân trang trả về không hợp lệ.");
  return data;
}
