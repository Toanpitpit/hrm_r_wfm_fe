import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const KioskCodePage = lazy(() => import('@/modules/kiosk/pages/KioskCodePage'));
const StoreManagersPage = lazy(() => import('@/modules/employee/pages/StoreManagersPage'));
const EmployeeListPage = lazy(() => import('@/modules/employee/pages/EmployeeListPage'));

// Placeholder cho Kiosk login và dashboard
const KioskLoginPage = () => <div className="p-8 text-white">Kiosk Login Page (Mock)</div>;
const DashboardPage = () => <div className="p-8 text-white">Dashboard (Mock)</div>;

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/store-manager/kiosk-codes" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/kiosk-login" element={<KioskLoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/store-manager/kiosk-codes" element={<KioskCodePage />} />
          <Route path="/kiosk-management" element={<Navigate to="/store-manager/kiosk-codes" replace />} />
          
          {/* UC 1.4: Quản lý Tài khoản & Phân quyền Vận hành */}
          <Route path="/admin/store-managers" element={<StoreManagersPage />} />
          <Route path="/store-managers" element={<Navigate to="/admin/store-managers" replace />} />

          {/* UC 1.5 & UC 1.6: Quản lý Hồ sơ & Hợp đồng Nhân sự, Cấp mã PIN Kiosk */}
          <Route path="/admin/employees" element={<EmployeeListPage />} />
          <Route path="/store-manager/employees" element={<EmployeeListPage />} />
          <Route path="/employees" element={<Navigate to="/admin/employees" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};


export default AppRouter;
