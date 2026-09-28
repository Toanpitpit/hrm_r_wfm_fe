import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import StatCard from '@/shared/components/ui/StatCard';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import useDebounce from '@/shared/hooks/useDebounce';

// Services
import employeeService, { STORE_ROLES } from '@/modules/employee/services/employee.service';

// Child Components
import EmployeeTable from '@/modules/employee/components/EmployeeTable/EmployeeTable';
import EmployeeFilter from '@/modules/employee/components/EmployeeFilter/EmployeeFilter';
import EmployeeFormModal from '@/modules/employee/components/EmployeeFormModal/EmployeeFormModal';
import EmployeeDetailModal from '@/modules/employee/components/EmployeeDetailModal/EmployeeDetailModal';
import ResetPasswordModal from '@/modules/employee/components/ResetPasswordModal/ResetPasswordModal';
import ToggleStatusModal from '@/modules/employee/components/ToggleStatusModal/ToggleStatusModal';

export default function EmployeeManagementPage() {
  const { c, fonts } = useAdminTheme();
  const navigate = useNavigate();
  const toast = useToast();

  // 1. Context người dùng hiện tại
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || '').toUpperCase();
  const roleName = storedUser?.roleName || storedUser?.RoleName || '';
  const currentBranchId = storedUser?.homeBranchId || storedUser?.storeId || storedUser?.branchId || 1;
  const currentBranchName = storedUser?.storeName || storedUser?.branchName || 'Chi nhánh Cầu Giấy';

  const canManageSystem = userRole === 'OPERATIONS_ADMIN' || userRole === 'BUSINESS_OWNER' || userRole.includes('ADMIN') || userRole.includes('OWNER');
  const isStoreManager = userRole === 'STORE_MANAGER' || userRole.includes('MANAGER') || roleName.toLowerCase().includes('quản lý');

  // 2. Dữ liệu trạng thái
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState(STORE_ROLES);
  const [branches, setBranches] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(isStoreManager ? String(currentBranchId) : '');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');

  // Thống kê tổng quan nhân sự (Overview Stat Cards)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    shiftLeader: 0,
    cashier: 0,
    sales: 0,
    security: 0,
    manager: 0,
  });

  // Refs điều phối Abort và initial load
  const isFirstMountRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmployee, setResetEmployee] = useState(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggleEmployee, setToggleEmployee] = useState(null);

  // 3. Tải Danh mục Roles và Branches (GET /api/Users/roles & GET /api/Users/branches)
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [fetchedRoles, fetchedBranches] = await Promise.all([
          employeeService.getRoles(),
          employeeService.getBranches(),
        ]);
        if (fetchedRoles && fetchedRoles.length > 0) {
          setRoles(fetchedRoles);
        }
        if (fetchedBranches && fetchedBranches.length > 0) {
          setBranches(fetchedBranches);
        }
      } catch (err) {
        console.warn('Lỗi khi tải master data:', err);
      }
    };
    loadMasterData();
  }, []);

  // 4. Tải danh sách nhân sự (GET /api/Users/employees) - Hỗ trợ hủy request cũ và không nháy bảng
  const fetchEmployees = useCallback(async (isInitial = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isInitial) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (roleFilter) params.roleCode = roleFilter;
      if (isStoreManager) {
        params.branchId = currentBranchId;
        params.homeBranchId = currentBranchId;
      } else if (branchFilter) {
        params.branchId = branchFilter;
        params.homeBranchId = branchFilter;
      }
      if (statusFilter) params.status = statusFilter;
      if (contractTypeFilter) params.contractType = contractTypeFilter;

      const res = await employeeService.getEmployees(params, { signal: controller.signal });

      if (res?.canceled) return;

      if (res?.success && res.data) {
        const data = res.data;
        setEmployees(data);

        // Cập nhật thống kê 4 thẻ KPI nếu đây là lần tải ban đầu hoặc thay đổi chi nhánh (không có từ khóa tìm kiếm/bộ lọc vai trò)
        const isUnfiltered = !debouncedSearch.trim() && !roleFilter && !statusFilter && !contractTypeFilter;
        if (isUnfiltered || isInitial) {
          setStats({
            total: data.length,
            active: data.filter((e) => e.status !== 'INACTIVE').length,
            inactive: data.filter((e) => e.status === 'INACTIVE').length,
            shiftLeader: data.filter((e) => e.roleCode === 'SHIFT_LEADER').length,
            cashier: data.filter((e) => e.roleCode === 'CASHIER').length,
            sales: data.filter((e) => e.roleCode === 'SALES_STAFF').length,
            security: data.filter((e) => e.roleCode === 'SECURITY_GUARD' || e.roleCode === 'SECURITY').length,
            manager: data.filter((e) => e.roleCode === 'STORE_MANAGER').length,
          });
        }
      } else {
        setEmployees([]);
      }
    } catch (err) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error('Lỗi khi tải danh sách nhân sự:', err);
        toast.error('Không thể tải danh sách nhân sự.');
      }
    } finally {
      if (isInitial) setInitialLoading(false);
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, branchFilter, statusFilter, contractTypeFilter, isStoreManager, currentBranchId, toast]);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      fetchEmployees(true);
    } else {
      fetchEmployees(false);
    }
  }, [fetchEmployees]);

  // 5. Thao tác Modals & CRUD
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormModalOpen(true);
  };

  const handleOpenDetailModal = (emp) => {
    setSelectedEmployee(emp);
    setDetailModalOpen(true);
  };

  const handleOpenResetModal = (emp) => {
    setResetEmployee(emp);
    setResetModalOpen(true);
  };

  const handleOpenToggleModal = (emp) => {
    setToggleEmployee(emp);
    setToggleModalOpen(true);
  };

  const handleFormSubmit = async (formData, isEdit) => {
    if (isEdit) {
      const res = await employeeService.updateEmployee(editingEmployee.id, formData);
      if (res.success) {
        toast.success(res.message || 'Cập nhật nhân sự thành công!');
        fetchEmployees(true);
      } else {
        toast.error(res.message || 'Cập nhật thất bại.');
      }
    } else {
      if (formData.roleCode === 'STORE_MANAGER' && canManageSystem) {
        const res = await employeeService.createStoreManager(formData);
        if (res.success) {
          toast.success(res.message || 'Cấp tài khoản Cửa hàng trưởng thành công!');
          fetchEmployees(true);
        } else {
          toast.error(res.message || 'Khai báo thất bại.');
        }
      } else {
        const res = await employeeService.createEmployee(formData);
        if (res.success) {
          toast.success(res.message || 'Khai báo thành công! Welcome Email đã được gửi.');
          fetchEmployees(true);
        } else {
          toast.error(res.message || 'Khai báo thất bại.');
        }
      }
    }
  };

  const handleConfirmResetPassword = async (id, customPassword) => {
    const res = await employeeService.resetPassword(id, customPassword);
    if (res.success) {
      toast.success('Đã đặt lại mật khẩu tài khoản thành công!');
      return res;
    } else {
      toast.error(res.message || 'Đặt lại mật khẩu thất bại.');
      throw new Error(res.message);
    }
  };

  const handleConfirmToggleStatus = async (id, newStatus) => {
    const res = await employeeService.toggleUserStatus(id, newStatus);
    if (res.success) {
      toast.success(res.message || 'Cập nhật trạng thái thành công!');
      fetchEmployees(true);
    } else {
      toast.error(res.message || 'Cập nhật trạng thái thất bại.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    if (!isStoreManager) setBranchFilter('');
    setStatusFilter('');
    setContractTypeFilter('');
  };

  // Điều hướng
  const navItems = getNavItemsForRole(userRole);

  const handleNavigate = (id) => {
    if (id === 'dashboard') {
      if (isStoreManager) navigate('/store-manager/kiosk-codes');
      else navigate('/dashboard');
    } else if (id === 'branches') navigate('/branches');
    else if (id === 'shift-master') navigate('/shifts/templates');
    else if (id === 'employees') navigate('/employees');
    else if (id === 'store-schedules') navigate('/store-manager/schedules');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
    else if (id === 'kiosk-codes') navigate('/store-manager/kiosk-codes');
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="employees"
          activePath="/employees"
          onNavigate={handleNavigate}
          consoleLabel={isStoreManager ? 'STORE MANAGER CONSOLE' : 'OPERATIONS CONSOLE'}
          brandName="RWFM Enterprise"
          roleLabel={isStoreManager ? `Quản lý ${currentBranchName}` : 'Operations Admin'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: isStoreManager ? 'Store Manager' : 'Quản Trị Vận Hành', href: isStoreManager ? '/store-manager/schedules' : '/dashboard' },
            { label: isStoreManager ? 'Quản Lý Nhân Sự & Kiosk' : 'Vận Hành & Hệ Thống', href: '/employees' },
            { label: 'Hồ Sơ Nhân Sự' },
          ]}
        />
      }
    >
      <PageHeader
        index={isStoreManager ? 'Store Manager · Quản Lý Nhân Sự' : 'Operations Admin · Hồ Sơ Nhân Sự'}
        title={
          isStoreManager
            ? `Quản Lý Nhân Sự Chi Nhánh: ${currentBranchName}`
            : 'Khai Báo Hồ Sơ Nhân Sự'
        }
        subtitle={
          isStoreManager
            ? 'Khai báo nhân sự mới tại chi nhánh của bạn.'
            : 'Quản trị 4 vai trò nhân sự cửa hàng chuỗi RWFM'
        }
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Icon name="plus" size={16} />
              <span>{isStoreManager ? 'Khai Báo Nhân Sự Chi Nhánh' : 'Khai Báo Nhân Sự Mới'}</span>
            </Button>
          </div>
        }
      />

      {/* Thẻ Thống Kê Nhanh (Stat Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <StatCard
          icon="users"
          title={isStoreManager ? 'Tổng Nhân Sự Chi Nhánh' : 'Tổng Nhân Sự Cửa Hàng'}
          value={stats.total}
          color="#f2ca50"
          subtitle={`${stats.cashier} Thu ngân • ${stats.sales} Bán hàng`}
        />
        <StatCard
          icon="check"
          title="Đang Hoạt Động"
          value={stats.active}
          color="#22c55e"
          subtitle="Sẵn sàng phân ca làm việc"
        />
        <StatCard
          icon="lock"
          title="Tạm Khóa / Vô Hiệu"
          value={stats.inactive}
          color="#ef4444"
          subtitle="Tài khoản tạm ngưng truy cập"
        />
        <StatCard
          icon="calendar"
          title="Điều Hành & An Ninh"
          value={`${stats.manager + stats.shiftLeader + stats.security}`}
          color="#3b82f6"
          subtitle={
            stats.manager > 0
              ? `${stats.manager} Cửa hàng trưởng • ${stats.shiftLeader} Trưởng ca • ${stats.security} Bảo vệ`
              : `${stats.shiftLeader} Trưởng ca • ${stats.security} Bảo vệ`
          }
        />
      </div>

      {/* Main Content Panel */}
      <Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Bộ lọc nhân sự */}
          <EmployeeFilter
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            branchFilter={branchFilter}
            onBranchFilterChange={setBranchFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            contractTypeFilter={contractTypeFilter}
            onContractTypeFilterChange={setContractTypeFilter}
            onResetFilters={handleResetFilters}
            roles={roles}
            branches={branches}
            isStoreManager={isStoreManager}
          />

          {/* Bảng danh sách nhân sự */}
          <EmployeeTable
            employees={employees}
            loading={loading}
            initialLoading={initialLoading}
            onViewDetail={handleOpenDetailModal}
            onEdit={handleOpenEditModal}
            onResetPassword={handleOpenResetModal}
            onToggleStatus={handleOpenToggleModal}
            canManageSystem={canManageSystem}
          />
        </div>
      </Panel>

      {/* Modal: Khai báo / Chỉnh sửa hồ sơ nhân sự */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        roles={roles}
        branches={branches}
        canManageSystem={canManageSystem}
        isStoreManager={isStoreManager}
        currentStoreBranchId={currentBranchId}
        currentStoreBranchName={currentBranchName}
      />

      {/* Modal: Xem chi tiết hồ sơ */}
      <EmployeeDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        employee={selectedEmployee}
        onEdit={handleOpenEditModal}
        onResetPassword={handleOpenResetModal}
        canManageSystem={canManageSystem}
      />

      {/* Modal: Đặt lại mật khẩu (Admin / Owner only) */}
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        employee={resetEmployee}
        onConfirmReset={handleConfirmResetPassword}
      />

      {/* Modal: Khóa / Kích hoạt tài khoản */}
      <ToggleStatusModal
        isOpen={toggleModalOpen}
        onClose={() => setToggleModalOpen(false)}
        employee={toggleEmployee}
        onConfirmToggle={handleConfirmToggleStatus}
      />
    </DashboardShell>
  );
}
