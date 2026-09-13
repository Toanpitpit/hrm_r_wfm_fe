import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

// UI components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import { IconButton } from '@/shared/components/ui';
import { useToast } from '@/components/ui/toast/ToastProvider';

// Service & Modals
import employeeService from '../../services/employee.service';
import CreateStoreManagerModal from '../../components/CreateStoreManagerModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';

export default function StoreManagersPage() {
  const { c } = useAdminTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [managers, setManagers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);

  const storedUser = useMemo(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mgrRes, storeRes] = await Promise.all([
        employeeService.getStoreManagers(),
        employeeService.getStores(),
      ]);

      if (mgrRes?.success) {
        setManagers(mgrRes.data || []);
      }
      if (storeRes?.success) {
        setStores(storeRes.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách Cửa hàng trưởng');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create Store Manager
  const handleCreateStoreManager = async (payload) => {
    setActionLoading(true);
    try {
      const res = await employeeService.createStoreManager(payload);
      if (res?.success) {
        toast.success(`Cấp tài khoản Store Manager cho ${payload.fullName} thành công!`);
        setIsCreateModalOpen(false);
        fetchData();
      } else {
        toast.error(res?.message || 'Cấp tài khoản thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi hệ thống khi cấp tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Status (Active / Inactive)
  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = user.status === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    const actionName = isCurrentlyActive ? 'khóa tài khoản' : 'kích hoạt lại tài khoản';

    if (!window.confirm(`Bạn có chắc muốn ${actionName} "${user.fullName}" (${user.employeeCode})?`)) {
      return;
    }

    try {
      const res = await employeeService.toggleUserStatus(user.id, nextStatus);
      if (res?.success) {
        toast.success(`Đã ${actionName} thành công!`);
        fetchData();
      } else {
        toast.error(res?.message || 'Thao tác không thành công');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (userId, newPassword) => {
    setActionLoading(true);
    try {
      const res = await employeeService.resetUserPassword(userId, newPassword);
      if (res?.success) {
        toast.success('Đã cập nhật mật khẩu mới thành công!');
        setSelectedUserForReset(null);
      } else {
        toast.error(res?.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List
  const filteredManagers = useMemo(() => {
    return managers.filter((m) => {
      const matchSearch =
        !searchTerm.trim() ||
        m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.includes(searchTerm);

      const matchStatus =
        statusFilter === 'ALL' || m.status?.toUpperCase() === statusFilter;

      const matchBranch =
        branchFilter === 'ALL' || String(m.homeBranchId) === branchFilter;

      return matchSearch && matchStatus && matchBranch;
    });
  }, [managers, searchTerm, statusFilter, branchFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = managers.length;
    const active = managers.filter((m) => m.status === 'ACTIVE').length;
    const inactive = total - active;
    const assignedStores = new Set(managers.map((m) => m.homeBranchId).filter(Boolean)).size;
    return { total, active, inactive, assignedStores };
  }, [managers]);

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', label: 'Báo cáo Vĩ mô', icon: 'home' },
    { type: 'group', label: 'Quản trị Nền tảng' },
    { id: 'branches', label: 'Chi nhánh & Kiosk', icon: 'building' },
    { id: 'shift-templates', label: 'Bộ Khung Ca Mẫu', icon: 'clock' },
    { id: 'store-managers', label: 'Tài Khoản Quản Lý', icon: 'shield' },
    { id: 'employees', label: 'Nhân Sự Toàn Chuỗi', icon: 'users' },
    { type: 'group', label: 'Vận hành & Giám sát' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock' },
    { id: 'attendance', label: 'Giám Sát Chấm Công', icon: 'pulse' },
  ];

  const handleNavigate = (id) => {
    if (id === 'store-managers') navigate('/admin/store-managers');
    else if (id === 'employees') navigate('/admin/employees');
    else if (id === 'kiosk-codes') navigate('/store-manager/kiosk-codes');
    else if (id === 'dashboard') navigate('/dashboard');
  };

  // Table Columns
  const columns = [
    {
      key: 'employeeCode',
      label: 'MÃ NV',
      w: '120px',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: c.accent }}>
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      label: 'CỬA HÀNG TRƯỞNG',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: c.fg }}>{row.fullName}</div>
          <div style={{ fontSize: 11.5, color: c.fgSubtle }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'ĐIỆN THOẠI',
      w: '130px',
      render: (row) => row.phone || <span style={{ color: c.fgFaint }}>Chưa cập nhật</span>,
    },
    {
      key: 'homeBranch',
      label: 'CƠ SỞ / CHI NHÁNH',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: c.fg }}>
            {row.branchName || 'Chưa gán chi nhánh'}
          </span>
          {row.branchCode && (
            <div style={{ fontSize: 11, color: c.accent, fontFamily: 'monospace' }}>
              Mã: {row.branchCode}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      w: '140px',
      render: (row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <Badge tone={isActive ? 'ok' : 'bad'} dot>
            {isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'NGÀY CẤP',
      w: '130px',
      render: (row) => {
        if (!row.createdAt) return 'N/A';
        const d = new Date(row.createdAt);
        return <span style={{ fontSize: 12, color: c.fgSubtle }}>{d.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      w: '140px',
      render: (row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Button
              size="sm"
              variant={isActive ? 'danger' : 'secondary'}
              onClick={() => handleToggleStatus(row)}
              title={isActive ? 'Khóa tài khoản' : 'Kích hoạt lại'}
            >
              {isActive ? 'Khóa' : 'Mở khóa'}
            </Button>
            <IconButton
              name="lock"
              title="Đặt lại mật khẩu"
              onClick={() => setSelectedUserForReset(row)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="store-managers"
          onNavigate={handleNavigate}
          navItems={navItems}
          consoleLabel="Operations Admin"
          defaultDisplayName={storedUser?.fullName || 'Operations Admin'}
          roleLabel="Quản Trị Vận Hành Chuỗi"
          avatarLetter="O"
          brandName="RWFM OPS"
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Quản Trị Nền Tảng', href: '#' },
            { label: 'Tài Khoản & Phân Quyền Vận Hành' },
          ]}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          index="Quản trị Master Data"
          title="QUẢN LÝ TÀI KHOẢN CỬA HÀNG TRƯỞNG"
          desc="Cấp mới, phân quyền chi nhánh và khóa/mở khóa tài khoản quản trị cho các Cửa hàng trưởng (Store Manager) trong toàn chuỗi bán lẻ."
          actions={
            <>
              <Button variant="ghost" icon="refresh" onClick={fetchData} loading={loading}>
                Làm mới
              </Button>
              <Button variant="primary" icon="plus" onClick={() => setIsCreateModalOpen(true)}>
                Cấp Tài Khoản Mới
              </Button>
            </>
          }
        />

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <StatCard
            label="TỔNG STORE MANAGER"
            title="TỔNG STORE MANAGER"
            value={stats.total}
            subtext="Tài khoản quản lý cơ sở"
            icon="users"
            tone="info"
          />
          <StatCard
            label="ĐANG HOẠT ĐỘNG"
            title="ĐANG HOẠT ĐỘNG"
            value={stats.active}
            subtext="Được phép truy cập hệ thống"
            icon="check"
            tone="ok"
          />
          <StatCard
            label="TÀI KHOẢN TẠM KHÓA"
            title="TÀI KHOẢN TẠM KHÓA"
            value={stats.inactive}
            subtext="Bị chặn đăng nhập"
            icon="x"
            tone={stats.inactive > 0 ? 'bad' : 'neutral'}
          />
          <StatCard
            label="CHI NHÁNH ĐÃ GÁN"
            title="CHI NHÁNH ĐÃ GÁN"
            value={`${stats.assignedStores}/${stores.length}`}
            subtext="Đã có Quản lý phụ trách"
            icon="building"
            tone="neutral"
          />
        </div>

        {/* Panel Danh sách Store Manager */}
        <Panel
          title="DANH SÁCH CỬA HÀNG TRƯỞNG TOÀN CHUỖI"
          subtitle="Quản lý và cấp quyền phân bổ lịch ca, duyệt đổi ca và kiểm soát Kiosk"
          actions={
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên, mã NV, email, SĐT..."
              />
              <Select
                value={branchFilter}
                onChange={(val) => setBranchFilter(val)}
                options={[
                  { value: 'ALL', label: 'Tất cả chi nhánh' },
                  ...stores.map((s) => ({
                    value: String(s.storeId || s.id),
                    label: `${s.storeCode || s.branchCode} - ${s.storeName || s.name}`,
                  })),
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'INACTIVE', label: 'Đã bị khóa' },
                ]}
              />
            </div>
          }
        >
          <DataTable
            columns={columns}
            data={filteredManagers}
            rows={filteredManagers}
            loading={loading}
            keyField="id"
            emptyText="Không tìm thấy Cửa hàng trưởng nào phù hợp."
          />
        </Panel>
      </div>

      {/* Modal Cấp mới */}
      <CreateStoreManagerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStoreManager}
        stores={stores}
        loading={actionLoading}
      />

      {/* Modal Đặt lại mật khẩu */}
      <ResetPasswordModal
        isOpen={Boolean(selectedUserForReset)}
        onClose={() => setSelectedUserForReset(null)}
        onSubmit={handleResetPassword}
        user={selectedUserForReset}
        loading={actionLoading}
      />
    </DashboardShell>
  );
}
