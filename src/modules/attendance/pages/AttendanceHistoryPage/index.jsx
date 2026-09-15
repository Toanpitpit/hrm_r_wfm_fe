import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Icon from '@/shared/components/ui/Icon';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { useAttendanceHistory } from '../../hooks/useAttendanceHistory';
import AttendanceSummaryCard from '../../components/AttendanceSummaryCard';
import AttendanceDetailTable from '../../components/AttendanceDetailTable';

export default function AttendanceHistoryPage() {
  const { c } = useAdminTheme();
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || '').toUpperCase();
  const roleName = (storedUser?.roleName || '').toLowerCase();

  const isShiftLeader = userRole === 'SHIFT_LEADER' || roleName.includes('trưởng ca');
  const isCashier = userRole === 'CASHIER' || roleName.includes('thu ngân');
  const isSales = userRole === 'SALES_STAFF' || roleName.includes('bán hàng');
  const isSecurity = userRole === 'SECURITY_GUARD' || userRole === 'SECURITY' || roleName.includes('bảo vệ');

  let portalTitle = 'EMPLOYEE PORTAL';
  let roleSubtitle = storedUser?.roleName || 'Nhân sự Chi nhánh';

  if (isShiftLeader) {
    portalTitle = 'SHIFT LEADER PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Trưởng Ca Trực';
  } else if (isCashier) {
    portalTitle = 'CASHIER PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Thu Ngân Chi nhánh';
  } else if (isSales) {
    portalTitle = 'SALES PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Nhân Viên Bán Hàng';
  } else if (isSecurity) {
    portalTitle = 'SECURITY PORTAL';
    if (!storedUser?.roleName) roleSubtitle = 'Bảo Vệ Chi nhánh';
  }

  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'employee-schedule') {
      navigate('/employee/schedule');
    } else if (id === 'my-calendar') {
      navigate('/employee/my-calendar');
    } else if (id === 'employee-attendance') {
      navigate('/employee/attendance-history');
    } else if (id === 'attendance-otp') {
      navigate('/employee/attendance-otp');
    } else if (id === 'live-roster') {
      navigate('/store-manager/live-roster');
    }
  };

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
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="employee-attendance"
          onNavigate={handleSidebarNavigate}
          navItems={navItems}
          consoleLabel={portalTitle}
          defaultDisplayName={storedUser?.fullName || 'Nhân viên Chi nhánh'}
          roleLabel={roleSubtitle}
          avatarLetter={storedUser?.fullName ? storedUser.fullName.charAt(0).toUpperCase() : 'E'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: portalTitle, href: '/employee/schedule' },
            { label: 'Lịch Sử Chấm Công' },
          ]}
        />
      }
    >
      <div style={{ padding: '24px 28px', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          index={`${portalTitle} · LỊCH SỬ CHẤM CÔNG`}
          title="Báo Cáo & Lịch Sử Chấm Công Cá Nhân"
          desc={`Tổng hợp dữ liệu chấm công, tổng buổi đi làm, số giờ công thực tế và lịch sử từng ca làm việc của ${storedUser?.fullName || 'Nhân sự'}.`}
        />

        {/* Thanh Chọn Tháng/Năm chuẩn hệ thống */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            backgroundColor: c.bgCard,
            padding: '14px 18px',
            borderRadius: 6,
            border: `1px solid ${c.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="calendar" size={16} color={c.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: c.fg }}>Kỳ Báo Cáo Chấm Công:</span>
            
            <select
              value={month}
              onChange={handleMonthChange}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: c.fg,
                backgroundColor: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={handleYearChange}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: c.fg,
                backgroundColor: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: 12, color: c.fgSubtle, fontWeight: 500 }}>
            Dữ liệu tổng hợp tính đến hết ngày hiện tại
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 16,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: c.fgSubtle, fontWeight: 500, background: c.bgCard, borderRadius: 6, border: `1px solid ${c.border}` }}>
            Đang tải dữ liệu lịch sử chấm công...
          </div>
        ) : (
          <>
            <AttendanceSummaryCard data={historyData} />

            <Panel
              title="BẢNG CHI TIẾT CHẤM CÔNG HÀNG CA"
              sub={`Danh sách toàn bộ các ca phân công và nhật ký check-in / check-out trong Tháng ${month}/${year}`}
              pad={16}
            >
              <AttendanceDetailTable details={historyData?.details || []} />
            </Panel>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
