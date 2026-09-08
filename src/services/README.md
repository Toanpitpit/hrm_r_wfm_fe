# 🔌 Services — Gọi API (Axios)

## Mục đích
Thư mục `services/` chứa các file gọi API backend bằng Axios.  
Mỗi module nghiệp vụ có **1 file service riêng**.

## Cấu trúc

```
services/
├── README.md
├── auth.service.js       ← Đăng nhập, đăng ký, logout
├── user.service.js       ← CRUD users
├── product.service.js    ← CRUD products
└── ...
```

## Quy tắc

1. **Đặt tên**: `[module].service.js` (camelCase).
2. **Import** Axios instance từ `@/config/axios.config`.
3. **Named export** mỗi hàm, đặt tên theo pattern `[hành_động][Đối_tượng]`:
   - `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`
4. **Chỉ xử lý Request/Response**:
   - ✅ Return `response.data` (dữ liệu sạch).
   - ❌ **KHÔNG** xử lý UI (loading, toast, redirect).
   - ❌ **KHÔNG** import React hay hooks.
5. **Endpoints** lấy từ `@/constants/api.constants.js`.
6. Thêm **JSDoc** mô tả params và return.

## Ví dụ — `auth.service.js`

```javascript
import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/constants/api.constants';

/**
 * Đăng nhập
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { accessToken, user }
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} - { user }
 */
export const register = async (userData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  return response.data;
};

/**
 * Lấy thông tin user hiện tại
 * @returns {Promise<Object>} - { user }
 */
export const getProfile = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
  return response.data;
};
```
