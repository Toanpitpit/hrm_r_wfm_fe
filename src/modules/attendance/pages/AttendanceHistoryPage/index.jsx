import React from 'react';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { useAttendanceHistory } from '../../hooks/useAttendanceHistory';
import AttendanceSummaryCard from '../../components/AttendanceSummaryCard';
import AttendanceDetailTable from '../../components/AttendanceDetailTable';
import styles from './AttendanceHistoryPage.module.css';

export default function AttendanceHistoryPage() {
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = storedUser?.role || 'FULLTIME_STAFF';
  const navItems = getNavItemsForRole(userRole);

  const {
    month,
    year,
    historyData,
    isLoading,
    error,
    changeMonthYear,
  } = useAttendanceHistory();

  const handleMonthChange = (e) => {
    changeMonthYear(parseInt(e.target.value, 10), year);
  };

  const handleYearChange = (e) => {
    changeMonthYear(month, parseInt(e.target.value, 10));
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <DashboardShell>
      <DashboardSidebar navItems={navItems} activeId="employee-attendance" />
      <DashboardTopbar title="Lịch Sử Chấm Công" user={storedUser} />

      <div className={styles.pageContent}>
        <PageHeader
          title="Lịch Sử Chấm Công Cá Nhân"
          subtitle="Theo dõi tổng hợp tổng buổi làm, số giờ công, tỷ lệ nghỉ và bảng chi tiết từng ca trong tháng"
        />

        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Chọn Tháng:</span>
            <select
              value={month}
              onChange={handleMonthChange}
              className={styles.selectInput}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <span className={styles.filterLabel} style={{ marginLeft: '1rem' }}>
              Năm:
            </span>
            <select
              value={year}
              onChange={handleYearChange}
              className={styles.selectInput}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {isLoading ? (
          <div className={styles.loadingBox}>Đang tải lịch sử chấm công...</div>
        ) : (
          <>
            <AttendanceSummaryCard data={historyData} />
            <AttendanceDetailTable details={historyData?.details || []} />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
