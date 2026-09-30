import { useState, useCallback } from 'react';
import branchService from '../services/branch.service';

/**
 * Hook kiểm tra điều kiện tiên quyết trước khi khóa chi nhánh
 * Endpoint: GET /api/branches/{id}/lock-check
 */
export function useBranchLockCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const checkLock = useCallback(async (branchId) => {
    if (!branchId) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await branchService.checkBranchLock(branchId);
      setData(res);
      return res;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi kiểm tra điều kiện khóa chi nhánh';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    data,
    checkLock,
    setData,
    reset,
  };
}

export default useBranchLockCheck;
