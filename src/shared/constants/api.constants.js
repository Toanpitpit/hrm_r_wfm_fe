/**
 * Danh sách tất cả API endpoints trong dự án.
 * Sử dụng cùng với Axios instance từ @/config/axios.config.js
 *
 * Ví dụ:
 *   import { API_ENDPOINTS } from '@/constants/api.constants';
 *   axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
 */
export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh',
  },
  KIOSK: {
    CREATE_CODE: '/kiosk/create-code',
    ACTIVATE: '/kiosk/activate',
    VERIFY_TOKEN: '/kiosk/verify-token',
    GET_BY_STORE: (storeId) => `/kiosk/store/${storeId}`,
    DEACTIVATE: (kioskId) => `/kiosk/${kioskId}`,
  },
  SHIFTS: {
    TEMPLATES: '/shifts/templates',
    WEEKLY_MATRIX: (branchId, weekStartDate) => `/shifts/schedules/weekly-matrix?branchId=${branchId}&weekStartDate=${weekStartDate}`,
    GENERATE_WEEKLY: '/shifts/schedules/generate-weekly',
    UPDATE_REQUIREMENT: (scheduleId) => `/shifts/schedules/${scheduleId}/requirements`,
    ASSIGN_FULLTIME_BATCH: '/shifts/assignments/assign-fulltime-batch',
    ASSIGN_BATCH: '/shifts/assignments/batch',
    ASSIGN_SINGLE: '/shifts/assign',
    DELETE_ASSIGNMENT: (assignmentId) => `/shifts/assignments/${assignmentId}`,
    CHECK_CONFLICTS: (branchId, weekStartDate) => `/shifts/schedules/check-conflicts?branchId=${branchId}&weekStartDate=${weekStartDate}`,
    PUBLISH_WEEKLY: '/shifts/schedules/publish-weekly',
    AUTO_SCHEDULE: '/shifts/schedules/auto-schedule',
    SWAP_REQUEST: '/shifts/swap-request',
    SWAP_REVIEW: '/shifts/swap-review',
    GET_STORE_SWAPS: (storeId) => `/shifts/swap-requests/${storeId}`,
    GET_MY_SWAPS: '/shifts/my-swap-requests',
    GET_COLLEAGUES: (branchId) => `/shifts/colleagues/${branchId}`,
    GET_COLLEAGUE_SHIFTS: (empId) => `/shifts/colleague-shifts/${empId}`,
  },
  ATTENDANCE: {
    MY_WEEKLY_SCHEDULE: (weekStart) => `attendance/my-weekly-schedule?weekStart=${weekStart}`,
    MY_ATTENDANCE_HISTORY: (month, year) => `attendance/my-attendance-history?month=${month}&year=${year}`,
  },
});

