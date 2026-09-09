import { useState, useCallback } from 'react';
import authService from '../services/auth.service';

/**
 * Hook quản lý logic đăng nhập và state (loading, error) cho module Auth
 */
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Xử lý đăng nhập Web
   */
  const handleLogin = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ username, password });
      if (response.success) {
        const { token, user } = response.data;
        // Lưu token vào localStorage để axiosInstance sử dụng
        localStorage.setItem('accessToken', token);
        // Có thể dispatch action lên Redux/Context để lưu thông tin user ở đây
        return { success: true, user };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng nhập.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    handleLogin,
    isLoading,
    error,
  };
};

export default useAuth;
