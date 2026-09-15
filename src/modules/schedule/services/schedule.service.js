import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';

/**
 * Service quản lý lịch ca và phân bổ nhân sự (UC 2.1 & UC 2.3) dành cho Store Manager.
 */

/**
 * Lấy danh sách mẫu ca chuẩn đang hoạt động.
 */
export const getShiftTemplates = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.TEMPLATES);
  return response.data;
};

/**
 * Lấy ma trận phân bổ ca tuần (7 ngày).
 * @param {number|string} branchId 
 * @param {string} weekStartDate (YYYY-MM-DD)
 */
export const getWeeklyScheduleMatrix = async (branchId, weekStartDate) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.WEEKLY_MATRIX(branchId, weekStartDate));
  return response.data;
};

/**
 * Khởi tạo khung mẫu ca cho 7 ngày trong tuần với định mức mặc định.
 */
export const generateWeeklySchedule = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.GENERATE_WEEKLY, payload);
  return response.data;
};

/**
 * Cập nhật định mức nhân sự (Thu ngân, Bán hàng, Bảo vệ) cho 1 ca trực.
 */
export const updateScheduleRequirement = async (scheduleId, payload) => {
  const response = await axiosInstance.put(API_ENDPOINTS.SHIFTS.UPDATE_REQUIREMENT(scheduleId), payload);
  return response.data;
};

/**
 * Phân bổ nhanh danh sách nhân sự Full-time vào ca trực trong tuần (UC 2.1).
 */
export const assignFullTimeBatch = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.ASSIGN_FULLTIME_BATCH, payload);
  return response.data;
};

/**
 * Phân công 1 ca làm việc đơn lẻ cho nhân viên.
 */
export const assignSingleShift = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.ASSIGN_SINGLE, payload);
  return response.data;
};

/**
 * Hủy / Xóa 1 phân công ca làm việc.
 */
export const deleteShiftAssignment = async (assignmentId) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.SHIFTS.DELETE_ASSIGNMENT(assignmentId));
  return response.data;
};

/**
 * Kiểm tra xung đột & rà soát định mức trước khi công bố lịch tuần (UC 2.3).
 */
export const checkWeeklyConflicts = async (branchId, weekStartDate) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.CHECK_CONFLICTS(branchId, weekStartDate));
  return response.data;
};

/**
 * Công bố phát hành lịch tuần và phát thông báo tới nhân viên (UC 2.3).
 */
export const publishWeeklySchedule = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.PUBLISH_WEEKLY, payload);
  return response.data;
};

/**
 * Tự động xếp lịch ca tuần tối ưu bằng thuật toán Google OR-Tools CP-SAT Solver (UC 2.1).
 */
export const autoScheduleWeekly = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.AUTO_SCHEDULE, payload);
  return response.data;
};

/**
 * Gửi đơn xin chuyển/đổi ca làm việc.
 */
export const createSwapRequest = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.SWAP_REQUEST, payload);
  return response.data;
};

/**
 * Quản lý phê duyệt hoặc từ chối đơn chuyển/đổi ca.
 */
export const reviewSwapRequest = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SHIFTS.SWAP_REVIEW, payload);
  return response.data;
};

/**
 * Lấy danh sách các đơn đổi/chuyển ca của cửa hàng cho Quản lý duyệt.
 */
export const getStoreSwapRequests = async (storeId) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.GET_STORE_SWAPS(storeId));
  return response.data;
};

/**
 * Nhân viên lấy danh sách các đơn đổi/chuyển ca của chính mình.
 */
export const getMySwapRequests = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.GET_MY_SWAPS);
  return response.data;
};

/**
 * Lấy danh sách đồng nghiệp cùng chi nhánh để chọn đổi/chuyển ca.
 */
export const getColleaguesForSwap = async (branchId) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.GET_COLLEAGUES(branchId));
  return response.data;
};

/**
 * Lấy danh sách các ca làm việc tương lai của đồng nghiệp để chọn đổi.
 */
export const getColleagueShifts = async (colleagueEmployeeId) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SHIFTS.GET_COLLEAGUE_SHIFTS(colleagueEmployeeId));
  return response.data;
};

export default {
  getShiftTemplates,
  getWeeklyScheduleMatrix,
  generateWeeklySchedule,
  updateScheduleRequirement,
  assignFullTimeBatch,
  assignSingleShift,
  deleteShiftAssignment,
  checkWeeklyConflicts,
  publishWeeklySchedule,
  autoScheduleWeekly,
  createSwapRequest,
  reviewSwapRequest,
  getStoreSwapRequests,
  getMySwapRequests,
  getColleaguesForSwap,
  getColleagueShifts,
};

