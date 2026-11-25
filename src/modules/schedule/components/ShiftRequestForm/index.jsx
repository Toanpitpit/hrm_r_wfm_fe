import { useAdminTheme } from "@/shared/context/ThemeContext";
import Button from "@/shared/components/ui/Button";
import FormField from "@/shared/components/ui/FormField";
import Icon from "@/shared/components/ui/Icon";
import ShiftRequestFeedback from "../ShiftRequestFeedback";

export default function ShiftRequestForm({
  requestType,
  setRequestType,
  selectedMyAssignmentId,
  setSelectedMyAssignmentId,
  myUpcomingShifts,
  selectedColleagueId,
  setSelectedColleagueId,
  colleagues,
  selectedTargetAssignmentId,
  setSelectedTargetAssignmentId,
  colleagueShifts,
  loadingShifts,
  loadingColleagues,
  loadingColleagueShifts,
  colleagueShiftsError,
  colleaguesError,
  shiftsError,
  reason,
  setReason,
  submitting,
  validationErrors,
  fetchMyShifts,
  fetchColleagues,
  fetchColleagueShifts,
  isAdvanceNoticeValid,
  onSubmit,
  fixedShift = false,
}) {
  const { c, fonts } = useAdminTheme();
  return (
    <>
      <ShiftRequestFeedback message={shiftsError} onRetry={fetchMyShifts} />
      <ShiftRequestFeedback
        message={colleaguesError}
        onRetry={fetchColleagues}
      />
      <ShiftRequestFeedback
        message={colleagueShiftsError}
        onRetry={fetchColleagueShifts}
      />
      <ShiftRequestFeedback
        message={
          fixedShift && !isAdvanceNoticeValid
            ? "Đơn xin đổi/nghỉ ca phải được gửi trước ngày làm việc ít nhất 1 ngày."
            : null
        }
      />
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          paddingTop: 10,
        }}
      >
        <fieldset
          disabled={submitting}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Mode Selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: c.fg,
                marginBottom: 10,
              }}
            >
              Hình thức yêu cầu (*):
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setRequestType("LEAVE")}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: `1.5px solid ${requestType === "LEAVE" ? c.accent : c.border}`,
                  backgroundColor:
                    requestType === "LEAVE"
                      ? "rgba(16, 185, 129, 0.08)"
                      : c.bgCard,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <Icon
                    name="calendar"
                    size={18}
                    color={requestType === "LEAVE" ? c.accent : c.fgMuted}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: requestType === "LEAVE" ? c.accent : c.fg,
                    }}
                  >
                    1. Xin Nghỉ Ca Đột Xuất
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: c.fgSubtle,
                    lineHeight: 1.4,
                  }}
                >
                  Xin nghỉ ca làm việc đã được phân công do có việc bận hoặc lý
                  do cá nhân.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRequestType("SWAP")}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: `1.5px solid ${requestType === "SWAP" ? c.accent : c.border}`,
                  backgroundColor:
                    requestType === "SWAP"
                      ? "rgba(16, 185, 129, 0.08)"
                      : c.bgCard,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <Icon
                    name="swap"
                    size={18}
                    color={requestType === "SWAP" ? c.accent : c.fgMuted}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: requestType === "SWAP" ? c.accent : c.fg,
                    }}
                  >
                    2. Đổi Ca Cho Đồng Nghiệp
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: c.fgSubtle,
                    lineHeight: 1.4,
                  }}
                >
                  Tráo đổi ca trực tương đương giữa bạn và đồng nghiệp cùng chi
                  nhánh.
                </p>
              </button>
            </div>
          </div>

          {/* Step 1: Select My Assignment */}
          <FormField
            label="Chọn ca trực của bạn cần điều chỉnh (*)"
            error={validationErrors.assignmentId}
          >
            <select
              disabled={loadingShifts || Boolean(fixedShift)}
              value={selectedMyAssignmentId}
              onChange={(e) => setSelectedMyAssignmentId(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: c.bgRaised,
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                padding: "10px 14px",
                color: c.fg,
                fontSize: 13,
                fontFamily: fonts?.body || "inherit",
                outline: "none",
              }}
            >
              <option
                value=""
                style={{ backgroundColor: c.bgElev, color: c.fgMuted }}
              >
                {loadingShifts
                  ? "Đang tải ca trực của bạn..."
                  : "-- Chọn ca trực của bạn --"}
              </option>
              {Array.isArray(myUpcomingShifts) &&
                myUpcomingShifts.map((sh) => (
                  <option
                    key={sh.assignmentId}
                    value={sh.assignmentId}
                    style={{ backgroundColor: c.bgElev, color: c.fg }}
                  >
                    {sh.workDate} ({sh.shiftName}: {sh.startTime} - {sh.endTime}
                    )
                  </option>
                ))}
            </select>
          </FormField>

          {/* Step 2 (SWAP only): Select Colleague and their shift */}
          {requestType === "SWAP" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              <FormField
                label="Chọn đồng nghiệp cùng chi nhánh (*)"
                error={validationErrors.targetEmployeeId}
              >
                <select
                  disabled={
                    !selectedMyAssignmentId ||
                    loadingColleagues ||
                    Boolean(colleaguesError)
                  }
                  value={selectedColleagueId}
                  onChange={(e) => setSelectedColleagueId(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4,
                    padding: "10px 14px",
                    color: c.fg,
                    fontSize: 13,
                    fontFamily: fonts?.body || "inherit",
                    outline: "none",
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: c.bgElev, color: c.fgMuted }}
                  >
                    {loadingColleagues
                      ? "Đang tải đồng nghiệp..."
                      : "-- Chọn đồng nghiệp đổi ca --"}
                  </option>
                  {Array.isArray(colleagues) &&
                    colleagues.map((col) => (
                      <option
                        key={col.employeeId}
                        value={col.employeeId}
                        style={{ backgroundColor: c.bgElev, color: c.fg }}
                      >
                        {col.fullName} ({col.roleName})
                      </option>
                    ))}
                </select>
              </FormField>

              <FormField
                label="Chọn ca trực của đồng nghiệp để đổi (*)"
                error={validationErrors.targetAssignmentId}
              >
                <select
                  value={selectedTargetAssignmentId}
                  onChange={(e) =>
                    setSelectedTargetAssignmentId(e.target.value)
                  }
                  disabled={
                    loadingColleagueShifts || colleagueShifts.length === 0
                  }
                  style={{
                    width: "100%",
                    backgroundColor: !selectedColleagueId
                      ? c.bgCard
                      : c.bgRaised,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4,
                    padding: "10px 14px",
                    color: c.fg,
                    fontSize: 13,
                    fontFamily: fonts?.body || "inherit",
                    outline: "none",
                    opacity: !selectedColleagueId ? 0.6 : 1,
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: c.bgElev, color: c.fgMuted }}
                  >
                    {!selectedMyAssignmentId
                      ? "-- Vui lòng chọn ca trực của bạn trước --"
                      : !selectedColleagueId
                        ? "-- Vui lòng chọn đồng nghiệp trước --"
                        : loadingColleagueShifts
                          ? "Đang kiểm tra ca có thể đổi..."
                          : colleagueShiftsError
                            ? "Không tải được danh sách ca có thể đổi"
                            : colleagueShifts.length === 0
                              ? "Đồng nghiệp không có ca trực khả dụng"
                              : "-- Chọn ca trực của đồng nghiệp --"}
                  </option>
                  {Array.isArray(colleagueShifts) &&
                    colleagueShifts.map((cs) => {
                      return (
                        <option
                          key={cs.assignmentId}
                          value={cs.assignmentId}
                          style={{ backgroundColor: c.bgElev, color: c.fg }}
                        >
                          {cs.workDate} ({cs.shiftName}: {cs.timeRange})
                          {cs.isSameDay ? " [Đổi cùng ngày]" : ""}
                        </option>
                      );
                    })}
                </select>
              </FormField>
            </div>
          )}

          {/* Step 3: Reason */}
          <FormField
            label={
              requestType === "LEAVE"
                ? "Lý do xin nghỉ ca (*)"
                : "Lý do xin điều chỉnh"
            }
            error={validationErrors.reason}
          >
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết gửi Cửa hàng trưởng xem xét phê duyệt..."
              style={{
                width: "100%",
                backgroundColor: c.bgRaised,
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                padding: "12px 16px",
                color: c.fg,
                fontSize: 13,
                fontFamily: fonts?.body || "inherit",
                outline: "none",
              }}
            />
          </FormField>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: 8,
            }}
          >
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={
                submitting ||
                loadingShifts ||
                (fixedShift && !isAdvanceNoticeValid) ||
                (requestType === "SWAP" &&
                  (loadingColleagues ||
                    loadingColleagueShifts ||
                    !selectedTargetAssignmentId))
              }
            >
              Gửi Đơn Yêu Cầu
            </Button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
