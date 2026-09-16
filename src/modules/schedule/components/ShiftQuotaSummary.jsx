import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import { DAY_NAMES_VN, formatVNDate } from '../hooks/useWeeklySchedule';

export default function ShiftQuotaSummary({
  days = [],
  schedules = [],
  onEditScheduleQuota,
}) {
  const { c, fonts } = useAdminTheme();

  if (!days || days.length === 0) return null;

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: c.accent, display: 'flex' }}><Icon name="clock" size={18} /></span>
          <span style={{ fontWeight: 800, fontSize: 15, color: c.fg, fontFamily: fonts.display }}>
            Định Mức Nhu Cầu Nhân Sự Từng Ca (Quota Tracking)
          </span>
          <span style={{ fontSize: 12, color: c.fgFaint }}>
            — Bấm vào từng ca để chỉnh sửa định mức
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: c.tones.good }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.tones.good }}></span>
            Đủ định mức
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: c.tones.bad }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.tones.bad }}></span>
            Thiếu nhân sự
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, overflowX: 'auto' }}>
        {days.map((dateStr, idx) => {
          const dayName = DAY_NAMES_VN[idx] || `Ngày ${idx + 1}`;
          const daySchedules = schedules.filter((s) => s.workDate === dateStr);

          return (
            <div
              key={dateStr}
              style={{
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: '10px 8px',
                minWidth: 130,
              }}
            >
              {/* Tiêu đề ngày */}
              <div style={{ borderBottom: `1px solid ${c.borderSub}`, paddingBottom: 6, marginBottom: 8, textAlign: 'center' }}>
                <div style={{ fontWeight: 750, fontSize: 13, color: c.fg }}>{dayName}</div>
                <div style={{ fontSize: 11, color: c.fgFaint }}>{formatVNDate(dateStr)}</div>
              </div>

              {/* Danh sách ca trong ngày */}
              {daySchedules.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: 11, color: c.fgFaint, padding: '10px 0' }}>
                  Chưa sinh ca
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {daySchedules.map((s) => {
                    const isCashierOk = s.assignedCashierCount >= s.requiredCashier;
                    const isSalesOk = s.assignedSalesCount >= s.requiredSales;
                    const isSecurityOk = s.assignedSecurityCount >= s.requiredSecurity;
                    const isAllOk = isCashierOk && isSalesOk && isSecurityOk;

                    return (
                      <div
                        key={s.scheduleId}
                        onClick={() => onEditScheduleQuota && onEditScheduleQuota(s)}
                        style={{
                          background: isAllOk ? `${c.accentDim}25` : `${c.tones.bad}15`,
                          border: `1px solid ${isAllOk ? c.accent : c.tones.bad}`,
                          borderRadius: 6,
                          padding: '6px 8px',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                        title={`Bấm để điều chỉnh định mức ca ${s.shiftTemplateName}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 11.5, color: isAllOk ? c.accent : c.tones.bad }}>
                            {s.shiftTemplateName}
                          </span>
                          <span style={{ fontSize: 10, color: c.fgFaint }}>
                            {s.startTime.substring(0, 5)}
                          </span>
                        </div>

                        {/* Chi tiết chỉ tiêu từng vị trí */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10.5 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: isCashierOk ? c.fgSubtle : c.tones.bad }}>
                            <span>TN (Thu ngân):</span>
                            <strong>{s.assignedCashierCount}/{s.requiredCashier}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: isSalesOk ? c.fgSubtle : c.tones.bad }}>
                            <span>BH (Bán hàng):</span>
                            <strong>{s.assignedSalesCount}/{s.requiredSales}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: isSecurityOk ? c.fgSubtle : c.tones.bad }}>
                            <span>BV (Bảo vệ):</span>
                            <strong>{s.assignedSecurityCount}/{s.requiredSecurity}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
