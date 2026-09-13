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
        // Lưu token và user vào localStorage
        localStorage.setItem('accessToken', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
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

  /**
   * Yêu cầu gửi mã OTP đặt lại mật khẩu
   */
  const handleForgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Xác thực mã OTP
   */
  const handleVerifyOtp = useCallback(async (email, otpCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyOtp(email, otpCode);
      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đặt lại mật khẩu mới
   */
  const handleResetPassword = useCallback(async (email, otpCode, newPassword, confirmPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword({
        email,
        otpCode,
        newPassword,
        confirmPassword,
      });
      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    handleLogin,
    handleForgotPassword,
    handleVerifyOtp,
    handleResetPassword,
    isLoading,
    error,
  };
};

export default useAuth;
