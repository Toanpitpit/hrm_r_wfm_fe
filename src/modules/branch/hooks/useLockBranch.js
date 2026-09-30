import { useState, useCallback } from 'react';
import branchService from '../services/branch.service';

/**
 * Hook gửi yêu cầu khóa chi nhánh
 * Endpoint: POST /api/branches/{id}/lock
 */
export function useLockBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lock = useCallback(async (branchId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await branchService.lockBranch(branchId, payload);
      return { success: true, data: res };
    } catch (err) {
      const status = err.status || err.response?.status || 500;
      const blockers = err.blockers || err.response?.data?.blockers || null;
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể thực hiện khóa chi nhánh';

      setError(message);
      return {
        success: false,
        status,
        message,
        blockers,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    lock,
    setError,
  };
}

export default useLockBranch;
