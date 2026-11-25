import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getMySwapRequests,
  getStoreSwapRequests,
  createSwapRequest,
  reviewSwapRequest,
  respondToSwapRequest,
  cancelSwapRequest,
  getColleaguesForSwap,
  getColleagueShifts,
  getMyShifts,
} from "../services/schedule.service";
import {
  readRequestUser,
  getRequestIdentity,
  localDate,
  normalizeRequest,
  requestError,
  requestList,
  requestPage,
  validateRequest,
  requestPayload,
} from "../utils/shiftRequest.utils";

const EMPTY_QUERY = { items: [], loading: false, error: null };
const EMPTY_REVIEW_QUERY = {
  ...EMPTY_QUERY,
  totalItems: 0,
  statistics: {
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
  },
};
const EMPTY_FORM = {
  requestType: "LEAVE",
  assignmentId: "",
  targetEmployeeId: "",
  targetAssignmentId: "",
  reason: "",
};
const BUSY_RESULT = {
  success: false,
  busy: true,
  message: "Yêu cầu đang được xử lý.",
};
const STALE_RESULT = { success: false, stale: true };

/**
 * Single business hook for SWAP/LEAVE. Each named fetch/action calls its service directly.
 * Review filters/paging are API parameters; the backend returns rows, totals and statistics.
 * The hook owns query state and handlers; components only render props.
 * @param {{mode?: 'workspace'|'create'|'history'|'review', enabled?: boolean,
 * user?: object, branchId?: number, shift?: object, initialReviewFilter?: string}} options
 * @returns {object} State, display data, event handlers and actions returning {success, message, data}.
 */
