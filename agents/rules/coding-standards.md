# 📏 Coding Standards — Quy tắc bắt buộc khi sử dụng AI sinh code

## Mục đích
File này định nghĩa các **quy tắc bắt buộc** mà AI phải tuân thủ khi sinh code cho dự án.  
**Mọi thành viên** phải đính kèm file này (hoặc tham chiếu nội dung) khi yêu cầu AI tạo code.

---

## 1. Cấu trúc thư mục (Modular Architecture)

Dự án sử dụng **Modular Architecture** — code được tổ chức theo **phân hệ nghiệp vụ**.
AI phải đặt file đúng vị trí theo quy tắc sau:

### Code thuộc nghiệp vụ cụ thể → `modules/[tên_module]/`

| Loại file | Đặt tại | Ví dụ |
|---|---|---|
| UI Component của module | `modules/[module]/components/` | `modules/employee/components/EmployeeCard/index.jsx` |
| Trang của module | `modules/[module]/pages/` | `modules/employee/pages/EmployeeListPage/index.jsx` |
| Gọi API của module | `modules/[module]/services/` | `modules/employee/services/employee.service.js` |
| Custom Hook của module | `modules/[module]/hooks/` | `modules/employee/hooks/useEmployeeList.js` |
| Context của module | `modules/[module]/context/` | `modules/auth/context/AuthContext.jsx` |

### Code dùng chung cho nhiều module → `shared/`

| Loại file | Đặt tại | Ví dụ |
|---|---|---|
| UI Component dùng chung | `shared/components/` | `shared/components/Button/index.jsx` |
| Custom Hook dùng chung | `shared/hooks/` | `shared/hooks/useDebounce.js` |
| Hằng số dùng chung | `shared/constants/` | `shared/constants/api.constants.js` |
| Context dùng chung | `shared/context/` | `shared/context/ThemeContext.jsx` |
| Utility functions | `shared/utils/` | `shared/utils/format.utils.js` |

### Code hạ tầng (không thuộc module nào)

| Loại file | Đặt tại | Ví dụ |
|---|---|---|
| Cấu hình | `src/config/` | `axios.config.js` |
| CSS Global | `src/styles/` | `variables.css` |
| Định tuyến | `src/routers/` | `AppRouter.jsx` |
| Tài nguyên tĩnh | `src/assets/` | `logo.svg` |

> ⚠️ **KHÔNG import chéo giữa các module.** Nếu 2 module cần dùng chung → chuyển vào `shared/`.

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

// 2. Config
import axiosInstance from '@/config/axios.config';

// 3. Shared — Context, Hooks, Constants, Utils
import { useAuth } from '@/modules/auth/context/AuthContext';
import useDebounce from '@/shared/hooks/useDebounce';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import { formatDate } from '@/shared/utils/format.utils';

// 4. Module-level — Services, Hooks (relative path)
import { getEmployees } from '../services/employee.service';
import useEmployeeList from '../hooks/useEmployeeList';

// 5. Shared Components
import Button from '@/shared/components/Button';

// 6. Module-level Components (relative path)
import EmployeeCard from '../components/EmployeeCard';

// 7. Styles & Assets
import styles from './EmployeeListPage.module.css';
import logo from '@/assets/logo.svg';
```

### Import Rules
```jsx
// ✅ Import từ shared (absolute path)
import Button from '@/shared/components/Button';

// ✅ Import trong cùng module (relative path)
import EmployeeCard from '../components/EmployeeCard';

// ✅ Import config (absolute path)
import axiosInstance from '@/config/axios.config';

// ❌ KHÔNG import từ module khác
import AttendanceCard from '@/modules/attendance/components/AttendanceCard';
```

---

## 5. Quy tắc Component

### Dumb Component (trong `shared/components/` hoặc `modules/[tên]/components/`)
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

### Container / Page (trong `modules/[tên]/pages/`)
```jsx
// ✅ Lấy dữ liệu qua hooks, truyền xuống components
import useEmployeeList from '../hooks/useEmployeeList';
import EmployeeCard from '../components/EmployeeCard';
import Loading from '@/shared/components/Loading';

const EmployeeListPage = () => {
  const { employees, isLoading } = useEmployeeList();
  
  if (isLoading) return <Loading />;
  
  return (
    <div className={styles.container}>
      {employees.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
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
