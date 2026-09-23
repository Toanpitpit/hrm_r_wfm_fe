/**
 * Cấu hình danh mục Menu Sidebar phân quyền theo từng Vai trò (Role-Based Navigation Configuration)
 * Chuẩn hóa 100% theo giao diện phẳng Apex Dashboard (Group headers + Flat clean items).
 */

export const NAV_ITEMS_BY_ROLE = {
  // 1. Quản trị Vận Hành (Operations Admin)
  OPERATIONS_ADMIN: [
    { type: 'group', label: 'OVERVIEW' },
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { type: 'group', label: 'VẬN HÀNH & HỆ THỐNG' },
    { id: 'employees', label: 'Quản Lý Nhân Sự & Định Biên', icon: 'users', path: '/employees' },
    { id: 'branches', label: 'Chi Nhánh & Kiosk', icon: 'pin', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Mẫu', icon: 'clock', path: '/shifts/templates' },
    { id: 'dispatch-network', label: 'Điều Động Chi Nhánh', icon: 'pulse', path: '/admin/dispatch-network' },
  ],

  // 2. Quản lý Cửa hàng (Store Manager)
  STORE_MANAGER: [
    { type: 'group', label: 'OVERVIEW' },
    { id: 'weekly-schedules', label: 'Phân Ca Tuần', icon: 'calendar', path: '/store-manager/schedules' },
    { type: 'group', label: 'QUẢN LÝ NHÂN SỰ & KIOSK' },
    { id: 'employees', label: 'Nhân Sự & Định Biên Chi Nhánh', icon: 'users', path: '/employees' },
    { id: 'shift-requests', label: 'Duyệt Đơn Đổi Ca', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'dispatches', label: 'Điều Động Nhân Sự', icon: 'users', path: '/store-manager/dispatches' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
  ],

  // 3. Chủ Doanh Nghiệp (Business Owner)
  BUSINESS_OWNER: [
    { type: 'group', label: 'OVERVIEW' },
    { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: 'dashboard', path: '/dashboard' },
    { type: 'group', label: 'QUẢN TRỊ DOANH NGHIỆP' },
    { id: 'employees', label: 'Hồ Sơ Nhân Sự Chuỗi', icon: 'users', path: '/employees' },
    { id: 'branches', label: 'Danh Mục Chi Nhánh', icon: 'pin', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'clock', path: '/shifts/templates' },
    { id: 'dispatch-network', label: 'Điều Động Chuỗi', icon: 'pulse', path: '/admin/dispatch-network' },
  ],

  // 4. Trưởng Ca Trực (Shift Leader)
  SHIFT_LEADER: [
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TRƯỞNG CA TRỰC' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'live-roster', label: 'Giám Sát Ca Trực Live', icon: 'pulse', path: '/store-manager/live-roster' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
  ],

  // 5. Thu Ngân (Cashier)
  CASHIER: [
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
  ],

  // 6. Nhân Viên Bán Hàng (Sales Staff)
  SALES_STAFF: [
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
  ],

  // 7. Nhân Viên Bảo Vệ (Security Guard)
  SECURITY_GUARD: [
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
  ],

  // Fallbacks
  SECURITY: [
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
  ],

  EMPLOYEE: [
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
  ],
};

/**
 * Trả về danh sách Nav items tương ứng theo vai trò người dùng
 */
export function getNavItemsForRole(roleCode) {
  const normalized = (roleCode || '').toUpperCase().trim();
  if (NAV_ITEMS_BY_ROLE[normalized]) {
    return NAV_ITEMS_BY_ROLE[normalized];
  }
  if (normalized.includes('MANAGER')) return NAV_ITEMS_BY_ROLE.STORE_MANAGER;
  if (normalized.includes('LEADER')) return NAV_ITEMS_BY_ROLE.SHIFT_LEADER;
  if (normalized.includes('CASHIER')) return NAV_ITEMS_BY_ROLE.CASHIER;
  if (normalized.includes('SALES')) return NAV_ITEMS_BY_ROLE.SALES_STAFF;
  if (normalized.includes('GUARD') || normalized.includes('SECURITY')) return NAV_ITEMS_BY_ROLE.SECURITY_GUARD;
  if (normalized.includes('ADMIN')) return NAV_ITEMS_BY_ROLE.OPERATIONS_ADMIN;
  if (normalized.includes('OWNER')) return NAV_ITEMS_BY_ROLE.BUSINESS_OWNER;
  return NAV_ITEMS_BY_ROLE.EMPLOYEE;
}
