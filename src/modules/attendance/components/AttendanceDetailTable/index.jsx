import React from 'react';
import styles from './AttendanceDetailTable.module.css';

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '--:--';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const renderStatusBadge = (status) => {
  switch (status) {
    case 'PRESENT':
      return <span className={`${styles.badge} ${styles.badgePresent}`}>Có Mặt</span>;
    case 'INCOMPLETE':
      return <span className={`${styles.badge} ${styles.badgeIncomplete}`}>Chưa Check-out</span>;
    case 'ABSENT':
      return <span className={`${styles.badge} ${styles.badgeAbsent}`}>Vắng Mặt</span>;
    case 'NOT_YET':
    default:
      return <span className={`${styles.badge} ${styles.badgeNotYet}`}>Chưa Đến Giờ</span>;
  }
};

export const AttendanceDetailTable = ({ details = [] }) => {
  if (!details || details.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          Không có dữ liệu ca làm việc nào trong tháng này.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Thứ</th>
            <th>Ca Làm Việc</th>
            <th>Khung Giờ</th>
            <th>Địa Điểm</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Giờ Thực Tế</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {details.map((item, idx) => {
            const [, mStr, dStr] = item.date.split('-');
            return (
              <tr key={`${item.date}-${idx}`}>
                <td className={styles.dateCell}>
                  {dStr}/{mStr}
                </td>
                <td>{item.dayOfWeek}</td>
                <td style={{ fontWeight: 600 }}>{item.shiftName}</td>
                <td className={styles.timeCell}>
                  {item.shiftStart?.substring(0, 5)} - {item.shiftEnd?.substring(0, 5)}
                </td>
                <td>
                  {item.branchName}
                  {item.isDispatched && (
                    <span className={`${styles.badge} ${styles.badgeDispatched}`}>
                      Điều Động
                    </span>
                  )}
                </td>
                <td className={styles.timeCell}>{formatTime(item.checkInTime)}</td>
                <td className={styles.timeCell}>{formatTime(item.checkOutTime)}</td>
                <td>
                  {item.actualWorkMinutes != null
                    ? `${(item.actualWorkMinutes / 60).toFixed(1)} giờ`
                    : '-'}
                </td>
                <td>{renderStatusBadge(item.status)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceDetailTable;
