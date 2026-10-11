import { useState, useEffect, useCallback, useMemo } from 'react';
import tierService, { TIER_DEFINITIONS } from '../services/tier.service';
import { createBranch, updateBranch, deleteBranch } from '../services/branch.service';
import employeeService from '@/modules/employee/services/employee.service';
import { useToast } from '@/components/ui/toast/ToastProvider';

export function useBranchTier() {
  const toast = useToast();

  const [branches, setBranches] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [branchEmployeesMap, setBranchEmployeesMap] = useState({});
  const [tierSummary, setTierSummary] = useState({
    tier1Count: 0,
    tier2Count: 0,
    tier3Count: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab: 'branches' | 'tiers'
  const [activeTab, setActiveTab] = useState('branches');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL'); // 'ALL' | 1 | 2 | 3
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'LOCKED'

  // Modal State for Changing Tier
  const [changeTierModalOpen, setChangeTierModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Modal State for Branch CRUD (Thêm / Sửa / Xóa Chi Nhánh)
  const [branchFormModalOpen, setBranchFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchDeleteModalOpen, setBranchDeleteModalOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState(null);

  // Modal State for Tier CRUD (Thêm / Sửa / Xóa Tier)
  const [tierFormModalOpen, setTierFormModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierDeleteModalOpen, setTierDeleteModalOpen] = useState(false);
  const [deletingTier, setDeletingTier] = useState(null);
  const [tierActionLoading, setTierActionLoading] = useState(false);

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, branchListRes, employeesRes, tiersRes] = await Promise.all([
        tierService.getTierSummary(),
        tierService.getAllBranches(),
        employeeService.getEmployees({ limit: 1000 }).catch(() => null),
        tierService.getAllTiers().catch(() => []),
      ]);

      setTierSummary(
        summaryRes || {
          tier1Count: 0,
          tier2Count: 0,
          tier3Count: 0,
          totalCount: 0,
        }
      );
      setBranches(branchListRes || []);
      setTiers(tiersRes || []);

      // Đếm số lượng nhân viên thực tế từ bảng Users cho từng chi nhánh
      const empList = employeesRes?.data || [];
      const empMap = {};
      if (Array.isArray(empList) && empList.length > 0) {
        empList.forEach((e) => {
          if (e.status !== 'INACTIVE') {
            const bId = Number(e.homeBranchId || e.branchId);
            if (bId) {
              empMap[bId] = (empMap[bId] || 0) + 1;
            }
          }
        });
      }
      setBranchEmployeesMap(empMap);
    } catch (err) {
      console.error('[useBranchTier] Error loading tier data:', err);
      setError(err.message || 'Không thể tải dữ liệu phân cấp chi nhánh.');
      toast?.error?.(err.message || 'Không thể tải dữ liệu phân cấp chi nhánh.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered branches with computed headcount & quota directly from database
  const enhancedBranches = useMemo(() => {
    return branches.map((b) => {
      const bId = Number(b.storeId || b.id);
      const bTierId = Number(b.tierId || b.tier?.id || 0);

      // Tìm thông tin tier từ DB
      const matchedTier =
        (tiers || []).find((t) => Number(t.id || t.tier_id) === bTierId) ||
        b.tierObj ||
        b.tier ||
        null;

      const quota = Number(
        (b.staffCount > 0 ? b.staffCount : null) ||
        b.effectiveQuota ||
        b.targetStaffCount ||
        matchedTier?.maxStaffCount ||
        tierService.getBranchQuota(bId, Number(b.branchTier ?? 2))
      );

      let staffCount = 0;
      if (branchEmployeesMap[bId] !== undefined) {
        staffCount = Number(branchEmployeesMap[bId]);
      } else if (b.currentStaffCount !== undefined && b.currentStaffCount !== null) {
        staffCount = Number(b.currentStaffCount);
      } else if (b.officialHeadcount !== undefined && b.officialHeadcount !== null) {
        staffCount = Number(b.officialHeadcount);
      }

      return {
        ...b,
        tierId: bTierId || matchedTier?.id,
        matchedTier,
        customQuota: quota,
        targetStaffCount: quota,
        currentStaffCount: staffCount,
        availableSlots: Math.max(0, quota - staffCount),
        isFull: staffCount >= quota,
        isOverQuota: staffCount > quota,
      };
    });
  }, [branches, branchEmployeesMap, tiers]);

  const filteredBranches = useMemo(() => {
    return enhancedBranches.filter((b) => {
      const matchSearch =
        !searchTerm.trim() ||
        (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.branchCode || b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.address || '').toLowerCase().includes(searchTerm.toLowerCase());

      const bTierId = Number(b.tierId || b.matchedTier?.id || 0);
      const bBranchTier = Number(b.branchTier ?? 0);

      const matchTier =
        selectedTierFilter === 'ALL' ||
        (bTierId > 0 && bTierId === Number(selectedTierFilter)) ||
        (bBranchTier > 0 && bBranchTier === Number(selectedTierFilter));

      const matchStatus =
        statusFilter === 'ALL' ||
        (b.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchTier && matchStatus;
    });
  }, [enhancedBranches, searchTerm, selectedTierFilter, statusFilter]);

  // Tính toán số lượng chi nhánh thực tế đang sử dụng cho từng Tier từ DB
  const enhancedTiers = useMemo(() => {
    return (tiers || []).map((t) => {
      const tId = Number(t.id || t.tier_id);
      const tName = (t.name || t.tierName || t.tier_name || '').toLowerCase();

      const usedCount = (branches || []).filter((b) => {
        const bTierId = Number(b.tierId || b.tier?.id || 0);
        if (bTierId > 0 && tId > 0 && bTierId === tId) {
          return true;
        }
        if (b.branchTierName && tName && b.branchTierName.toLowerCase() === tName) {
          return true;
        }
        return false;
      }).length;

      return {
        ...t,
        branch_count: usedCount,
        branchCount: usedCount,
      };
    });
  }, [tiers, branches]);

  // Handle Changing Tier & Headcount Quota of a Branch
  const handleUpdateTierAndQuota = async (storeId, newTier, quota, note = '') => {
    try {
      setUpdating(true);
      await tierService.updateBranchTierAndQuota(storeId, newTier, quota, note);
      await fetchData();
      const tierLabel = typeof newTier === 'object' ? (newTier.tierName || `Tier ${newTier.tierId}`) : `Cấp ${newTier}`;
      toast?.success?.(
        `Đã cập nhật phân cấp ${tierLabel} cho chi nhánh thành công!`
      );
      setChangeTierModalOpen(false);
      setSelectedBranch(null);
      return { success: true };
    } catch (err) {
      console.error('[useBranchTier] Update tier and quota failed:', err);
      toast?.error?.(err.message || 'Cập nhật phân cấp & định biên thất bại.');
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTier = async (storeId, newTier, note = '') => {
    return await handleUpdateTierAndQuota(storeId, newTier, undefined, note);
  };

  // Quick adjust headcount (+1 or -1) directly from table
  const handleQuickAdjust = async (storeId, delta) => {
    try {
      await tierService.quickAdjustHeadcount(storeId, delta);
      await fetchData();
      const actionText = delta > 0 ? `Tăng +${delta}` : `Giảm ${delta}`;
      toast?.success?.(`Đã ${actionText} chỉ tiêu định biên nhân sự chi nhánh!`);
    } catch (err) {
      toast?.error?.(err.message || 'Không thể điều chỉnh định biên.');
    }
  };

  // ==========================================
  // BRANCH CRUD (Thêm, Sửa, Xóa Chi Nhánh)
  // ==========================================
  const handleCreateBranch = async (formData) => {
    try {
      await createBranch(formData);
      toast?.success?.('Thêm mới chi nhánh thành công!');
      setBranchFormModalOpen(false);
      await fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm chi nhánh';
      toast?.error?.(msg);
      return { success: false, error: msg };
    }
  };

  const handleUpdateBranch = async (storeId, formData) => {
    try {
      await updateBranch(storeId, formData);
      toast?.success?.('Cập nhật thông tin chi nhánh thành công!');
      setBranchFormModalOpen(false);
      setEditingBranch(null);
      await fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật chi nhánh';
      toast?.error?.(msg);
      return { success: false, error: msg };
    }
  };

  const handleDeleteBranch = async (storeId) => {
    try {
      await deleteBranch(storeId);
      toast?.success?.('Đã xóa chi nhánh thành công!');
      setBranchDeleteModalOpen(false);
      setDeletingBranch(null);
      await fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa chi nhánh';
      toast?.error?.(msg);
      return { success: false, error: msg };
    }
  };

  // ==========================================
  // TIER CRUD (Thêm, Sửa, Xóa Phân Cấp)
  // ==========================================
  const handleCreateTier = async (dto) => {
    try {
      setTierActionLoading(true);
      await tierService.createTier(dto);
      toast?.success?.('Tạo mới phân cấp Tier thành công!');
      setTierFormModalOpen(false);
      await fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo Tier';
      toast?.error?.(msg);
      return { success: false, error: msg };
    } finally {
      setTierActionLoading(false);
    }
  };

  const handleUpdateTierDefinition = async (id, dto) => {
    try {
      setTierActionLoading(true);
      await tierService.updateTier(id, dto);
      toast?.success?.('Cập nhật phân cấp Tier thành công!');
      setTierFormModalOpen(false);
      setEditingTier(null);
      await fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật Tier';
      toast?.error?.(msg);
      return { success: false, error: msg };
    } finally {
      setTierActionLoading(false);
    }
  };

  const handleDeleteTier = async (id) => {
    try {
      setTierActionLoading(true);
      await tierService.deleteTier(id);
      toast?.success?.('Xóa phân cấp Tier thành công!');
      setTierDeleteModalOpen(false);
      setDeletingTier(null);
      await fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa Tier';
      toast?.error?.(msg);
      return { success: false, error: msg };
    } finally {
      setTierActionLoading(false);
    }
  };

  return {
    branches: filteredBranches,
    rawBranches: enhancedBranches,
    tiers: enhancedTiers,
    tierSummary,
    tierDefinitions: TIER_DEFINITIONS,
    loading,
    tiersLoading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedTierFilter,
    setSelectedTierFilter,
    statusFilter,
    setStatusFilter,
    // Change Tier Modal
    changeTierModalOpen,
    setChangeTierModalOpen,
    selectedBranch,
    setSelectedBranch,
    updating,
    // Branch CRUD Modal
    branchFormModalOpen,
    setBranchFormModalOpen,
    editingBranch,
    setEditingBranch,
    branchDeleteModalOpen,
    setBranchDeleteModalOpen,
    deletingBranch,
    setDeletingBranch,
    // Tier CRUD Modal
    tierFormModalOpen,
    setTierFormModalOpen,
    editingTier,
    setEditingTier,
    tierDeleteModalOpen,
    setTierDeleteModalOpen,
    deletingTier,
    setDeletingTier,
    tierActionLoading,
    // Handlers
    handleUpdateTier,
    handleUpdateTierAndQuota,
    handleQuickAdjust,
    handleCreateBranch,
    handleUpdateBranch,
    handleDeleteBranch,
    handleCreateTier,
    handleUpdateTierDefinition,
    handleDeleteTier,
    refreshData: fetchData,
  };
}

export default useBranchTier;
