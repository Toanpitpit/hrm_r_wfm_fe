import { useEffect } from "react";
import { useAdminTheme } from "@/shared/context/ThemeContext";
import { useToast } from "@/shared/components/ui/ToastProvider";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Icon from "@/shared/components/ui/Icon";
import { formatShiftTemplateName } from "../hooks/useWeeklySchedule";
import useShiftRequests from "../hooks/useShiftRequests";
import ShiftRequestFeedback from "./ShiftRequestFeedback";

export default function ShiftSwapReviewList({
  storeId = null,
  enabled = true,
  onReviewed,
  onPendingCountChange,
  onBusyChange,
}) {
  const { c } = useAdminTheme();
  const toast = useToast();
  const {
    filteredStoreRequests: filteredRequests,
    loadingStoreRequests: loading,
    actionLoadingId,
    reviewFilter: filterTab,
    setReviewFilter: setFilterTab,
    reviewStats,
    fetchStoreRequests,
    reviewRequest,
    permissionError,
    storeRequestsError,
  } = useShiftRequests({
    mode: "review",
    enabled,
    branchId: storeId,
    initialReviewFilter: "PENDING",
  });
  const { pendingCount, totalCount } = reviewStats;
  const busy = actionLoadingId !== null;

  useEffect(() => {
    onPendingCountChange?.(pendingCount);
  }, [pendingCount, onPendingCountChange]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(
    () => () => {
      onBusyChange?.(false);
    },
    [onBusyChange],
  );

  const handleReview = async (swapRequestId, isApproved) => {
    const result = await reviewRequest(swapRequestId, isApproved);
    if (result.busy || result.stale) return;
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) onReviewed?.();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge tone="ok" dot>
            Đã Duyệt
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge tone="bad" dot>
            Đã Từ Chối
          </Badge>
        );
      case "PENDING_PEER":
        return <Badge tone="warn">Chờ Đồng Nghiệp</Badge>;
      case "EXPIRED":
        return (
          <Badge tone="bad" dot>
            Đã Hết Hạn
          </Badge>
        );
      case "CANCELLED":
        return <Badge tone="neutral">Đã Hủy</Badge>;
      case "PENDING":
      default:
        return (
          <Badge tone="warn" dot>
            Chờ Duyệt
          </Badge>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ShiftRequestFeedback
        message={permissionError || storeRequestsError}
        onRetry={storeRequestsError ? fetchStoreRequests : undefined}
      />
      {/* Thanh bộ lọc & Làm mới */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "12px 16px",
          background: c.bgCard,
          border: `1px solid ${c.border}`,
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterTab("PENDING")}
            style={{
              background: filterTab === "PENDING" ? c.accent : c.bgCard,
              color: filterTab === "PENDING" ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === "PENDING" ? c.accent : c.border}`,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span>Chờ Cửa Hàng Trưởng Duyệt</span>
            {pendingCount > 0 && (
              <span
                style={{
                  background: filterTab === "PENDING" ? c.ink : "#ef4444",
                  color: filterTab === "PENDING" ? c.accent : "#ffffff",
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 10,
                  fontWeight: 800,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("APPROVED")}
            style={{
              background: filterTab === "APPROVED" ? c.accent : c.bgCard,
              color: filterTab === "APPROVED" ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === "APPROVED" ? c.accent : c.border}`,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Đã Phê Duyệt
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("REJECTED")}
            style={{
              background: filterTab === "REJECTED" ? c.accent : c.bgCard,
              color: filterTab === "REJECTED" ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === "REJECTED" ? c.accent : c.border}`,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Đã Từ Chối
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            style={{
              background: filterTab === "ALL" ? c.accent : c.bgCard,
              color: filterTab === "ALL" ? c.ink : c.fgSubtle,
              border: `1px solid ${filterTab === "ALL" ? c.accent : c.border}`,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Tất Cả ({totalCount})
          </button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchStoreRequests}
          disabled={loading || busy}
        >
          <Icon name="refresh" size={14} style={{ marginRight: 6 }} />
          Làm Mới Danh Sách
        </Button>
      </div>

      {/* Danh sách các đơn */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: c.fgSubtle,
              background: c.bgCard,
              borderRadius: 10,
              border: `1px solid ${c.border}`,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <Icon name="pulse" size={24} color={c.accent} />
            </div>
            <span>Đang tải danh sách đơn xét duyệt đổi ca...</span>
          </div>
        ) : (permissionError || storeRequestsError) &&
          filteredRequests.length === 0 ? null : filteredRequests.length ===
          0 ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: c.fgFaint,
              background: c.bgCard,
              borderRadius: 10,
              border: `1px solid ${c.border}`,
            }}
          >
            <Icon
              name="checkCircle"
              size={28}
              color="#22c55e"
              style={{ margin: "0 auto 8px" }}
            />
            <div style={{ fontSize: 14, fontWeight: 650, color: c.fg }}>
              Không có đơn nào trong mục này
            </div>
            <div style={{ fontSize: 12, color: c.fgFaint, marginTop: 4 }}>
              Chi nhánh hiện không có đơn yêu cầu đổi ca / xin nghỉ cần xử lý.
            </div>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isLeave = req.requestType === "LEAVE";
            const isPending = req.canReview;
            const isItemBusy = actionLoadingId === req.swapRequestId;

            return (
              <div
                key={req.swapRequestId}
                style={{
                  background: c.bgCard,
                  border: `1px solid ${c.border}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Tiêu đề card */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: `${c.accent}20`,
                        color: c.accent,
                      }}
                    >
                      <Icon
                        name={isLeave ? "calendar" : "swap"}
                        size={15}
                        color={c.accent}
                      />
                    </span>
                    <span
                      style={{ fontWeight: 750, fontSize: 14.5, color: c.fg }}
                    >
                      {isLeave
                        ? "Đơn Xin Nghỉ Ca (Có Việc Bận)"
                        : "Đơn Đổi Ca Cho Nhau (2 Chiều)"}
                    </span>
                    <span style={{ fontSize: 11.5, color: c.fgFaint }}>
                      #{req.swapRequestId} ·{" "}
                      {new Date(req.createdAt).toLocaleString("vi-VN")}
                    </span>
                    {req.isDispatchedEmployee && (
                      <span
                        style={{
                          background: `${c.tones.info}20`,
                          color: c.tones.info,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Biệt phái từ {req.sourceBranchName || "Chi nhánh khác"}
                      </span>
                    )}
                  </div>
                  <div>{renderStatusBadge(req.status)}</div>
                </div>

                {/* Chi tiết người gửi và người nhận */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 14,
                    background: c.bgElev,
                    padding: "14px 16px",
                    borderRadius: 8,
                    border: `1px solid ${c.borderSub}`,
                    fontSize: 13,
                  }}
                >
                  {/* Người gửi */}
                  <div>
                    <div
                      style={{
                        color: c.fgFaint,
                        fontSize: 11,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Nhân Viên Làm Đơn:
                    </div>
                    <div
                      style={{ fontWeight: 750, fontSize: 13.5, color: c.fg }}
                    >
                      {req.requesterName}{" "}
                      <span style={{ fontSize: 11.5, color: c.accent }}>
                        ({req.requesterRoleName || "Nhân viên"})
                      </span>
                    </div>
                    <div
                      style={{
                        color: c.accent,
                        marginTop: 4,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Icon name="calendar" size={13} color={c.accent} />
                      <span>
                        {req.requesterWorkDate} ·{" "}
                        {formatShiftTemplateName(req.requesterShiftName)} (
                        {req.requesterTimeRange})
                      </span>
                    </div>
                  </div>

                  {/* Người nhận */}
                  <div>
                    <div
                      style={{
                        color: c.fgFaint,
                        fontSize: 11,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {isLeave
                        ? "Nhân Sự Thay Thế:"
                        : "Đổi Với Ca Của Đồng Nghiệp:"}
                    </div>
                    {isLeave ? (
                      <div
                        style={{
                          color: c.fgSubtle,
                          marginTop: 4,
                          fontSize: 12.5,
                          fontStyle: "italic",
                        }}
                      >
                        Chưa có (Duyệt đơn sẽ hủy ca, Quản lý tự xếp người khác)
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            fontWeight: 750,
                            fontSize: 13.5,
                            color: c.fg,
                          }}
                        >
                          {req.targetName}{" "}
                          <span style={{ fontSize: 11.5, color: c.accent }}>
                            ({req.targetRoleName || "Nhân viên"})
                          </span>
                        </div>
                        <div
                          style={{
                            color: c.accent,
                            marginTop: 4,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Icon name="calendar" size={13} color={c.accent} />
                          <span>
                            {req.targetWorkDate} ·{" "}
                            {formatShiftTemplateName(req.targetShiftName)} (
                            {req.targetTimeRange})
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Lý do */}
                {req.reason && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: c.fgSubtle,
                      background: `${c.bgElev}80`,
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: `1px solid ${c.borderSub}`,
                    }}
                  >
                    <strong>Lý do từ nhân viên:</strong> {req.reason}
                  </div>
                )}

                {/* Footer card: Thao tác duyệt hoặc thông tin người duyệt */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 8,
                    borderTop: `1px dashed ${c.borderSub}`,
                  }}
                >
                  <div style={{ fontSize: 11.5, color: c.fgFaint }}>
                    {req.reviewedByName && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Icon name="edit" size={12} color={c.fgFaint} />
                        <span>
                          Đã duyệt bởi <strong>{req.reviewedByName}</strong> lúc{" "}
                          {new Date(req.reviewedAt).toLocaleString("vi-VN")}
                        </span>
                      </span>
                    )}
                  </div>

                  {isPending && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => handleReview(req.swapRequestId, false)}
                        style={{
                          color: "#ef4444",
                          border: "1px solid #ef4444",
                        }}
                      >
                        {isItemBusy ? "Đang Xử Lý..." : "❌ Từ Chối"}
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy}
                        onClick={() => handleReview(req.swapRequestId, true)}
                      >
                        {isItemBusy ? "Đang Phê Duyệt..." : "✅ Phê Duyệt Ngay"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
