import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Panel from '@/shared/components/ui/Panel';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: Shift24hTimeline.jsx
 * UC 1.3: Trực quan hóa sơ đồ phân bổ các ca làm việc trong 24 giờ
 * ==============================================================================
 */
export default function Shift24hTimeline({ shifts = [] }) {
  const { c } = useAdminTheme();

  const activeShifts = (shifts || []).filter((s) => s.isActive);
  const hours = Array.from({ length: 25 }, (_, i) => i);

  // Helper tính tọa độ phần trăm trên thanh 24h
  const getShiftPosition = (startTime, endTime, isOvernight) => {
    if (!startTime || !endTime) return { left: '0%', width: '0%' };
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (isOvernight || endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalDayMinutes = 24 * 60;
    const leftPercent = (startMinutes / totalDayMinutes) * 100;
    const widthPercent = ((endMinutes - startMinutes) / totalDayMinutes) * 100;

    return {
      left: `${Math.min(100, Math.max(0, leftPercent))}%`,
      width: `${Math.min(100, Math.max(2, widthPercent))}%`,
    };
  };

  return (
    <Panel style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon
            name="calendar"
            size={16}
          />
          <span style={{ fontWeight: 700, fontSize: '14px', color: c.fg }}>
            Sơ Đồ Phân Bổ Ca Trực 24 Giờ (24h Timeline Visualizer)
          </span>
        </div>
        <Badge tone="accent">
          <span>{activeShifts.length} Khung Ca Đang Phủ Sóng</span>
        </Badge>
      </div>

      {/* Dải thước đo 24h */}
      <div
        style={{
          position: 'relative',
          paddingBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {/* Thước đo giờ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${c.border}`,
            paddingBottom: '6px',
            marginBottom: '12px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: c.fgSubtle,
          }}
        >
          {hours
            .filter((h) => h % 3 === 0)
            .map((h) => (
              <div key={h}>{String(h).padStart(2, '0')}:00</div>
            ))}
        </div>

        {/* Các thanh ca trực quan */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minHeight: '80px',
          }}
        >
          {activeShifts.map((shift, idx) => {
            const { left, width } = getShiftPosition(
              shift.startTime,
              shift.endTime,
              shift.isOvernight
            );
            const color =
              shift.colorCode ||
              (shift.isOvernight
                ? '#7c3aed'
                : shift.shiftCode === 'CA_CHIEU'
                ? '#d97706'
                : '#0284c7');

            return (
              <div
                key={shift.shiftId || idx}
                style={{
                  position: 'relative',
                  height: '32px',
                  backgroundColor: `${c.bgSubtle}40`,
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left,
                    width,
                    height: '100%',
                    backgroundColor: `${color}25`,
                    border: `1px solid ${color}`,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    color: c.fg,
                    fontSize: '12px',
                    fontWeight: 600,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    boxShadow: `0 1px 3px ${color}15`,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      marginRight: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    {shift.shiftName} ({shift.startTime?.slice(0, 5)} -{' '}
                    {shift.endTime?.slice(0, 5)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
