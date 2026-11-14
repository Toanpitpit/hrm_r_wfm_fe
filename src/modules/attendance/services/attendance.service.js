import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';

export const attendanceService = {
  /**
   * Đệ trình GPS di động và yêu cầu cấp mã OTP 60s (CHECK_IN hoặc CHECK_OUT)
   */
  requestOtp: async (latitude, longitude, type = 'CHECK_IN') => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ATTENDANCE.REQUEST_OTP, {
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
  getLiveRoster: async (storeId, date = null) => {
    try {
      const endpoint = API_ENDPOINTS.ATTENDANCE.LIVE_ROSTER(storeId, date);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể lấy dữ liệu quân số.' };
    }
  },

  /**
   * Lấy lịch sử danh sách bản ghi điểm danh trong ngày của chi nhánh cửa hàng
   */
  getHistory: async (storeId, date = null) => {
    try {
      const endpoint = API_ENDPOINTS.ATTENDANCE.HISTORY(storeId, date);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể lấy lịch sử điểm danh.' };
    }
  },

  /**
   * Lấy lịch làm việc cá nhân theo tuần (Calendar View)
   */
  getMyWeeklySchedule: async (weekStart) => {
    try {
      const endpoint = API_ENDPOINTS.ATTENDANCE.MY_WEEKLY_SCHEDULE(weekStart);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể tải lịch làm việc cá nhân.' };
    }
  },

  /**
   * Lấy lịch sử và thống kê chấm công cá nhân theo tháng
   */
  getMyAttendanceHistory: async (month, year) => {
    try {
      const endpoint = API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE_HISTORY(month, year);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể tải lịch sử chấm công.' };
    }
  },
};
