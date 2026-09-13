import { useState, useEffect, useCallback, useMemo } from 'react';
import shiftTemplateService from '../services/shiftTemplate.service';

/**
 * ==============================================================================
 * MODULE: Chuẩn hóa Bộ Khung ca Mẫu (Operations Admin)
 * HOOK: useShiftTemplate.js
 * ==============================================================================
 * Hook quản lý trạng thái, tính toán thống kê và thực hiện các thao tác khung ca.
 */
export function useShiftTemplate() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL | OVERNIGHT | SYSTEM_DEFAULT | ACTIVE

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingShift, setDeletingShift] = useState(null);
  const [standardizing, setStandardizing] = useState(false);

  // Fetch dữ liệu từ Backend
  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shiftTemplateService.getAllShiftTemplates(true);
      // Giữ lại các ca mặc định hoặc các ca tùy chỉnh đang hoạt động
      const visible = (data || []).filter(
        (s) => s.isSystemDefault || s.isActive
      );
      setShifts(visible);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách khung ca mẫu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const total = shifts.length;
    const active = shifts.filter((s) => s.isActive).length;
    const overnight = shifts.filter((s) => s.isOvernight).length;
    const systemDefault = shifts.filter((s) => s.isSystemDefault).length;
    return {
      total,
      active,
      overnight,
      systemDefault,
    };
  }, [shifts]);

  // Danh sách ca đã lọc
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        s.shiftName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.shiftCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchType = true;
      if (filterType === 'OVERNIGHT') matchType = s.isOvernight;
      else if (filterType === 'SYSTEM_DEFAULT') matchType = s.isSystemDefault;
      else if (filterType === 'ACTIVE') matchType = s.isActive;

      return matchSearch && matchType;
    });
  }, [shifts, searchTerm, filterType]);

  // Thao tác Tạo khung ca
  const handleCreateShift = async (formData) => {
    try {
      await shiftTemplateService.createShiftTemplate(formData);
      await fetchShifts();
      setFormModalOpen(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Cập nhật khung ca
  const handleUpdateShift = async (shiftId, formData) => {
    try {
      await shiftTemplateService.updateShiftTemplate(shiftId, formData);
      await fetchShifts();
      setFormModalOpen(false);
      setEditingShift(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Bật/Tắt hoạt động
  const handleToggleStatus = async (shift) => {
    try {
      await shiftTemplateService.toggleShiftStatus(shift.shiftId, shift.isActive);
      await fetchShifts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Xóa khung ca
  const handleDeleteShift = async (shiftId) => {
    try {
      await shiftTemplateService.deleteShiftTemplate(shiftId);
      setShifts((prev) => prev.filter((s) => String(s.shiftId) !== String(shiftId)));
      setDeleteModalOpen(false);
      setDeletingShift(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Thao tác Chuẩn hóa 3 ca mặc định toàn chuỗi
  const handleStandardize = async () => {
    try {
      setStandardizing(true);
      await shiftTemplateService.standardizeDefaultShifts();
      await fetchShifts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setStandardizing(false);
    }
  };

  return {
    shifts: filteredShifts,
    allShifts: shifts,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    // Modal
    formModalOpen,
    setFormModalOpen,
    editingShift,
    setEditingShift,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingShift,
    setDeletingShift,
    standardizing,
    // Handlers
    refresh: fetchShifts,
    handleCreateShift,
    handleUpdateShift,
    handleToggleStatus,
    handleDeleteShift,
    handleStandardize,
  };
}

export default useShiftTemplate;
