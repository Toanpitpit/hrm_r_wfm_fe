# ⚙️ Config — Cấu hình dự án

## Mục đích
Thư mục `config/` chứa các file thiết lập cấu hình cho dự án, bao gồm:
- Cấu hình **Axios instance** (base URL, interceptors, headers mặc định).
- Cấu hình **biến môi trường** (`import.meta.env`).
- Setup các **thư viện bên thứ 3** nếu cần.

## Cấu trúc

```
config/
├── README.md          ← Bạn đang đọc file này
└── axios.config.js    ← Axios instance mặc định
```

## Quy tắc

1. Mỗi thư viện/service cần config riêng → tạo file riêng: `[tên].config.js`
2. **KHÔNG** hard-code URL hay secret ở đây — dùng biến môi trường từ `.env`.
3. Axios interceptors xử lý:
   - **Request**: Tự động gắn token vào header.
   - **Response**: Xử lý lỗi chung (401 → redirect login, 500 → thông báo lỗi).

## Ví dụ — `axios.config.js`

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — tự động gắn token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```
