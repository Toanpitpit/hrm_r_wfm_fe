# 🌐 Context — React Context & Providers

## Mục đích
Thư mục `context/` chứa các **React Context** và **Provider** để quản lý global state thay thế Redux.

## Cấu trúc

```
context/
├── README.md
├── AuthContext.jsx       ← Quản lý trạng thái đăng nhập
├── ThemeContext.jsx      ← Quản lý theme (light/dark)
└── ...
```

## Quy tắc

1. **Đặt tên**: PascalCase + hậu tố `Context.jsx` → `AuthContext.jsx`.
2. **Mỗi context = 1 file**, export cả:
   - `Provider` component (bọc ở App level).
   - Custom hook tiêu thụ (`useAuth`, `useTheme`,...).
3. **KHÔNG** đặt API calls trong context — gọi qua `services/`, xử lý trong hook.
4. Sử dụng `useMemo` cho context value để tránh re-render không cần thiết.
5. Sử dụng `useCallback` cho các hàm trong context.

## Ví dụ — `AuthContext.jsx`

```jsx
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('accessToken', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
  }, []);

  // useMemo để tránh re-render không cần thiết
  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook tiêu thụ
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
```

## Cách sử dụng

### Bọc Provider ở App level (`main.jsx` hoặc `App.jsx`)
```jsx
import { AuthProvider } from '@/context/AuthContext';

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
```

### Sử dụng hook trong component
```jsx
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Xin chào, {user.name}</span>
          <button onClick={logout}>Đăng xuất</button>
        </>
      ) : (
        <a href="/login">Đăng nhập</a>
      )}
    </nav>
  );
};
```
