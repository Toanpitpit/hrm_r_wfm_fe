import { useState, useCallback } from 'react';
import branchService from '../services/branch.service';

/**
 * Hook gửi yêu cầu mở khóa chi nhánh
 * Endpoint: POST /api/branches/{id}/unlock
 */
export function useUnlockBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unlock = useCallback(async (branchId, payload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await branchService.unlockBranch(branchId, payload);
      return { success: true, data: res };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể mở khóa chi nhánh';
      setError(message);
      return {
        success: false,
        status: err.status || err.response?.status || 500,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    unlock,
    setError,
  };
}

export default useUnlockBranch;
