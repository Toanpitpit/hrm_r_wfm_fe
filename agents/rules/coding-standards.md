# 📏 Coding Standards — Quy tắc bắt buộc khi sử dụng AI sinh code

## Mục đích
File này định nghĩa các **quy tắc bắt buộc** mà AI phải tuân thủ khi sinh code cho dự án.  
**Mọi thành viên** phải đính kèm file này (hoặc tham chiếu nội dung) khi yêu cầu AI tạo code.

---

## 1. Cấu trúc thư mục

AI phải đặt file đúng vị trí theo cấu trúc sau:

| Loại file | Đặt tại | Ví dụ |
|---|---|---|
| UI Component dùng chung | `src/components/` | `Button/index.jsx` |
| Trang (Page) | `src/pages/` | `LoginPage/index.jsx` |
| Gọi API | `src/services/` | `auth.service.js` |
| Custom Hook | `src/hooks/` | `useDebounce.js` |
| React Context | `src/context/` | `AuthContext.jsx` |
| Hằng số | `src/constants/` | `api.constants.js` |
| Cấu hình | `src/config/` | `axios.config.js` |
| CSS Global | `src/styles/` | `variables.css` |
| Định tuyến | `src/routers/` | `AppRouter.jsx` |
| Tài nguyên tĩnh | `src/assets/` | `logo.svg` |

---

## 2. Quy tắc đặt tên

### Files & Folders
- **Components / Pages**: PascalCase, mỗi component 1 folder  
  ✅ `Button/index.jsx`, `LoginPage/index.jsx`  
  ❌ `button.jsx`, `login-page.jsx`

- **Services**: camelCase + hậu tố `.service.js`  
  ✅ `auth.service.js`, `user.service.js`  
  ❌ `AuthService.js`, `api-auth.js`

- **Hooks**: camelCase + tiền tố `use`  
  ✅ `useDebounce.js`, `useAuth.js`  
  ❌ `debounce-hook.js`, `AuthHook.js`

- **Constants**: camelCase + hậu tố `.constants.js`  
  ✅ `api.constants.js`, `message.constants.js`

- **Context**: PascalCase + hậu tố `Context.jsx`  
  ✅ `AuthContext.jsx`, `ThemeContext.jsx`

### Biến & Hàm
- **Biến / Hàm**: camelCase → `userName`, `fetchUserList()`
- **Hằng số**: UPPER_SNAKE_CASE → `API_BASE_URL`, `MAX_RETRY_COUNT`
- **Component**: PascalCase → `UserCard`, `LoginForm`
- **Boolean**: tiền tố `is/has/can/should` → `isLoading`, `hasPermission`

---

## 3. Quy tắc CSS / Styling

### CSS Modules (ưu tiên cho component-level)
```jsx
// ✅ Đúng cách
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>

// ❌ Sai cách
import './Button.css';
<button className="primary">Click</button>
```

### CSS Global (cho styles/ folder)
- Sử dụng chuẩn **BEM**: `block__element--modifier`
- Biến CSS đặt trong `:root` tại `styles/variables.css`

```css
/* ✅ Đúng cách */
:root {
  --color-primary: #3b82f6;
  --font-size-base: 16px;
}
.card__title--active { color: var(--color-primary); }

/* ❌ Sai cách */
.cardTitle.active { color: blue; }
```

---

## 4. Quy tắc Import

Thứ tự import bắt buộc (từ trên xuống):

```jsx
// 1. React & thư viện bên thứ 3
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Context & Hooks
import { useAuth } from '@/context/AuthContext';
import useDebounce from '@/hooks/useDebounce';

// 3. Services & Constants
import { getUsers } from '@/services/user.service';
import { API_ENDPOINTS } from '@/constants/api.constants';

// 4. Components
import Button from '@/components/Button';

// 5. Styles & Assets
import styles from './UserPage.module.css';
import logo from '@/assets/logo.svg';
```

---

## 5. Quy tắc Component

### Dumb Component (trong `components/`)
```jsx
// ✅ Chỉ nhận props, không gọi API, không có business logic
const Button = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {label}
    </button>
  );
};
export default Button;
```

### Container / Page (trong `pages/`)
```jsx
// ✅ Lấy dữ liệu qua hooks, truyền xuống components
const UserPage = () => {
  const { users, isLoading } = useUsers();
  
  if (isLoading) return <Loading />;
  
  return (
    <div className={styles.container}>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
};
```

---

## 6. Quy tắc Service

```jsx
// ✅ Chỉ xử lý Request/Response, trả dữ liệu sạch
import axiosInstance from '@/config/axios.config';

export const getUsers = async (params) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data;
};
```

---

## 7. Quy tắc Error Handling

- Service: dùng `try/catch` và throw error có message rõ ràng.
- Component/Hook: dùng state `error` để hiển thị thông báo cho user.
- **KHÔNG** dùng `console.log` trong production, dùng `console.error` cho lỗi nghiêm trọng.

---

## 8. Quy tắc Performance

- Dùng `useMemo` cho computed values tốn tài nguyên.
- Dùng `useCallback` cho callback functions truyền xuống component con.
- Dùng `React.memo()` cho components không cần re-render khi parent re-render.
- Dùng `React.lazy()` + `Suspense` cho code-splitting theo page.
