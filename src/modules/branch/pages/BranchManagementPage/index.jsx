import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import { useToast } from '@/components/ui/toast/ToastProvider';

// UI components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';

// Subcomponents & Hook
import { useBranch } from '../../hooks/useBranch';
import BranchTable from '../../components/BranchTable';
import BranchMapView from '../../components/BranchMapView';
import BranchFormModal from '../../components/BranchFormModal';
import BranchLockModal from '../../components/BranchLockModal';
import BranchDeleteModal from '../../components/BranchDeleteModal';
import KioskManagerModal from '../../components/KioskManagerModal';
import KioskGlobalMonitor from '../../components/KioskGlobalMonitor';

/**
 * ==============================================================================
 * MODULE: Quản lý Danh mục Chi nhánh & Cấu hình Kiosk
 * ACTOR: Operations Admin
 * PAGE: BranchManagementPage (index.jsx)
 * ==============================================================================
 * Tính năng chính:
 * 1. Thêm / sửa / khóa / xóa chi nhánh toàn hệ thống kèm lý do lưu vết kiểm toán (Audit Log)
 * 2. Thiết lập tọa độ Point (Latitude / Longitude) & Bán kính Geofence chấm công GPS
 * 3. Tích hợp Bản đồ Leaflet tương tác trực quan hiển thị vị trí toàn chuỗi cơ sở
 * 4. Thiết lập cấu hình an ninh mạng: Dải IP Whitelist / Subnet cho trạm Kiosk
 * 5. Chuẩn hóa trình duyệt Kiosk Lockdown Mode tại quầy điểm danh
 * 6. Giám sát tình trạng kết nối mạng trạm Kiosk toàn chuỗi
 */
