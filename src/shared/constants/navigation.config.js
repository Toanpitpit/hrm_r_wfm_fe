/**
 * Cấu hình danh mục Menu Sidebar phân quyền theo từng Vai trò (Role-Based Navigation Configuration)
 */

export const NAV_ITEMS_BY_ROLE = {
  // 1. Quản trị Vận Hành (Operations Admin)
  OPERATIONS_ADMIN: [
    { id: 'dashboard', label: 'Bảng Điều Khiển Overview', icon: 'home', path: '/dashboard' },
    { type: 'group', label: 'Quản trị Master Data' },
    { id: 'branches', label: 'Danh mục Chi nhánh & Kiosk', icon: 'store', path: '/branches' },
    { id: 'shift-master', label: 'Bộ Khung Ca Mẫu', icon: 'calendar', path: '/shifts/templates' },
  ],

  // 2. Quản lý Cửa hàng (Store Manager)
  STORE_MANAGER: [
    { id: 'dashboard', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { type: 'group', label: 'Lịch Ca & Điểm Danh' },
    { id: 'store-schedules', label: 'Lịch Phân Công Ca Tuần', icon: 'calendar', path: '/store-manager/schedules' },
    { id: 'live-roster', label: 'Bảng Trực Ca Live', icon: 'pulse', path: '/store-manager/live-roster' },
    { id: 'kiosk-codes', label: 'Quản Lý Trạm Kiosk', icon: 'screen', path: '/store-manager/kiosk-codes' },
  ],

  // 3. Chủ Doanh Nghiệp (Business Owner)
  BUSINESS_OWNER: [
    { id: 'dashboard', label: 'Bảng Điều Khiển Tổng Quan', icon: 'home', path: '/dashboard' },
    { type: 'group', label: 'Báo Cáo & Audit System' },
    { id: 'branches', label: 'Giám Sát Chi Nhánh', icon: 'store', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'calendar', path: '/shifts/templates' },
  ],

  // 4. Trưởng Ca Trực (Shift Leader)
  SHIFT_LEADER: [
    { id: 'employee-schedule', label: 'Lịch Phân Công Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { id: 'my-calendar', label: 'Bộ Lịch Cá Nhân (Calendar)', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'live-roster', label: 'Bảng Trực Ca Live (Real-time)', icon: 'pulse', path: '/store-manager/live-roster' },
    { type: 'group', label: 'Tiện Ích Trưởng Ca' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'shift-handover', label: 'Bàn Giao Ca Trực', icon: 'lock', onClick: () => alert('Tính năng Bàn giao ca trực đang được phát triển.') },
  ],

  // 5. Thu Ngân (Cashier)
  CASHIER: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { id: 'my-calendar', label: 'Bộ Lịch Cá Nhân (Calendar)', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Thu Ngân' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'cash-handover', label: 'Bàn Giao Két Tiền', icon: 'lock', onClick: () => alert('Tính năng Bàn giao két tiền đang được phát triển.') },
  ],

  // 6. Nhân Viên Bán Hàng (Sales Staff)
  SALES_STAFF: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { id: 'my-calendar', label: 'Bộ Lịch Cá Nhân (Calendar)', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Bán Hàng' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
  ],

  // 7. Nhân Viên Bảo Vệ (Security Guard)
  SECURITY_GUARD: [
    { id: 'employee-schedule', label: 'Lịch Trực Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { id: 'my-calendar', label: 'Bộ Lịch Cá Nhân (Calendar)', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Ca Trực' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock', onClick: () => alert('Tính năng Báo cáo sự cố ca trực đang được phát triển.') },
  ],

  // Alias fallbacks
  SECURITY: [
    { id: 'employee-schedule', label: 'Lịch Trực Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { id: 'my-calendar', label: 'Bộ Lịch Cá Nhân (Calendar)', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Ca Trực' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock', onClick: () => alert('Tính năng Báo cáo sự cố ca trực đang được phát triển.') },
  ],

  // General Staff / Employee
  EMPLOYEE: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { id: 'my-calendar', label: 'Bộ Lịch Cá Nhân (Calendar)', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Nhân Viên' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
  ],
};

/**
 * Hàm hỗ trợ lấy danh sách Menu phù hợp với Role
 */
export const getNavItemsForRole = (roleCode) => {
  const normalized = (roleCode || '').toUpperCase().trim();

  if (normalized === 'SHIFT_LEADER' || normalized.includes('LEADER') || normalized.includes('TRƯỞNG CA')) {
    return NAV_ITEMS_BY_ROLE.SHIFT_LEADER;
  }
  if (normalized === 'CASHIER' || normalized.includes('THU NGÂN')) {
    return NAV_ITEMS_BY_ROLE.CASHIER;
  }
  if (normalized === 'SALES_STAFF' || normalized.includes('SALES') || normalized.includes('BÁN HÀNG')) {
    return NAV_ITEMS_BY_ROLE.SALES_STAFF;
  }
  if (normalized === 'SECURITY_GUARD' || normalized === 'SECURITY' || normalized.includes('BẢO VỆ')) {
    return NAV_ITEMS_BY_ROLE.SECURITY_GUARD;
  }
  if (normalized === 'STORE_MANAGER' || normalized.includes('QUẢN LÝ')) {
    return NAV_ITEMS_BY_ROLE.STORE_MANAGER;
  }
  if (normalized === 'BUSINESS_OWNER' || normalized.includes('OWNER')) {
    return NAV_ITEMS_BY_ROLE.BUSINESS_OWNER;
  }
  if (normalized === 'OPERATIONS_ADMIN' || normalized.includes('ADMIN')) {
    return NAV_ITEMS_BY_ROLE.OPERATIONS_ADMIN;
  }

  return NAV_ITEMS_BY_ROLE[normalized] || NAV_ITEMS_BY_ROLE.EMPLOYEE;
};
