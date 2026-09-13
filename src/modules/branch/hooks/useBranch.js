import { useState, useEffect, useCallback, useMemo } from 'react';
import branchService from '../services/branch.service';

/**
 * ==============================================================================
 * MODULE: Quản lý Danh mục Chi nhánh & Cấu hình Kiosk (Operations Admin)
 * HOOK: useBranch.js
 * ==============================================================================
 * Hook xử lý state, fetch dữ liệu từ Backend, tính toán thống kê và quản lý modal.
 */
export function useBranch() {
  const [branches, setBranches] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockingBranch, setLockingBranch] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState(null);

  const [kioskModalOpen, setKioskModalOpen] = useState(false);
  const [selectedBranchForKiosk, setSelectedBranchForKiosk] = useState(null);

  const [globalMonitorOpen, setGlobalMonitorOpen] = useState(false);

  // Tải danh sách chi nhánh và Kiosk
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [branchList, kioskList] = await Promise.all([
        branchService.getAllBranches(),
        branchService.getAllKiosks(),
      ]);
      setBranches(branchList || []);
      setKiosks(kioskList || []);
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
    const totalKiosks = kiosks.length;
    const onlineKiosks = kiosks.filter((k) => (k.status || '').toUpperCase() === 'ACTIVE').length;
    return {
      totalBranches,
      activeBranches,
      lockedBranches,
      totalKiosks,
      onlineKiosks,
    };
  }, [branches, kiosks]);

  // Danh sách chi nhánh đã lọc theo Search và Status
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
      return matchSearch && matchStatus;
    });
  }, [branches, searchTerm, statusFilter]);

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

  // Thao tác Thêm Kiosk cho chi nhánh
  const handleAddKiosk = async (storeId, kioskData) => {
    try {
      await branchService.createKiosk(storeId, kioskData);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Cấu hình Kiosk của chi nhánh
  const handleSaveKioskConfig = async (kioskId, config) => {
    try {
      await branchService.updateKioskConfig(kioskId, config);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Đổi trạng thái Kiosk (Khóa / Mở khóa trạm)
  const handleToggleKioskLock = async (kioskId, currentStatus) => {
    try {
      await branchService.toggleKioskLock(kioskId, currentStatus);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    branches: filteredBranches,
    allBranches: branches,
    kiosks,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
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
    kioskModalOpen,
    setKioskModalOpen,
    selectedBranchForKiosk,
    setSelectedBranchForKiosk,
    globalMonitorOpen,
    setGlobalMonitorOpen,
    // Handlers
    refresh: fetchData,
    handleCreateBranch,
    handleUpdateBranch,
    handleToggleBranchStatus,
    handleDeleteBranch,
    handleAddKiosk,
    handleSaveKioskConfig,
    handleToggleKioskLock,
  };
}

export default useBranch;