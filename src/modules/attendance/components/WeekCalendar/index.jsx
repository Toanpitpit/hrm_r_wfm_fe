import React from 'react';
import styles from './WeekCalendar.module.css';

const getShiftThemeClass = (templateCode) => {
  const code = (templateCode || '').toUpperCase();
  if (code.includes('SANG') || code.includes('MORNING')) return styles.shiftMorning;
  if (code.includes('CHIEU') || code.includes('AFTERNOON')) return styles.shiftAfternoon;
  if (code.includes('DEM') || code.includes('NIGHT')) return styles.shiftNight;
  return styles.shiftMorning;
};

const renderStatusBadge = (status) => {
  switch (status) {
    case 'COMPLETED':
      return <span className={`${styles.badge} ${styles.badgeCompleted}`}>Đã Hoàn Thành</span>;
    case 'CHECKED_IN':
      return <span className={`${styles.badge} ${styles.badgeCheckedIn}`}>Đã Check-In</span>;
    case 'ABSENT':
      return <span className={`${styles.badge} ${styles.badgeAbsent}`}>Vắng Mặt</span>;
    case 'NOT_YET':
    default:
      return <span className={`${styles.badge} ${styles.badgeNotYet}`}>Chưa Đến Giờ</span>;
  }
};

export const WeekCalendar = ({ days = [] }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.gridHeader}>
        {days.map((day) => {
          const isToday = day.date === todayStr;
          const [, monthStr, dateStr] = day.date.split('-');
          return (
            <div
              key={day.date}
              className={`${styles.dayHeader} ${isToday ? styles.todayHeader : ''}`}
            >
              <div className={styles.dayName}>{day.dayOfWeek}</div>
              <div className={styles.dayDate}>
                {dateStr}/{monthStr}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.gridBody}>
        {days.map((day) => {
          const isToday = day.date === todayStr;
          return (
            <div
              key={day.date}
              className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ''}`}
            >
              {day.shifts && day.shifts.length > 0 ? (
                day.shifts.map((shift) => (
                  <div
                    key={shift.assignmentId}
                    className={`${styles.shiftCard} ${getShiftThemeClass(shift.templateCode)}`}
                  >
                    <div className={styles.shiftTitleRow}>
                      <span className={styles.shiftName}>{shift.shiftName}</span>
                    </div>

                    <div className={styles.shiftTime}>
                      {shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)}
                    </div>

                    <div className={styles.branchInfo}>
                      <span className={styles.branchName}>{shift.branchName}</span>
                    </div>

                    <div className={styles.badgeGroup}>
                      {renderStatusBadge(shift.attendanceStatus)}
                      {shift.isDispatched && (
                        <span className={`${styles.badge} ${styles.badgeDispatched}`}>
                          Điều Động
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptySlot}>Nghỉ</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
