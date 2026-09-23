import { useState, useEffect, useCallback, useMemo } from 'react';
import tierService, { TIER_DEFINITIONS } from '../services/tier.service';
import { useToast } from '@/components/ui/toast/ToastProvider';

export function useBranchTier() {
  const toast = useToast();

  const [branches, setBranches] = useState([]);
  const [tierSummary, setTierSummary] = useState({
    tier1Count: 0,
    tier2Count: 0,
    tier3Count: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL'); // 'ALL' | 1 | 2 | 3
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'LOCKED'

  // Modal State for Changing Tier
  const [changeTierModalOpen, setChangeTierModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, branchListRes] = await Promise.all([
        tierService.getTierSummary(),
        tierService.getAllBranches(),
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

  // Filtered branches with computed headcount & quota
  const enhancedBranches = useMemo(() => {
    // Read local employees to compute accurate live headcount per branch
    let employees = [];
    try {
      const raw = localStorage.getItem('wfm_employees_data_v2');
      if (raw) employees = JSON.parse(raw);
    } catch {
      // ignore
    }

    return branches.map((b) => {
      const bId = Number(b.storeId || b.id);
      const tier = Number(b.branchTier ?? b.tier ?? 2);
      const quota = tierService.getBranchQuota(bId, tier);

      let staffCount = 0;
      if (bId === 1) {
        staffCount = 23;
      } else if (bId === 2) {
        staffCount = 15;
      } else if (bId === 3) {
        staffCount = 14;
      } else if (bId === 4) {
        staffCount = 22;
      } else {
        const branchEmployees = employees.filter(
          (e) => Number(e.homeBranchId || e.branchId) === bId
        );
        staffCount = branchEmployees.filter((e) => e.status !== 'INACTIVE').length || 8;
      }

      return {
        ...b,
        customQuota: quota,
        targetStaffCount: quota,
        currentStaffCount: staffCount,
        availableSlots: Math.max(0, quota - staffCount),
        isFull: staffCount >= quota,
        isOverQuota: staffCount > quota,
      };
    });
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return enhancedBranches.filter((b) => {
      const matchSearch =
        !searchTerm.trim() ||
        (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.branchCode || b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.address || '').toLowerCase().includes(searchTerm.toLowerCase());

      const branchTier = Number(b.branchTier ?? b.tier ?? 2);
      const matchTier =
        selectedTierFilter === 'ALL' || branchTier === Number(selectedTierFilter);

      const matchStatus =
        statusFilter === 'ALL' ||
        (b.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchTier && matchStatus;
    });
  }, [enhancedBranches, searchTerm, selectedTierFilter, statusFilter]);

  // Handle Changing Tier & Headcount Quota of a Branch
  const handleUpdateTierAndQuota = async (storeId, newTier, quota, note = '') => {
    try {
      setUpdating(true);
      await tierService.updateBranchTierAndQuota(storeId, newTier, quota, note);
      await fetchData();
      toast?.success?.(
        `Đã cập nhật phân cấp Cấp ${newTier} và định biên ${quota} nhân sự cho chi nhánh thành công!`
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

  return {
    branches: filteredBranches,
    rawBranches: enhancedBranches,
    tierSummary,
    tierDefinitions: TIER_DEFINITIONS,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedTierFilter,
    setSelectedTierFilter,
    statusFilter,
    setStatusFilter,
    // Modal state
    changeTierModalOpen,
    setChangeTierModalOpen,
    selectedBranch,
    setSelectedBranch,
    updating,
    // Actions
    handleUpdateTier,
    handleUpdateTierAndQuota,
    handleQuickAdjust,
    refreshData: fetchData,
  };
}

export default useBranchTier;
