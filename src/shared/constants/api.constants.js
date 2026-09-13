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
  USERS: {
    STORE_MANAGERS: '/users/store-managers',
    TOGGLE_STATUS: (id) => `/users/${id}/status`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
    EMPLOYEES: '/users/employees',
    EMPLOYEE_BY_ID: (id) => `/users/employees/${id}`,
    RESET_PIN: (id) => `/users/employees/${id}/reset-pin`,
    ROLES: '/users/roles',
  },
  STORES: {
    GET_ALL: '/stores',
    GET_BY_ID: (id) => `/stores/${id}`,
  },
});

