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
const LiveRosterDashboardPage = lazy(() => import('@/modules/attendance/pages/LiveRosterDashboardPage'));
const AttendanceOtpPage = lazy(() => import('@/modules/attendance/pages/AttendanceOtpPage'));
const EmployeeManagementPage = lazy(() => import('@/modules/employee/pages/EmployeeManagementPage'));

// Placeholder cho Kiosk login
const KioskLoginPage = () => (
  <div className="p-8 text-white">Kiosk Login Page (Mock)</div>
);

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#131313] text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f2ca50]"></div>
  </div>
);

const AdminProtectedRoute = ({ children }) => {
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const role = (user?.role || user?.Role || '').toUpperCase();
  const roleName = (user?.roleName || '').toUpperCase();

  if (role === 'STORE_MANAGER' || role.includes('MANAGER') || roleName.includes('QUẢN LÝ')) {
    return <Navigate to="/store-manager/kiosk-codes" replace />;
  }

  const isStaff = [
    'SHIFT_LEADER',
    'CASHIER',
    'SALES_STAFF',
    'SECURITY_GUARD',
    'SECURITY',
    'EMPLOYEE',
    'STAFF'
  ].includes(role) ||
  role.includes('LEADER') ||
  role.includes('CASHIER') ||
  role.includes('SALES') ||
  role.includes('STAFF') ||
  role.includes('EMPLOYEE') ||
  role.includes('SECURITY') ||
  roleName.includes('TRƯỞNG CA') ||
  roleName.includes('THU NGÂN') ||
  roleName.includes('BÁN HÀNG') ||
  roleName.includes('BẢO VỆ') ||
  roleName.includes('NHÂN VIÊN');

  if (isStaff) {
    return <Navigate to="/employee/schedule" replace />;
  }

  return children;
};

const ManagerOrAdminProtectedRoute = ({ children }) => {
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const role = (user?.role || user?.Role || '').toUpperCase();
  const roleName = (user?.roleName || '').toUpperCase();

  const isStaff = [
    'SHIFT_LEADER',
    'CASHIER',
    'SALES_STAFF',
    'SECURITY_GUARD',
    'SECURITY',
    'EMPLOYEE',
    'STAFF'
  ].includes(role) ||
  role.includes('LEADER') ||
  role.includes('CASHIER') ||
  role.includes('SALES') ||
  role.includes('STAFF') ||
  role.includes('EMPLOYEE') ||
  role.includes('SECURITY') ||
  roleName.includes('TRƯỞNG CA') ||
  roleName.includes('THU NGÂN') ||
  roleName.includes('BÁN HÀNG') ||
  roleName.includes('BẢO VỆ') ||
  roleName.includes('NHÂN VIÊN');

  if (isStaff) {
    return <Navigate to="/employee/schedule" replace />;
  }

  return children;
};

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

          {/* ═══════════════ EMPLOYEE MANAGEMENT & ONBOARDING (RBAC) ═══════════════ */}
          <Route
            path="/employees"
            element={
              <ManagerOrAdminProtectedRoute>
                <EmployeeManagementPage />
              </ManagerOrAdminProtectedRoute>
            }
          />
          <Route path="/admin/employees" element={<Navigate to="/employees" replace />} />
          <Route path="/store-manager/employees" element={<Navigate to="/employees" replace />} />

          {/* ═══════════════ STORE MANAGER & SCHEDULES (UC 2.1 & 2.3) ═══════════════ */}
          <Route path="/store-manager/schedules" element={<WeeklySchedulePage />} />
          <Route path="/store-manager/live-roster" element={<LiveRosterDashboardPage />} />
          <Route path="/live-roster" element={<Navigate to="/store-manager/live-roster" replace />} />
          <Route path="/schedule" element={<Navigate to="/store-manager/schedules" replace />} />
          <Route path="/shifts" element={<Navigate to="/store-manager/schedules" replace />} />
          <Route path="/weekly-schedules" element={<Navigate to="/store-manager/schedules" replace />} />
          <Route
            path="/store-manager/kiosk-codes"
            element={
              <StoreManagerProtectedRoute>
                <KioskCodePage />
              </StoreManagerProtectedRoute>
            }
          />
          <Route path="/kiosk-codes" element={<Navigate to="/store-manager/kiosk-codes" replace />} />
          <Route path="/kiosk-management" element={<Navigate to="/store-manager/kiosk-codes" replace />} />

          {/* ═══════════════ EMPLOYEE ROUTES ═══════════════ */}
          <Route path="/employee/schedule" element={<EmployeeDashboardPage />} />
          <Route path="/employee/attendance-otp" element={<AttendanceOtpPage />} />
          <Route path="/attendance-otp" element={<Navigate to="/employee/attendance-otp" replace />} />

          {/* ═══════════════ ADMIN & GENERAL ROUTES (Chặn Store Manager) ═══════════════ */}
          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <DashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <DashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/branches"
            element={
              <AdminProtectedRoute>
                <BranchManagementPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/shifts/templates"
            element={
              <AdminProtectedRoute>
                <ShiftMasterPage />
              </AdminProtectedRoute>
            }
          />

          {/* ═══════════════ FALLBACK ROUTE ═══════════════ */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;