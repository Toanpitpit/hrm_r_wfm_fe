# 📋 Constants — Hằng số dùng chung

## Mục đích
Thư mục `constants/` chứa các hằng số, giá trị cố định được dùng lại ở nhiều nơi trong dự án.

## Cấu trúc

```
constants/
├── README.md
├── api.constants.js       ← Danh sách API endpoints
├── message.constants.js   ← Thông báo lỗi / thành công
├── app.constants.js       ← Cấu hình app (page size, roles,...)
└── ...
```

## Quy tắc

1. **Đặt tên file**: `[module].constants.js` (camelCase).
2. **Đặt tên biến**: UPPER_SNAKE_CASE → `API_BASE_URL`, `MAX_PAGE_SIZE`.
3. **Export** dưới dạng `const` hoặc object frozen.
4. **KHÔNG** đặt logic xử lý trong constants — chỉ chứa giá trị thuần.
5. Nhóm các hằng số liên quan vào cùng 1 object.

## Ví dụ — `api.constants.js`

```javascript
/**
 * Danh sách tất cả API endpoints trong dự án.
 * Sử dụng cùng với Axios instance từ config/axios.config.js.
 */
export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },
});
```

## Ví dụ — `message.constants.js`

```javascript
export const MESSAGES = Object.freeze({
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công!',
    REGISTER: 'Đăng ký thành công!',
    SAVE: 'Lưu thành công!',
    DELETE: 'Xóa thành công!',
  },
  ERROR: {
    NETWORK: 'Lỗi kết nối mạng. Vui lòng thử lại.',
    UNAUTHORIZED: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
    NOT_FOUND: 'Không tìm thấy dữ liệu.',
    SERVER: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  },
});
```
