import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import { DAY_NAMES_VN, formatVNDate } from '../hooks/useWeeklySchedule';

// Bảng màu cho từng ca làm việc để dễ nhận biết trực quan
const SHIFT_COLORS = {
  MORNING: { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#38bdf8' },
  AFTERNOON: { bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c', text: '#fb923c' },
  NIGHT: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#a855f7' },
  DEFAULT: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e' },
};

const getShiftColorStyle = (shiftName = '') => {
  const nameUpper = shiftName.toUpperCase();
  if (nameUpper.includes('SÁNG') || nameUpper.includes('MORNING')) return SHIFT_COLORS.MORNING;
  if (nameUpper.includes('CHIỀU') || nameUpper.includes('AFTERNOON')) return SHIFT_COLORS.AFTERNOON;
  if (nameUpper.includes('TỐI') || nameUpper.includes('ĐÊM') || nameUpper.includes('NIGHT')) return SHIFT_COLORS.NIGHT;
  return SHIFT_COLORS.DEFAULT;
};

export default function WeeklyRosterMatrix({
  days = [],
  employees = [],
  loading = false,
  onCellClick,
  onDeleteAssignment,
  isPublished = false,
}) {
  const { c, fonts } = useAdminTheme();

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: c.fgFaint }}>
        <div style={{ display: 'inline-block', width: 32, height: 32, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12, fontSize: 13 }}>Đang tải ma trận lịch ca tuần...</div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: c.fgFaint, background: c.bgCard, borderRadius: 12, border: `1px solid ${c.border}` }}>
        <Icon name="users" size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: c.fg }}>Không tìm thấy nhân viên nào phù hợp</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Vui lòng kiểm tra lại bộ lọc tìm kiếm hoặc nạp nhân sự chi nhánh.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 950 }}>
          <thead>
            <tr style={{ background: c.bgRaised, borderBottom: `2px solid ${c.border}` }}>
              {/* Cột thông tin nhân viên */}
              <th style={{ padding: '14px 16px', width: 240, color: c.fg, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Nhân Sự Chi Nhánh
              </th>

              {/* 7 cột cho 7 ngày trong tuần */}
              {days.map((dateStr, idx) => (
                <th
                  key={dateStr}
                  style={{
                    padding: '12px 10px',
                    textAlign: 'center',
                    borderLeft: `1px solid ${c.borderSub}`,
                    color: c.fg,
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 800 }}>{DAY_NAMES_VN[idx]}</div>
                  <div style={{ fontSize: 11, color: c.accent, marginTop: 2 }}>{formatVNDate(dateStr)}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {employees.map((emp, empIdx) => {
              const assignedShiftsMap = new Map();
              (emp.assignedShifts || []).forEach((cell) => {
                assignedShiftsMap.set(cell.date, cell);
              });

              const totalShiftsInWeek = emp.assignedShifts ? emp.assignedShifts.length : 0;

              return (
                <tr
                  key={emp.userId}
                  style={{
                    borderBottom: `1px solid ${c.borderSub}`,
                    background: empIdx % 2 === 0 ? 'transparent' : `${c.bgElev}50`,
                  }}
                >
                  {/* Cột nhân viên */}
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: c.accentDim,
                          color: c.accent,
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                          flexShrink: 0,
                          border: `1px solid ${c.accent}`,
                        }}
                      >
                        {emp.fullName ? emp.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 750, fontSize: 13, color: c.fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {emp.fullName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: c.fgFaint, fontFamily: 'monospace' }}>
                            {emp.employeeCode}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: c.track,
                              color: c.fgSubtle,
                              fontWeight: 600,
                            }}
                          >
                            {emp.roleName || emp.roleCode}
                          </span>
                          <span style={{ fontSize: 10, color: c.accent, fontWeight: 700 }}>
                            ({totalShiftsInWeek} ca)
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 7 ô lịch */}
                  {days.map((dateStr) => {
                    const assignment = assignedShiftsMap.get(dateStr);

                    return (
                      <td
                        key={dateStr}
                        style={{
                          padding: '8px',
                          borderLeft: `1px solid ${c.borderSub}`,
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          height: 60,
                        }}
                      >
                        {assignment ? (
                          // Thẻ ca đã gán
                          <div
                            style={{
                              ...(() => {
                                const style = getShiftColorStyle(assignment.shiftName);
                                return {
                                  background: style.bg,
                                  border: `1px solid ${style.border}`,
                                  color: style.text,
                                };
                              })(),
                              borderRadius: 6,
                              padding: '6px 8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              position: 'relative',
                              fontSize: 11,
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                            onClick={() => onCellClick && onCellClick({ user: emp, date: dateStr, currentAssignment: assignment })}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 800 }}>{assignment.shiftName}</span>
                              {/* Nút hủy phân công */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Bạn có chắc muốn hủy ca '${assignment.shiftName}' ngày ${formatVNDate(dateStr)} của NV ${emp.fullName}?`)) {
                                    onDeleteAssignment && onDeleteAssignment(assignment.assignmentId);
                                  }
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: c.tones.bad,
                                  cursor: 'pointer',
                                  padding: 0,
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: 14,
                                  fontWeight: 800,
                                  lineHeight: 1,
                                }}
                                title="Hủy ca trực"
                              >
                                ×
                              </button>
                            </div>
                            <div style={{ fontSize: 9.5, opacity: 0.85 }}>
                              {assignment.startTime ? assignment.startTime.substring(0, 5) : ''} - {assignment.endTime ? assignment.endTime.substring(0, 5) : ''}
                            </div>
                          </div>
                        ) : (
                          // Ô trống - Bấm để thêm ca
                          <button
                            onClick={() => onCellClick && onCellClick({ user: emp, date: dateStr, currentAssignment: null })}
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 38,
                              background: 'transparent',
                              border: `1px dashed ${c.borderSub}`,
                              borderRadius: 6,
                              color: c.fgFaint,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = c.bgElev;
                              e.currentTarget.style.borderColor = c.accent;
                              e.currentTarget.style.color = c.accent;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = c.borderSub;
                              e.currentTarget.style.color = c.fgFaint;
                            }}
                            title={`Gán ca cho ${emp.fullName} ngày ${formatVNDate(dateStr)}`}
                          >
                            <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
