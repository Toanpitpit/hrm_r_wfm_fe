import { useState, useEffect, useCallback, useMemo } from 'react';
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
 * Hook quản lý toàn bộ nghiệp vụ Lịch Ca Tuần (UC 2.1 & UC 2.3).
 */
export function useWeeklySchedule(initialBranchId = 1) {
  const [branchId, setBranchId] = useState(initialBranchId);
  const [weekStartDate, setWeekStartDate] = useState(getMondayOfWeek());

  // Dữ liệu từ API
  const [templates, setTemplates] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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
    setLoading(true);
    try {
      const res = await scheduleService.getWeeklyScheduleMatrix(branchId, weekStartDate);
      if (res.success && res.data) {
        setMatrix(res.data);
      } else {
        setMatrix(null);
      }
    } catch (err) {
      console.error('Lỗi khi tải ma trận lịch tuần:', err);
      setMatrix(null);
    } finally {
      setLoading(false);
    }
  }, [branchId, weekStartDate]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    fetchWeeklyMatrix();
  }, [fetchWeeklyMatrix]);

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
        setToastMessage({ type: 'success', text: 'Khởi tạo khung mẫu tuần & định mức thành công!' });
        await fetchWeeklyMatrix();
        setIsQuotaModalOpen(false);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Khởi tạo khung ca thất bại.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi tạo khung ca.' });
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
        setToastMessage({ type: 'success', text: 'Cập nhật định mức ca thành công!' });
        await fetchWeeklyMatrix();
        setSelectedScheduleForQuota(null);
        setIsQuotaModalOpen(false);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Cập nhật định mức thất bại.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật định mức.' });
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
        setToastMessage({ type: 'success', text: res.message || 'Phân bổ nhân sự Full-time thành công!' });
        await fetchWeeklyMatrix();
        setIsFullTimeModalOpen(false);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Phân bổ thất bại.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi phân bổ nhân sự.' });
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
        setToastMessage({ type: 'success', text: 'Gán ca làm việc thành công!' });
        await fetchWeeklyMatrix();
        setIsAssignCellModalOpen(false);
        setSelectedCellData(null);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Gán ca thất bại.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi gán ca làm việc.' });
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
        setToastMessage({ type: 'success', text: 'Đã hủy phân công ca làm việc.' });
        await fetchWeeklyMatrix();
        setIsAssignCellModalOpen(false);
        setSelectedCellData(null);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Hủy ca thất bại.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi xóa phân công ca.' });
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
        setToastMessage({ type: 'error', text: res.message || 'Không thể kiểm tra xung đột lịch tuần.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi kiểm tra xung đột.' });
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
        setToastMessage({ type: 'success', text: res.message || 'Đã công bố phát hành lịch tuần thành công!' });
        await fetchWeeklyMatrix();
        setIsPublishModalOpen(false);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Công bố lịch thất bại.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi công bố lịch tuần.' });
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
        emp.roleName === roleFilter;

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
      totalAssignments += (s.assignedCashierCount + s.assignedSalesCount + s.assignedSecurityCount);
      if (
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
        setToastMessage({
          type: 'success',
          text: res.message || 'Tự động xếp lịch ca tuần thành công với Google OR-Tools!',
        });
        await fetchWeeklyMatrix();
        setIsAutoScheduleModalOpen(false);
      } else {
        setToastMessage({
          type: 'error',
          text: res.message || 'Không tìm được phương án xếp ca tối ưu.',
        });
      }
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi chạy thuật toán tự động xếp ca.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return {
    branchId,
    setBranchId,
    weekStartDate,
    setWeekStartDate,
    templates,
    matrix,
    loading,
    actionLoading,
    toastMessage,
    setToastMessage,
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

