/**
 * Cấu hình danh mục Menu Sidebar phân quyền theo từng Vai trò (Role-Based Navigation Configuration)
 * Chuẩn hóa 100% theo giao diện phẳng Apex Dashboard (Group headers + Flat clean items).
 */

export const NAV_ITEMS_BY_ROLE = {
  // 1. Quản trị Vận Hành (Operations Admin)
  OPERATIONS_ADMIN: [
<<<<<<< Updated upstream
    { id: 'dashboard', label: 'Bảng Điều Khiển Overview', icon: 'home', path: '/dashboard' },
    { type: 'group', label: 'Quản trị Master Data' },
    { id: 'employees', label: 'Khai Báo & Quản Lý Nhân Sự', icon: 'users', path: '/employees' },
    { id: 'branches', label: 'Danh mục Chi nhánh & Kiosk', icon: 'store', path: '/branches' },
    { id: 'shift-master', label: 'Bộ Khung Ca Mẫu', icon: 'calendar', path: '/shifts/templates' },
    { id: 'dispatch-network', label: 'Ma Trận Điều Động Chi Nhánh', icon: 'pulse', path: '/admin/dispatch-network' },
=======
    { type: 'group', label: 'OVERVIEW' },
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { type: 'group', label: 'VẬN HÀNH & HỆ THỐNG' },
    { id: 'employees', label: 'Hồ Sơ Nhân Sự', icon: 'users', path: '/employees' },
    { id: 'branches', label: 'Chi Nhánh & Kiosk', icon: 'pin', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Mẫu', icon: 'clock', path: '/shifts/templates' },
    { id: 'dispatch-network', label: 'Điều Động Chi Nhánh', icon: 'pulse', path: '/admin/dispatch-network' },
>>>>>>> Stashed changes
  ],

  // 2. Quản lý Cửa hàng (Store Manager)
  STORE_MANAGER: [
<<<<<<< Updated upstream
    { id: 'dashboard', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { type: 'group', label: 'Quản Lý Nhân Sự & Ca Trực' },
    { id: 'employees', label: 'Khai Báo Nhân Sự Chi Nhánh', icon: 'users', path: '/employees' },
    { id: 'store-schedules', label: 'Lịch Phân Công Ca Tuần', icon: 'calendar', path: '/store-manager/schedules' },
    { id: 'shift-requests', label: 'Duyệt Đơn Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'dispatches', label: 'Điều Động Nhân Sự', icon: 'users', path: '/store-manager/dispatches' },
    { id: 'kiosk-codes', label: 'Quản Lý Trạm Kiosk', icon: 'screen', path: '/store-manager/kiosk-codes' },
=======
    { type: 'group', label: 'OVERVIEW' },
    { id: 'weekly-schedules', label: 'Phân Ca Tuần', icon: 'calendar', path: '/store-manager/schedules' },
    { type: 'group', label: 'QUẢN LÝ NHÂN SỰ & KIOSK' },
    { id: 'employees', label: 'Nhân Sự Chi Nhánh', icon: 'users', path: '/employees' },
    { id: 'shift-requests', label: 'Duyệt Đơn Đổi Ca', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'dispatches', label: 'Điều Động Nhân Sự', icon: 'users', path: '/store-manager/dispatches' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
>>>>>>> Stashed changes
  ],

  // 3. Chủ Doanh Nghiệp (Business Owner)
  BUSINESS_OWNER: [
<<<<<<< Updated upstream
    { id: 'dashboard', label: 'Bảng Điều Khiển Tổng Quan', icon: 'home', path: '/dashboard' },
    { type: 'group', label: 'Quản Trị Hệ Thống & Audit' },
    { id: 'employees', label: 'Hồ Sơ Nhân Sự Chuỗi', icon: 'users', path: '/employees' },
    { id: 'branches', label: 'Giám Sát Chi Nhánh', icon: 'store', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'calendar', path: '/shifts/templates' },
    { id: 'dispatch-network', label: 'Ma Trận Điều Động Chi Nhánh', icon: 'pulse', path: '/admin/dispatch-network' },
=======
    { type: 'group', label: 'OVERVIEW' },
    { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: 'dashboard', path: '/dashboard' },
    { type: 'group', label: 'QUẢN TRỊ DOANH NGHIỆP' },
    { id: 'employees', label: 'Hồ Sơ Nhân Sự Chuỗi', icon: 'users', path: '/employees' },
    { id: 'branches', label: 'Danh Mục Chi Nhánh', icon: 'pin', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'clock', path: '/shifts/templates' },
    { id: 'dispatch-network', label: 'Điều Động Chuỗi', icon: 'pulse', path: '/admin/dispatch-network' },
>>>>>>> Stashed changes
  ],

  // 4. Trưởng Ca Trực (Shift Leader)
  SHIFT_LEADER: [
<<<<<<< Updated upstream
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Giám Sát & Tiện Ích Trưởng Ca' },
    { id: 'live-roster', label: 'Bảng Trực Ca Live (Giám Sát Real-time)', icon: 'pulse', path: '/store-manager/live-roster' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'shift-handover', label: 'Bàn Giao Ca Trực', icon: 'lock' },
=======
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TRƯỞNG CA TRỰC' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'live-roster', label: 'Giám Sát Ca Trực Live', icon: 'pulse', path: '/store-manager/live-roster' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
>>>>>>> Stashed changes
  ],

  // 5. Thu Ngân (Cashier)
  CASHIER: [
<<<<<<< Updated upstream
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Thu Ngân' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'cash-handover', label: 'Bàn Giao Két Tiền', icon: 'lock' },
=======
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
>>>>>>> Stashed changes
  ],

  // 6. Nhân Viên Bán Hàng (Sales Staff)
  SALES_STAFF: [
<<<<<<< Updated upstream
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Bán Hàng' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
=======
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
>>>>>>> Stashed changes
  ],

  // 7. Nhân Viên Bảo Vệ (Security Guard)
  SECURITY_GUARD: [
<<<<<<< Updated upstream
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Ca Trực' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock' },
=======
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
>>>>>>> Stashed changes
  ],

  // Fallbacks
  SECURITY: [
<<<<<<< Updated upstream
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Ca Trực' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
    { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock' },
=======
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
>>>>>>> Stashed changes
  ],

  EMPLOYEE: [
<<<<<<< Updated upstream
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
    { type: 'group', label: 'Tiện Ích Nhân Viên' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
=======
    { type: 'group', label: 'CÁ NHÂN' },
    { id: 'my-calendar', label: 'Lịch Ca Của Tôi', icon: 'calendar', path: '/employee/my-calendar' },
    { type: 'group', label: 'TIỆN ÍCH' },
    { id: 'shift-requests', label: 'Đơn Đổi & Xin Nghỉ', icon: 'calendar', path: '/employee/shift-requests' },
    { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk', icon: 'screen', path: '/employee/attendance-otp' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'clock', path: '/employee/attendance-history' },
>>>>>>> Stashed changes
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
