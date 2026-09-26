import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/toast/ToastProvider';
import scheduleService from '../services/schedule.service';

/**
 * Tiện ích lấy ngày Thứ 2 đầu tuần của một ngày bất kỳ (định dạng YYYY-MM-DD).
 */
export const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0: Sun, 1: Mon, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
};

/**
 * Tiện ích cộng/trừ tuần.
 */
export const addWeeks = (dateStr, numWeeks) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2] + numWeeks * 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
};

/**
 * Tiện ích định dạng ngày hiển thị tiếng Việt (dd/MM).
 */
export const formatVNDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
};


export const DAY_NAMES_VN = [
  'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'
];

/**
 * Tiện ích chuẩn hóa tên ca làm việc, xử lý triệt để lỗi font chữ hoặc dấu hỏi chấm Unicode.
 */
export const formatShiftTemplateName = (name) => {
  if (!name || typeof name !== 'string') return name || '';
  let clean = name;
  clean = clean.replace(/Chi\?u/gi, 'Chiều');
  clean = clean.replace(/T\?i/gi, 'Tối');
  clean = clean.replace(/\?êm/gi, 'Đêm');
  clean = clean.replace(/S\?ng/gi, 'Sáng');
  if (/^ca\s*1\b/i.test(clean) && clean.includes('?')) {
    clean = clean.replace(/Ca\s*1\s*-\s*.*?(?=\(|$)/i, 'Ca 1 - Sáng ');
  }
  if (/^ca\s*2\b/i.test(clean) && clean.includes('?')) {
    clean = clean.replace(/Ca\s*2\s*-\s*.*?(?=\(|$)/i, 'Ca 2 - Chiều ');
  }
  if (/^ca\s*3\b/i.test(clean) && clean.includes('?')) {
    clean = clean.replace(/Ca\s*3\s*-\s*.*?(?=\(|$)/i, 'Ca 3 - Tối ');
  }
  if (/^ca\s*4\b/i.test(clean) && clean.includes('?')) {
    clean = clean.replace(/Ca\s*4\s*-\s*.*?(?=\(|$)/i, 'Ca 4 - Đêm ');
  }
  return clean.trim();
};


/**
 * Hook quản lý toàn bộ nghiệp vụ Lịch Ca Tuần (UC 2.1 & UC 2.3).
 */
export function useWeeklySchedule(initialBranchId = null) {
  const toast = useToast();
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const [branchId, setBranchId] = useState(
    initialBranchId || storedUser?.storeId || storedUser?.homeBranchId || storedUser?.branchId || null
  );
  const [weekStartDate, setWeekStartDate] = useState(getMondayOfWeek());

  // Phân quyền cơ sở (Branch Isolation)
  const [accessibleBranches, setAccessibleBranches] = useState([]);
  const [isGlobalManager, setIsGlobalManager] = useState(false);
  const [assignedBranch, setAssignedBranch] = useState(null);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(null);

  // Dữ liệu từ API
  const [templates, setTemplates] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Bộ lọc tìm kiếm nhân viên
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [employmentFilter, setEmploymentFilter] = useState('ALL');

  // Modals state
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [selectedScheduleForQuota, setSelectedScheduleForQuota] = useState(null);

  const [isFullTimeModalOpen, setIsFullTimeModalOpen] = useState(false);

  const [isAssignCellModalOpen, setIsAssignCellModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [conflictReport, setConflictReport] = useState(null);

  const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);

  /**
   * Tải danh sách cơ sở tài khoản được phép quản lý lập lịch (Branch Isolation).
   */
  const loadAccessibleBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await scheduleService.getAccessibleBranches();
      if (res.success && res.data) {
        setIsGlobalManager(Boolean(res.data.isGlobalManager));
        const branchList = res.data.branches || [];
        setAccessibleBranches(branchList);

        if (!res.data.isGlobalManager) {
          // Store Manager / Shift Leader: khóa cứng vào chi nhánh phụ trách
          if (res.data.assignedBranchId) {
            setBranchId(res.data.assignedBranchId);
            setAssignedBranch({
              id: res.data.assignedBranchId,
              name: res.data.assignedBranchName,
              code: res.data.assignedBranchCode,
            });
            setPermissionError(null);
          } else {
            setPermissionError('Tài khoản quản lý của bạn chưa được phân công cơ sở chi nhánh cụ thể. Vui lòng liên hệ Quản trị viên để được gán chi nhánh.');
          }
        } else {
          // Global Manager (Operations Admin / Business Owner): chọn chi nhánh đầu tiên nếu chưa có
          if (branchList.length > 0) {
            setBranchId((prev) => {
              const exists = branchList.some((b) => b.id === prev);
              return exists ? prev : branchList[0].id;
            });
          }
          setPermissionError(null);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách cơ sở có quyền truy cập:', err);
      if (err.response?.status === 403) {
        setPermissionError(err.response?.data?.message || 'Bạn không có quyền truy cập lập lịch.');
      }
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  /**
   * Tải danh sách ca chuẩn.
   */
  const loadTemplates = useCallback(async () => {
    try {
      const res = await scheduleService.getShiftTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải mẫu ca:', err);
    }
  }, []);

  /**
   * Tải dữ liệu ma trận lịch tuần.
   */
  const fetchWeeklyMatrix = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await scheduleService.getWeeklyScheduleMatrix(branchId, weekStartDate);
      if (res.success && res.data) {
        setMatrix(res.data);
        setPermissionError(null);
      } else {
        setMatrix(null);
      }
    } catch (err) {
      console.error('Lỗi khi tải ma trận lịch tuần:', err);
      if (err.response?.status === 403) {
        const msg = err.response.data?.message || 'Bạn không có quyền quản lý lịch ca của cơ sở này.';
        setPermissionError(msg);
        toast.error(msg);
      }
      setMatrix(null);
    } finally {
      setLoading(false);
    }
  }, [branchId, weekStartDate, toast]);

  useEffect(() => {
    loadAccessibleBranches();
    loadTemplates();
  }, [loadAccessibleBranches, loadTemplates]);

  useEffect(() => {
    if (branchId) {
      fetchWeeklyMatrix();
    }
  }, [branchId, fetchWeeklyMatrix]);


  // Điều hướng tuần
  const goToPreviousWeek = () => setWeekStartDate((prev) => addWeeks(prev, -1));
  const goToNextWeek = () => setWeekStartDate((prev) => addWeeks(prev, 1));
  const goToCurrentWeek = () => setWeekStartDate(getMondayOfWeek());

  /**
   * UC 2.1: Khởi tạo khung mẫu lịch 7 ngày trong tuần với định mức mặc định.
   */
  const handleGenerateWeekly = async ({
    templateIds,
    defaultRequiredCashier = 1,
    defaultRequiredSales = 2,
    defaultRequiredSecurity = 1,
  }) => {
    setActionLoading(true);
    try {
      const res = await scheduleService.generateWeeklySchedule({
        branchId: Number(branchId),
        weekStartDate,
        templateIds,
        defaultRequiredCashier: Number(defaultRequiredCashier),
        defaultRequiredSales: Number(defaultRequiredSales),
        defaultRequiredSecurity: Number(defaultRequiredSecurity),
      });

      if (res.success) {
        toast.success('Khởi tạo khung mẫu tuần & định mức thành công!');
        await fetchWeeklyMatrix();
        setIsQuotaModalOpen(false);
      } else {
        toast.error(res.message || 'Khởi tạo khung ca thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo khung ca.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * UC 2.1: Cập nhật định mức nhân sự cho 1 ca trực cụ thể.
   */
  const handleUpdateRequirement = async ({ scheduleId, requiredCashier, requiredSales, requiredSecurity }) => {
    setActionLoading(true);
    try {
      const res = await scheduleService.updateScheduleRequirement(scheduleId, {
        scheduleId,
        requiredCashier: Number(requiredCashier),
        requiredSales: Number(requiredSales),
        requiredSecurity: Number(requiredSecurity),
      });

      if (res.success) {
        toast.success('Cập nhật định mức ca thành công!');
        await fetchWeeklyMatrix();
        setSelectedScheduleForQuota(null);
        setIsQuotaModalOpen(false);
      } else {
        toast.error(res.message || 'Cập nhật định mức thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật định mức.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * UC 2.1: Phân bổ nhanh nhân sự Full-time vào ca trực tuần.
   */
  const handleAssignFullTimeBatch = async ({ userIds, shiftTemplateId, daysOfWeek }) => {
    setActionLoading(true);
    try {
      const res = await scheduleService.assignFullTimeBatch({
        branchId: Number(branchId),
        weekStartDate,
        userIds: userIds.map(Number),
        shiftTemplateId: Number(shiftTemplateId),
        daysOfWeek: daysOfWeek.map(Number),
      });

      if (res.success) {
        toast.success(res.message || 'Phân bổ nhân sự Full-time thành công!');
        await fetchWeeklyMatrix();
        setIsFullTimeModalOpen(false);
      } else {
        toast.error(res.message || 'Phân bổ thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi phân bổ nhân sự.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Gán 1 ca lẻ cho nhân viên trên ô ma trận.
   */
  const handleAssignSingle = async (employeeId, shiftId, workDate) => {
    setActionLoading(true);
    try {
      const res = await scheduleService.assignSingleShift({
        storeId: Number(branchId),
        employeeId: Number(employeeId),
        shiftId: Number(shiftId),
        workDate,
      });

      if (res.success) {
        toast.success('Gán ca làm việc thành công!');
        await fetchWeeklyMatrix();
        setIsAssignCellModalOpen(false);
        setSelectedCellData(null);
      } else {
        toast.error(res.message || 'Gán ca thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gán ca làm việc.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Hủy / Xóa 1 phân công ca.
   */
  const handleDeleteAssignment = async (assignmentId) => {
    setActionLoading(true);
    try {
      const res = await scheduleService.deleteShiftAssignment(assignmentId);
      if (res.success) {
        toast.success('Đã hủy phân công ca làm việc.');
        await fetchWeeklyMatrix();
        setIsAssignCellModalOpen(false);
        setSelectedCellData(null);
      } else {
        toast.error(res.message || 'Hủy ca thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa phân công ca.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * UC 2.3: Mở modal rà soát xung đột trước khi công bố lịch.
   */
  const handleOpenPublishModal = async () => {
    setActionLoading(true);
    try {
      const res = await scheduleService.checkWeeklyConflicts(branchId, weekStartDate);
      if (res.success && res.data) {
        setConflictReport(res.data);
        setIsPublishModalOpen(true);
      } else {
        toast.error(res.message || 'Không thể kiểm tra xung đột lịch tuần.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi kiểm tra xung đột.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * UC 2.3: Xác nhận công bố phát hành lịch tuần tới nhân viên.
   */
  const handleConfirmPublish = async () => {
    setActionLoading(true);
    try {
      const res = await scheduleService.publishWeeklySchedule({
        branchId: Number(branchId),
        weekStartDate,
      });

      if (res.success) {
        toast.success(res.message || 'Đã công bố phát hành lịch tuần thành công!');
        await fetchWeeklyMatrix();
        setIsPublishModalOpen(false);
      } else {
        toast.error(res.message || 'Công bố lịch thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi công bố lịch tuần.');
    } finally {
      setActionLoading(false);
    }
  };

  // Tính toán danh sách nhân sự đã lọc
  const filteredEmployees = useMemo(() => {
    if (!matrix || !matrix.employeeRosters) return [];
    return matrix.employeeRosters.filter((emp) => {
      const matchSearch =
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        roleFilter === 'ALL' ||
        emp.roleCode === roleFilter ||
        emp.roleName === roleFilter ||
        (roleFilter === 'SALES' && (emp.roleCode === 'SALES_STAFF' || emp.roleCode === 'SALES')) ||
        (roleFilter === 'SECURITY' && (emp.roleCode === 'SECURITY_GUARD' || emp.roleCode === 'SECURITY')) ||
        (roleFilter === 'SHIFT_LEADER' && (emp.roleCode === 'SHIFT_LEADER' || emp.roleCode === 'LEADER'));

      return matchSearch && matchRole;
    });
  }, [matrix, searchTerm, roleFilter]);

  // Thống kê tổng quan tuần
  const weeklyStats = useMemo(() => {
    if (!matrix || !matrix.schedules) {
      return { totalSchedules: 0, totalAssignments: 0, understaffedCount: 0, status: 'DRAFT' };
    }

    let totalAssignments = 0;
    let understaffedCount = 0;

    matrix.schedules.forEach((s) => {
      totalAssignments += ((s.assignedLeaderCount || 0) + s.assignedCashierCount + s.assignedSalesCount + s.assignedSecurityCount);
      if (
        (s.assignedLeaderCount || 0) < (s.requiredLeader || 1) ||
        s.assignedCashierCount < s.requiredCashier ||
        s.assignedSalesCount < s.requiredSales ||
        s.assignedSecurityCount < s.requiredSecurity
      ) {
        understaffedCount++;
      }
    });

    return {
      totalSchedules: matrix.schedules.length,
      totalAssignments,
      understaffedCount,
      status: matrix.weekStatus || 'DRAFT',
    };
  }, [matrix]);

  /**
   * UC 2.1: Tự động xếp ca tuần bằng Google OR-Tools CP-SAT Solver.
   */
  const handleAutoScheduleWeekly = async ({
    maxShiftsPerWeek = 6,
    minShiftsPerWeek = 5,
    overwriteExisting = true,
  }) => {
    setActionLoading(true);
    try {
      const res = await scheduleService.autoScheduleWeekly({
        branchId: Number(branchId),
        weekStartDate,
        maxShiftsPerWeekPerEmployee: Number(maxShiftsPerWeek),
        minShiftsPerWeekForFullTime: Number(minShiftsPerWeek),
        overwriteExisting: Boolean(overwriteExisting),
      });

      if (res.success) {
        toast.success(res.message || 'Tự động xếp lịch ca tuần thành công với Google OR-Tools!');
        await fetchWeeklyMatrix();
        setIsAutoScheduleModalOpen(false);
      } else {
        toast.error(res.message || 'Không tìm được phương án xếp ca tối ưu.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi chạy thuật toán tự động xếp ca.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    branchId,
    setBranchId,
    accessibleBranches,
    isGlobalManager,
    assignedBranch,
    branchesLoading,
    permissionError,
    weekStartDate,
    setWeekStartDate,

    templates,
    matrix,
    loading,
    actionLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    employmentFilter,
    setEmploymentFilter,
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
    // Modal states
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
  };
}

