import axios from 'axios';

// ==================== IN-MEMORY TOKEN STORAGE ====================
// BẢO MẬT: Access Token lưu hoàn toàn trong RAM (biến Javascript).
// Hacker có dùng tấn công XSS cũng KHÔNG THỂ trộm từ localStorage!
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const apiBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

/**
 * Axios Instance mặc định cho toàn bộ dự án.
 * - withCredentials = true: Tự động gửi và nhận HttpOnly Cookie (chứa Refresh Token).
 * - Tự động gắn Bearer token từ Memory vào mọi request.
 * - Khi gặp 401: Tự động kích hoạt cơ chế Silent Refresh ngầm.
 */
const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true, // BẮT BUỘC để gửi Cookie qua cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Quản lý hàng đợi khi nhiều API cùng nhận 401 khi token hết hạn
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==================== RESPONSE INTERCEPTOR ====================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp 401 và request chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || '';

      // Không refresh nếu chính request refresh, login, hoặc kiosk-login bị 401
      if (
        url.includes('/Auth/refresh') ||
        url.includes('Auth/refresh') ||
        url.includes('/Auth/login') ||
        url.includes('Auth/login') ||
        url.includes('/Auth/kiosk-login') ||
        url.includes('Auth/kiosk-login') ||
        url.includes('/Auth/google-login') ||
        url.includes('Auth/google-login') ||
        url.includes('/Auth/logout') ||
        url.includes('Auth/logout')
      ) {
        clearAccessToken();
        return Promise.reject(error);
      }

      // Nếu người dùng chưa từng đăng nhập (không có token trong memory và không có user), không gọi refresh làm gì
      if (!getAccessToken() && !localStorage.getItem('user')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đã có 1 request refresh đang chạy, các request khác chờ vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi ngầm lên Backend để lấy Access Token mới (Backend đọc Refresh Token từ HttpOnly Cookie)
        const refreshRes = await axios.post(
          `${apiBaseURL}Auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data?.success && refreshRes.data?.data?.token) {
          const newToken = refreshRes.data.data.token;
          setAccessToken(newToken);

          // Cập nhật thông tin user nếu có
          if (refreshRes.data.data.user) {
            localStorage.setItem('user', JSON.stringify(refreshRes.data.data.user));
          }

          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Silent refresh failed'), null);
          clearAccessToken();
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/kiosk-login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAccessToken();
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/kiosk-login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
