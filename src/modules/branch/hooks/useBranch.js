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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState(null);

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

  // Thống kê tổng hợp
  const stats = useMemo(() => {
    const totalBranches = branches.length;
    const activeBranches = branches.filter((b) => (b.status || '').toUpperCase() === 'ACTIVE').length;
    const lockedBranches = totalBranches - activeBranches;

    let t1Count = 0;
    let t2Count = 0;
    let t3Count = 0;
    let t4Count = 0;
    let t5Count = 0;
    let otherCount = 0;

    branches.forEach((b) => {
      const tId = Number(b.tierId || b.tier?.id || b.tier_id || 0);
      const matchedTier = (tiers || []).find((t) => Number(t.id || t.tier_id) === tId) || b.tierObj || b.tier;
      const tName = (matchedTier?.tierName || matchedTier?.name || b.branchTierName || '').toLowerCase();

      if (tId === 6 || tName.includes('tier 1') || tName.includes('flagship')) {
        t1Count++;
      } else if (tId === 7 || tName.includes('tier 2') || tName.includes('tiêu chuẩn')) {
        t2Count++;
      } else if (tId === 3 || tName.includes('tier 3') || tName.includes('mini')) {
        t3Count++;
      } else if (tId === 9 || tName.includes('tier 4')) {
        t4Count++;
      } else if (tId === 10 || tName.includes('tier 5')) {
        t5Count++;
      } else if (Number(b.branchTier) === 1) {
        t1Count++;
      } else if (Number(b.branchTier) === 2) {
        t2Count++;
      } else if (Number(b.branchTier) === 3) {
        t3Count++;
      } else {
        otherCount++;
      }
    });

    return {
      totalBranches,
      activeBranches,
      lockedBranches,
      tier1Count: t1Count,
      tier2Count: t2Count,
      tier3Count: t3Count,
      tier4Count: t4Count,
      tier5Count: t5Count,
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
      const matchStatus =
        statusFilter === 'ALL' ||
        (b.status || '').toUpperCase() === statusFilter.toUpperCase();

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

  // Thao tác Xóa chi nhánh
  const handleDeleteBranch = async (storeId) => {
    try {
      setIsActionInProgress(true);
      await branchService.deleteBranch(storeId);
      await fetchData();
      setDeleteModalOpen(false);
      setDeletingBranch(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
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
    deleteModalOpen,
    setDeleteModalOpen,
    deletingBranch,
    setDeletingBranch,
    isActionInProgress,
    setIsActionInProgress,
    // Handlers
    refresh: fetchData,
    handleCreateBranch,
    handleUpdateBranch,
    handleToggleBranchStatus,
    handleLockSuccess,
    handleUnlockSuccess,
    handleDeleteBranch,
  };
}

export default useBranch;
