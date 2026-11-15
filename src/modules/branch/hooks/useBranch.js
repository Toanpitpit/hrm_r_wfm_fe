import { useState, useEffect, useCallback, useMemo } from 'react';
import branchService from '../services/branch.service';
import tierService from '../services/tier.service';

/**
 * ==============================================================================
 * MODULE: Quản lý Danh mục Chi nhánh (Operations Admin)
 * HOOK: useBranch.js
 * ==============================================================================
 * Hook xử lý state, fetch dữ liệu từ Backend, tính toán thống kê và quản lý modal.
 */
export function useBranch() {
  const [branches, setBranches] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockingBranch, setLockingBranch] = useState(null);

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockingBranch, setUnlockingBranch] = useState(null);

  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Tải danh sách chi nhánh và phân cấp
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [branchList, tierList] = await Promise.all([
        branchService.getAllBranches(),
        tierService.getAllTiers().catch(() => []),
      ]);
      setBranches(branchList || []);
      setTiers(tierList || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu chi nhánh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Thống kê tổng hợp phân cấp chi nhánh động từ Database
  const stats = useMemo(() => {
    const totalBranches = branches.length;
    const activeBranches = branches.filter((b) => (b.status || '').toUpperCase() === 'ACTIVE').length;
    const lockedBranches = totalBranches - activeBranches;

    const TIER_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#06b6d4', '#eab308', '#6366f1'];

    // Sắp xếp tiers theo số tự nhiên (ví dụ: Tier 1, Tier 2, Tier 4, Tier 5)
    const sortedTiers = [...(tiers || [])].sort((a, b) => {
      const numA = parseInt((a.tierName || a.name || '').match(/\d+/)?.[0] || a.id || 0, 10);
      const numB = parseInt((b.tierName || b.name || '').match(/\d+/)?.[0] || b.id || 0, 10);
      return numA - numB;
    });

    const tierMap = new Map();
    sortedTiers.forEach((t, idx) => {
      const id = Number(t.id || t.tier_id);
      const name = t.tierName || t.name || `Tier ${id}`;
      const numMatch = name.match(/\d+/);
      const shortCode = numMatch ? `T${numMatch[0]}` : (name.length <= 4 ? name.toUpperCase() : `T${id}`);

      let color = TIER_COLORS[idx % TIER_COLORS.length];
      const lower = name.toLowerCase();
      if (lower.includes('tier 1') || lower.includes('cấp 1') || lower.includes('flagship')) color = '#f59e0b';
      else if (lower.includes('tier 2') || lower.includes('cấp 2') || lower.includes('tiêu chuẩn')) color = '#3b82f6';
      else if (lower.includes('tier 3') || lower.includes('cấp 3') || lower.includes('mini')) color = '#10b981';
      else if (lower.includes('tier 4') || lower.includes('cấp 4')) color = '#a855f7';
      else if (lower.includes('tier 5') || lower.includes('cấp 5')) color = '#ec4899';

      tierMap.set(id, {
        id,
        name,
        shortCode,
        color,
        count: 0,
      });
    });

    // Nếu API tiers chưa tải xong hoặc rỗng, mặc định T1, T2, T3
    if (tierMap.size === 0) {
      [1, 2, 3].forEach((num, idx) => {
        tierMap.set(num, {
          id: num,
          name: `Tier ${num}`,
          shortCode: `T${num}`,
          color: TIER_COLORS[idx],
          count: 0,
        });
      });
    }

    let otherCount = 0;
    branches.forEach((b) => {
      const tId = Number(b.tierId || b.tier?.id || b.tier_id || 0);

      // 1. Khớp trực tiếp theo TierId
      if (tId && tierMap.has(tId)) {
        tierMap.get(tId).count++;
        return;
      }

      // 2. Khớp theo tên Tier của đối tượng đính kèm
      const matchedTierObj = (tiers || []).find((t) => Number(t.id || t.tier_id) === tId) || b.tierObj || b.tier;
      const tName = (matchedTierObj?.tierName || matchedTierObj?.name || b.branchTierName || '').toLowerCase();
      const numFromTName = parseInt(tName.match(/\d+/)?.[0] || '0', 10);
      if (numFromTName > 0) {
        const found = Array.from(tierMap.values()).find(
          (item) => item.shortCode === `T${numFromTName}` || item.name.toLowerCase().includes(`tier ${numFromTName}`)
        );
        if (found) {
          found.count++;
          return;
        }
      }

      // 3. Fallback theo số branchTier cũ
      const numBranchTier = Number(b.branchTier ?? b.tier);
      if (numBranchTier > 0) {
        const found = Array.from(tierMap.values()).find(
          (item) => item.shortCode === `T${numBranchTier}` || item.name.toLowerCase().includes(`tier ${numBranchTier}`)
        );
        if (found) {
          found.count++;
          return;
        }
      }

      otherCount++;
    });

    const tierBreakdown = Array.from(tierMap.values());

    return {
      totalBranches,
      activeBranches,
      lockedBranches,
      tierBreakdown,
      tier1Count: tierBreakdown.find((t) => t.shortCode === 'T1')?.count || 0,
      tier2Count: tierBreakdown.find((t) => t.shortCode === 'T2')?.count || 0,
      tier3Count: tierBreakdown.find((t) => t.shortCode === 'T3')?.count || 0,
      tier4Count: tierBreakdown.find((t) => t.shortCode === 'T4')?.count || 0,
      tier5Count: tierBreakdown.find((t) => t.shortCode === 'T5')?.count || 0,
      otherTierCount: otherCount,
    };
  }, [branches, tiers]);

  // Danh sách chi nhánh đã lọc theo Search, Status và Tier
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch =
        !searchTerm.trim() ||
        (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.branchCode || b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      const bStatus = (b.status || '').toUpperCase();
      const sFilter = (statusFilter || 'ALL').toUpperCase();
      const isLockedStatus = bStatus === 'LOCKED' || bStatus === 'INACTIVE';
      const isLockedFilter = sFilter === 'LOCKED' || sFilter === 'INACTIVE';
      const matchStatus =
        sFilter === 'ALL' ||
        (isLockedFilter ? isLockedStatus : bStatus === sFilter);

      const bTierId = Number(b.tierId || b.tier?.id || 0);
      const matchedTier = (tiers || []).find((t) => Number(t.id || t.tier_id) === bTierId);
      const bBranchTier = Number(b.branchTier || b.tier || 2);
      const matchTier =
        tierFilter === 'ALL' ||
        String(bTierId) === String(tierFilter) ||
        (matchedTier && String(matchedTier.id) === String(tierFilter)) ||
        String(bBranchTier) === String(tierFilter);

      return matchSearch && matchStatus && matchTier;
    });
  }, [branches, searchTerm, statusFilter, tierFilter, tiers]);

  // Thao tác Tạo mới chi nhánh
  const handleCreateBranch = async (formData) => {
    try {
      setIsActionInProgress(true);
      await branchService.createBranch(formData);
      await fetchData();
      setFormModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Thao tác Cập nhật chi nhánh
  const handleUpdateBranch = async (storeId, formData) => {
    try {
      setIsActionInProgress(true);
      await branchService.updateBranch(storeId, formData);
      await fetchData();
      setFormModalOpen(false);
      setEditingBranch(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Thao tác Khóa / Mở khóa chi nhánh có lưu lý do (tương thích ngược)
  const handleToggleBranchStatus = async (storeId, nextStatus, reason) => {
    try {
      setIsActionInProgress(true);
      await branchService.updateBranchStatus(storeId, nextStatus, reason);
      await fetchData();
      setLockModalOpen(false);
      setLockingBranch(null);
      setUnlockModalOpen(false);
      setUnlockingBranch(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Callback sau khi hoàn thành khóa chi nhánh
  const handleLockSuccess = async () => {
    setIsActionInProgress(true);
    try {
      await fetchData();
      setLockModalOpen(false);
      setLockingBranch(null);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Callback sau khi hoàn thành mở khóa chi nhánh
  const handleUnlockSuccess = async () => {
    setIsActionInProgress(true);
    try {
      await fetchData();
      setUnlockModalOpen(false);
      setUnlockingBranch(null);
    } finally {
      setIsActionInProgress(false);
    }
  };

  return {
    branches: filteredBranches,
    allBranches: branches,
    tiers,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    tierFilter,
    setTierFilter,
    // Modals
    formModalOpen,
    setFormModalOpen,
    editingBranch,
    setEditingBranch,
    lockModalOpen,
    setLockModalOpen,
    lockingBranch,
    setLockingBranch,
    unlockModalOpen,
    setUnlockModalOpen,
    unlockingBranch,
    setUnlockingBranch,
    isActionInProgress,
    setIsActionInProgress,
    // Handlers
    refresh: fetchData,
    handleCreateBranch,
    handleUpdateBranch,
    handleToggleBranchStatus,
    handleLockSuccess,
    handleUnlockSuccess,
  };
}

export default useBranch;
