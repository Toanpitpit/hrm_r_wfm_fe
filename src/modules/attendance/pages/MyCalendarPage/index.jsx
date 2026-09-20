import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { useMyCalendar } from '../../hooks/useMyCalendar';
import WeekCalendar from '../../components/WeekCalendar';
import ShiftSwapModal from '@/modules/schedule/components/ShiftSwapModal';
import MySwapRequestsModal from '@/modules/schedule/components/MySwapRequestsModal';

export default function MyCalendarPage() {
  const { c, fonts } = useAdminTheme();
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
    if (id === 'my-calendar') {
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
    scheduleData,
    isLoading,
    error,
    goNextWeek,
    goPrevWeek,
    goToCurrentWeek,
    refetch,
  } = useMyCalendar();

  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState(null);
  const [isMyRequestsOpen, setIsMyRequestsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const formatWeekRange = () => {
    if (!scheduleData?.weekStart || !scheduleData?.weekEnd) return '';
    const [y1, m1, d1] = scheduleData.weekStart.split('-');
    const [y2, m2, d2] = scheduleData.weekEnd.split('-');
    return `${d1}/${m1}/${y1} – ${d2}/${m2}/${y2}`;
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="my-calendar"
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
            { label: portalTitle, href: '/employee/my-calendar' },
            { label: 'Lịch Làm Việc Cá Nhân' },
          ]}
        />
      }
    >
      <div style={{ padding: '24px 28px', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          index={`${portalTitle} · LỊCH LÀM VIỆC`}
          title="Bộ Lịch Làm Việc Cá Nhân (Weekly Calendar)"
          desc={`Theo dõi tổng quan phân công ca làm việc, vị trí chi nhánh và trạng thái chấm công 7 ngày trong tuần của ${storedUser?.fullName || 'Nhân sự'}.`}
        />

        {/* Thanh Điều Hướng Tuần chuẩn hệ thống */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button kind="ghost" variant="ghost" size="sm" onClick={goPrevWeek}>
              ◄ Tuần Trước
            </Button>
            <Button kind="ghost" variant="ghost" size="sm" onClick={goToCurrentWeek}>
              Tuần Hiện Tại
            </Button>
            <Button kind="ghost" variant="ghost" size="sm" onClick={goNextWeek}>
              Tuần Sau ►
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.fg, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="calendar" size={16} color={c.accent} />
              <span>Tuần: {formatWeekRange()}</span>
            </div>

            <Button
              variant="outline"
              kind="outline"
              size="sm"
              onClick={() => setIsMyRequestsOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>📋</span> Đơn Đổi / Chuyển Ca Của Tôi
            </Button>
          </div>
        </div>

        {toastMsg && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 6,
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#86efac',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>✅ {toastMsg}</span>
            <span style={{ cursor: 'pointer', fontWeight: 800 }} onClick={() => setToastMsg(null)}>✕</span>
          </div>
        )}

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
            Đang tải dữ liệu bộ lịch làm việc...
          </div>
        ) : (
          <Panel
            title="BỘ LỊCH PHÂN CÔNG 7 NGÀY"
            sub={`Hiển thị khung ca, địa điểm làm việc và trạng thái chấm công từ ${formatWeekRange()}`}
            pad={16}
          >
            <WeekCalendar
              days={scheduleData?.days || []}
              onOpenSwapModal={(shift) => setSelectedShiftForSwap(shift)}
            />
          </Panel>
        )}

        {/* Modal tạo đơn đổi / chuyển ca */}
        <ShiftSwapModal
          isOpen={Boolean(selectedShiftForSwap)}
          onClose={() => setSelectedShiftForSwap(null)}
          shift={selectedShiftForSwap}
          onSuccess={(msg) => {
            showToast(msg);
            refetch();
          }}
        />

        {/* Modal xem lịch sử đơn đổi / chuyển ca */}
        <MySwapRequestsModal
          isOpen={isMyRequestsOpen}
          onClose={() => setIsMyRequestsOpen(false)}
        />
      </div>
    </DashboardShell>
  );
}
