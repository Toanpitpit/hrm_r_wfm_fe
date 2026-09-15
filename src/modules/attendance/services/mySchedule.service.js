import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';

export const myScheduleService = {
  /**
   * Lấy lịch làm việc cá nhân theo tuần (Calendar View)
   * @param {string} weekStart ISO Date string (YYYY-MM-DD)
   */
  getMyWeeklySchedule: async (weekStart) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ATTENDANCE.MY_WEEKLY_SCHEDULE(weekStart));
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể tải lịch làm việc.' };
    }
  },

  /**
   * Lấy lịch sử chấm công cá nhân theo tháng
   * @param {number} month 1-12
   * @param {number} year YYYY
   */
  getMyAttendanceHistory: async (month, year) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE_HISTORY(month, year));
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Không thể tải lịch sử chấm công.' };
    }
  },
};
