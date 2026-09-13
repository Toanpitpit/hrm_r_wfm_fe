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
});

