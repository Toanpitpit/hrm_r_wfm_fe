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
import Modal from '@/shared/components/ui/Modal';
import StatCard from '@/shared/components/ui/StatCard';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import useDebounce from '@/shared/hooks/useDebounce';

// Services
import employeeService, { STORE_ROLES } from '@/modules/employee/services/employee.service';
import headcountService from '@/modules/employee/services/headcount.service';

// Child Components
import EmployeeTable from '@/modules/employee/components/EmployeeTable/EmployeeTable';
import EmployeeFilter from '@/modules/employee/components/EmployeeFilter/EmployeeFilter';
import EmployeeFormModal from '@/modules/employee/components/EmployeeFormModal/EmployeeFormModal';
import EmployeeDetailModal from '@/modules/employee/components/EmployeeDetailModal/EmployeeDetailModal';
import ResetPasswordModal from '@/modules/employee/components/ResetPasswordModal/ResetPasswordModal';
import ToggleStatusModal from '@/modules/employee/components/ToggleStatusModal/ToggleStatusModal';
import HeadcountQuotaCard from '@/modules/employee/components/HeadcountQuotaCard/HeadcountQuotaCard';

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
  const isBusinessOwner = userRole === 'BUSINESS_OWNER' || userRole.includes('OWNER');
  const isStoreManager = userRole === 'STORE_MANAGER' || userRole.includes('MANAGER') || roleName.toLowerCase().includes('quản lý');

  // 2. Dữ liệu trạng thái
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState(STORE_ROLES);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const abortControllerRef = useRef(null);
  const isFirstMountRef = useRef(true);

  // Dữ liệu thống kê nhân sự độc lập (không bị nhảy về 0 khi tìm kiếm nhân viên)
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    activeCount: 0,
    inactiveCount: 0,
    roleStats: {
      shiftLeader: 0,
      cashier: 0,
      sales: 0,
      security: 0,
      manager: 0,
    },
  });

  // Bộ lọc
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(isStoreManager ? String(currentBranchId) : '');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');

  // Định biên Effective Quota
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [allBranchesQuota, setAllBranchesQuota] = useState([]);
  const [loadingQuota, setLoadingQuota] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmployee, setResetEmployee] = useState(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggleEmployee, setToggleEmployee] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeletingDirect, setIsDeletingDirect] = useState(false);

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
      if (contractTypeFilter) {
        params.contractType = contractTypeFilter;
        params.employmentType = contractTypeFilter;
      }

      const res = await employeeService.getEmployees(params, { signal: controller.signal });

      if (res?.canceled) return;

      if (res?.success && res.data) {
        setEmployees(res.data);
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

  // 4b. Tải thống kê nhân sự toàn hệ thống (GET /api/Users/employees/stats)
  // Luôn lấy dữ liệu TỔNG TẤT CẢ CHI NHÁNH trong chuỗi (hoặc chi nhánh nếu là Store Manager).
  // Độc lập hoàn toàn với thanh tìm kiếm và bộ lọc bên dưới, không phụ thuộc search hay branchFilter.
  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (isStoreManager) {
        params.branchId = currentBranchId;
      } else if (branchFilter) {
        params.branchId = branchFilter;
      }
      const res = await employeeService.getEmployeeStats(params);
      if (res.success && res.data) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thống kê nhân sự:', err);
    }
  }, [isStoreManager, currentBranchId, branchFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 5. Tải dữ liệu Effective Quota (định biên hiệu dụng)
  const fetchHeadcountData = useCallback(async () => {
    const targetBranchId = isStoreManager
      ? currentBranchId
      : branchFilter || branches[0]?.id || branches[0]?.storeId || 1;

    const currentBranch = branches.find((b) => String(b.id || b.storeId) === String(targetBranchId));
    const tier = currentBranch?.branchTier || currentBranch?.tier || (Number(targetBranchId) === 1 ? 1 : 2);

    setLoadingQuota(true);
    try {
      const promises = [
        headcountService.getBranchHeadcountStatus(targetBranchId, tier),
      ];

      if (!isStoreManager) {
        promises.push(headcountService.getAllBranchesHeadcountStatus(branches));
      }

      const [quotaRes, allBranchesRes] = await Promise.all(promises);

      if (quotaRes.success) {
        setQuotaStatus(quotaRes.data);
      }
      if (allBranchesRes?.success) {
        setAllBranchesQuota(allBranchesRes.data);
      }
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu định biên:', err);
    } finally {
      setLoadingQuota(false);
    }
  }, [isStoreManager, currentBranchId, branchFilter, branches]);

  useEffect(() => {
    fetchHeadcountData();
  }, [fetchHeadcountData]);

  // 6. Thao tác Modals Nhân sự & CRUD
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    if (!canManageSystem) {
      toast?.warning?.('Cửa hàng trưởng chỉ có quyền xem hồ sơ nhân sự, không có quyền chỉnh sửa.');
      return;
    }
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

  const handleOpenDeleteModal = (emp) => {
    if (emp.status !== 'INACTIVE') {
      toast.warning('Tài khoản đang hoạt động. Bạn cần khóa tài khoản trước khi thực hiện xóa.');
      return;
    }
    const lockedDate = emp.lockedAt ? new Date(emp.lockedAt) : (emp.updatedAt ? new Date(emp.updatedAt) : null);
    const daysPassed = lockedDate ? Math.floor((new Date() - lockedDate) / (1000 * 60 * 60 * 24)) : 0;
    const daysRemaining = emp.daysUntilDeletable ?? Math.max(0, 14 - daysPassed);

    if (daysRemaining > 0) {
      toast.warning(`Tài khoản mới bị khóa được ${daysPassed} ngày. Theo chính sách đối soát bảng công và tiền lương (bắt buộc cho mọi cấp quản trị), chỉ được xóa vĩnh viễn sau đủ 14 ngày (còn ${daysRemaining} ngày nữa).`);
      return;
    }

    setDeletingEmployee(emp);
    setDeleteModalOpen(true);
  };

  const handleConfirmDirectDelete = async () => {
    if (!deletingEmployee?.id) return;
    setIsDeletingDirect(true);
    try {
      const res = await employeeService.deleteEmployee(deletingEmployee.id);
      if (res.success) {
        toast.success(res.message || 'Đã xóa hoàn toàn tài khoản khỏi CSDL thành công!');
        setDeleteModalOpen(false);
        fetchEmployees();
        fetchStats();
        fetchHeadcountData();
      } else {
        toast.error(res.message || 'Không thể xóa tài khoản nhân sự.');
      }
    } catch (err) {
      toast.error('Lỗi khi thực hiện xóa tài khoản.');
    } finally {
      setIsDeletingDirect(false);
    }
  };

  const handleFormSubmit = async (formData, isEdit) => {
    if (isEdit) {
      const res = await employeeService.updateEmployee(editingEmployee.id, formData);
      if (res.success) {
        toast.success(res.message || 'Cập nhật nhân sự thành công!');
        fetchEmployees();
        fetchStats();
        fetchHeadcountData();
      } else {
        toast.error(res.message || 'Cập nhật thất bại.');
      }
    } else {
      if (formData.roleCode === 'STORE_MANAGER' && canManageSystem) {
        const res = await employeeService.createStoreManager(formData);
        if (res.success) {
          toast.success(res.message || 'Cấp tài khoản Cửa hàng trưởng thành công!');
          fetchEmployees();
          fetchStats();
          fetchHeadcountData();
        } else {
          toast.error(res.message || 'Khai báo thất bại.');
        }
      } else {
        const res = await employeeService.createEmployee(formData);
        if (res.success) {
          toast.success(res.message || 'Khai báo thành công! Welcome Email đã được gửi.');
          fetchEmployees();
          fetchStats();
          fetchHeadcountData();
        } else {
          toast.error(res.message || 'Khai báo thất bại.');
        }
      }
    }
  };

  const handleConfirmResetPassword = async (id, customPassword, reason) => {
    const res = await employeeService.resetPassword(id, customPassword, reason);
    if (res.success) {
      toast.success(res.message || 'Đã đặt lại mật khẩu tài khoản thành công!');
      return res;
    } else {
      toast.error(res.message || 'Đặt lại mật khẩu thất bại.');
      throw new Error(res.message);
    }
  };

  const handleConfirmToggleStatus = async (id, newStatus, reason) => {
    const res = await employeeService.toggleUserStatus(id, newStatus, reason);
    if (res.success) {
      toast.success(res.message || 'Cập nhật trạng thái thành công!');
      fetchEmployees();
      fetchStats();
      // Quota tự động cập nhật ngay lập tức vì trạng thái INACTIVE làm dôi dư vị trí (Attrition Compensation)
      fetchHeadcountData();
    } else {
      toast.error(res.message || 'Cập nhật trạng thái thất bại.');
      throw new Error(res.message);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    if (!isStoreManager) setBranchFilter('');
    setStatusFilter('');
    setContractTypeFilter('');
  };

  // 7. Số liệu thống kê độc lập lấy từ thống kê chuẩn (không bị ảnh hưởng bởi thanh tìm kiếm search)
  const totalEmployees = statsData?.totalEmployees || 0;
  const activeCount = statsData?.activeCount || 0;
  const inactiveCount = statsData?.inactiveCount || 0;
  const roleStats = statsData?.roleStats || {
    shiftLeader: 0,
    cashier: 0,
    sales: 0,
    security: 0,
    manager: 0,
  };

  const handleUpgradeBranchTier = async (branchId) => {
    try {
      const res = await headcountService.upgradeBranchTier(branchId);
      if (res.success) {
        toast.success(res.message || 'Nâng cấp phân cấp chi nhánh thành công!');
        const updatedBranches = await employeeService.getBranches();
        if (updatedBranches && updatedBranches.length > 0) {
          setBranches(updatedBranches);
        }
        await Promise.all([fetchHeadcountData(), fetchStats()]);
      } else {
        toast.error(res.message || 'Nâng cấp Tier thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi nâng cấp Tier chi nhánh');
    }
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

  // Xác định tên chi nhánh hiển thị cho Quota Card
  const displayBranch = isStoreManager
    ? currentBranchName
    : branchFilter
      ? branches.find((b) => String(b.id || b.storeId) === String(branchFilter))?.name || `Chi nhánh #${branchFilter}`
      : branches[0]?.name || 'Chi nhánh Flagship Cầu Giấy';

  const displayTier = isStoreManager
    ? (quotaStatus?.branchTier || 2)
    : branchFilter
      ? (branches.find((b) => String(b.id || b.storeId) === String(branchFilter))?.branchTier || 2)
      : (branches[0]?.branchTier || 1);

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
            { label: 'Hồ Sơ Nhân Sự & Định Biên' },
          ]}
        />
      }
    >
      <PageHeader
        index={isStoreManager ? 'Store Manager · Quản Lý Nhân Sự' : 'Operations Admin · Hồ Sơ Nhân Sự'}
        title={
          isStoreManager
            ? `Quản Lý Nhân Sự & Định Biên: ${currentBranchName}`
            : 'Khai Báo Nhân Sự & Định Biên Chuỗi'
        }
        subtitle={
          isStoreManager
            ? 'Theo dõi danh sách nhân sự và tình trạng định biên chuẩn theo Tier tại chi nhánh.'
            : ''
        }
        actions={
          !isStoreManager && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Operations Admin & Owner: Quyền tạo nhân viên (kèm tính năng Import Hàng Loạt bên trong modal) */}
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                id="btn-create-employee"
              >
                <Icon name="plus" size={16} />
                <span>Khai Báo Nhân Sự Mới</span>
              </Button>
            </div>
          )
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
          title={isStoreManager ? 'Tổng Nhân Sự Chi Nhánh' : 'Tổng Nhân Sự Toàn Chuỗi'}
          value={totalEmployees}
          color="var(--color-primary, #0D9488)"
          subtitle={`${roleStats.cashier || 0} Thu ngân • ${roleStats.sales || 0} Bán hàng`}
        />
        <StatCard
          icon="check"
          title="Đang Hoạt Động (Active)"
          value={activeCount}
          color="#22c55e"
          subtitle="Tính vào hạn mức định biên"
        />
        <StatCard
          icon="lock"
          title="Đã Nghỉ / Tạm Khóa"
          value={inactiveCount}
          color="#ef4444"
          subtitle="Tự động bù đắp dôi dư Quota"
        />
        <StatCard
          icon="calendar"
          title="Điều Hành & An Ninh"
          value={`${(roleStats.manager || 0) + (roleStats.shiftLeader || 0) + (roleStats.security || 0)}`}
          color="#3b82f6"
          subtitle={
            (roleStats.manager || 0) > 0
              ? `${roleStats.manager} Cửa hàng trưởng • ${roleStats.shiftLeader || 0} Trưởng ca • ${roleStats.security || 0} Bảo vệ`
              : `${roleStats.shiftLeader || 0} Trưởng ca • ${roleStats.security || 0} Bảo vệ`
          }
        />
      </div>

      {/* Widget Giám Sát Định Biên Chi Nhánh Chuẩn Theo Tier */}
      <HeadcountQuotaCard
        allBranchesQuota={allBranchesQuota}
        selectedBranchId={branchFilter}
        onSelectBranch={(bId) => setBranchFilter(bId ? String(bId) : '')}
        isStoreManager={isStoreManager}
        canManageSystem={canManageSystem}
        onUpgradeTier={handleUpgradeBranchTier}
      />

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
            onDelete={handleOpenDeleteModal}
            canManageSystem={canManageSystem}
          />
        </div>
      </Panel>

      {/* Modal: Khai báo / Chỉnh sửa hồ sơ nhân sự (kèm Import Hàng Loạt Excel/CSV bên trong) */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        onImportSuccess={() => {
          fetchEmployees();
          fetchStats();
          fetchHeadcountData();
          toast?.success?.('Import nhân sự hoàn tất! Đã cập nhật danh sách.');
        }}
        initialData={editingEmployee}
        roles={roles}
        branches={branches}
        canManageSystem={canManageSystem}
        isBusinessOwner={isBusinessOwner}
        isStoreManager={isStoreManager}
        currentStoreBranchId={currentBranchId}
        currentStoreBranchName={currentBranchName}
        onBranchTierUpgraded={async () => {
          const updatedBranches = await employeeService.getBranches();
          if (updatedBranches && updatedBranches.length > 0) {
            setBranches(updatedBranches);
          }
          await fetchHeadcountData();
        }}
        onToggleStatus={(emp) => handleOpenToggleModal(emp)}
        onResetPassword={(emp) => handleOpenResetModal(emp)}
        onDeleteSuccess={() => {
          fetchEmployees();
          fetchStats();
          fetchHeadcountData();
        }}
      />

      {/* Modal: Xem chi tiết hồ sơ (Chỉ xem chi tiết, không còn nút chỉnh sửa hay reset mật khẩu) */}
      <EmployeeDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        employee={selectedEmployee}
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

      {/* Modal: Xác nhận xóa vĩnh viễn tài khoản (Trực tiếp từ bảng danh sách) */}
      <Modal
        open={deleteModalOpen}
        onClose={() => !isDeletingDirect && setDeleteModalOpen(false)}
        title="Xác Nhận Xóa Vĩnh Viễn Tài Khoản"
        sub={`Hành động này sẽ xóa hoàn toàn tài khoản #${deletingEmployee?.id} khỏi hệ thống và CSDL.`}
        width={480}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeletingDirect}>
              Hủy Bỏ
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDirectDelete}
              disabled={isDeletingDirect}
              style={{ background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="trash" size={14} color="#fff" />
              <span>{isDeletingDirect ? 'Đang Xóa...' : 'Xác Nhận Xóa'}</span>
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: c.fg }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <Icon name="alert-triangle" size={18} color="#ef4444" />
            <div>
              <strong>Cảnh Báo Quan Trọng:</strong> Bạn đang chuẩn bị xóa hoàn toàn nhân sự{' '}
              <strong style={{ color: '#fff' }}>{deletingEmployee?.fullName}</strong> (Mã NV:{' '}
              <span style={{ color: '#f2ca50', fontWeight: 600 }}>{deletingEmployee?.employeeCode || `NV-${deletingEmployee?.id}`}</span>).
              <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#fca5a5' }}>
                Hệ thống sẽ xóa triệt để hồ sơ người dùng này khỏi cơ sở dữ liệu. Thao tác này không thể hoàn tác.
              </div>
            </div>
          </div>

          <div>Bạn có chắc chắn muốn tiếp tục thực hiện xóa vĩnh viễn tài khoản này không?</div>
        </div>
      </Modal>


    </DashboardShell>
  );
}
