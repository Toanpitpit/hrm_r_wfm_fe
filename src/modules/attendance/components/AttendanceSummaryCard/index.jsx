import React from 'react';
import styles from './AttendanceSummaryCard.module.css';

export const AttendanceSummaryCard = ({ data }) => {
  if (!data) return null;

  const {
    totalAssignedShifts = 0,
    totalWorkedShifts = 0,
    totalAbsentShifts = 0,
    totalWorkHours = 0,
    absentPercentage = 0,
    attendanceRate = 0,
  } = data;

  return (
    <div className={styles.cardGrid}>
      {/* Card 1: Số buổi làm việc */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Số Buổi Làm Việc</span>
          <span className={`${styles.cardIndicator} ${styles.indicatorBlue}`} />
        </div>
        <div className={styles.cardValue}>
          {totalWorkedShifts} / {totalAssignedShifts}
        </div>
        <div className={styles.cardSubtitle}>
          Đã đi làm trên tổng buổi phân công
        </div>
      </div>

      {/* Card 2: Tổng giờ công */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Tổng Giờ Công</span>
          <span className={`${styles.cardIndicator} ${styles.indicatorGreen}`} />
        </div>
        <div className={styles.cardValue}>
          {totalWorkHours} <span style={{ fontSize: '1rem', fontWeight: 600 }}>giờ</span>
        </div>
        <div className={styles.cardSubtitle}>
          Thời gian làm việc thực tế trong tháng
        </div>
      </div>

      {/* Card 3: % Đi làm */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Tỷ Lệ Đi Làm</span>
          <span className={`${styles.cardIndicator} ${styles.indicatorAmber}`} />
        </div>
        <div className={styles.cardValue}>{attendanceRate}%</div>
        <div className={styles.cardSubtitle}>
          Dựa trên số ca đã phân công
        </div>
      </div>

      {/* Card 4: % Nghỉ */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Tỷ Lệ Vắng Mặt (% Nghỉ)</span>
          <span className={`${styles.cardIndicator} ${styles.indicatorRed}`} />
        </div>
        <div className={styles.cardValue}>{absentPercentage}%</div>
        <div className={styles.cardSubtitle}>
          {totalAbsentShifts} buổi vắng mặt
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryCard;