export default function useShiftRequests({
  mode = "workspace",
  enabled = true,
  user,
  branchId: branchOverride,
  shift = null,
  initialReviewFilter = "ALL",
} = {}) {
  const storedUser = useMemo(
    () => (user === undefined ? readRequestUser() : user),
    [user],
  );
  const {
    employeeId,
    branchId: homeBranchId,
    isStoreManager,
  } = getRequestIdentity(storedUser);
  const branchId = branchOverride || homeBranchId;
  const canCreateRequest = Boolean(employeeId && !isStoreManager);
  const canReview = Boolean(employeeId && isStoreManager);
  const hasFixedShift = Boolean(shift);
  const formEnabled =
    enabled && canCreateRequest && ["workspace", "create"].includes(mode);
  const historyEnabled =
    enabled && canCreateRequest && ["workspace", "history"].includes(mode);
  const reviewEnabled =
    enabled &&
    canReview &&
    ["workspace", "review"].includes(mode) &&
    Boolean(branchId);
  const [activeTab, setActiveTab] = useState(
    isStoreManager ? "REVIEW" : "CREATE",
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [validationErrors, setValidationErrors] = useState({});
  const [shiftsQuery, setShiftsQuery] = useState(EMPTY_QUERY);
  const [historyQuery, setHistoryQuery] = useState(EMPTY_QUERY);
  const [reviewQuery, setReviewQuery] = useState(EMPTY_REVIEW_QUERY);
  const [colleaguesQuery, setColleaguesQuery] = useState(EMPTY_QUERY);
  const [colleagueShiftsQuery, setColleagueShiftsQuery] = useState(EMPTY_QUERY);
  const [myTab, updateMyTab] = useState("SENT");
  const [myPage, updateMyPage] = useState(1);
  const [myPageSize, updateMyPageSize] = useState(10);
  const [reviewFilter, updateReviewFilter] = useState(initialReviewFilter);
  const [searchTerm, updateSearchTerm] = useState("");
  const [reviewPage, updateReviewPage] = useState(1);
  const [reviewPageSize, updateReviewPageSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const readRequests = useRef({});
  const reviewParameters = useRef({});
  const mounted = useRef(false);
  const busy = useRef(false);
  const session = useRef(0);

  useEffect(() => {
    mounted.current = true;
    const requests = readRequests.current;
    return () => {
      mounted.current = false;
      Object.values(requests).forEach((request) => request.abort());
    };
  }, []);
  useEffect(
    () => () => {
      session.current += 1;
    },
    [enabled, employeeId, branchId, shift?.assignmentId, mode],
  );

  // Conditional reset applies only to a new user, branch, opening or fixed shift.
  const context = [
    enabled,
    employeeId,
    branchId,
    shift?.assignmentId,
    mode,
  ].join(":");
  const [previousContext, setPreviousContext] = useState(context);
  if (previousContext !== context) {
    setPreviousContext(context);
    setActiveTab(isStoreManager ? "REVIEW" : "CREATE");
    setForm(EMPTY_FORM);
    setValidationErrors({});
    setActionError(null);
    setShiftsQuery(EMPTY_QUERY);
    setHistoryQuery(EMPTY_QUERY);
    setReviewQuery(EMPTY_REVIEW_QUERY);
    setColleaguesQuery(EMPTY_QUERY);
    setColleagueShiftsQuery(EMPTY_QUERY);
    updateMyPage(1);
    updateReviewPage(1);
  }

  const myUpcomingShifts = useMemo(
    () =>
      shift
        ? [{ ...shift, workDate: shift.workDate || shift.date }]
        : shiftsQuery.items,
    [shift, shiftsQuery.items],
  );
  const selectedMyAssignmentId = shift?.assignmentId
    ? String(shift.assignmentId)
    : form.assignmentId;
  const selectedShift = myUpcomingShifts.find(
    (item) => String(item.assignmentId) === selectedMyAssignmentId,
  );
  const selectedBranchId =
    selectedShift?.branchId || selectedShift?.storeId || branchId;
  const selectedWorkDate = selectedShift?.workDate;
  const isAdvanceNoticeValid = Boolean(
    selectedWorkDate && selectedWorkDate > localDate(),
  );
  const colleaguesEnabled = Boolean(
    formEnabled &&
    form.requestType === "SWAP" &&
    isAdvanceNoticeValid &&
    selectedBranchId,
  );
  const colleagueShiftsEnabled =
    colleaguesEnabled && Boolean(form.targetEmployeeId);

  const fetchMyShifts = useCallback(
    async function fetchMyShifts() {
      readRequests.current.shifts?.abort();
      if (!(formEnabled && !hasFixedShift && employeeId)) {
        setShiftsQuery(EMPTY_QUERY);
        return;
      }
      const request = new AbortController();
      readRequests.current.shifts = request;
      setShiftsQuery((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const end = new Date();
        end.setDate(end.getDate() + 14);
        const response = await getMyShifts(
          localDate(tomorrow),
          localDate(end),
          request.signal,
        );
        const items = requestList(response).filter(
          (item) =>
            item.workDate >= localDate(tomorrow) && item.status !== "CANCELLED",
        );
        if (mounted.current && !request.signal.aborted)
          setShiftsQuery({ items, loading: false, error: null });
      } catch (error) {
        if (mounted.current && !request.signal.aborted) {
          setShiftsQuery((previous) => ({
            ...previous,
            loading: false,
            error: requestError(error, "Không thể tải dữ liệu."),
          }));
        }
      }
    },
    [formEnabled, hasFixedShift, employeeId],
  );

  const fetchMyRequests = useCallback(
    async function fetchMyRequests() {
      readRequests.current.history?.abort();
      if (!historyEnabled || !employeeId) {
        setHistoryQuery(EMPTY_QUERY);
        return;
      }
      const request = new AbortController();
      readRequests.current.history = request;
      setHistoryQuery((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));
      try {
        const response = await getMySwapRequests(request.signal);
        const items = requestList(response);
        if (mounted.current && !request.signal.aborted)
          setHistoryQuery({ items, loading: false, error: null });
      } catch (error) {
        if (mounted.current && !request.signal.aborted) {
          setHistoryQuery((previous) => ({
            ...previous,
            loading: false,
            error: requestError(error, "Không thể tải dữ liệu."),
          }));
        }
      }
    },
    [historyEnabled, employeeId],
  );

  const fetchStoreRequests = useCallback(
    async function fetchStoreRequests() {
      readRequests.current.review?.abort();
      if (!reviewEnabled || !employeeId) {
        setReviewQuery(EMPTY_REVIEW_QUERY);
        return;
      }
      const request = new AbortController();
      readRequests.current.review = request;
      setReviewQuery((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));
      try {
        const response = await getStoreSwapRequests(
          branchId,
          reviewParameters.current,
          request.signal,
        );
        const data = requestPage(response);
        if (mounted.current && !request.signal.aborted) {
          setReviewQuery({ ...data, loading: false, error: null });
          updateReviewPage(data.page);
        }
      } catch (error) {
        if (mounted.current && !request.signal.aborted) {
          setReviewQuery((previous) => ({
            ...previous,
            loading: false,
            error: requestError(error, "Không thể tải dữ liệu."),
          }));
        }
      }
    },
    [reviewEnabled, employeeId, branchId],
  );

  const fetchColleagues = useCallback(
    async function fetchColleagues() {
      readRequests.current.colleagues?.abort();
      if (!colleaguesEnabled || !selectedMyAssignmentId || !employeeId) {
        setColleaguesQuery(EMPTY_QUERY);
        return;
      }
      const request = new AbortController();
      readRequests.current.colleagues = request;
      setColleaguesQuery((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));
      try {
        const response = await getColleaguesForSwap(
          selectedBranchId,
          selectedWorkDate,
          request.signal,
        );
        const items = requestList(response);
        if (mounted.current && !request.signal.aborted)
          setColleaguesQuery({ items, loading: false, error: null });
      } catch (error) {
        if (mounted.current && !request.signal.aborted) {
          setColleaguesQuery((previous) => ({
            ...previous,
            loading: false,
            error: requestError(error, "Không thể tải dữ liệu."),
          }));
        }
      }
    },
    [
      colleaguesEnabled,
      selectedBranchId,
      selectedWorkDate,
      selectedMyAssignmentId,
      employeeId,
    ],
  );

  const fetchColleagueShifts = useCallback(
    async function fetchColleagueShifts() {
      readRequests.current.colleagueShifts?.abort();
      if (!colleagueShiftsEnabled || !employeeId) {
        setColleagueShiftsQuery(EMPTY_QUERY);
        return;
      }
      const request = new AbortController();
      readRequests.current.colleagueShifts = request;
      setColleagueShiftsQuery((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));
      try {
        const response = await getColleagueShifts(
          form.targetEmployeeId,
          selectedMyAssignmentId,
          request.signal,
        );
        const items = requestList(response);
        if (mounted.current && !request.signal.aborted)
          setColleagueShiftsQuery({ items, loading: false, error: null });
      } catch (error) {
        if (mounted.current && !request.signal.aborted) {
          setColleagueShiftsQuery((previous) => ({
            ...previous,
            loading: false,
            error: requestError(error, "Không thể tải dữ liệu."),
          }));
        }
      }
    },
    [
      colleagueShiftsEnabled,
      form.targetEmployeeId,
      selectedMyAssignmentId,
      employeeId,
    ],
  );

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Synchronize HTTP data and its loading state.
    fetchMyShifts();
    const requests = readRequests.current;
    return () => requests.shifts?.abort();
  }, [fetchMyShifts]);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Synchronize HTTP data and its loading state.
    fetchMyRequests();
    const requests = readRequests.current;
    return () => requests.history?.abort();
  }, [fetchMyRequests]);

  useEffect(() => {
    reviewParameters.current = {
      status: reviewFilter,
      search: searchTerm.trim(),
      page: reviewPage,
      pageSize: reviewPageSize,
    };
    // eslint-disable-next-line react/set-state-in-effect -- Synchronize HTTP data and its loading state.
    fetchStoreRequests();
    const requests = readRequests.current;
    return () => requests.review?.abort();
  }, [
    fetchStoreRequests,
    reviewFilter,
    searchTerm,
    reviewPage,
    reviewPageSize,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Synchronize HTTP data and its loading state.
    fetchColleagues();
    const requests = readRequests.current;
    return () => requests.colleagues?.abort();
  }, [fetchColleagues]);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Synchronize HTTP data and its loading state.
    fetchColleagueShifts();
    const requests = readRequests.current;
    return () => requests.colleagueShifts?.abort();
  }, [fetchColleagueShifts]);

  const setRequestType = useCallback(
    function setRequestType(requestType) {
      if (requestType === form.requestType) return;
      readRequests.current.colleagues?.abort();
      readRequests.current.colleagueShifts?.abort();
      setForm((previous) => ({
        ...previous,
        requestType,
        targetEmployeeId: "",
        targetAssignmentId: "",
      }));
      setColleaguesQuery(EMPTY_QUERY);
      setColleagueShiftsQuery(EMPTY_QUERY);
      setValidationErrors({});
    },
    [form.requestType],
  );
  const setSelectedMyAssignmentId = useCallback(
    function setSelectedMyAssignmentId(assignmentId) {
      if (String(assignmentId) === form.assignmentId) return;
      readRequests.current.colleagues?.abort();
      readRequests.current.colleagueShifts?.abort();
      setForm((previous) => ({
        ...previous,
        assignmentId: String(assignmentId),
        targetEmployeeId: "",
        targetAssignmentId: "",
      }));
      setColleaguesQuery(EMPTY_QUERY);
      setColleagueShiftsQuery(EMPTY_QUERY);
      setValidationErrors({});
    },
    [form.assignmentId],
  );
  const setSelectedColleagueId = useCallback(
    function setSelectedColleagueId(targetEmployeeId) {
      if (String(targetEmployeeId) === form.targetEmployeeId) return;
      readRequests.current.colleagueShifts?.abort();
      setForm((previous) => ({
        ...previous,
        targetEmployeeId: String(targetEmployeeId),
        targetAssignmentId: "",
      }));
      setColleagueShiftsQuery(EMPTY_QUERY);
      setValidationErrors({});
    },
    [form.targetEmployeeId],
  );
  const setSelectedTargetAssignmentId = useCallback(
    function setSelectedTargetAssignmentId(targetAssignmentId) {
      setForm((previous) => ({
        ...previous,
        targetAssignmentId: String(targetAssignmentId),
      }));
      setValidationErrors({});
    },
    [],
  );
  const setReason = useCallback(function setReason(reason) {
    setForm((previous) => ({ ...previous, reason }));
    setValidationErrors((previous) => ({ ...previous, reason: undefined }));
  }, []);

  const myRequests = useMemo(
    () =>
      historyQuery.items.map((request) => {
        const item = normalizeRequest(request);
        return {
          ...item,
          canRespond:
            historyEnabled &&
            String(item.targetEmployeeId) === String(employeeId) &&
            item.status === "PENDING_PEER",
          canCancel:
            historyEnabled &&
            String(item.requesterEmployeeId) === String(employeeId) &&
            ["PENDING", "PENDING_PEER"].includes(item.status),
        };
      }),
    [historyQuery.items, historyEnabled, employeeId],
  );
  const storeRequests = useMemo(
    () =>
      reviewQuery.items.map((request) => {
        const item = normalizeRequest(request);
        return {
          ...item,
          canReview: reviewEnabled && item.status === "PENDING",
        };
      }),
    [reviewQuery.items, reviewEnabled],
  );
  const sentRequests = useMemo(
    () =>
      myRequests.filter(
        (item) => String(item.requesterEmployeeId) === String(employeeId),
      ),
    [myRequests, employeeId],
  );
  const receivedRequests = useMemo(
    () =>
      myRequests.filter(
        (item) => String(item.targetEmployeeId) === String(employeeId),
      ),
    [myRequests, employeeId],
  );
  const filteredMyRequests = myTab === "SENT" ? sentRequests : receivedRequests;
  // Personal history remains local; branch review data is already filtered/paged by the API.
  const myTotalItems = filteredMyRequests.length;
  const reviewTotalItems = reviewQuery.totalItems;
  const currentMyPage = Math.min(
    myPage,
    Math.max(1, Math.ceil(myTotalItems / myPageSize)),
  );
  if (myPage !== currentMyPage) updateMyPage(currentMyPage);
  const pagedMyRequests = useMemo(
    () =>
      filteredMyRequests.slice(
        (currentMyPage - 1) * myPageSize,
        currentMyPage * myPageSize,
      ),
    [filteredMyRequests, currentMyPage, myPageSize],
  );
  const pagedStoreRequests = storeRequests;
  const reviewStats = reviewQuery.statistics;
  const reviewTabs = useMemo(
    () => [
      { key: "ALL", label: "Tất Cả", count: reviewStats.totalCount },
      {
        key: "PENDING",
        label: "Chờ Xét Duyệt",
        count: reviewStats.pendingCount,
      },
      {
        key: "APPROVED",
        label: "Đã Phê Duyệt",
        count: reviewStats.approvedCount,
      },
      {
        key: "REJECTED",
        label: "Đã Từ Chối",
        count: reviewStats.rejectedCount,
      },
      {
        key: "EXPIRED",
        label: "Quá Hạn Xử Lý",
        count: reviewStats.expiredCount,
      },
    ],
    [reviewStats],
  );
  const colleagueShifts = useMemo(
    () =>
      colleagueShiftsQuery.items.map((item) => ({
        ...item,
        isSameDay: item.workDate === selectedWorkDate,
      })),
    [colleagueShiftsQuery.items, selectedWorkDate],
  );
  const setMyTab = useCallback(function setMyTab(value) {
    updateMyTab(value);
    updateMyPage(1);
  }, []);
  const setMyPage = useCallback(function setMyPage(value) {
    updateMyPage(Math.max(1, Number(value) || 1));
  }, []);
  const setMyPageSize = useCallback(function setMyPageSize(value) {
    updateMyPageSize(Math.max(1, Number(value) || 10));
    updateMyPage(1);
  }, []);
  const setReviewFilter = useCallback(function setReviewFilter(value) {
    updateReviewFilter(value);
    updateReviewPage(1);
  }, []);
  const setSearchTerm = useCallback(function setSearchTerm(value) {
    updateSearchTerm(value);
    updateReviewPage(1);
  }, []);
  const setReviewPage = useCallback(function setReviewPage(value) {
    updateReviewPage(Math.max(1, Number(value) || 1));
  }, []);
  const setReviewPageSize = useCallback(function setReviewPageSize(value) {
    updateReviewPageSize(Math.max(1, Number(value) || 10));
    updateReviewPage(1);
  }, []);

  // These helpers only manage the local lock/lifecycle, not the API call stack.
  const beginAction = useCallback((id, isSubmit = false) => {
    if (busy.current) return null;
    busy.current = true;
    setActionError(null);
    if (isSubmit) setSubmitting(true);
    else setActionLoadingId(id);
    return { session: session.current };
  }, []);
  const isCurrentAction = useCallback(
    (action) => mounted.current && action.session === session.current,
    [],
  );
  const finishAction = useCallback(() => {
    busy.current = false;
    if (mounted.current) {
      setSubmitting(false);
      setActionLoadingId(null);
    }
  }, []);

  const submitRequest = useCallback(
    async function submitRequest() {
      if (busy.current) return BUSY_RESULT;
      if (!formEnabled)
        return { success: false, message: "Bạn không thể tạo đơn tại đây." };
      const values = { ...form, assignmentId: selectedMyAssignmentId };
      const errors = validateRequest(values, selectedShift);
      if (form.requestType === "SWAP") {
        if (
          !colleaguesQuery.items.some(
            (item) => String(item.employeeId) === form.targetEmployeeId,
          )
        )
          errors.targetEmployeeId =
            "Vui lòng chọn đồng nghiệp hợp lệ trong danh sách.";
        if (
          !colleagueShiftsQuery.items.some(
            (item) => String(item.assignmentId) === form.targetAssignmentId,
          )
        )
          errors.targetAssignmentId =
            "Vui lòng chọn ca trực khả dụng của đồng nghiệp.";
      }
      setValidationErrors(errors);
      if (Object.keys(errors).length)
        return { success: false, message: Object.values(errors)[0] };
      const action = beginAction(null, true);
      if (!action) return BUSY_RESULT;
      try {
        const result = await createSwapRequest(requestPayload(values));
        if (!isCurrentAction(action)) return STALE_RESULT;
        if (!result?.success)
          throw new Error(result?.message || "Không thể gửi đơn.");
        await Promise.all([fetchMyRequests(), fetchMyShifts()]);
        if (!isCurrentAction(action)) return STALE_RESULT;
        setForm(EMPTY_FORM);
        setValidationErrors({});
        return {
          ...result,
          message: result.message || "Đã gửi đơn yêu cầu thành công!",
        };
      } catch (error) {
        if (!isCurrentAction(action)) return STALE_RESULT;
        const message = requestError(error);
        setActionError(message);
        return { success: false, message };
      } finally {
        finishAction();
      }
    },
    [
      formEnabled,
      form,
      selectedMyAssignmentId,
      selectedShift,
      colleaguesQuery.items,
      colleagueShiftsQuery.items,
      beginAction,
      isCurrentAction,
      finishAction,
      fetchMyRequests,
      fetchMyShifts,
    ],
  );

  const respondToRequest = useCallback(
    async function respondToRequest(id, accepted) {
      if (busy.current) return BUSY_RESULT;
      const item = receivedRequests.find(
        (request) => String(request.swapRequestId) === String(id),
      );
      if (!historyEnabled || item?.status !== "PENDING_PEER")
        return { success: false, message: "Đơn không còn chờ bạn xác nhận." };
      const action = beginAction(id);
      if (!action) return BUSY_RESULT;
      try {
        const result = await respondToSwapRequest(id, accepted);
        if (!isCurrentAction(action)) return STALE_RESULT;
        if (!result?.success)
          throw new Error(result?.message || "Không thể xử lý yêu cầu.");
        await fetchMyRequests();
        if (!isCurrentAction(action)) return STALE_RESULT;
        return {
          ...result,
          message:
            result.message ||
            (accepted ? "Đã đồng ý đổi ca!" : "Đã từ chối đơn."),
        };
      } catch (error) {
        if (!isCurrentAction(action)) return STALE_RESULT;
        const message = requestError(error);
        setActionError(message);
        return { success: false, message };
      } finally {
        finishAction();
      }
    },
    [
      historyEnabled,
      receivedRequests,
      fetchMyRequests,
      beginAction,
      isCurrentAction,
      finishAction,
    ],
  );

  const cancelRequest = useCallback(
    async function cancelRequest(id) {
      if (busy.current) return BUSY_RESULT;
      const item = sentRequests.find(
        (request) => String(request.swapRequestId) === String(id),
      );
      if (
        !historyEnabled ||
        !["PENDING", "PENDING_PEER"].includes(item?.status)
      )
        return { success: false, message: "Không thể hủy đơn này." };
      const action = beginAction(id);
      if (!action) return BUSY_RESULT;
      try {
        const result = await cancelSwapRequest(id);
        if (!isCurrentAction(action)) return STALE_RESULT;
        if (!result?.success)
          throw new Error(result?.message || "Không thể xử lý yêu cầu.");
        await fetchMyRequests();
        if (!isCurrentAction(action)) return STALE_RESULT;
        return {
          ...result,
          message: result.message || "Đã hủy đơn thành công!",
        };
      } catch (error) {
        if (!isCurrentAction(action)) return STALE_RESULT;
        const message = requestError(error);
        setActionError(message);
        return { success: false, message };
      } finally {
        finishAction();
      }
    },
    [
      historyEnabled,
      sentRequests,
      fetchMyRequests,
      beginAction,
      isCurrentAction,
      finishAction,
    ],
  );

  const reviewRequest = useCallback(
    async function reviewRequest(id, approved) {
      if (busy.current) return BUSY_RESULT;
      const item = storeRequests.find(
        (request) => String(request.swapRequestId) === String(id),
      );
      if (!reviewEnabled || item?.status !== "PENDING")
        return {
          success: false,
          message: "Đơn không còn chờ quản lý xét duyệt.",
        };
      const action = beginAction(id);
      if (!action) return BUSY_RESULT;
      try {
        const result = await reviewSwapRequest({
          swapRequestId: id,
          isApproved: approved,
        });
        if (!isCurrentAction(action)) return STALE_RESULT;
        if (!result?.success)
          throw new Error(result?.message || "Không thể xử lý yêu cầu.");
        await fetchStoreRequests();
        if (!isCurrentAction(action)) return STALE_RESULT;
        return {
          ...result,
          message:
            result.message ||
            (approved
              ? "Đã phê duyệt đơn và cập nhật lịch làm việc!"
              : "Đã từ chối đơn."),
        };
      } catch (error) {
        if (!isCurrentAction(action)) return STALE_RESULT;
        const message = requestError(error);
        setActionError(message);
        return { success: false, message };
      } finally {
        finishAction();
      }
    },
    [
      reviewEnabled,
      storeRequests,
      fetchStoreRequests,
      beginAction,
      isCurrentAction,
      finishAction,
    ],
  );

  return {
    storedUser,
    employeeId,
    branchId,
    isStoreManager,
    canCreateRequest,
    canReview,
    permissionError: !employeeId
      ? "Không xác định được nhân viên đăng nhập."
      : canReview && !branchId
        ? "Chưa xác định được chi nhánh cần xét duyệt."
        : null,
    activeTab,
    setActiveTab,
    requestType: form.requestType,
    setRequestType,
    myUpcomingShifts,
    selectedMyAssignmentId,
    setSelectedMyAssignmentId,
    selectedColleagueId: form.targetEmployeeId,
    setSelectedColleagueId,
    selectedTargetAssignmentId: form.targetAssignmentId,
    setSelectedTargetAssignmentId,
    reason: form.reason,
    setReason,
    validationErrors,
    isAdvanceNoticeValid,
    colleagues: colleaguesEnabled ? colleaguesQuery.items : [],
    colleagueShifts: colleagueShiftsEnabled ? colleagueShifts : [],
    loadingShifts: shiftsQuery.loading,
    shiftsError: shiftsQuery.error,
    loadingColleagues: colleaguesQuery.loading,
    colleaguesError: colleaguesQuery.error,
    loadingColleagueShifts: colleagueShiftsQuery.loading,
    colleagueShiftsError: colleagueShiftsQuery.error,
    submitting,
    actionLoadingId,
    actionError,
    myRequests,
    myRequestCount: myRequests.length,
    sentRequests,
    receivedRequests,
    filteredMyRequests,
    pagedMyRequests,
    receivedPendingCount: receivedRequests.filter(
      (item) => item.status === "PENDING_PEER",
    ).length,
    myTotalItems,
    myTab,
    setMyTab,
    myPage: currentMyPage,
    setMyPage,
    myPageSize,
    setMyPageSize,
    loadingMyRequests: historyQuery.loading,
    myRequestsError: historyQuery.error,
    storeRequests,
    pagedStoreRequests,
    reviewStats,
    reviewTabs,
    reviewTotalItems,
    reviewFilter,
    setReviewFilter,
    searchTerm,
    setSearchTerm,
    reviewPage,
    setReviewPage,
    reviewPageSize,
    setReviewPageSize,
    loadingStoreRequests: reviewQuery.loading,
    storeRequestsError: reviewQuery.error,
    fetchMyShifts,
    fetchMyRequests,
    fetchStoreRequests,
    fetchColleagues,
    fetchColleagueShifts,
    submitRequest,
    respondToRequest,
    cancelRequest,
    reviewRequest,
  };
}
