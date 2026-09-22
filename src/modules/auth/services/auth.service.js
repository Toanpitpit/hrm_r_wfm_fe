import axiosInstance from '@/config/axios.config';

/**
 * Service xử lý các API liên quan đến Authentication
 */
const authService = {
  /**
   * Đăng nhập Web (Standard Login)
   * @param {Object} data - { username, password }
   * @returns {Promise<Object>} ApiResponse chứa token và thông tin user
   */
  login: async (data) => {
    const response = await axiosInstance.post('/Auth/login', data);
    return response.data;
  },

  /**
   * Đăng nhập Kiosk (Kiosk Login)
   * @param {Object} data - { employeeCode, pinCode, storeId }
   * @returns {Promise<Object>} ApiResponse chứa token và thông tin user
   */
  kioskLogin: async (data) => {
    const response = await axiosInstance.post('/Auth/kiosk-login', data);
    return response.data;
  },

  /**
   * Yêu cầu gửi mã OTP đặt lại mật khẩu qua email
   * @param {string} email
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/Auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Xác thực mã OTP
   * @param {string} email
   * @param {string} otpCode
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  verifyOtp: async (email, otpCode) => {
    const response = await axiosInstance.post('/Auth/verify-otp', { email, otpCode });
    return response.data;
  },

  /**
   * Đặt lại mật khẩu mới
   * @param {Object} data - { email, otpCode, newPassword, confirmPassword }
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  resetPassword: async (data) => {
    const response = await axiosInstance.post('/Auth/reset-password', data);
    return response.data;
  },

  /**
   * Đăng nhập bằng tài khoản Google
   * @param {string} idToken - Google Credential ID Token
   * @returns {Promise<Object>} ApiResponse chứa token và thông tin user
   */
  googleLogin: async (idToken) => {
    const response = await axiosInstance.post('/Auth/google-login', { idToken });
    return response.data;
  },

  /**
   * Đổi mật khẩu tài khoản
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  changePassword: async (data) => {
    const response = await axiosInstance.post('/Auth/change-password', data);
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân
   * @param {Object} data - { fullName, phone, email }
   * @returns {Promise<Object>} ApiResponse<UserSummaryDto>
   */
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/Auth/profile', data);
    return response.data;
  },

  /**
   * Lấy danh sách thông báo hệ thống của người dùng
   * @returns {Promise<Object>} ApiResponse<List<NotificationItemDto>>
   */
  getNotifications: async () => {
    const response = await axiosInstance.get('/Auth/notifications');
    return response.data;
  },
};

export default authService;


