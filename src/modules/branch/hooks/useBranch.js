import { useState, useEffect, useCallback, useMemo } from 'react';
import branchService from '../services/branch.service';

/**
 * ==============================================================================
 * MODULE: Quản lý Danh mục Chi nhánh (Operations Admin)
 * HOOK: useBranch.js
 * ==============================================================================
 * Hook xử lý state, fetch dữ liệu từ Backend, tính toán thống kê và quản lý modal.
 */
export function useBranch() {
  const [branches, setBranches] = useState([]);
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState(null);

  // Tải danh sách chi nhánh
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const branchList = await branchService.getAllBranches();
      setBranches(branchList || []);
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
    const tier1Count = branches.filter((b) => Number(b.branchTier || b.tier || 2) === 1).length;
    const tier2Count = branches.filter((b) => Number(b.branchTier || b.tier || 2) === 2).length;
    const tier3Count = branches.filter((b) => Number(b.branchTier || b.tier || 2) === 3).length;
    return {
      totalBranches,
      activeBranches,
      lockedBranches,
      tier1Count,
      tier2Count,
      tier3Count,
    };
  }, [branches]);

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
      const matchTier =
        tierFilter === 'ALL' ||
        Number(b.branchTier || b.tier || 2) === Number(tierFilter);
      return matchSearch && matchStatus && matchTier;
    });
  }, [branches, searchTerm, statusFilter, tierFilter]);

  // Thao tác Tạo mới chi nhánh
  const handleCreateBranch = async (formData) => {
    try {
      await branchService.createBranch(formData);
      await fetchData();
      setFormModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Cập nhật chi nhánh
  const handleUpdateBranch = async (storeId, formData) => {
    try {
      await branchService.updateBranch(storeId, formData);
      await fetchData();
      setFormModalOpen(false);
      setEditingBranch(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Khóa / Mở khóa chi nhánh có lưu lý do
  const handleToggleBranchStatus = async (storeId, nextStatus, reason) => {
    try {
      await branchService.updateBranchStatus(storeId, nextStatus, reason);
      await fetchData();
      setLockModalOpen(false);
      setLockingBranch(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Xóa chi nhánh
  const handleDeleteBranch = async (storeId) => {
    try {
      await branchService.deleteBranch(storeId);
      await fetchData();
      setDeleteModalOpen(false);
      setDeletingBranch(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    branches: filteredBranches,
    allBranches: branches,
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
    deleteModalOpen,
    setDeleteModalOpen,
    deletingBranch,
    setDeletingBranch,
    // Handlers
    refresh: fetchData,
    handleCreateBranch,
    handleUpdateBranch,
    handleToggleBranchStatus,
    handleDeleteBranch,
  };
}

export default useBranch;
