import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';

const renderStatusBadge = (status, assignmentStatus) => {
  if (status === 'CANCELLED' || assignmentStatus === 'CANCELLED') {
    return <Badge tone="neutral" dot>Đã Nghỉ Phép</Badge>;
  }

  switch (status) {
    case 'COMPLETED':
      return <Badge tone="ok" dot>Đã Hoàn Thành</Badge>;
    case 'CHECKED_IN':
      return <Badge tone="info" dot>Đã Check-In</Badge>;
    case 'ABSENT':
      return <Badge tone="bad" dot>Vắng Mặt</Badge>;
    case 'NOT_YET':
    default:
      return <Badge tone="warn" dot>Chưa Đến Giờ</Badge>;
  }
};

export const WeekCalendar = ({ days = [], onOpenSwapModal }) => {
  const { c, fonts } = useAdminTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      style={{
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        background: c.bgPaper,
        overflow: 'hidden',
        fontFamily: fonts.body,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${c.border}` }}>
        {days.map((day) => {
          const isToday = day.date === todayStr;
          return (
            <div
              key={day.date}
              style={{
                padding: '12px 8px',
                textAlign: 'center',
                background: isToday ? `${c.accent}15` : c.bgElev,
                borderRight: `1px solid ${c.border}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? c.accent : c.fg }}>
                {day.dayOfWeek}
              </div>
              <div style={{ fontSize: 12, color: isToday ? c.accent : c.fgSubtle, marginTop: 2 }}>
                {day.date.split('-').reverse().slice(0, 2).join('/')}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 320 }}>
        {days.map((day) => {
          const isToday = day.date === todayStr;
          return (
            <div
              key={day.date}
              style={{
                padding: '12px 8px',
                borderRight: `1px solid ${c.border}`,
                background: isToday ? `${c.accent}05` : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {day.shifts && day.shifts.length > 0 ? (
                day.shifts.map((shift) => {
                  const isCancelled = shift.attendanceStatus === 'CANCELLED' || shift.assignmentStatus === 'CANCELLED';
                  return (
                    <div
                      key={shift.scheduleId || shift.assignmentId}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        background: isCancelled ? c.bgElev : c.bgCard,
                        opacity: isCancelled ? 0.75 : 1,
                        border: `1px solid ${c.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: isCancelled ? c.fgSubtle : c.fg }}>
                          {shift.shiftName}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 700, color: isCancelled ? c.fgSubtle : c.accent, fontFamily: 'monospace' }}>
                        {shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)}
                      </div>

                      <div style={{ fontSize: 12, color: c.fgSubtle, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="pin" size={12} color={c.fgSubtle} />
                        <span>{shift.branchName}</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {renderStatusBadge(shift.attendanceStatus, shift.assignmentStatus)}
                        {shift.isDispatched && <Badge tone="info">Điều Động</Badge>}
                      </div>

                      {onOpenSwapModal && !isCancelled && (shift.attendanceStatus === 'NOT_YET' || day.date >= todayStr) && (
                        <button
                          type="button"
                          onClick={() => onOpenSwapModal({ ...shift, date: day.date, dayOfWeek: day.dayOfWeek })}
                          style={{
                            marginTop: 6,
                            padding: '5px 10px',
                            background: `${c.accent}15`,
                            color: c.accent,
                            border: `1px solid ${c.accent}40`,
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            width: '100%',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icon name="swap" size={13} color={c.accent} />
                          <span>Đổi / Chuyển Ca</span>
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 12, color: c.fgFaint, textAlign: 'center', padding: '32px 0', fontStyle: 'italic' }}>
                  Nghỉ
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
