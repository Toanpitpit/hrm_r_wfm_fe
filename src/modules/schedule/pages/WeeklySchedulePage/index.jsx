import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

// UI Components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';

// Schedule Hook & Components
import { useWeeklySchedule } from '../../hooks/useWeeklySchedule';
import WeekNavigator from '../../components/WeekNavigator';
import ShiftQuotaSummary from '../../components/ShiftQuotaSummary';
import WeeklyRosterMatrix from '../../components/WeeklyRosterMatrix';
import SetQuotaModal from '../../components/SetQuotaModal';
import AssignFullTimeModal from '../../components/AssignFullTimeModal';
import AssignShiftCellModal from '../../components/AssignShiftCellModal';
import PublishScheduleModal from '../../components/PublishScheduleModal';
import AutoScheduleModal from '../../components/AutoScheduleModal';
import ShiftSwapReviewModal from '../../components/ShiftSwapReviewModal';

import { useToast } from '@/components/ui/toast/ToastProvider';

import styles from './WeeklySchedulePage.module.css';

export default function WeeklySchedulePage() {
  const { c } = useAdminTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    branchId,
    weekStartDate,
    templates,
    matrix,
    loading,
    actionLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    filteredEmployees,
    weeklyStats,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    fetchWeeklyMatrix,
    handleGenerateWeekly,
    handleUpdateRequirement,
    handleAssignFullTimeBatch,
    handleAssignSingle,
    handleDeleteAssignment,
    handleOpenPublishModal,
    handleConfirmPublish,
    handleAutoScheduleWeekly,
    // Modals
    isQuotaModalOpen,
    setIsQuotaModalOpen,
    selectedScheduleForQuota,
    setSelectedScheduleForQuota,
    isFullTimeModalOpen,
    setIsFullTimeModalOpen,
    isAssignCellModalOpen,
    setIsAssignCellModalOpen,
    selectedCellData,
    setSelectedCellData,
    isPublishModalOpen,
    setIsPublishModalOpen,
    conflictReport,
    isAutoScheduleModalOpen,
    setIsAutoScheduleModalOpen,
  } = useWeeklySchedule(1);

  const [isSwapReviewModalOpen, setIsSwapReviewModalOpen] = useState(false);


  // Navigation Items cho Store Manager Sidebar
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan cửa hàng', icon: 'home', onClick: () => toast.info('Tính năng Tổng quan cửa hàng đang được phát triển.') },
    { type: 'group', label: 'Quản lý Kiosk & Điểm Danh' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { id: 'kiosk-list', label: 'Danh Sách Trạm Kiosk', icon: 'screen', onClick: () => toast.info('Tính năng Danh sách trạm Kiosk đang được phát triển.') },
    { id: 'attendance', label: 'Điểm Danh Chi Nhánh', icon: 'pulse', onClick: () => toast.info('Tính năng Điểm danh chi nhánh đang được phát triển.') },
    { type: 'group', label: 'Nhân sự & Lịch Ca Chi Nhánh' },
    { id: 'weekly-schedules', label: 'Quản lý Lịch Ca (UC 2.1 & 2.3)', icon: 'calendar', path: '/store-manager/schedules' },
    { id: 'store-employees', label: 'Nhân sự Chi Nhánh', icon: 'users', onClick: () => toast.info('Tính năng Quản lý nhân sự chi nhánh đang được phát triển.') },
  ];

  const handleSidebarNavigate = (id) => {
    if (id === 'kiosk-codes' || id === 'kiosk-list') {
      navigate('/store-manager/kiosk-codes');
    } else if (id === 'weekly-schedules' || id === 'store-schedule' || id === 'schedules') {
      navigate('/store-manager/schedules');
    }
  };

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="weekly-schedules"
          onNavigate={handleSidebarNavigate}
          defaultDisplayName={storedUser?.fullName || 'Quản Lý Cửa Hàng'}
          roleLabel={storedUser?.roleName || 'Cửa hàng trưởng'}
          avatarLetter={storedUser?.fullName?.charAt(0) || 'M'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: storedUser?.roleName || 'Store Manager', href: '/store-manager/schedules' },
            { label: 'Lập Lịch Ca Tuần (UC 2.1 & UC 2.3)' },
          ]}
        />
      }
    >
      <div className={styles.container}>
        {/* Tiêu đề trang */}
        <PageHeader
          title="Thiết Lập Định Mức & Phân Bổ Ca Tuần"
          subtitle="Quản lý định mức nhu cầu nhân sự, gán lịch Full-time, kiểm tra xung đột và công bố lịch tuần"
          badge={matrix?.branchName ? `Chi nhánh: ${matrix.branchName}` : 'Chi nhánh: Siêu Thị Quận 1'}
        />

        {/* Thống kê nhanh */}
        <div className={styles.statsGrid}>
          <StatCard
            label="TỔNG SỐ CA TRONG TUẦN"
            value={weeklyStats.totalSchedules}
            icon="calendar"
            hint="Khung ca chuẩn 7 ngày"
          />
          <StatCard
            label="LƯỢT PHÂN CÔNG ĐÃ GÁN"
            value={weeklyStats.totalAssignments}
            icon="users"
            hint="Đã phân bổ nhân sự"
          />
          <StatCard
            label="CA THIẾU ĐỊNH MỨC"
            value={weeklyStats.understaffedCount}
            icon="alertTriangle"
            variant={weeklyStats.understaffedCount > 0 ? 'bad' : 'good'}
            hint={weeklyStats.understaffedCount > 0 ? 'Cần bổ sung nhân sự' : 'Đạt chuẩn 100%'}
          />
          <StatCard
            label="TRẠNG THÁI TUẦN"
            value={weeklyStats.status === 'PUBLISHED' ? 'ĐÃ CÔNG BỐ' : 'BẢN NHÁP'}
            icon="send"
            variant={weeklyStats.status === 'PUBLISHED' ? 'good' : 'warning'}
            hint={weeklyStats.status === 'PUBLISHED' ? 'Nhân viên đã nhận thông báo' : 'Chưa phát hành'}
          />
        </div>

        {/* Nút thao tác Xét duyệt đơn đổi / chuyển ca */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -6 }}>
          <button
            type="button"
            onClick={() => setIsSwapReviewModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              background: `${c.accent}20`,
              color: c.accent,
              border: `1px solid ${c.accent}`,
              fontWeight: 750,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="swap" size={15} color={c.accent} />
            <span>Xét Duyệt Đơn Đổi / Chuyển Ca Trực</span>
          </button>
        </div>

        {/* Bộ điều hướng tuần & Nút hành động */}
        <WeekNavigator
          weekStartDate={weekStartDate}
          weekStatus={weeklyStats.status}
          onPrevWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onCurrentWeek={goToCurrentWeek}
          onOpenQuotaModal={() => {
            setSelectedScheduleForQuota(null);
            setIsQuotaModalOpen(true);
          }}
          onOpenAutoScheduleModal={() => setIsAutoScheduleModalOpen(true)}
          onOpenFullTimeModal={() => setIsFullTimeModalOpen(true)}
          onOpenPublishModal={handleOpenPublishModal}
          actionLoading={actionLoading}
        />

        {/* Bảng theo dõi định mức từng ca */}
        <ShiftQuotaSummary
          days={matrix?.days || []}
          schedules={matrix?.schedules || []}
          onEditScheduleQuota={(schedule) => {
            setSelectedScheduleForQuota(schedule);
            setIsQuotaModalOpen(true);
          }}
        />

        {/* Bộ lọc nhân viên */}
        <div className={styles.filterBar} style={{ background: c.bgCard, border: `1px solid ${c.border}` }}>
          <div className={styles.filterGroup}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm nhân viên theo tên hoặc mã..."
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'ALL', label: 'Tất cả vị trí' },
                { value: 'SHIFT_LEADER', label: 'Trưởng ca (SHIFT_LEADER)' },
                { value: 'CASHIER', label: 'Thu ngân (CASHIER)' },
                { value: 'SALES', label: 'Bán hàng (SALES_STAFF)' },
                { value: 'SECURITY', label: 'Bảo vệ (SECURITY_GUARD)' },
              ]}
            />
          </div>
          <div style={{ fontSize: 12, color: c.fgFaint }}>
            Hiển thị <strong>{filteredEmployees.length}</strong> nhân sự chi nhánh
          </div>
        </div>

        {/* Ma trận phân bổ lịch tuần */}
        <WeeklyRosterMatrix
          days={matrix?.days || []}
          schedules={matrix?.schedules || []}
          templates={templates}
          employees={filteredEmployees}
          allEmployees={matrix?.employeeRosters || []}
          loading={loading}
          isPublished={weeklyStats.status === 'PUBLISHED'}
          onCellClick={(cellData) => {
            setSelectedCellData(cellData);
            setIsAssignCellModalOpen(true);
          }}
          onDeleteAssignment={handleDeleteAssignment}
          onEditScheduleQuota={(schedule) => {
            setSelectedScheduleForQuota(schedule);
            setIsQuotaModalOpen(true);
          }}
        />

        {/* Modals */}
        {/* Modal điều chỉnh / sinh định mức ca */}
        <SetQuotaModal
          isOpen={isQuotaModalOpen}
          onClose={() => {
            setIsQuotaModalOpen(false);
            setSelectedScheduleForQuota(null);
          }}
          selectedSchedule={selectedScheduleForQuota}
          templates={templates}
          onUpdateSingleQuota={handleUpdateRequirement}
          onGenerateWeekly={handleGenerateWeekly}
          actionLoading={actionLoading}
        />

        {/* Modal tự động xếp ca bằng Google OR-Tools CP-SAT */}
        <AutoScheduleModal
          isOpen={isAutoScheduleModalOpen}
          onClose={() => setIsAutoScheduleModalOpen(false)}
          onRunAutoSchedule={handleAutoScheduleWeekly}
          actionLoading={actionLoading}
        />

        {/* Modal gán nhanh Full-time */}
        <AssignFullTimeModal
          isOpen={isFullTimeModalOpen}
          onClose={() => setIsFullTimeModalOpen(false)}
          employees={matrix?.employeeRosters || []}
          templates={templates}
          onAssignBatch={handleAssignFullTimeBatch}
          actionLoading={actionLoading}
        />

        {/* Modal gán / đổi ca lẻ từng ô */}
        <AssignShiftCellModal
          isOpen={isAssignCellModalOpen}
          onClose={() => {
            setIsAssignCellModalOpen(false);
            setSelectedCellData(null);
          }}
          cellData={selectedCellData}
          templates={templates}
          onAssignSingle={handleAssignSingle}
          onDeleteAssignment={handleDeleteAssignment}
          actionLoading={actionLoading}
        />

        {/* Modal rà soát xung đột & công bố lịch tuần */}
        <PublishScheduleModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          weekStartDate={weekStartDate}
          conflictReport={conflictReport}
          onConfirmPublish={handleConfirmPublish}
          actionLoading={actionLoading}
        />

        {/* Modal phê duyệt đơn đổi / chuyển ca */}
        <ShiftSwapReviewModal
          isOpen={isSwapReviewModalOpen}
          onClose={() => setIsSwapReviewModalOpen(false)}
          storeId={branchId || 1}
          onReviewed={() => {
            fetchWeeklyMatrix();
          }}
        />
      </div>
    </DashboardShell>
  );
}

