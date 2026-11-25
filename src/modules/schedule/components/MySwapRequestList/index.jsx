import { useAdminTheme } from "@/shared/context/ThemeContext";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import Pagination from "@/shared/components/ui/Pagination";
import ShiftRequestStatusBadge, {
  ShiftRequestTypeBadge,
} from "../ShiftRequestStatusBadge";
import ShiftRequestFeedback from "../ShiftRequestFeedback";

export default function MySwapRequestList({
  myTab,
  setMyTab,
  receivedPendingCount,
  loadingMyRequests,
  requests,
  totalItems,
  myPage,
  myPageSize,
  setMyPage,
  setMyPageSize,
  actionLoadingId,
  myRequestsError,
  fetchMyRequests,
  onRespond,
  onCancel,
}) {
  const { c } = useAdminTheme();
  const handlePeerReview = onRespond;
  const handleCancelRequest = onCancel;
  return (
    <>
      <ShiftRequestFeedback
        message={myRequestsError}
        onRetry={fetchMyRequests}
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: `1px solid ${c.borderSub}`,
          paddingBottom: 10,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => setMyTab("SENT")}
          style={{
            background: myTab === "SENT" ? c.accent : c.bgCard,
            color: myTab === "SENT" ? c.ink : c.fgSubtle,
            border: `1px solid ${myTab === "SENT" ? c.accent : c.border}`,
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đơn Tôi Đã Gửi
        </button>
        <button
          type="button"
          onClick={() => setMyTab("RECEIVED")}
          style={{
            background: myTab === "RECEIVED" ? c.accent : c.bgCard,
            color: myTab === "RECEIVED" ? c.ink : c.fgSubtle,
            border: `1px solid ${myTab === "RECEIVED" ? c.accent : c.border}`,
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Đơn Cần Tôi Duyệt</span>
          {receivedPendingCount > 0 && (
            <span
              style={{
                background: myTab === "RECEIVED" ? c.ink : c.tones.bad,
                color: myTab === "RECEIVED" ? c.accent : c.fg,
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 10,
                fontWeight: 800,
              }}
            >
              {receivedPendingCount}
            </span>
          )}
        </button>
      </div>
      {loadingMyRequests ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: c.fgSubtle,
            fontSize: 13,
          }}
        >
          Đang tải danh sách đơn...
        </div>
      ) : myRequestsError && totalItems === 0 ? null : totalItems === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: c.fgSubtle,
            fontSize: 13,
            fontStyle: "italic",
          }}
        >
          {myTab === "SENT"
            ? "Bạn chưa gửi đơn xin đổi / chuyển ca nào."
            : "Không có đơn nào chờ bạn duyệt."}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 10,
            }}
          >
            {requests.map((req) => {
              const requiresPeerReview = req.canRespond;
              return (
                <div
                  key={req.swapRequestId}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 8,
                    backgroundColor: c.bgCard,
                    border: `1px solid ${c.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <ShiftRequestTypeBadge type={req.requestType} />
                      <ShiftRequestStatusBadge status={req.status} />
                      <span style={{ fontSize: 12, color: c.fgSubtle }}>
                        Khởi tạo:{" "}
                        {new Date(req.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>
                      Ca trực cần điều chỉnh:{" "}
                      <span style={{ color: c.accent }}>
                        {req.requesterWorkDate} ({req.requesterShiftName}:{" "}
                        {req.requesterTimeRange})
                      </span>
                    </div>

                    {req.targetName && (
                      <div style={{ fontSize: 13, color: c.fgMuted }}>
                        Đối tác tiếp nhận:{" "}
                        <strong style={{ color: c.fg }}>
                          {req.targetName}
                        </strong>
                        {req.targetWorkDate && (
                          <span style={{ marginLeft: 6, color: c.fgSubtle }}>
                            (Ca đổi: {req.targetWorkDate} {req.targetShiftName}{" "}
                            {req.targetTimeRange})
                          </span>
                        )}
                      </div>
                    )}

                    {req.reason && (
                      <div
                        style={{
                          fontSize: 12,
                          color: c.fgSubtle,
                          fontStyle: "italic",
                        }}
                      >
                        "Lý do: {req.reason}"
                      </div>
                    )}
                  </div>

                  {req.reviewedByName && (
                    <div
                      style={{
                        fontSize: 12,
                        color: c.fgSubtle,
                        textAlign: "right",
                        paddingLeft: 16,
                        borderLeft: `1px solid ${c.borderSub}`,
                      }}
                    >
                      <div>
                        Người duyệt:{" "}
                        <strong style={{ color: c.fg }}>
                          {req.reviewedByName}
                        </strong>
                      </div>
                      <div>
                        {req.reviewedAt
                          ? new Date(req.reviewedAt).toLocaleString("vi-VN")
                          : ""}
                      </div>
                    </div>
                  )}
                  {/* Action buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 12,
                      justifyContent: "flex-end",
                      width: "100%",
                    }}
                  >
                    {requiresPeerReview && (
                      <>
                        <Button
                          variant="primary"
                          kind="primary"
                          size="sm"
                          onClick={() =>
                            handlePeerReview(req.swapRequestId, true)
                          }
                          loading={actionLoadingId === req.swapRequestId}
                          disabled={actionLoadingId !== null}
                          style={{
                            background: c.tones.ok,
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          <Icon name="check" size={14} /> Đồng Ý Đổi Ca
                        </Button>
                        <Button
                          variant="primary"
                          kind="danger"
                          size="sm"
                          onClick={() =>
                            handlePeerReview(req.swapRequestId, false)
                          }
                          loading={actionLoadingId === req.swapRequestId}
                          disabled={actionLoadingId !== null}
                        >
                          Từ Chối
                        </Button>
                      </>
                    )}
                    {req.canCancel && (
                      <Button
                        variant="ghost"
                        kind="danger"
                        size="sm"
                        onClick={() => handleCancelRequest(req.swapRequestId)}
                        loading={actionLoadingId === req.swapRequestId}
                        disabled={actionLoadingId !== null}
                      >
                        Hủy Đơn
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalItems > 0 && (
            <div style={{ marginTop: 16 }}>
              <Pagination
                page={myPage}
                pageSize={myPageSize}
                totalItems={totalItems}
                onPageChange={setMyPage}
                onPageSizeChange={setMyPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
