import { useState, useEffect, useCallback } from 'react';
import * as tierService from '../services/tier.service';

/**
 * Custom Hook quản lý State và Actions của Branch Tiers
 */
export const useTier = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast / Notification
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tierService.getAllTiers();
      setTiers(data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách Tier');
      showToast('Lỗi khi tải danh mục Tier từ server', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const handleOpenCreate = () => {
    setSelectedTier(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tier) => {
    setSelectedTier(tier);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (tier) => {
    setSelectedTier(tier);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (selectedTier) {
        await tierService.updateTier(selectedTier.id || selectedTier.tier_id, payload);
        showToast('Cập nhật Tier thành công!');
      } else {
        await tierService.createTier(payload);
        showToast('Tạo mới Tier thành công!');
      }
      setIsFormOpen(false);
      setSelectedTier(null);
      await fetchTiers();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra khi lưu Tier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (tierId) => {
    setSubmitting(true);
    try {
      await tierService.deleteTier(tierId);
      showToast('Xóa Tier thành công!');
      setIsDeleteOpen(false);
      setSelectedTier(null);
      await fetchTiers();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra khi xóa Tier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const totalTiers = tiers.length;
  const totalBranchesInTiers = tiers.reduce((sum, t) => sum + (Number(t.branch_count ?? t.branchCount ?? 0)), 0);

  return {
    tiers,
    loading,
    error,
    isFormOpen,
    isDeleteOpen,
    selectedTier,
    submitting,
    notification,
    totalTiers,
    totalBranchesInTiers,
    fetchTiers,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleFormSubmit,
    handleDeleteConfirm,
    setIsFormOpen,
    setIsDeleteOpen,
  };
};

export default useTier;