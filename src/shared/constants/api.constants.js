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
  BRANCHES: {
    LIST: '/branches',
    DETAIL: (id) => `/branches/${id}`,
    CREATE: '/branches',
    UPDATE: (id) => `/branches/${id}`,
    UPDATE_STATUS: (id) => `/branches/${id}/status`,
    UPGRADE_TIER: (id) => `/branches/${id}/upgrade-tier`,
    DELETE: (id) => `/branches/${id}`,
    STAFF_COUNT: (id) => `/branches/${id}/staff-count`,
    TIER_SUMMARY: '/branches/tier-summary',
    HEADCOUNT_STATUS: (id) => `/branches/${id}/headcount-status`,
    KIOSKS: (id) => `/branches/${id}/kiosks`,
  },
  KIOSKS: {
    LIST: '/kiosks',
    DETAIL: (id) => `/kiosks/${id}`,
    GET_BY_STORE: (storeId) => `/kiosks/store/${storeId}`,
    UPDATE: (id) => `/kiosks/${id}`,
    UPDATE_STATUS: (id) => `/kiosks/${id}/status`,
    DEACTIVATE: (id) => `/kiosks/${id}`,
  },
  KIOSK_AUTH: {
    CREATE_CODE: '/kiosk-auth/create-code',
    ACTIVATE: '/kiosk-auth/activate',
    VERIFY_TOKEN: '/kiosk-auth/verify-token',
    UNPAIR: '/kiosk-auth/unpair',
  },
  SHIFT_TEMPLATES: {
    BASE: '/shift-templates',
    STATS: '/shift-templates/stats',
  },
  SHIFT_SWAPS: {
    REQUEST: '/shift-swaps/swap-request',
    REVIEW: '/shift-swaps/swap-review',
    PEER_REVIEW: '/shift-swaps/swap-peer-review',
    CANCEL: (id) => `/shift-swaps/swap-cancel/${id}`,
    STORE_SWAPS: (storeId) => `/shift-swaps/swap-requests/${storeId}`,
    MY_SWAPS: '/shift-swaps/my-swap-requests',
    COLLEAGUES: (branchId) => `/shift-swaps/colleagues/${branchId}`,
    COLLEAGUE_SHIFTS: (empId) => `/shift-swaps/colleague-shifts/${empId}`,
  },
  SHIFTS: {
    ACCESSIBLE_BRANCHES: '/shifts/accessible-branches',
    TEMPLATES: '/shift-templates',
    WEEKLY_MATRIX: (branchId, weekStartDate) => `/shifts/schedules/weekly-matrix?branchId=${branchId}&weekStartDate=${weekStartDate}`,
    GENERATE_WEEKLY: '/shifts/schedules/generate-weekly',
    UPDATE_REQUIREMENT: (scheduleId) => `/shifts/schedules/${scheduleId}/requirements`,
    DELETE_SCHEDULE: (scheduleId) => `/shifts/schedules/${scheduleId}`,
    ASSIGN_FULLTIME_BATCH: '/shifts/assignments/assign-fulltime-batch',
    ASSIGN_BATCH: '/shifts/assignments/batch',
    ASSIGN_SINGLE: '/shifts/assign',
    DELETE_ASSIGNMENT: (assignmentId) => `/shifts/assignments/${assignmentId}`,
    CHECK_CONFLICTS: (branchId, weekStartDate) => `/shifts/schedules/check-conflicts?branchId=${branchId}&weekStartDate=${weekStartDate}`,
    PUBLISH_WEEKLY: '/shifts/schedules/publish-weekly',
    AUTO_SCHEDULE: '/shifts/schedules/auto-schedule',
    SWAP_REQUEST: '/shifts/swap-request',
    SWAP_REVIEW: '/shifts/swap-review',
    SWAP_PEER_REVIEW: '/shifts/swap-peer-review',
    SWAP_CANCEL: (id) => `/shifts/swap-cancel/${id}`,
    GET_STORE_SWAPS: (storeId) => `/shifts/swap-requests/${storeId}`,
    GET_MY_SWAPS: '/shifts/my-swap-requests',
    GET_COLLEAGUES: (branchId) => `/shifts/colleagues/${branchId}`,
    GET_COLLEAGUE_SHIFTS: (empId) => `/shifts/colleague-shifts/${empId}`,
    GET_MY_SHIFTS: (startDate, endDate) => `/shifts/my-shifts?startDate=${startDate}&endDate=${endDate}`,
    GET_EMPLOYEE_SHIFTS: (empId, startDate, endDate) => `/shifts/employee/${empId}?startDate=${startDate}&endDate=${endDate}`,
  },
  ATTENDANCE: {
    REQUEST_OTP: '/attendance/request-otp',
    LIVE_ROSTER: (storeId, date) => date ? `/attendance/live-roster?storeId=${storeId}&date=${date}` : `/attendance/live-roster?storeId=${storeId}`,
    HISTORY: (storeId, date) => date ? `/attendance/history?storeId=${storeId}&date=${date}` : `/attendance/history?storeId=${storeId}`,
    MY_WEEKLY_SCHEDULE: (weekStart) => `/attendance/my-weekly-schedule?weekStart=${weekStart}`,
    MY_ATTENDANCE_HISTORY: (month, year) => `/attendance/my-attendance-history?month=${month}&year=${year}`,
  },
  DISPATCH: {
    REQUEST: '/dispatches/request',
    UPDATE: (id) => `/dispatches/request/${id}`,
    DELETE: (id) => `/dispatches/request/${id}`,
    RECALL: (id) => `/dispatches/recall/${id}`,
    REVIEW: '/dispatches/review',
    STORE_DISPATCHES: (storeId) => `/dispatches/store/${storeId}`,
    ALL: '/dispatches/all',
    NETWORK_METRICS: '/dispatches/network-metrics',
    BRANCH_EMPLOYEES: (branchId) => `/dispatches/branch-employees/${branchId}`,
    BRANCH_QUOTA: (branchId) => `/dispatches/branch-quota/${branchId}`,
  },
});

