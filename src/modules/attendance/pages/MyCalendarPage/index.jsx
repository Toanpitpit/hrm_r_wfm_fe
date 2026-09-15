import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { useMyCalendar } from '../../hooks/useMyCalendar';
import WeekCalendar from '../../components/WeekCalendar';
import styles from './MyCalendarPage.module.css';

export default function MyCalendarPage() {
  const { c } = useAdminTheme();

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
    scheduleData,
    isLoading,
    error,
    goNextWeek,
    goPrevWeek,
    goToCurrentWeek,
  } = useMyCalendar();

  const formatWeekRange = () => {
    if (!scheduleData?.weekStart || !scheduleData?.weekEnd) return '';
    const [y1, m1, d1] = scheduleData.weekStart.split('-');
    const [y2, m2, d2] = scheduleData.weekEnd.split('-');
    return `${d1}/${m1}/${y1} - ${d2}/${m2}/${y2}`;
  };

  return (
    <DashboardShell>
      <DashboardSidebar navItems={navItems} activeId="my-calendar" />
      <DashboardTopbar title="Lịch Làm Việc Cá Nhân" user={storedUser} />

      <div className={styles.pageContent}>
        <PageHeader
          title="Lịch Làm Việc Cá Nhân (Weekly Calendar)"
          subtitle="Xem phân công ca làm việc, vị trí làm việc và trạng thái chấm công theo tuần"
        />

        <div className={styles.toolbar}>
          <div className={styles.navGroup}>
            <button type="button" className={styles.navBtn} onClick={goPrevWeek}>
              ◄ Tuần Trước
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.todayBtn}`}
              onClick={goToCurrentWeek}
            >
              Tuần Hiện Tại
            </button>
            <button type="button" className={styles.navBtn} onClick={goNextWeek}>
              Tuần Sau ►
            </button>
          </div>

          <div className={styles.dateRangeText}>
            Tuần: {formatWeekRange()}
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {isLoading ? (
          <div className={styles.loadingBox}>Đang tải lịch làm việc...</div>
        ) : (
          <WeekCalendar days={scheduleData?.days || []} />
        )}
      </div>
    </DashboardShell>
  );
}