export default function BranchManagementPage() {
  const navigate = useNavigate();
  const { c } = useAdminTheme();
  const toast = useToast();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'

  const {
    branches,
    allBranches,
    kiosks,
    loading,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    // Modals state
    formModalOpen,
    setFormModalOpen,
    editingBranch,
    setEditingBranch,
    lockModalOpen,
    setLockModalOpen,
    lockingBranch,
    setLockingBranch,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingBranch,
    setDeletingBranch,
    kioskModalOpen,
    setKioskModalOpen,
    selectedBranchForKiosk,
    setSelectedBranchForKiosk,
    globalMonitorOpen,
    setGlobalMonitorOpen,
    // Handlers
    handleCreateBranch,
    handleUpdateBranch,
    handleToggleBranchStatus,
    handleDeleteBranch,
    handleAddKiosk,
    handleSaveKioskConfig,
    handleToggleKioskLock,
  } = useBranch();

  // Navigation menu
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan Dashboard', icon: 'dashboard' },
    { type: 'group', label: 'VẬN HÀNH & HỆ THỐNG' },
    { id: 'branches', label: 'Danh mục Chi nhánh & Kiosk', icon: 'store' },
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
          page="branches"
          onNavigate={handleNavigate}
          navItems={navItems}
          consoleLabel="OPERATIONS CONSOLE"
          brandName="RWFM OPS"
          roleLabel="Operations Admin"
        />
      }
      topbar={
        <DashboardTopbar
          page="branches"
          pageTitles={{ branches: 'Quản Lý Danh Mục Chi Nhánh & Cấu Hình Kiosk' }}
          consoleLabel="Operations Admin"
          roleLabel="Quản trị vận hành"
          fallbackTitle="Chi Nhánh & Kiosk"
        />
      }
    >
      {/* 1. Header trang */}
      <PageHeader
        title="Quản Lý Danh Mục Chi Nhánh & Cấu Hình Kiosk"
        subtitle="Quản trị danh mục chi nhánh, định vị tọa độ Point (GPS / Geofence), cấu hình an ninh mạng và cấp phát máy trạm Kiosk."
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* View Mode Toggle (Table / Map) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                padding: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? c.accent : 'transparent',
                  color: viewMode === 'table' ? c.ink : c.fgSubtle,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all .16s ease',
                }}
              >
                <Icon name="grid" size={14} />
                <span>Dạng Bảng</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'map' ? c.accent : 'transparent',
                  color: viewMode === 'map' ? c.ink : c.fgSubtle,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all .16s ease',
                }}
              >
                <Icon name="map" size={14} />
                <span>Bản Đồ Leaflet</span>
              </button>
            </div>

            {/* Nút mở giám sát Kiosk chuỗi */}
            <Button
              variant="outline"
              onClick={() => setGlobalMonitorOpen(true)}
            >
              <Icon
                name="pulse"
                size={16}
              />
              <span>Giám Sát Kiosk Chuỗi</span>
            </Button>

            {/* Nút thêm mới chi nhánh */}
            <Button
              variant="primary"
              onClick={() => {
                setEditingBranch(null);
                setFormModalOpen(true);
              }}
            >
              <Icon
                name="plus"
                size={16}
              />
              <span>Thêm Chi Nhánh Mới</span>
            </Button>
          </div>
        }
      />

      {/* 2. Thẻ thống kê tổng hợp */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          label="TỔNG SỐ CHI NHÁNH"
          value={stats.totalBranches}
          tone="neutral"
          icon="store"
          hint="Toàn bộ hệ thống cửa hàng"
        />
        <StatCard
          label="ĐANG HOẠT ĐỘNG"
          value={stats.activeBranches}
          tone="good"
          icon="check"
          hint="Đang mở cửa kinh doanh"
        />
        <StatCard
          label="TẠM KHÓA / BẢO TRÌ"
          value={stats.lockedBranches}
          tone={stats.lockedBranches > 0 ? 'bad' : 'neutral'}
          icon="lock"
          hint="Đình chỉ Kiosk & Chấm công"
        />
        <StatCard
          label="TRẠM KIOSK TRỰC TUYẾN"
          value={`${stats.onlineKiosks}/${stats.totalKiosks}`}
          tone="accent"
          icon="screen"
          hint="Máy trạm quầy đang kết nối"
        />
      </div>

      {/* 3. Hiển thị theo chế độ: Bản đồ tương tác Leaflet HOẶC Bảng danh mục */}
      {viewMode === 'map' ? (
        <BranchMapView
          branches={branches}
          onEdit={(branch) => {
            setEditingBranch(branch);
            setFormModalOpen(true);
          }}
          onManageKiosk={(branch) => {
            setSelectedBranchForKiosk(branch);
            setKioskModalOpen(true);
          }}
          onToggleLock={(branch) => {
            setLockingBranch(branch);
            setLockModalOpen(true);
          }}
        />
      ) : (
        <Panel>
          {/* Bộ lọc tìm kiếm & trạng thái */}
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
                placeholder="Tìm theo tên chi nhánh, mã chi nhánh, địa chỉ..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: c.fgSubtle }}>Trạng thái:</span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'INACTIVE', label: 'Tạm khóa' },
                ]}
              />
            </div>
          </div>

          {/* Bảng chi nhánh */}
          <BranchTable
            branches={branches}
            loading={loading}
            onEdit={(branch) => {
              setEditingBranch(branch);
              setFormModalOpen(true);
            }}
            onManageKiosk={(branch) => {
              setSelectedBranchForKiosk(branch);
              setKioskModalOpen(true);
            }}
            onToggleLock={(branch) => {
              setLockingBranch(branch);
              setLockModalOpen(true);
            }}
            onDelete={(branch) => {
              setDeletingBranch(branch);
              setDeleteModalOpen(true);
            }}
          />
        </Panel>
      )}

      {/* 4. Các Modals */}
      {/* Modal Thêm/Sửa chi nhánh */}
      <BranchFormModal
        open={formModalOpen}
        initialData={editingBranch}
        onClose={() => {
          setFormModalOpen(false);
          setEditingBranch(null);
        }}
        onSubmit={async (formData) => {
          if (editingBranch) {
            const res = await handleUpdateBranch(editingBranch.storeId || editingBranch.id, formData);
            if (res?.success) {
              toast.success('Cập nhật thông tin chi nhánh & tọa độ thành công!');
            } else {
              toast.error(res?.error || 'Không thể cập nhật chi nhánh');
            }
            return res;
          } else {
            const res = await handleCreateBranch(formData);
            if (res?.success) {
              toast.success('Thêm mới chi nhánh & ghim tọa độ thành công!');
            } else {
              toast.error(res?.error || 'Không thể tạo chi nhánh');
            }
            return res;
          }
        }}
      />

      {/* Modal Khóa / Mở khóa chi nhánh có lưu lý do */}
      <BranchLockModal
        open={lockModalOpen}
        branch={lockingBranch}
        onClose={() => {
          setLockModalOpen(false);
          setLockingBranch(null);
        }}
        onConfirm={async (storeId, nextStatus, reason) => {
          const res = await handleToggleBranchStatus(storeId, nextStatus, reason);
          if (res?.success) {
            toast.success(
              nextStatus === 'LOCKED' || nextStatus === 'INACTIVE'
                ? 'Đã khóa chi nhánh thành công! Các trạm Kiosk đã bị ngắt kết nối.'
                : 'Đã mở khóa chi nhánh hoạt động trở lại!'
            );
          } else {
            toast.error(res?.error || 'Không thể thay đổi trạng thái chi nhánh');
          }
          return res;
        }}
      />

      {/* Modal Xác nhận Xóa chi nhánh */}
      <BranchDeleteModal
        open={deleteModalOpen}
        branch={deletingBranch}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingBranch(null);
        }}
        onConfirm={async (storeId) => {
          const res = await handleDeleteBranch(storeId);
          if (res?.success) {
            toast.success('Đã xóa chi nhánh và các trạm Kiosk liên quan thành công!');
          } else {
            toast.error(res?.error || 'Không thể xóa chi nhánh');
          }
          return res;
        }}
      />

      {/* Modal Cấu hình máy trạm Kiosk cho chi nhánh */}
      <KioskManagerModal
        open={kioskModalOpen}
        branch={selectedBranchForKiosk}
        allKiosks={kiosks}
        onClose={() => {
          setKioskModalOpen(false);
          setSelectedBranchForKiosk(null);
        }}
        onAddKiosk={async (storeId, kioskData) => {
          const res = await handleAddKiosk(storeId, kioskData);
          return res;
        }}
        onToggleKioskLock={async (kioskId, currentStatus) => {
          const res = await handleToggleKioskLock(kioskId, currentStatus);
          if (res?.success) {
            toast.success('Đã cập nhật trạng thái trạm Kiosk thành công!');
          }
          return res;
        }}
      />

      {/* Modal Giám sát Kiosk toàn chuỗi */}
      <KioskGlobalMonitor
        open={globalMonitorOpen}
        kiosks={kiosks}
        branches={allBranches}
        onClose={() => setGlobalMonitorOpen(false)}
      />
    </DashboardShell>
  );
}