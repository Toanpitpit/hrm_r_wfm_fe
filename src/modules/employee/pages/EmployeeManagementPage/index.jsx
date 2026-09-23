import React, { useState, useEffect, useCallback } from 'react';
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
import UploadHeadcountModal from '@/modules/employee/components/UploadHeadcountModal/UploadHeadcountModal';
import ReviewHeadcountModal from '@/modules/employee/components/ReviewHeadcountModal/ReviewHeadcountModal';
import HeadcountRequestList from '@/modules/employee/components/HeadcountRequestList/HeadcountRequestList';
import BulkImportEmployeeModal from '@/modules/employee/components/BulkImportEmployeeModal/BulkImportEmployeeModal';

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
  const [activeTab, setActiveTab] = useState('EMPLOYEES'); // 'EMPLOYEES' | 'HEADCOUNT_REQUESTS'
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState(STORE_ROLES);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(isStoreManager ? String(currentBranchId) : '');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');

  // Định biên & Đơn đề xuất
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [allBranchesQuota, setAllBranchesQuota] = useState([]);
  const [headcountRequests, setHeadcountRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmployee, setResetEmployee] = useState(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggleEmployee, setToggleEmployee] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewRequest, setSelectedReviewRequest] = useState(null);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);

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

  // 4. Tải danh sách nhân sự (GET /api/Users/employees)
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
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

      const res = await employeeService.getEmployees(params);
      if (res.success && res.data) {
        setEmployees(res.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân sự:', err);
      toast.error('Không thể tải danh sách nhân sự.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, branchFilter, statusFilter, contractTypeFilter, isStoreManager, currentBranchId, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // 5. Tải dữ liệu Quota Định biên & Danh sách Đơn đề xuất (toàn bộ 3 chi nhánh cho Admin)
  const fetchHeadcountData = useCallback(async () => {
    const targetBranchId = isStoreManager
      ? currentBranchId
      : branchFilter || branches[0]?.id || branches[0]?.storeId || 1;

    const currentBranch = branches.find((b) => String(b.id || b.storeId) === String(targetBranchId));
    const tier = currentBranch?.branchTier || currentBranch?.tier || (Number(targetBranchId) === 1 ? 1 : 2);

    setLoadingRequests(true);
    try {
      const promises = [
        headcountService.getBranchHeadcountStatus(targetBranchId, tier),
        headcountService.getRequests(isStoreManager ? { branchId: currentBranchId } : (branchFilter ? { branchId: branchFilter } : {})),
      ];

      if (!isStoreManager) {
        promises.push(headcountService.getAllBranchesHeadcountStatus(branches));
      }

      const [quotaRes, reqsRes, allBranchesRes] = await Promise.all(promises);

      if (quotaRes.success) {
        setQuotaStatus(quotaRes.data);
      }
      if (reqsRes.success) {
        setHeadcountRequests(reqsRes.data);
      }
      if (allBranchesRes?.success) {
        setAllBranchesQuota(allBranchesRes.data);
      }
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu định biên:', err);
    } finally {
      setLoadingRequests(false);
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
        fetchEmployees();
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
          fetchHeadcountData();
        } else {
          toast.error(res.message || 'Khai báo thất bại.');
        }
      } else {
        const res = await employeeService.createEmployee(formData);
        if (res.success) {
          toast.success(res.message || 'Khai báo thành công! Welcome Email đã được gửi.');
          fetchEmployees();
          fetchHeadcountData();
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
      fetchEmployees();
      // Quota tự động cập nhật ngay lập tức vì trạng thái INACTIVE làm dôi dư vị trí (Attrition Compensation)
      fetchHeadcountData();
    } else {
      toast.error(res.message || 'Cập nhật trạng thái thất bại.');
    }
  };

  // 7. Thao tác Đề xuất Mở rộng Định biên
  const handleUploadHeadcount = async (payload) => {
    const res = await headcountService.uploadRequest(payload);
    if (res.success) {
      toast.success(res.message || 'Gửi đề xuất mở rộng định biên thành công!');
      fetchHeadcountData();
    } else {
      toast.error(res.message || 'Gửi đề xuất thất bại.');
    }
  };

  const handleOpenReviewModal = (req) => {
    setSelectedReviewRequest(req);
    setReviewModalOpen(true);
  };

  const handleReviewHeadcount = async (id, reviewData) => {
    const res = await headcountService.reviewRequest(id, reviewData);
    if (res.success) {
      toast.success(res.message || 'Đã xử lý thẩm định đơn thành công!');
      fetchHeadcountData();
    } else {
      toast.error(res.message || 'Xử lý thẩm định thất bại.');
    }
  };

  const handleCloseHeadcount = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đề xuất này?')) return;
    const res = await headcountService.closeRequest(id);
    if (res.success) {
      toast.success(res.message || 'Đã hủy đơn đề xuất.');
      fetchHeadcountData();
    } else {
      toast.error(res.message || 'Hủy đơn thất bại.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    if (!isStoreManager) setBranchFilter('');
    setStatusFilter('');
    setContractTypeFilter('');
  };

  // 8. Tính toán các chỉ số thống kê (Stats)
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status !== 'INACTIVE').length;
  const inactiveCount = employees.filter((e) => e.status === 'INACTIVE').length;

  const roleStats = {
    shiftLeader: employees.filter((e) => e.roleCode === 'SHIFT_LEADER').length,
    cashier: employees.filter((e) => e.roleCode === 'CASHIER').length,
    sales: employees.filter((e) => e.roleCode === 'SALES_STAFF').length,
    security: employees.filter((e) => e.roleCode === 'SECURITY_GUARD' || e.roleCode === 'SECURITY').length,
    manager: employees.filter((e) => e.roleCode === 'STORE_MANAGER').length,
  };

  const pendingRequestsCount = headcountRequests.filter((r) => r.status === 'PENDING').length;

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
            ? 'Theo dõi danh sách nhân sự và tình trạng đề xuất định biên tại chi nhánh.'
            : 'Khai báo nhân sự mới, kiểm soát định biên chi nhánh (Tier 1/2/3) và thẩm định phê duyệt đề xuất mở rộng.'
        }
        actions={
          !isStoreManager && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Operations Admin & Owner: Quyền tạo nhân viên + Import Hàng Loạt */}
              <Button
                variant="ghost"
                onClick={() => setBulkImportModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                id="btn-bulk-import-employees"
                title="Import nhân sự hàng loạt từ file Excel/CSV"
              >
                <Icon name="table-import" size={16} />
                <span>Import Hàng Loạt</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
          title={isStoreManager ? 'Tổng Nhân Sự Chi Nhánh' : 'Tổng Nhân Sự Cửa Hàng'}
          value={totalEmployees}
          color="var(--color-primary, #0D9488)"
          subtitle={`${roleStats.cashier} Thu ngân • ${roleStats.sales} Bán hàng`}
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
          value={`${roleStats.manager + roleStats.shiftLeader + roleStats.security}`}
          color="#3b82f6"
          subtitle={`${roleStats.manager} Cửa hàng trưởng • ${roleStats.shiftLeader} Trưởng ca • ${roleStats.security} Bảo vệ`}
        />
      </div>

      {/* Widget Giám Sát Định Biên Chi Nhánh (Tier 1/2/3 Quota & Attrition Compensation) */}
      <HeadcountQuotaCard
        allBranchesQuota={allBranchesQuota}
        selectedBranchId={branchFilter}
        onSelectBranch={(bId) => setBranchFilter(bId ? String(bId) : '')}
        isStoreManager={isStoreManager}
      />

      {/* Navigation Tabs: Hồ Sơ Nhân Sự & Đề Xuất Định Biên */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: `1px solid ${c.border}`,
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('EMPLOYEES')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'EMPLOYEES' ? c.accent : 'transparent',
            color: activeTab === 'EMPLOYEES' ? '#000000' : c.fgMuted,
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name="users" size={15} />
          <span>Danh Sách Nhân Sự</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              background: activeTab === 'EMPLOYEES' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
            }}
          >
            {employees.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HEADCOUNT_REQUESTS')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'HEADCOUNT_REQUESTS' ? c.accent : 'transparent',
            color: activeTab === 'HEADCOUNT_REQUESTS' ? '#000000' : c.fgMuted,
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name="document" size={15} />
          <span>Đề Xuất Mở Rộng Định Biên</span>
          {pendingRequestsCount > 0 && (
            <span
              style={{
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '11px',
                background: '#ef4444',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {pendingRequestsCount} chờ
            </span>
          )}
        </button>
      </div>

      {/* Main Content Panel */}
      <Panel>
        {activeTab === 'EMPLOYEES' ? (
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
              onViewDetail={handleOpenDetailModal}
              onEdit={handleOpenEditModal}
              onResetPassword={handleOpenResetModal}
              onToggleStatus={handleOpenToggleModal}
              canManageSystem={canManageSystem}
            />
          </div>
        ) : (
          /* Bảng Danh Sách Đề Xuất Định Biên */
          <HeadcountRequestList
            requests={headcountRequests}
            loading={loadingRequests}
            canManageSystem={canManageSystem}
            isStoreManager={isStoreManager}
            onReviewRequest={handleOpenReviewModal}
            onCloseRequest={handleCloseHeadcount}
            onUploadNew={() => setUploadModalOpen(true)}
          />
        )}
      </Panel>

      {/* Modal: Khai báo / Chỉnh sửa hồ sơ nhân sự (Operations Admin & Owner only) */}
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

      {/* Modal: Upload Đề Xuất Mở Rộng Định Biên (Store Manager / Admin) */}
      <UploadHeadcountModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadHeadcount}
        branchId={currentBranchId}
        branchName={currentBranchName}
        isStoreManager={isStoreManager}
        branches={branches}
      />

      {/* Modal: Thẩm Định & Phê Duyệt Đề Xuất Định Biên (Operations Admin only) */}
      <ReviewHeadcountModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedReviewRequest(null);
        }}
        onSubmit={handleReviewHeadcount}
        request={selectedReviewRequest}
      />

      {/* Modal: Import Nhân Sự Hàng Loạt (Operations Admin & Admin only) */}
      {canManageSystem && (
        <BulkImportEmployeeModal
          isOpen={bulkImportModalOpen}
          onClose={() => setBulkImportModalOpen(false)}
          onSuccess={() => {
            fetchEmployees();
            toast?.success?.('Import nhân sự hoàn tất! Đã cập nhật danh sách.');
          }}
          branches={branches}
          availableImportRequests={headcountRequests.filter(
            (r) => r.status === 'APPROVED' && r.additionalQuantity > 0
          )}
          currentBranchId={isStoreManager ? currentBranchId : null}
        />
      )}
    </DashboardShell>
  );
}
