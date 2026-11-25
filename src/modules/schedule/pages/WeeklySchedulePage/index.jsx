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
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';

// Schedule Hook & Components
import { useWeeklySchedule, formatVNDate } from '../../hooks/useWeeklySchedule';
import WeekNavigator from '../../components/WeekNavigator';
import ShiftQuotaSummary from '../../components/ShiftQuotaSummary';
import WeeklyRosterMatrix from '../../components/WeeklyRosterMatrix';
import SetQuotaModal from '../../components/SetQuotaModal';
import AssignFullTimeModal from '../../components/AssignFullTimeModal';
import AssignShiftCellModal from '../../components/AssignShiftCellModal';
import PublishScheduleModal from '../../components/PublishScheduleModal';
import AutoScheduleModal from '../../components/AutoScheduleModal';
import ShiftSwapReviewModal from '../../components/ShiftSwapReviewModal';
import ShiftSwapReviewList from '../../components/ShiftSwapReviewList';

import { useToast } from '@/shared/components/ui/ToastProvider';

import styles from './WeeklySchedulePage.module.css';

export default function WeeklySchedulePage() {
  const { c } = useAdminTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const {
    branchId,
    setBranchId,
    accessibleBranches,
    isGlobalManager,
    assignedBranch,
    branchesLoading,
    permissionError,
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
    handleDeleteSchedule,
    handleDeleteWeeklySchedule,
    handleDeleteWeeklyAssignments,
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
  } = useWeeklySchedule();

  const [isSwapReviewModalOpen, setIsSwapReviewModalOpen] = useState(false);
  const [isDeleteWeeklyModalOpen, setIsDeleteWeeklyModalOpen] = useState(false);
  const [isDeleteAssignmentsModalOpen, setIsDeleteAssignmentsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'quota' | 'swaps'
  const [pendingSwapsCount, setPendingSwapsCount] = useState(0);

  const safeStartDate = weekStartDate || '2026-01-01';
  const parts = safeStartDate.split('-').map(Number);
  const endObj = parts.length >= 3 ? new Date(parts[0], parts[1] - 1, parts[2] + 6) : new Date();
  const endStr = `${endObj.getFullYear()}-${String(endObj.getMonth() + 1).padStart(2, '0')}-${String(endObj.getDate()).padStart(2, '0')}`;


  // Navigation Items cho Store Manager Sidebar
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan cửa hàng', icon: 'home', onClick: () => toast.info('Tính năng Tổng quan cửa hàng đang được phát triển.') },
    { type: 'group', label: 'Quản lý Kiosk & Điểm Danh' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { id: 'kiosk-list', label: 'Danh Sách Trạm Kiosk', icon: 'screen', onClick: () => toast.info('Tính năng Danh sách trạm Kiosk đang được phát triển.') },
    { id: 'attendance', label: 'Điểm Danh Chi Nhánh', icon: 'pulse', onClick: () => toast.info('Tính năng Điểm danh chi nhánh đang được phát triển.') },
    { type: 'group', label: 'Nhân sự & Lịch Ca Chi Nhánh' },
    { id: 'weekly-schedules', label: 'Quản lý Lịch Ca', icon: 'calendar', path: '/store-manager/schedules' },
    { id: 'store-employees', label: 'Nhân sự Chi Nhánh', icon: 'users', onClick: () => toast.info('Tính năng Quản lý nhân sự chi nhánh đang được phát triển.') },
  ];

  const handleSidebarNavigate = (id) => {
    if (id === 'kiosk-codes' || id === 'kiosk-list') {
      navigate('/store-manager/kiosk-codes');
    } else if (id === 'weekly-schedules' || id === 'store-schedule' || id === 'schedules') {
      navigate('/store-manager/schedules');
    }
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="weekly-schedules"
          activePath="/store-manager/schedules"
          onNavigate={handleSidebarNavigate}
          brandName="RWFM Enterprise"
          consoleLabel="STORE MANAGER CONSOLE"
          defaultDisplayName={storedUser?.fullName || 'Quản Lý Cửa Hàng'}
          roleLabel={storedUser?.roleName || 'Cửa hàng trưởng'}
          avatarLetter={storedUser?.fullName?.charAt(0) || 'M'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Store Manager', href: '/store-manager/schedules' },
            { label: 'Phân Ca & Lịch Làm', href: '/store-manager/schedules' },
            { label: 'Phân Ca Tuần' },
          ]}
        />
      }
    >
      <div className={styles.container}>
        {/* Tiêu đề trang */}
        <PageHeader
          index={
            activeTab === 'quota'
              ? 'Store Manager · Định Mức Nhu Cầu Ca'
              : activeTab === 'swaps'
              ? 'Store Manager · Xét Duyệt Đổi Ca'
              : 'Store Manager · Phân Bổ Ca Tuần'
          }
          title={
            activeTab === 'quota'
              ? 'Thiết Lập Định Mức Nhu Cầu Nhân Sự'
              : activeTab === 'swaps'
              ? 'Quản Lý & Phê Duyệt Đơn Đổi Ca'
              : 'Bảng Phân Bổ & Lập Lịch Làm Việc Tuần'
          }
          subtitle={
            activeTab === 'quota'
              ? 'Xác định chỉ tiêu số lượng nhân sự tối thiểu cho từng vị trí và từng ca làm việc trong 7 ngày'
              : activeTab === 'swaps'
              ? 'Duyệt các yêu cầu xin đổi ca, nhường ca hoặc xin nghỉ từ nhân viên chi nhánh'
              : 'Gán ca nhân viên, tự động xếp ca bằng Google OR-Tools, rà soát xung đột và công bố lịch'
          }
          badge={
            isGlobalManager
              ? 'Toàn quyền Quản trị Vận hành'
              : assignedBranch?.name
              ? `Cơ sở: ${assignedBranch.name}`
              : matrix?.branchName
              ? `Cơ sở: ${matrix.branchName}`
              : 'Phân quyền Chi nhánh'
          }
        />

        {/* Cảnh báo phân quyền nếu tài khoản quản lý chưa có cơ sở */}
        {permissionError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 20px',
              borderRadius: 10,
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              marginBottom: 18,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Icon name="alertTriangle" size={22} color="#d97706" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Thanh chọn / thông tin phân quyền cơ sở (Branch Isolation) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '12px 20px',
            marginBottom: 18,
            borderRadius: 12,
            background: c.bgCard,
            border: `1px solid ${c.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {isGlobalManager ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${c.accent}20`,
                    color: c.accent,
                  }}
                >
                  <Icon name="home" size={18} color={c.accent} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: c.textPrimary }}>
                  Cơ sở quản lý lập lịch:
                </span>
              </div>
              <div style={{ minWidth: 280 }}>
                <Select
                  value={String(branchId || '')}
                  onChange={(val) => setBranchId(Number(val))}
                  options={accessibleBranches.map((b) => ({
                    value: String(b.id),
                    label: `${b.branchCode ? `[${b.branchCode}] ` : ''}${b.name}`,
                  }))}
                  disabled={actionLoading || loading || branchesLoading}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid #bae6fd',
                }}
              >
                Quyền Quản Trị Hệ Thống (Xem & Lập lịch mọi cơ sở)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  borderRadius: 20,
                  background: `${c.accent}15`,
                  border: `1px solid ${c.accent}40`,
                  color: c.accent,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <Icon name="lock" size={14} color={c.accent} />
                <span>
                  Cơ sở phụ trách: {assignedBranch?.name || matrix?.branchName || (branchId ? `Chi nhánh #${branchId}` : 'Chưa phân công')}
                </span>
              </div>
              <span style={{ fontSize: 12, color: c.textTertiary, fontWeight: 500 }}>
                (Tài khoản Cửa hàng trưởng được phân quyền cố định theo cơ sở trực thuộc)
              </span>
            </div>
          )}

          {matrix?.branchName && (
            <div style={{ fontSize: 12, color: c.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Trạng thái cơ sở:</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>● Hoạt động bình thường</span>
            </div>
          )}
        </div>


        {/* Thanh chuyển đổi phân hệ màn hình con (Sub-screens Tabs) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            padding: '6px',
            background: c.bgCard,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflowX: 'auto',
          }}
        >
          {/* Tab 1: Phân bổ lịch tuần (Roster Matrix) */}
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            style={{
              flex: 1,
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'roster' ? (c.accent || '#10b981') : 'transparent',
              color: activeTab === 'roster' ? (c.ink || '#ffffff') : c.textSecondary,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'roster' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <Icon
              name="calendar"
              size={18}
              color={activeTab === 'roster' ? (c.ink || '#ffffff') : c.textSecondary}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ lineHeight: 1.2 }}>1. Phân Bổ Ca Tuần</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  opacity: 0.85,
                  marginTop: 2,
                }}
              >
                Ma trận xếp ca {filteredEmployees.length} nhân sự
              </div>
            </div>
            {matrix?.employeeRosters?.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 800,
                  background: activeTab === 'roster' ? 'rgba(0,0,0,0.2)' : `${c.accent}20`,
                  color: activeTab === 'roster' ? (c.ink || '#ffffff') : c.accent,
                }}
              >
                {matrix.employeeRosters.length} NV
              </span>
            )}
          </button>

          {/* Tab 2: Định mức nhu cầu ca (Staffing Demand Quota) */}
          <button
            type="button"
            onClick={() => setActiveTab('quota')}
            style={{
              flex: 1,
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'quota' ? (c.accent || '#10b981') : 'transparent',
              color: activeTab === 'quota' ? (c.ink || '#ffffff') : c.textSecondary,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'quota' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <Icon
              name="sliders"
              size={18}
              color={activeTab === 'quota' ? (c.ink || '#ffffff') : c.textSecondary}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ lineHeight: 1.2 }}>2. Định Mức Nhu Cầu Ca</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  opacity: 0.85,
                  marginTop: 2,
                }}
              >
                Chỉ tiêu vị trí từng ca 7 ngày
              </div>
            </div>
            {weeklyStats.understaffedCount > 0 ? (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 800,
                  background: activeTab === 'quota' ? '#ef4444' : '#fee2e2',
                  color: activeTab === 'quota' ? '#ffffff' : '#b91c1c',
                }}
              >
                {weeklyStats.understaffedCount} ca thiếu
              </span>
            ) : weeklyStats.totalSchedules > 0 ? (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 800,
                  background: activeTab === 'quota' ? 'rgba(0,0,0,0.2)' : '#dcfce7',
                  color: activeTab === 'quota' ? (c.ink || '#ffffff') : '#15803d',
                }}
              >
                Đạt chuẩn
              </span>
            ) : null}
          </button>

          {/* Tab 3: Xét duyệt đổi ca (Shift Swaps) */}
          <button
            type="button"
            onClick={() => setActiveTab('swaps')}
            style={{
              flex: 1,
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'swaps' ? (c.accent || '#10b981') : 'transparent',
              color: activeTab === 'swaps' ? (c.ink || '#ffffff') : c.textSecondary,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'swaps' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <Icon
              name="swap"
              size={18}
              color={activeTab === 'swaps' ? (c.ink || '#ffffff') : c.textSecondary}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ lineHeight: 1.2 }}>3. Xét Duyệt Đổi Ca</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  opacity: 0.85,
                  marginTop: 2,
                }}
              >
                Đơn đổi ca & xin nghỉ của NV
              </div>
            </div>
            {pendingSwapsCount > 0 ? (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 800,
                  background: activeTab === 'swaps' ? '#ef4444' : '#fee2e2',
                  color: activeTab === 'swaps' ? '#ffffff' : '#b91c1c',
                }}
              >
                {pendingSwapsCount} chờ duyệt
              </span>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 800,
                  background: activeTab === 'swaps' ? 'rgba(0,0,0,0.2)' : `${c.bgElev}`,
                  color: activeTab === 'swaps' ? (c.ink || '#ffffff') : c.fgFaint,
                }}
              >
                Yêu cầu
              </span>
            )}
          </button>
        </div>

        {/* ═══════════════ TAB 1: PHÂN BỔ CA TUẦN (ROSTER MATRIX) ═══════════════ */}
        {activeTab === 'roster' && (
          <>
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
                value={
                  weeklyStats.status === 'PUBLISHED'
                    ? 'ĐÃ CÔNG BỐ'
                    : weeklyStats.totalSchedules === 0
                    ? 'CHƯA TẠO CA'
                    : 'CHƯA CÔNG BỐ'
                }
                icon="send"
                variant={weeklyStats.status === 'PUBLISHED' ? 'good' : weeklyStats.totalSchedules === 0 ? 'neutral' : 'warning'}
                hint={
                  weeklyStats.status === 'PUBLISHED'
                    ? 'Nhân viên đã nhận thông báo'
                    : weeklyStats.totalSchedules === 0
                    ? 'Chưa có ca làm việc trong tuần'
                    : 'Lịch đang soạn thảo'
                }
              />
            </div>

            {/* Bộ điều hướng tuần & Nút hành động */}
            <WeekNavigator
              weekStartDate={weekStartDate}
              weekStatus={weeklyStats.status}
              hasSchedules={weeklyStats.totalSchedules > 0}
              hasAssignments={weeklyStats.totalAssignments > 0}
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
              onOpenDeleteWeeklyModal={() => setIsDeleteWeeklyModalOpen(true)}
              onOpenDeleteAssignmentsModal={() => setIsDeleteAssignmentsModalOpen(true)}
              actionLoading={actionLoading}
              activeTab="roster"
              onSwitchTab={setActiveTab}
            />

            {/* Cảnh báo thiếu định mức (nếu có) */}
            {weeklyStats.understaffedCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 18px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  marginBottom: 16,
                  color: '#b45309',
                  fontSize: 13,
                  fontWeight: 600,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="alertTriangle" size={18} color="#d97706" />
                  <span>
                    Hiện có <strong>{weeklyStats.understaffedCount} ca</strong> chưa đủ định mức nhân sự tối thiểu. Bạn có thể bấm <strong>&quot;Tự Động Xếp Ca&quot;</strong> hoặc sang màn hình Định Mức để kiểm tra.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('quota')}
                  style={{
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Xem Bảng Định Mức ➔
                </button>
              </div>
            )}

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
              branchId={branchId}
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
          </>
        )}

        {/* ═══════════════ TAB 2: ĐỊNH MỨC NHU CẦU CA (SHIFT QUOTA) ═══════════════ */}
        {activeTab === 'quota' && (
          <>
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
                value={
                  weeklyStats.status === 'PUBLISHED'
                    ? 'ĐÃ CÔNG BỐ'
                    : weeklyStats.totalSchedules === 0
                    ? 'CHƯA TẠO CA'
                    : 'CHƯA CÔNG BỐ'
                }
                icon="send"
                variant={weeklyStats.status === 'PUBLISHED' ? 'good' : weeklyStats.totalSchedules === 0 ? 'neutral' : 'warning'}
                hint={
                  weeklyStats.status === 'PUBLISHED'
                    ? 'Nhân viên đã nhận thông báo'
                    : weeklyStats.totalSchedules === 0
                    ? 'Chưa có ca làm việc trong tuần'
                    : 'Lịch đang soạn thảo'
                }
              />
            </div>

            {/* Bộ điều hướng tuần */}
            <WeekNavigator
              weekStartDate={weekStartDate}
              weekStatus={weeklyStats.status}
              hasSchedules={weeklyStats.totalSchedules > 0}
              hasAssignments={weeklyStats.totalAssignments > 0}
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
              onOpenDeleteWeeklyModal={() => setIsDeleteWeeklyModalOpen(true)}
              onOpenDeleteAssignmentsModal={() => setIsDeleteAssignmentsModalOpen(true)}
              actionLoading={actionLoading}
              activeTab="quota"
              onSwitchTab={setActiveTab}
            />

            {/* Banner hướng dẫn định mức */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 10,
                background: `${c.accent}12`,
                border: `1px solid ${c.accent}30`,
                marginBottom: 18,
                fontSize: 13.5,
                color: c.textPrimary,
              }}
            >
              <Icon name="info" size={20} color={c.accent} />
              <div style={{ flex: 1, lineHeight: 1.5 }}>
                <strong>Thiết Lập Định Mức Nhu Cầu Nhân Sự:</strong> Bấm trực tiếp vào từng ô ca bên dưới để điều chỉnh chỉ tiêu số lượng nhân sự cho các vị trí (Trưởng ca, Thu ngân, Bán hàng, Bảo vệ). Định mức này là căn cứ cốt lõi để thuật toán <strong>Google OR-Tools</strong> tự động xếp ca tối ưu.
              </div>
            </div>

            {/* Bảng theo dõi định mức từng ca */}
            <ShiftQuotaSummary
              days={matrix?.days || []}
              schedules={matrix?.schedules || []}
              onEditScheduleQuota={(schedule) => {
                setSelectedScheduleForQuota(schedule);
                setIsQuotaModalOpen(true);
              }}
            />
          </>
        )}

        {/* ═══════════════ TAB 3: XÉT DUYỆT ĐỔI CA (SHIFT SWAPS) ═══════════════ */}
        {activeTab === 'swaps' && (
          <>
            {/* Banner hướng dẫn duyệt đổi ca */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 10,
                background: `${c.accent}12`,
                border: `1px solid ${c.accent}30`,
                marginBottom: 18,
                fontSize: 13.5,
                color: c.textPrimary,
              }}
            >
              <Icon name="swap" size={20} color={c.accent} />
              <div style={{ flex: 1, lineHeight: 1.5 }}>
                <strong>Quản Lý Đơn Đổi / Chuyển Ca Trực:</strong> Danh sách các yêu cầu xin đổi ca cho nhau hoặc xin nghỉ ca từ nhân sự chi nhánh. Khi Cửa hàng trưởng bấm <strong>&quot;Phê Duyệt Ngay&quot;</strong>, hệ thống sẽ tự động cập nhật ngay nhân sự mới vào bảng lịch phân công tuần.
              </div>
            </div>

            {/* Danh sách xét duyệt đổi ca trực tiếp */}
            <ShiftSwapReviewList
              storeId={branchId}
              onReviewed={fetchWeeklyMatrix}
              onPendingCountChange={setPendingSwapsCount}
            />
          </>
        )}

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
          onDeleteSchedule={handleDeleteSchedule}
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
          storeId={branchId || storedUser?.storeId || storedUser?.homeBranchId || 1}
          onReviewed={() => {
            fetchWeeklyMatrix();
          }}
        />

        {/* Modal xác nhận XÓA LỊCH (xóa toàn bộ phân công ca của nhân viên, GIỮ NGUYÊN định mức ca) */}
        <Modal
          isOpen={isDeleteAssignmentsModalOpen}
          onClose={() => setIsDeleteAssignmentsModalOpen(false)}
          title="Xác Nhận Xóa Lịch Phân Công Ca (Giữ Định Mức)"
          width={530}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#ef4444',
              }}
            >
              <Icon name="alertTriangle" size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, lineHeight: '1.6', color: c.fg }}>
                Bạn có chắc chắn muốn xóa toàn bộ{' '}
                <strong style={{ color: '#ef4444' }}>
                  {weeklyStats.totalAssignments} lượt phân công ca
                </strong>{' '}
                đã gán cho nhân viên trong tuần{' '}
                <strong style={{ color: '#ef4444' }}>
                  {formatVNDate(weekStartDate)} - {formatVNDate(endStr)}
                </strong>{' '}
                không?
                <div style={{ marginTop: 8, fontSize: 12, color: c.fgFaint }}>
                  ● Thao tác này sẽ dọn sạch tất cả các ca đã gán cho nhân sự trong tuần này.<br />
                  ● <strong>Định mức nhu cầu nhân sự của các ca vẫn được giữ nguyên</strong> để bạn có thể gán lại hoặc sử dụng tính năng <em>&quot;Tự Động Xếp Ca&quot;</em>.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button
                variant="secondary"
                onClick={() => setIsDeleteAssignmentsModalOpen(false)}
                disabled={actionLoading}
              >
                Hủy Bỏ
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  const res = await handleDeleteWeeklyAssignments();
                  if (res?.success !== false) {
                    setIsDeleteAssignmentsModalOpen(false);
                  }
                }}
                disabled={actionLoading}
                style={{
                  background: '#dc2626',
                  border: '1px solid #dc2626',
                  color: '#ffffff',
                }}
              >
                {actionLoading ? 'Đang xóa...' : 'Xác Nhận Xóa Lịch'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal xác nhận XÓA ĐỊNH MỨC (xóa toàn bộ định mức và khung ca của tuần) */}
        <Modal
          isOpen={isDeleteWeeklyModalOpen}
          onClose={() => setIsDeleteWeeklyModalOpen(false)}
          title="Xác Nhận Xóa Định Mức & Khung Ca Tuần"
          width={530}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#ef4444',
              }}
            >
              <Icon name="alertTriangle" size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, lineHeight: '1.6', color: c.fg }}>
                Bạn có chắc chắn muốn xóa toàn bộ khung lịch và định mức nhu cầu của tuần{' '}
                <strong style={{ color: '#ef4444' }}>
                  {formatVNDate(weekStartDate)} - {formatVNDate(endStr)}
                </strong>{' '}
                không?
                <div style={{ marginTop: 8, fontSize: 12, color: c.fgFaint }}>
                  ● Thao tác này sẽ dọn sạch toàn bộ các ca làm việc và định mức chưa công bố của tuần.<br />
                  ● Bảng sẽ trở về trạng thái <strong>&quot;Chưa sinh ca&quot;</strong> và <strong>&quot;Chưa có khung ca&quot;</strong> ban đầu (như tuần mới).
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button
                variant="secondary"
                onClick={() => setIsDeleteWeeklyModalOpen(false)}
                disabled={actionLoading}
              >
                Hủy Bỏ
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  const res = await handleDeleteWeeklySchedule();
                  if (res?.success !== false) {
                    setIsDeleteWeeklyModalOpen(false);
                  }
                }}
                disabled={actionLoading}
                style={{
                  background: '#dc2626',
                  border: '1px solid #dc2626',
                  color: '#ffffff',
                }}
              >
                {actionLoading ? 'Đang xóa...' : 'Xác Nhận Xóa Định Mức'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}

