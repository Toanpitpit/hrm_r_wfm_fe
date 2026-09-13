import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import { useToast } from '@/components/ui/toast/ToastProvider';

// UI Components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';

// Subcomponents & Hook
import { useShiftTemplate } from '../../hooks/useShiftTemplate';
import ShiftEnforcementBanner from '../../components/ShiftEnforcementBanner';
import Shift24hTimeline from '../../components/Shift24hTimeline';
import ShiftTemplateTable from '../../components/ShiftTemplateTable';
import ShiftTemplateFormModal from '../../components/ShiftTemplateFormModal';
import ShiftDeleteModal from '../../components/ShiftDeleteModal';

/**
 * ==============================================================================
 * MODULE: Chuẩn hóa Bộ Khung ca Mẫu (Shift Master Template)
 * ACTOR: Operations Admin
 * PAGE: ShiftMasterPage (index.jsx)
 * ==============================================================================
 * Tính năng chính:
 * 1. Thiết lập và chuẩn hóa các khung ca mặc định toàn chuỗi (Ca sáng, Ca chiều, Ca đêm)
 * 2. Ngăn chặn việc tạo ca sai lệch từ phía Store Manager (Strict Shift Policy)
 * 3. Trực quan hóa dòng thời gian 24h (24h Timeline Visualizer)
 * 4. Tự động tính toán số giờ công chuẩn và phát hiện ca làm việc qua đêm
 * 5. Nút phục hồi & đồng bộ 3 ca mặc định từ Backend API (/api/Shifts/templates/standardize)
 */
