import { useState } from "react";
import { useAdminTheme } from "@/shared/context/ThemeContext";
import { useToast } from "@/shared/components/ui/ToastProvider";
import ConfirmModal from "@/shared/components/ui/ConfirmModal";
import PageHeader from "@/shared/components/ui/PageHeader";
import Panel from "@/shared/components/ui/Panel";
import Icon from "@/shared/components/ui/Icon";
import useShiftRequests from "../../hooks/useShiftRequests";
import ShiftRequestForm from "../ShiftRequestForm";
import MySwapRequestList from "../MySwapRequestList";
import StoreSwapRequestReview from "../StoreSwapRequestReview";
import ShiftRequestStats from "../ShiftRequestStats";
import ShiftRequestFeedback from "../ShiftRequestFeedback";

export default function ShiftRequestsWorkspace({ user }) {
  const { c, isDark } = useAdminTheme();
  const toast = useToast();
  const requests = useShiftRequests({ user });
  const {
    isStoreManager,
    canCreateRequest,
    canReview,
    activeTab,
    setActiveTab,
    myRequestCount,
  } = requests;
  const [cancelId, setCancelId] = useState(null);
  const notify = (result) => {
    if (!result.busy && !result.stale)
      toast[result.success ? "success" : "error"](result.message);
    return result;
  };
  const submit = async (event) => {
    event.preventDefault();
    notify(await requests.submitRequest());
  };
  const respond = async (id, accepted) =>
    notify(await requests.respondToRequest(id, accepted));
  const review = async (id, approved) =>
    notify(await requests.reviewRequest(id, approved));
  const confirmCancel = async () => {
    const result = notify(await requests.cancelRequest(cancelId));
    if (result.success) setCancelId(null);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        index={
          isStoreManager
            ? "Store Manager · Phê Duyệt Đơn"
            : "Employee Portal · Điều Chỉnh Lịch"
        }
        title={
          isStoreManager
            ? "Phê Duyệt Đơn Xin Nghỉ & Đổi Ca Chi Nhánh"
            : "Quản Lý Đơn Xin Đổi & Điều Chỉnh Lịch Ca"
        }
        desc={
          isStoreManager
            ? "Xem xét lý do và phê duyệt các đơn xin nghỉ ca, đổi ca làm việc của Trưởng ca và nhân viên chi nhánh."
            : "Tạo đơn xin nghỉ ca khi có việc bận đột xuất hoặc tráo đổi ca trực với đồng nghiệp trong chi nhánh."
        }
      />

      <ShiftRequestFeedback message={requests.permissionError} />
      {isStoreManager && <ShiftRequestStats stats={requests.reviewStats} />}
      {canCreateRequest && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${c.borderSub}`,
            paddingBottom: 8,
          }}
        >
          <button
            onClick={() => setActiveTab("CREATE")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${activeTab === "CREATE" ? c.accent : c.border}`,
              background:
                activeTab === "CREATE"
                  ? "rgba(242, 202, 80, 0.12)"
                  : "transparent",
              color: activeTab === "CREATE" ? c.accent : c.fgMuted,
              fontSize: 13,
              fontWeight: activeTab === "CREATE" ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <Icon
              name="document"
              size={16}
              color={activeTab === "CREATE" ? c.accent : c.fgMuted}
            />
            <span>Tạo Đơn Điều Chỉnh Ca</span>
          </button>

          <button
            onClick={() => setActiveTab("MY_REQUESTS")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${activeTab === "MY_REQUESTS" ? c.accent : c.border}`,
              background:
                activeTab === "MY_REQUESTS"
                  ? "rgba(242, 202, 80, 0.12)"
                  : "transparent",
              color: activeTab === "MY_REQUESTS" ? c.accent : c.fgMuted,
              fontSize: 13,
              fontWeight: activeTab === "MY_REQUESTS" ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <Icon
              name="pulse"
              size={16}
              color={activeTab === "MY_REQUESTS" ? c.accent : c.fgMuted}
            />
            <span>Lịch Sử Đơn Của Tôi</span>
            <span
              style={{
                background:
                  activeTab === "MY_REQUESTS"
                    ? `${c.accent}20`
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                color: activeTab === "MY_REQUESTS" ? c.accent : c.fgSubtle,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 10,
                padding: "1px 6px",
                marginLeft: 2,
              }}
            >
              {myRequestCount}
            </span>
          </button>
        </div>
      )}
      {activeTab === "CREATE" && canCreateRequest && (
        <Panel title="Khởi Tạo Yêu Cầu Điều Chỉnh Lịch Ca">
          <ShiftRequestForm
            requestType={requests.requestType}
            setRequestType={requests.setRequestType}
            selectedMyAssignmentId={requests.selectedMyAssignmentId}
            setSelectedMyAssignmentId={requests.setSelectedMyAssignmentId}
            myUpcomingShifts={requests.myUpcomingShifts}
            selectedColleagueId={requests.selectedColleagueId}
            setSelectedColleagueId={requests.setSelectedColleagueId}
            colleagues={requests.colleagues}
            selectedTargetAssignmentId={requests.selectedTargetAssignmentId}
            setSelectedTargetAssignmentId={
              requests.setSelectedTargetAssignmentId
            }
            colleagueShifts={requests.colleagueShifts}
            loadingShifts={requests.loadingShifts}
            loadingColleagues={requests.loadingColleagues}
            loadingColleagueShifts={requests.loadingColleagueShifts}
            colleagueShiftsError={requests.colleagueShiftsError}
            colleaguesError={requests.colleaguesError}
            shiftsError={requests.shiftsError}
            reason={requests.reason}
            setReason={requests.setReason}
            submitting={requests.submitting}
            validationErrors={requests.validationErrors}
            fetchMyShifts={requests.fetchMyShifts}
            fetchColleagues={requests.fetchColleagues}
            fetchColleagueShifts={requests.fetchColleagueShifts}
            isAdvanceNoticeValid={requests.isAdvanceNoticeValid}
            onSubmit={submit}
          />
        </Panel>
      )}
      {activeTab === "MY_REQUESTS" && canCreateRequest && (
        <Panel title="Lịch Sử Đơn Đổi / Chuyển Ca Của Tôi">
          <MySwapRequestList
            myTab={requests.myTab}
            setMyTab={requests.setMyTab}
            receivedPendingCount={requests.receivedPendingCount}
            loadingMyRequests={requests.loadingMyRequests}
            requests={requests.pagedMyRequests}
            totalItems={requests.myTotalItems}
            myPage={requests.myPage}
            myPageSize={requests.myPageSize}
            setMyPage={requests.setMyPage}
            setMyPageSize={requests.setMyPageSize}
            actionLoadingId={requests.actionLoadingId}
            myRequestsError={requests.myRequestsError}
            fetchMyRequests={requests.fetchMyRequests}
            onRespond={respond}
            onCancel={setCancelId}
          />
        </Panel>
      )}
      {activeTab === "REVIEW" && canReview && (
        <Panel title="Danh Sách Đơn Xin Nghỉ & Đổi Ca Chi Nhánh">
          <StoreSwapRequestReview
            tabs={requests.reviewTabs}
            reviewFilter={requests.reviewFilter}
            setReviewFilter={requests.setReviewFilter}
            searchTerm={requests.searchTerm}
            setSearchTerm={requests.setSearchTerm}
            loadingStoreRequests={requests.loadingStoreRequests}
            requests={requests.pagedStoreRequests}
            totalItems={requests.reviewTotalItems}
            actionLoadingId={requests.actionLoadingId}
            reviewPage={requests.reviewPage}
            reviewPageSize={requests.reviewPageSize}
            setReviewPage={requests.setReviewPage}
            setReviewPageSize={requests.setReviewPageSize}
            storeRequestsError={requests.storeRequestsError}
            fetchStoreRequests={requests.fetchStoreRequests}
            onReview={review}
          />
        </Panel>
      )}
      <ConfirmModal
        isOpen={cancelId !== null}
        title="Hủy đơn yêu cầu"
        message="Bạn có chắc chắn muốn hủy đơn này không?"
        confirmText="Hủy đơn"
        onClose={() => {
          if (requests.actionLoadingId === null) setCancelId(null);
        }}
        onConfirm={confirmCancel}
        loading={requests.actionLoadingId !== null}
      />
    </div>
  );
}
