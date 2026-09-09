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
};

export default authService;