export default function ShiftMasterPage() {
  const navigate = useNavigate();
  const { c } = useAdminTheme();
  const toast = useToast();

  const {
    shifts,
    allShifts,
    loading,
    stats,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    // Modal
    formModalOpen,
    setFormModalOpen,
    editingShift,
    setEditingShift,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingShift,
    setDeletingShift,
    standardizing,
    // Handlers
    handleCreateShift,
    handleUpdateShift,
    handleToggleStatus,
    handleDeleteShift,
    handleStandardize,
  } = useShiftTemplate();

  // Menu Sidebar phía Operations Admin
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan Dashboard', icon: 'dashboard' },
    { type: 'group', label: 'VẬN HÀNH & HỆ THỐNG' },
    { id: 'branches', label: 'Danh mục Chi nhánh & Kiosk', icon: 'pin' },
    { id: 'shift-master', label: 'Khung Ca Mẫu (Shift Master)', icon: 'clock' },
  ];

  const handleNavigate = (id) => {
    if (id === 'dashboard') navigate('/dashboard');
    if (id === 'branches') navigate('/branches');
    if (id === 'shift-master') navigate('/shifts/templates');
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="shift-master"
          onNavigate={handleNavigate}
          navItems={navItems}
          consoleLabel="OPERATIONS CONSOLE"
          brandName="RWFM OPS"
          roleLabel="Operations Admin"
        />
      }
      topbar={
        <DashboardTopbar
          page="shift-master"
          pageTitles={{ 'shift-master': 'Bộ Khung Ca Mẫu Toàn Hệ Thống' }}
          consoleLabel="Operations Admin"
          roleLabel="Quản trị vận hành"
          fallbackTitle="Khung Ca Mẫu"
        />
      }
    >
      {/* 1. Header trang */}
      <PageHeader
        title="Bộ Khung Ca Mẫu Toàn Hệ Thống"
        subtitle="Thiết lập và chuẩn hóa các khung ca làm việc mặc định toàn chuỗi để ngăn chặn việc tạo ca sai lệch tại các chi nhánh."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Nút chuẩn hóa lại 3 ca mặc định */}
            <Button
              variant="outline"
              onClick={async () => {
                const res = await handleStandardize();
                if (res?.success) {
                  toast.success('Đã đồng bộ 3 khung ca chuẩn mặc định từ Backend!');
                } else {
                  toast.error(res?.error || 'Đồng bộ thất bại');
                }
              }}
              loading={standardizing}
              title="Đồng bộ 3 ca mặc định từ Backend"
            >
              <Icon
                name="pulse"
                size={16}
              />
              <span>Đồng Bộ Ca Mặc Định</span>
            </Button>

            {/* Nút thêm mới khung ca */}
            <Button
              variant="primary"
              onClick={() => {
                setEditingShift(null);
                setFormModalOpen(true);
              }}
            >
              <Icon
                name="plus"
                size={16}
              />
              <span>Thêm Khung Ca Mới</span>
            </Button>
          </div>
        }
      />

      {/* 2. Thống kê tổng hợp */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <StatCard
          label="TỔNG SỐ KHUNG CA"
          value={stats.total}
          tone="neutral"
          icon="calendar"
          hint="Đã thiết lập trong hệ thống"
        />
        <StatCard
          label="ĐANG ÁP DỤNG"
          value={stats.active}
          tone="good"
          icon="check"
          hint="Cho phép quản lý cửa hàng xếp lịch"
        />
        <StatCard
          label="CA ĐÊM QUA NGÀY"
          value={stats.overnight}
          tone="accent"
          icon="lock"
          hint="Tính phụ cấp ca đêm tự động"
        />
        <StatCard
          label="CA MẶC ĐỊNH CHUỖI"
          value={stats.systemDefault}
          tone="neutral"
          icon="dot"
          hint="Ca sáng, chiều, đêm bất biến"
        />
      </div>

      {/* 3. Banner chính sách khóa ca chuẩn */}
      <ShiftEnforcementBanner />

      {/* 4. Sơ đồ 24h Timeline Visualizer */}
      <Shift24hTimeline shifts={allShifts} />

      {/* 5. Bảng dữ liệu Khung ca mẫu */}
      <Panel>
        {/* Bộ lọc tìm kiếm & nhóm ca */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: '1', minWidth: '280px', maxWidth: '420px' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm theo tên ca, mã ca, mô tả..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: c.fgSubtle }}>Phân loại ca:</span>
            <Select
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: 'ALL', label: 'Tất cả khung ca' },
                { value: 'ACTIVE', label: 'Đang áp dụng' },
                { value: 'OVERNIGHT', label: 'Ca trực đêm qua ngày' },
                { value: 'SYSTEM_DEFAULT', label: 'Ca chuẩn mặc định' },
              ]}
            />
          </div>
        </div>

        {/* Bảng danh sách ca */}
        <ShiftTemplateTable
          shifts={shifts}
          loading={loading}
          onEdit={(shift) => {
            setEditingShift(shift);
            setFormModalOpen(true);
          }}
          onToggleStatus={async (shift) => {
            const res = await handleToggleStatus(shift);
            if (res?.success) {
              toast.success(
                shift.isActive
                  ? `Đã tạm dừng áp dụng khung ca "${shift.shiftName}"`
                  : `Đã kích hoạt lại khung ca "${shift.shiftName}"`
              );
            } else {
              toast.error(res?.error || 'Không thể đổi trạng thái ca');
            }
          }}
          onDelete={(shift) => {
            setDeletingShift(shift);
            setDeleteModalOpen(true);
          }}
        />
      </Panel>

      {/* 6. Modal Thêm/Sửa Khung ca mẫu */}
      <ShiftTemplateFormModal
        open={formModalOpen}
        initialData={editingShift}
        onClose={() => {
          setFormModalOpen(false);
          setEditingShift(null);
        }}
        onSubmit={async (formData) => {
          if (editingShift) {
            const res = await handleUpdateShift(editingShift.shiftId, formData);
            if (res?.success) {
              toast.success('Cập nhật khung ca mẫu thành công!');
            } else {
              toast.error(res?.error || 'Không thể cập nhật khung ca');
            }
            return res;
          } else {
            const res = await handleCreateShift(formData);
            if (res?.success) {
              toast.success('Thêm mới khung ca mẫu thành công!');
            } else {
              toast.error(res?.error || 'Không thể tạo khung ca');
            }
            return res;
          }
        }}
      />

      {/* 7. Modal Xóa Khung ca mẫu */}
      <ShiftDeleteModal
        open={deleteModalOpen}
        shift={deletingShift}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingShift(null);
        }}
        onConfirm={async (shiftId) => {
          const res = await handleDeleteShift(shiftId);
          if (res?.success) {
            toast.success('Đã xóa khung ca thành công!');
          } else {
            toast.error(res?.error || 'Không thể xóa khung ca');
          }
          return res;
        }}
      />
    </DashboardShell>
  );
}
