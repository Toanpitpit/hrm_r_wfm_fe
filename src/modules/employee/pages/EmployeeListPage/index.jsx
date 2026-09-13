import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

// Shared UI components
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
import CreateEmployeeModal from '../../components/CreateEmployeeModal';
import EditEmployeeModal from '../../components/EditEmployeeModal';
import ResetKioskPinModal from '../../components/ResetKioskPinModal';
import PinSuccessModal from '../../components/PinSuccessModal';

export default function EmployeeListPage() {
  const { c } = useAdminTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [contractFilter, setContractFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [selectedForPin, setSelectedForPin] = useState(null);
  const [pinResultData, setPinResultData] = useState(null);

  const storedUser = useMemo(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  const isStoreManager = storedUser?.role === 'STORE_MANAGER';

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, storeRes, roleRes] = await Promise.all([
        employeeService.getEmployees(),
        employeeService.getStores(),
        employeeService.getRoles(),
      ]);

      if (empRes?.success) {
        setEmployees(empRes.data || []);
      }
      if (storeRes?.success) {
        setStores(storeRes.data || []);
      }
      if (roleRes?.success) {
        setRoles(roleRes.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách nhân sự');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // UC 1.5: Handle Create Employee
  const handleCreateEmployee = async (payload) => {
    setActionLoading(true);
    try {
      const res = await employeeService.createEmployee(payload);
      if (res?.success) {
        toast.success(`Thêm hồ sơ nhân sự "${payload.fullName}" thành công!`);
        setIsCreateModalOpen(false);
        fetchData();
      } else {
        toast.error(res?.message || 'Không thể tạo hồ sơ nhân viên');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo hồ sơ nhân viên');
    } finally {
      setActionLoading(false);
    }
  };

  // UC 1.5: Handle Update Employee
  const handleUpdateEmployee = async (id, payload) => {
    setActionLoading(true);
    try {
      const res = await employeeService.updateEmployee(id, payload);
      if (res?.success) {
        toast.success(`Cập nhật hồ sơ thành công!`);
        setSelectedForEdit(null);
        fetchData();
      } else {
        toast.error(res?.message || 'Không thể cập nhật hồ sơ');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setActionLoading(false);
    }
  };

  // UC 1.6: Handle Reset/Generate Kiosk PIN
  const handleResetPin = async (id, newPin) => {
    setActionLoading(true);
    try {
      const res = await employeeService.resetKioskPin(id, newPin);
      if (res?.success) {
        setSelectedForPin(null);
        setPinResultData(res.data);
        toast.success('Cấp mã PIN Kiosk thành công!');
        fetchData();
      } else {
        toast.error(res?.message || 'Không thể cấp mã PIN Kiosk');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cấp mã PIN');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        !searchTerm.trim() ||
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone?.includes(searchTerm);

      const matchBranch =
        branchFilter === 'ALL' || String(emp.homeBranchId) === branchFilter;

      const matchRole =
        roleFilter === 'ALL' || String(emp.roleId) === roleFilter;

      const matchContract =
        contractFilter === 'ALL' || emp.employmentType === contractFilter;

      const matchStatus =
        statusFilter === 'ALL' || emp.status === statusFilter;

      return matchSearch && matchBranch && matchRole && matchContract && matchStatus;
    });
  }, [employees, searchTerm, branchFilter, roleFilter, contractFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const fullTime = employees.filter((e) => e.employmentType === 'FULL_TIME').length;
    const partTime = employees.filter((e) => e.employmentType === 'PART_TIME').length;
    const hasPin = employees.filter((e) => e.hasKioskPin).length;
    return { total, fullTime, partTime, hasPin };
  }, [employees]);

  // Navigation Items
  const navItems = isStoreManager
    ? [
        { id: 'dashboard', label: 'Tổng quan cửa hàng', icon: 'home' },
        { type: 'group', label: 'Quản lý Kiosk & Ca' },
        { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock' },
        { id: 'attendance', label: 'Điểm Danh Chi Nhánh', icon: 'pulse' },
        { type: 'group', label: 'Nhân sự & Phân ca' },
        { id: 'shifts', label: 'Quản lý Lịch Ca', icon: 'calendar' },
        { id: 'employees', label: 'Hồ Sơ Nhân Sự', icon: 'users' },
      ]
    : [
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

  // Helper format Role
  const getRoleTone = (roleCode) => {
    switch (roleCode) {
      case 'STORE_MANAGER':
        return 'warn';
      case 'SHIFT_LEADER':
        return 'info';
      case 'CASHIER':
        return 'ok';
      case 'SECURITY_GUARD':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  // Columns definition
  const columns = [
    {
      key: 'employeeCode',
      label: 'MÃ NV',
      w: '110px',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: c.accent }}>
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      label: 'HỌ VÀ TÊN NHÂN VIÊN',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: c.fg }}>{row.fullName}</div>
          <div style={{ fontSize: 11.5, color: c.fgSubtle }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'CHỨC DANH (ROLE)',
      w: '160px',
      render: (row) => (
        <Badge tone={getRoleTone(row.roleCode)}>
          {row.roleName || row.roleCode}
        </Badge>
      ),
    },
    {
      key: 'employmentType',
      label: 'LOẠI HỢP ĐỒNG',
      w: '140px',
      render: (row) => {
        const isFull = row.employmentType === 'FULL_TIME';
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 11.5,
              fontWeight: 600,
              background: isFull ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: isFull ? '#60a5fa' : '#facc15',
              border: `1px solid ${isFull ? 'rgba(59, 130, 246, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            }}
          >
            {isFull ? 'Full-time' : 'Part-time'}
          </span>
        );
      },
    },
    {
      key: 'homeBranch',
      label: 'CHI NHÁNH GỐC',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: c.fg }}>
            {row.branchName || 'Chưa gán chi nhánh'}
          </span>
          {row.branchCode && (
            <span style={{ marginLeft: 6, fontSize: 11, color: c.accent, fontFamily: 'monospace' }}>
              [{row.branchCode}]
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'kioskPin',
      label: 'MÃ PIN KIOSK',
      w: '140px',
      render: (row) => {
        return row.hasKioskPin ? (
          <Badge tone="ok" dot>Đã cấp PIN</Badge>
        ) : (
          <Badge tone="neutral">Chưa có PIN</Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      w: '120px',
      render: (row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <Badge tone={isActive ? 'ok' : 'bad'}>
            {isActive ? 'Hoạt động' : 'Tạm khóa'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      w: '170px',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Button
            size="sm"
            variant="secondary"
            icon="lock"
            onClick={() => setSelectedForPin(row)}
            title="Cấp lại mã PIN điểm danh Kiosk"
          >
            {row.hasKioskPin ? 'Đổi PIN' : 'Cấp PIN'}
          </Button>
          <IconButton
            name="pencil"
            title="Chỉnh sửa hồ sơ & hợp đồng"
            onClick={() => setSelectedForEdit(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="employees"
          onNavigate={handleNavigate}
          navItems={navItems}
          consoleLabel={isStoreManager ? 'Store Manager Console' : 'Operations Admin'}
          defaultDisplayName={storedUser?.fullName || (isStoreManager ? 'Cửa Hàng Trưởng' : 'Operations Admin')}
          roleLabel={isStoreManager ? `Quản lý ${storedUser?.storeName || 'Cơ sở'}` : 'Quản Trị Vận Hành Chuỗi'}
          avatarLetter={storedUser?.fullName?.charAt(0) || 'U'}
          brandName="RWFM HR"
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Quản Trị Nền Tảng', href: '#' },
            { label: 'Hồ Sơ & Hợp Đồng Nhân Sự' },
          ]}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          index="Quản lý Nhân sự & Kiosk"
          title="QUẢN LÝ HỒ SƠ & MÃ PIN KIOSK NHÂN SỰ"
          desc="Khai báo nhân sự toàn chuỗi, phân loại Full-time / Part-time, gán chức danh (Thu ngân, Bán hàng, Bảo vệ, Trưởng ca), Chi nhánh gốc và Cấp mã PIN định danh chấm công Kiosk."
          actions={
            <>
              <Button variant="ghost" icon="refresh" onClick={fetchData} loading={loading}>
                Làm mới
              </Button>
              <Button variant="primary" icon="plus" onClick={() => setIsCreateModalOpen(true)}>
                Thêm Hồ Sơ Nhân Sự
              </Button>
            </>
          }
        />

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <StatCard
            label="TỔNG NHÂN SỰ TOÀN HỆ THỐNG"
            title="TỔNG NHÂN SỰ TOÀN HỆ THỐNG"
            value={stats.total}
            subtext="Nhân viên đã khai báo hồ sơ"
            icon="users"
            tone="info"
          />
          <StatCard
            label="NHÂN SỰ FULL-TIME"
            title="NHÂN SỰ FULL-TIME"
            value={stats.fullTime}
            subtext="Hợp đồng chính thức toàn thời gian"
            icon="calendar"
            tone="ok"
          />
          <StatCard
            label="NHÂN SỰ PART-TIME"
            title="NHÂN SỰ PART-TIME"
            value={stats.partTime}
            subtext="Linh động theo ca đăng ký"
            icon="clock"
            tone="warn"
          />
          <StatCard
            label="ĐÃ CẤP MÃ PIN KIOSK"
            title="ĐÃ CẤP MÃ PIN KIOSK"
            value={`${stats.hasPin}/${stats.total}`}
            subtext="Đủ điều kiện check-in Kiosk"
            icon="lock"
            tone="ok"
          />
        </div>

        {/* Panel Danh sách hồ sơ */}
        <Panel
          title="DANH MỤC HỒ SƠ & HỢP ĐỒNG LAO ĐỘNG"
          subtitle="Dữ liệu nhân sự liên kết trực tiếp với Lập lịch ca (Module 2) và Điểm danh Kiosk (Module 3)"
          actions={
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã NV, họ tên, email..."
              />

              {/* Chi nhánh */}
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

              {/* Chức danh */}
              <Select
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
                options={[
                  { value: 'ALL', label: 'Tất cả chức danh' },
                  ...roles.map((r) => ({
                    value: String(r.id),
                    label: r.roleName,
                  })),
                ]}
              />

              {/* Loại HĐ */}
              <Select
                value={contractFilter}
                onChange={(val) => setContractFilter(val)}
                options={[
                  { value: 'ALL', label: 'Tất cả hợp đồng' },
                  { value: 'FULL_TIME', label: 'Full-time' },
                  { value: 'PART_TIME', label: 'Part-time' },
                ]}
              />

              {/* Trạng thái */}
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'ACTIVE', label: 'Hoạt động' },
                  { value: 'INACTIVE', label: 'Tạm khóa' },
                ]}
              />
            </div>
          }
        >
          <DataTable
            columns={columns}
            data={filteredEmployees}
            rows={filteredEmployees}
            loading={loading}
            keyField="id"
            emptyText="Không tìm thấy hồ sơ nhân sự nào phù hợp với bộ lọc."
          />
        </Panel>
      </div>

      {/* Modal Thêm Mới Hồ Sơ (UC 1.5) */}
      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEmployee}
        stores={stores}
        roles={roles}
        loading={actionLoading}
        defaultBranchId={isStoreManager ? storedUser?.storeId : null}
      />

      {/* Modal Cập Nhật Hồ Sơ (UC 1.5) */}
      <EditEmployeeModal
        isOpen={Boolean(selectedForEdit)}
        onClose={() => setSelectedForEdit(null)}
        onSubmit={handleUpdateEmployee}
        employee={selectedForEdit}
        stores={stores}
        roles={roles}
        loading={actionLoading}
      />

      {/* Modal Cấp / Sinh Lại Mã PIN Kiosk (UC 1.6) */}
      <ResetKioskPinModal
        isOpen={Boolean(selectedForPin)}
        onClose={() => setSelectedForPin(null)}
        onSubmit={handleResetPin}
        employee={selectedForPin}
        loading={actionLoading}
      />

      {/* Modal Hiển Thị Mã PIN Vừa Sinh (UC 1.6) */}
      <PinSuccessModal
        isOpen={Boolean(pinResultData)}
        onClose={() => setPinResultData(null)}
        pinData={pinResultData}
      />
    </DashboardShell>
  );
}
