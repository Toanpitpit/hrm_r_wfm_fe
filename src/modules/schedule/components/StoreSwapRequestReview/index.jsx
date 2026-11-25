import { useAdminTheme } from "@/shared/context/ThemeContext";
import Button from "@/shared/components/ui/Button";
import SearchInput from "@/shared/components/ui/SearchInput";
import Pagination from "@/shared/components/ui/Pagination";
import ShiftRequestStatusBadge, {
  ShiftRequestTypeBadge,
} from "../ShiftRequestStatusBadge";
import ShiftRequestFeedback from "../ShiftRequestFeedback";

export default function StoreSwapRequestReview({
  tabs,
  reviewFilter,
  setReviewFilter,
  searchTerm,
  setSearchTerm,
  loadingStoreRequests,
  requests,
  totalItems,
  actionLoadingId,
  reviewPage,
  reviewPageSize,
  setReviewPage,
  setReviewPageSize,
  storeRequestsError,
  fetchStoreRequests,
  onReview,
}) {
  const { c, fonts, isDark } = useAdminTheme();
  const handleReviewAction = onReview;
  const thStyle = {
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: c.fgSubtle,
    borderBottom: `1px solid ${c.border}`,
    textAlign: "left",
  };

  const tdStyle = {
    padding: "14px 16px",
    fontSize: 13,
    color: c.fg,
    borderBottom: `1px solid ${c.borderSub}`,
    verticalAlign: "middle",
  };

  return (
    <>
      <ShiftRequestFeedback
        message={storeRequestsError}
        onRetry={fetchStoreRequests}
      />

      {/* Filter bar & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Tab Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map(({ key, label, count }) => {
            const active = reviewFilter === key;
            return (
              <button
                key={key}
                onClick={() => setReviewFilter(key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: `1px solid ${active ? c.accent : c.border}`,
                  background: active
                    ? "rgba(242, 202, 80, 0.12)"
                    : "transparent",
                  color: active ? c.accent : c.fgMuted,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    background: active
                      ? `${c.accent}20`
                      : isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                    color: active ? c.accent : c.fgSubtle,
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: "1px 6px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div style={{ width: 280 }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm nhân viên, ca làm, lý do..."
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {loadingStoreRequests ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: c.fgSubtle,
            fontSize: 13,
          }}
        >
          Đang tải danh sách đơn chi nhánh...
        </div>
      ) : storeRequestsError && totalItems === 0 ? null : totalItems === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: c.fgSubtle,
            backgroundColor: c.bgRaised,
            borderRadius: 8,
            border: `1px dashed ${c.border}`,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Không tìm thấy đơn xin nghỉ ca / đổi ca nào phù hợp với bộ lọc.
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              overflowX: "auto",
              borderRadius: 8,
              border: `1px solid ${c.border}`,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: fonts.body,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: c.bgElev,
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  <th style={thStyle}>Mã Đơn</th>
                  <th style={thStyle}>Nhân Sự Làm Đơn</th>
                  <th style={thStyle}>Hình Thức</th>
                  <th style={thStyle}>Ca Trực Cần Điều Chỉnh</th>
                  <th style={thStyle}>Đồng Nghiệp Tiếp Nhận</th>
                  <th style={thStyle}>Lý Do</th>
                  <th style={thStyle}>Trạng Thái</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.swapRequestId}
                    style={{
                      borderBottom: `1px solid ${c.borderSub}`,
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = c.bgRaised)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: c.accent,
                          fontSize: 12,
                        }}
                      >
                        #SR-{String(req.swapRequestId).padStart(4, "0")}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: c.fg }}>
                        {req.requesterName}
                      </div>
                      <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                        {req.requesterRoleName || "Nhân viên"}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <ShiftRequestTypeBadge type={req.requestType} />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: c.fg }}>
                        {req.requesterShiftName}
                      </div>
                      <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                        📅 {req.requesterWorkDate} ({req.requesterTimeRange})
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {req.targetName &&
                      req.targetName !== "Không có (Xin nghỉ ca)" ? (
                        <div>
                          <div style={{ fontWeight: 600, color: c.fg }}>
                            {req.targetName}
                          </div>
                          {req.targetWorkDate && (
                            <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                              Ca đổi: {req.targetWorkDate} {req.targetShiftName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: c.fgSubtle }}>
                          — (Xin nghỉ)
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontSize: 12,
                          color: c.fgMuted,
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={req.reason}
                      >
                        {req.reason || "—"}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <ShiftRequestStatusBadge status={req.status} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {req.canReview ? (
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <Button
                            variant="success"
                            size="sm"
                            loading={actionLoadingId === req.swapRequestId}
                            disabled={actionLoadingId !== null}
                            onClick={() =>
                              handleReviewAction(req.swapRequestId, true)
                            }
                          >
                            Duyệt
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={actionLoadingId === req.swapRequestId}
                            disabled={actionLoadingId !== null}
                            onClick={() =>
                              handleReviewAction(req.swapRequestId, false)
                            }
                          >
                            Từ Chối
                          </Button>
                        </div>
                      ) : req.status === "EXPIRED" ||
                        req.status === "EXPRIED" ? (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: c.fgSubtle,
                            fontStyle: "italic",
                          }}
                        >
                          Đã quá hạn ca trực
                        </div>
                      ) : (
                        <div style={{ fontSize: 11.5, color: c.fgSubtle }}>
                          {req.reviewedByName && (
                            <div>Bởi: {req.reviewedByName}</div>
                          )}
                          {req.reviewedAt && (
                            <div>
                              {new Date(req.reviewedAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16 }}>
            <Pagination
              page={reviewPage}
              pageSize={reviewPageSize}
              totalItems={totalItems}
              onPageChange={setReviewPage}
              onPageSizeChange={setReviewPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </div>
      )}
    </>
  );
}
