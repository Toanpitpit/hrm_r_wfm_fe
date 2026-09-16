import axiosInstance from '@/config/axios.config';

export const attendanceService = {
  /**
   * Đệ trình GPS di động và yêu cầu cấp mã OTP 60s (CHECK_IN hoặc CHECK_OUT)
   */
  requestOtp: async (latitude, longitude, type = 'CHECK_IN') => {
    try {
      const response = await axiosInstance.post('attendance/request-otp', {
        latitude,
        longitude,
        type,
      });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể kết nối đến hệ thống điểm danh.' };
    }
  },

  /**
   * Lấy danh sách quân số theo dõi trực tiếp thời gian thực (Live Roster)
   */
  getLiveRoster: async (storeId) => {
    try {
      const response = await axiosInstance.get(`attendance/live-roster?storeId=${storeId}`);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể lấy dữ liệu quân số.' };
    }
  },

  /**
   * Gắn cờ nghi ngờ gian lận / vắng mặt cho ca trực
   */
  flagFraud: async (attendanceId, reason) => {
    try {
      const response = await axiosInstance.post('attendance/flag-fraud', {
        attendanceId,
        reason,
      });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể thực hiện báo cáo gian lận.' };
    }
  },

  /**
   * Phân xử khiếu nại (Store Manager duyệt/khôi phục giờ công)
   */
  resolveFraud: async (attendanceId, isApproved) => {
    try {
      const response = await axiosInstance.post('attendance/resolve-fraud', {
        attendanceId,
        isApproved,
      });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể phân xử khiếu nại.' };
    }
  },
};
