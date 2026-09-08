# 🛤️ Routers — Cấu hình định tuyến

## Mục đích
Thư mục `routers/` chứa cấu hình **React Router DOM** để quản lý navigation giữa các pages.

## Cấu trúc

```
routers/
├── README.md
├── AppRouter.jsx          ← Router chính, khai báo tất cả routes
├── ProtectedRoute.jsx     ← HOC bảo vệ route cần xác thực
└── routes.js              ← Danh sách route config (path, component, auth)
```

## Quy tắc

1. **Tập trung tất cả routes** vào 1 file `AppRouter.jsx` hoặc `routes.js`.
2. Sử dụng `React.lazy()` + `Suspense` cho **lazy loading** pages.
3. Routes cần đăng nhập → bọc trong `ProtectedRoute`.
4. **KHÔNG** khai báo route rải rác trong components/pages.
5. Đặt tên route path theo chuẩn: kebab-case, viết thường → `/user-list`, `/product-detail/:id`.

## Ví dụ — `AppRouter.jsx`

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Loading from '@/components/Loading';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
```

## Ví dụ — `ProtectedRoute.jsx`

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```
