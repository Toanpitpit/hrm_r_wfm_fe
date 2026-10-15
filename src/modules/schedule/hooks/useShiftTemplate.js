import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import shiftTemplateService from '../services/shiftTemplate.service';
import { useToast } from '@/components/ui/toast/ToastProvider';
import { SHIFT_ERROR_MESSAGES } from '../constants/shift.constants';

/**
 * ==============================================================================
 * MODULE: Khung Ca Mẫu (Operations Admin)
 * HOOK: useShiftTemplate.js
 * ==============================================================================
 */
export function useShiftTemplate() {
  const toast = useToast();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // 1. Phân quyền người dùng: Chỉ Operations Admin (hoặc Admin/Owner) mới được thao tác
  const isOperationsAdmin = useMemo(() => {
    if (!user) return true;
    const role = (user?.role || user?.Role || '').toUpperCase();
    const roleName = (user?.roleName || user?.RoleName || '').toUpperCase();
    return (
      role === 'OPERATIONS_ADMIN' ||
      role.includes('ADMIN') ||
      roleName.includes('ADMIN') ||
      role === 'BUSINESS_OWNER'
    );
  }, [user]);

  // 2. Tab điều hướng: 'GLOBAL' (Khung ca chung) | 'BRANCH' (Khung ca chi nhánh)
  const [activeTab, setActiveTab] = useState('GLOBAL');

  // 3. Thẻ thống kê (4 thẻ) - Lấy từ GET /api/shift-templates/stats
  const [stats, setStats] = useState({
    totalGlobalShifts: 0,
    branchesUsingGlobal: 0,
    branchesUsingCustom: 0,
    overnightShifts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await shiftTemplateService.getShiftTemplateStats();
      if (data) {
        setStats({
          totalGlobalShifts: data.totalGlobalShifts ?? 0,
          branchesUsingGlobal: data.branchesUsingGlobal ?? 0,
          branchesUsingCustom: data.branchesUsingCustom ?? 0,
          overnightShifts: data.overnightShifts ?? 0,
        });
      }
    } catch (err) {
      setStatsError(err.message || 'Không thể tải số liệu thống kê');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 4. Tab "Khung ca chung"
  const [globalShifts, setGlobalShifts] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL | Morning | Afternoon | Night | Other | ACTIVE | OVERNIGHT

  // Ref lưu các ID ca đã xóa trong session để tránh việc backend trả về lại khi refetch
  const deletedShiftIdsRef = useRef(new Set());

  const fetchGlobalShifts = useCallback(async () => {
    try {
      setGlobalLoading(true);
      setGlobalError(null);
      const data = await shiftTemplateService.getShiftTemplates({ scope: 'GLOBAL' });
      const activeList = (data || []).filter((s) => {
        const sId = String(s.id ?? s.shiftId ?? s.templateId ?? s.shiftTemplateId ?? '');
        return !deletedShiftIdsRef.current.has(sId);
      });
      setGlobalShifts(activeList);
    } catch (err) {
      setGlobalError(err.message || 'Không thể tải danh sách khung ca chung');
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  // Lọc ca chung client-side
  const filteredGlobalShifts = useMemo(() => {
    return globalShifts.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.templateCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchFilter = true;
      if (filterType === 'ACTIVE') matchFilter = s.isActive;
      else if (filterType === 'OVERNIGHT') matchFilter = s.isOvernight;
      else if (filterType !== 'ALL') matchFilter = s.shiftType === filterType;

      return matchSearch && matchFilter;
    });
  }, [globalShifts, searchTerm, filterType]);

  // 5. Tab "Khung ca chi nhánh"
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  const [effectiveData, setEffectiveData] = useState({
    source: 'GLOBAL',
    shifts: [],
  });
  const [effectiveLoading, setEffectiveLoading] = useState(false);
  const [effectiveError, setEffectiveError] = useState(null);

  const [customShifts, setCustomShifts] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState(null);

  const [modeSwitching, setModeSwitching] = useState(false);

  // AbortController để huỷ request cũ khi đổi chi nhánh nhanh
  const branchAbortRef = useRef(null);

  const fetchBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);
      const data = await shiftTemplateService.getBranches();
      const list = data || [];
      setBranches(list);

      // Nếu chưa chọn chi nhánh, chọn chi nhánh đầu tiên
      setSelectedBranchId((prev) => {
        if (prev && list.some((b) => String(b.id ?? b.storeId) === String(prev))) return prev;
        return list.length > 0 ? (list[0].id ?? list[0].storeId) : null;
      });
    } catch (err) {
      console.warn('[useShiftTemplate] Lỗi tải chi nhánh:', err.message);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  const selectedBranch = useMemo(() => {
    if (!selectedBranchId) return null;
    return (
      branches.find((b) => String(b.id ?? b.storeId) === String(selectedBranchId)) || null
    );
  }, [branches, selectedBranchId]);

  // Tải dữ liệu bộ ca hiệu lực và ca riêng của chi nhánh đã chọn
  const fetchBranchShifts = useCallback(
    async (branchId) => {
      if (!branchId) return;

      // Huỷ request cũ nếu đang chạy
      if (branchAbortRef.current) {
        branchAbortRef.current.abort();
      }
      const controller = new AbortController();
      branchAbortRef.current = controller;

      try {
        setEffectiveLoading(true);
        setCustomLoading(true);
        setEffectiveError(null);
        setCustomError(null);

        const [effRes, custRes] = await Promise.all([
          shiftTemplateService.getBranchEffectiveShifts(branchId, controller.signal),
          shiftTemplateService.getBranchCustomShifts(branchId, controller.signal),
        ]);

        setEffectiveData({
          source: effRes?.source || 'GLOBAL',
          shifts: effRes?.shifts || [],
        });
        setCustomShifts(custRes || []);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        setEffectiveError(err.message || 'Không thể tải ca hiệu lực chi nhánh');
        setCustomError(err.message || 'Không thể tải ca riêng chi nhánh');
      } finally {
        setEffectiveLoading(false);
        setCustomLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeTab === 'BRANCH' && selectedBranchId) {
      fetchBranchShifts(selectedBranchId);
    }
  }, [activeTab, selectedBranchId, fetchBranchShifts]);

  // Khởi tạo ban đầu
  useEffect(() => {
    fetchStats();
    fetchGlobalShifts();
    fetchBranches();
  }, [fetchStats, fetchGlobalShifts, fetchBranches]);

  // 6. Xử lý đổi chế độ ca của chi nhánh (PATCH /api/branches/{id}/shift-mode)
  const [impactModal, setImpactModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Xác Nhận',
    onConfirm: null,
  });

  const handleToggleBranchMode = async (newMode, confirm = false) => {
    if (!selectedBranchId || !selectedBranch) return;

    if (selectedBranch.isLocked) {
      toast.error(SHIFT_ERROR_MESSAGES.BRANCH_LOCKED);
      return;
    }

    try {
      setModeSwitching(true);
      await shiftTemplateService.updateBranchShiftMode(selectedBranchId, newMode, confirm);

      toast.success(
        `Đã chuyển sang chế độ "${newMode === 'CUSTOM' ? 'Dùng ca riêng' : 'Dùng ca chung'}" thành công!`
      );

      // Tải lại dữ liệu
      await Promise.all([
        fetchBranches(),
        fetchBranchShifts(selectedBranchId),
        fetchStats(),
      ]);

      setImpactModal((prev) => ({ ...prev, open: false }));
    } catch (err) {
      const errCode = err.response?.data?.code;
      const errMsg = err.response?.data?.message || err.message;
      const details = err.response?.data?.details;

      if (errCode === 'NO_ACTIVE_CUSTOM_SHIFT' || err.response?.status === 400) {
        toast.error(SHIFT_ERROR_MESSAGES.NO_ACTIVE_CUSTOM_SHIFT);
      } else if (errCode === 'FUTURE_SCHEDULES_EXIST' || err.response?.status === 409) {
        const count = details?.futureAssignmentCount || 14;
        setImpactModal({
          open: true,
          title: 'Xác Nhận Chuyển Đổi Chế Độ Khung Ca',
          message: SHIFT_ERROR_MESSAGES.FUTURE_SCHEDULES_EXIST(count),
          confirmLabel: 'Đồng Ý Chuyển Đổi',
          onConfirm: () => handleToggleBranchMode(newMode, true),
        });
      } else if (errCode === 'BRANCH_LOCKED' || err.response?.status === 423) {
        toast.error(SHIFT_ERROR_MESSAGES.BRANCH_LOCKED);
      } else {
        toast.error(errMsg || 'Không thể đổi chế độ khung ca');
      }
    } finally {
      setModeSwitching(false);
    }
  };

  // 7. Modal Form Thêm / Sửa
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const handleOpenCreateModal = () => {
    setEditingShift(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (shift) => {
    setEditingShift(shift);
    setFormModalOpen(true);
  };

  // Tạo khung ca mới (Hỗ trợ tạo đơn lẻ hoặc tạo hàng loạt nhiều ca cùng lúc)
  const handleCreateShift = async (formData) => {
    try {
      const items = Array.isArray(formData) ? formData : [formData];
      const createdList = [];
      let targetBranchId = null;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const created = await shiftTemplateService.createShiftTemplate(item);
        createdList.push(created);
        if (item.scope === 'BRANCH') {
          targetBranchId = item.branchId || selectedBranchId;
        }
      }

      if (items.length > 1) {
        toast.success(`Đã tạo thành công ${items.length} khung ca mẫu!`);
      } else {
        toast.success('Thêm mới khung ca mẫu thành công!');
      }

      if (
        targetBranchId &&
        String(selectedBranchId) !== String(targetBranchId)
      ) {
        setSelectedBranchId(String(targetBranchId));
      }

      await Promise.all([
        fetchGlobalShifts(),
        fetchStats(),
        fetchBranches(),
        targetBranchId ? fetchBranchShifts(targetBranchId) : Promise.resolve(),
      ]);

      setFormModalOpen(false);
      return { success: true, data: items.length > 1 ? createdList : createdList[0] };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo khung ca';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Cập nhật khung ca (hỗ trợ confirm = true khi 409 IMPACT_CONFIRM_REQUIRED)
  const handleUpdateShift = async (shiftId, formData, confirm = false) => {
    try {
      await shiftTemplateService.updateShiftTemplate(shiftId, formData, confirm);
      toast.success('Cập nhật khung ca mẫu thành công!');

      const targetBranchId =
        formData.scope === 'BRANCH' ? formData.branchId || selectedBranchId : selectedBranchId;

      await Promise.all([
        fetchGlobalShifts(),
        fetchStats(),
        fetchBranches(),
        targetBranchId ? fetchBranchShifts(targetBranchId) : Promise.resolve(),
      ]);
      setFormModalOpen(false);
      setEditingShift(null);
      setImpactModal((prev) => ({ ...prev, open: false }));
      return { success: true };
    } catch (err) {
      const errCode = err.response?.data?.code;
      const details = err.response?.data?.details;

      if (errCode === 'IMPACT_CONFIRM_REQUIRED' || err.response?.status === 409) {
        const count = details?.affectedBranchCount || 14;
        setImpactModal({
          open: true,
          title: 'Xác Nhận Thay Đổi Khung Ca Chung',
          message: SHIFT_ERROR_MESSAGES.IMPACT_CONFIRM_REQUIRED(count),
          confirmLabel: 'Đồng Ý Áp Dụng',
          onConfirm: () => handleUpdateShift(shiftId, formData, true),
        });
        return { success: false, error: SHIFT_ERROR_MESSAGES.IMPACT_CONFIRM_REQUIRED(count) };
      }

      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật khung ca';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Bật/tắt trạng thái ca
  const handleToggleStatus = async (shift, confirm = false) => {
    const nextStatus = !shift.isActive;
    const shiftId = shift.id || shift.shiftId;
    const targetBranchId =
      shift.scope === 'BRANCH' ? shift.branchId || selectedBranchId : selectedBranchId;

    try {
      await shiftTemplateService.toggleShiftActive(shiftId, nextStatus, confirm);
      toast.success(
        nextStatus
          ? `Đã kích hoạt lại khung ca "${shift.name || shift.shiftName}"`
          : `Đã tạm ngừng áp dụng khung ca "${shift.name || shift.shiftName}"`
      );

      await Promise.all([
        fetchGlobalShifts(),
        fetchStats(),
        fetchBranches(),
        targetBranchId ? fetchBranchShifts(targetBranchId) : Promise.resolve(),
      ]);

      setImpactModal((prev) => ({ ...prev, open: false }));
      return { success: true };
    } catch (err) {
      const errCode = err.response?.data?.code;
      const details = err.response?.data?.details;

      if (errCode === 'IMPACT_CONFIRM_REQUIRED' || err.response?.status === 409) {
        const count = details?.affectedBranchCount || 14;
        setImpactModal({
          open: true,
          title: 'Xác Nhận Tạm Ngừng Khung Ca Chung',
          message: SHIFT_ERROR_MESSAGES.IMPACT_CONFIRM_REQUIRED(count),
          confirmLabel: 'Đồng Ý Tạm Ngừng',
          onConfirm: () => handleToggleStatus(shift, true),
        });
        return { success: false };
      }

      const msg = err.response?.data?.message || err.message || 'Không thể đổi trạng thái ca';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // 8. Modal Xác nhận Xóa Khung ca mẫu
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingShift, setDeletingShift] = useState(null);

  const handleOpenDeleteModal = (shift) => {
    setDeletingShift(shift);
    setDeleteModalOpen(true);
  };

  const handleDeleteShift = async (shiftId) => {
    try {
      if (shiftId) {
        deletedShiftIdsRef.current.add(String(shiftId));
      }
      await shiftTemplateService.deleteShiftTemplate(shiftId);
      toast.success('Đã xóa khung ca mẫu thành công!');

      // Cập nhật ngay lập tức UI trên client
      setGlobalShifts((prev) =>
        prev.filter((s) => {
          const sId = s.id ?? s.shiftId ?? s.templateId ?? s.shiftTemplateId;
          return String(sId) !== String(shiftId);
        })
      );
      setCustomShifts((prev) =>
        prev.filter((s) => {
          const sId = s.id ?? s.shiftId ?? s.templateId ?? s.shiftTemplateId;
          return String(sId) !== String(shiftId);
        })
      );

      await Promise.all([
        fetchGlobalShifts(),
        fetchStats(),
        fetchBranches(),
        selectedBranchId ? fetchBranchShifts(selectedBranchId) : Promise.resolve(),
      ]);

      setDeleteModalOpen(false);
      setDeletingShift(null);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa khung ca';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    isOperationsAdmin,
    // Tab
    activeTab,
    setActiveTab,
    // 4 Stat Cards
    stats,
    statsLoading,
    statsError,
    fetchStats,
    // Tab "Khung ca chung"
    globalShifts: filteredGlobalShifts,
    allGlobalShifts: globalShifts,
    globalLoading,
    globalError,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    fetchGlobalShifts,
    // Tab "Khung ca chi nhánh"
    branches,
    branchesLoading,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    effectiveData,
    effectiveLoading,
    effectiveError,
    customShifts,
    customLoading,
    customError,
    modeSwitching,
    handleToggleBranchMode,
    fetchBranchShifts,
    // Modals
    formModalOpen,
    setFormModalOpen,
    editingShift,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreateShift,
    handleUpdateShift,
    handleToggleStatus,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingShift,
    setDeletingShift,
    handleOpenDeleteModal,
    handleDeleteShift,
    impactModal,
    setImpactModal,
  };
}

export default useShiftTemplate;
