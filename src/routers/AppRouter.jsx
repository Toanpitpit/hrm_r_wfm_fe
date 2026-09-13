import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ─── Lazy Load Pages ──────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
const EmployeeDashboardPage = lazy(() => import('@/modules/dashboard/pages/EmployeeDashboardPage'));
const KioskCodePage = lazy(() => import('@/modules/kiosk/pages/KioskCodePage'));
const BranchManagementPage = lazy(() => import('@/modules/branch/pages/BranchManagementPage'));
const ShiftMasterPage = lazy(() => import('@/modules/schedule/pages/ShiftMasterPage'));
const WeeklySchedulePage = lazy(() => import('@/modules/schedule/pages/WeeklySchedulePage'));

// Placeholder cho Kiosk login
const KioskLoginPage = () => (
  <div className="p-8 text-white">Kiosk Login Page (Mock)</div>
);

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#131313] text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f2ca50]"></div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ═══════════════ AUTHENTICATION ROUTES ═══════════════ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/kiosk-login" element={<KioskLoginPage />} />

          {/* ═══════════════ STORE MANAGER & SCHEDULES (UC 2.1 & 2.3) ═══════════════ */}
          <Route path="/store-manager/schedules" element={<WeeklySchedulePage />} />
          <Route path="/schedule" element={<Navigate to="/store-manager/schedules" replace />} />
          <Route path="/shifts" element={<Navigate to="/store-manager/schedules" replace />} />
          <Route path="/weekly-schedules" element={<Navigate to="/store-manager/schedules" replace />} />
          <Route path="/store-manager/kiosk-codes" element={<KioskCodePage />} />
          <Route path="/kiosk-codes" element={<Navigate to="/store-manager/kiosk-codes" replace />} />
          <Route path="/kiosk-management" element={<Navigate to="/store-manager/kiosk-codes" replace />} />

          {/* ═══════════════ EMPLOYEE & DASHBOARDS ═══════════════ */}
          <Route path="/dashboard" element={<EmployeeDashboardPage />} />
          <Route path="/employee/schedule" element={<EmployeeDashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/branches" element={<BranchManagementPage />} />
          <Route path="/shifts/templates" element={<ShiftMasterPage />} />

          {/* ═══════════════ FALLBACK ROUTE ═══════════════ */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;