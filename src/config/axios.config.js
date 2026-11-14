import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const apiBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config.url?.startsWith('/') && !config.url.startsWith('/api')) {
    config.url = config.url.slice(1);
  }
  if (!['get', 'head', 'options'].includes(config.method)) {
    config.headers['X-RWFM-Request'] = '1';
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url?.replace(/^\//, '');
    if (error.response?.status === 401 && url !== 'Auth/me' && localStorage.getItem('user')) {
      localStorage.removeItem('user');
      if (!['/login', '/kiosk-login'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
