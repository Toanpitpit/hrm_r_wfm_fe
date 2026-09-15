import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Badge from '@/shared/components/ui/Badge';

const renderStatusBadge = (status) => {
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

export const WeekCalendar = ({ days = [] }) => {
  const { c, fonts } = useAdminTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: c.bgCard,
        width: '100%',
        padding: 16,
      }}
    >
      {/* Grid Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: c.bgElev,
          border: `1px solid ${c.border}`,
          borderRadius: '6px 6px 0 0',
        }}
      >
        {days.map((day, idx) => {
          const isToday = day.date === todayStr;
          const [, monthStr, dateStr] = day.date.split('-');
          const isLast = idx === days.length - 1;
          return (
            <div
              key={day.date}
              style={{
                padding: '14px 10px',
                textAlign: 'center',
                borderRight: isLast ? 'none' : `1px solid ${c.borderSub}`,
                backgroundColor: isToday ? c.accentDim : 'transparent',
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: isToday ? c.accent : c.fgSubtle,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {day.dayOfWeek}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: isToday ? c.accent : c.fg,
                  marginTop: 4,
                  fontFamily: fonts.display,
                }}
              >
                {dateStr}/{monthStr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Body */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          minHeight: 420,
          border: `1px solid ${c.border}`,
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
        }}
      >
        {days.map((day, idx) => {
          const isToday = day.date === todayStr;
          const isLast = idx === days.length - 1;
          return (
            <div
              key={day.date}
              style={{
                padding: '14px 10px',
                borderRight: isLast ? 'none' : `1px solid ${c.borderSub}`,
                backgroundColor: isToday ? 'rgba(242, 202, 80, 0.02)' : c.bgCard,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {day.shifts && day.shifts.length > 0 ? (
                day.shifts.map((shift) => (
                  <div
                    key={shift.assignmentId}
                    style={{
                      borderRadius: 6,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      backgroundColor: c.bgElev,
                      border: `1px solid ${c.borderSub}`,
                      borderLeft: `3px solid ${c.accent}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: c.fg }}>
                        {shift.shiftName}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: c.accent, fontFamily: 'monospace' }}>
                      {shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)}
                    </div>

                    <div style={{ fontSize: 12, color: c.fgSubtle }}>
                      📍 {shift.branchName}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {renderStatusBadge(shift.attendanceStatus)}
                      {shift.isDispatched && <Badge tone="info">Điều Động</Badge>}
                    </div>
                  </div>
                ))
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
