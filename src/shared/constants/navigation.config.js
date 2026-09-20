/**
 * Cấu hình danh mục Menu Sidebar phân quyền theo từng Vai trò (Role-Based Navigation Configuration)
 */

export const NAV_ITEMS_BY_ROLE = {
  // 1. Quản trị Vận Hành (Operations Admin)
  OPERATIONS_ADMIN: [
    { id: 'dashboard', label: 'Bảng Điều Khiển Overview', icon: 'home', path: '/dashboard' },
    {
      id: 'master-data-group',
      label: 'Quản Trị Master Data',
      icon: 'building',
      children: [
        { id: 'employees', label: 'Khai Báo & Quản Lý Nhân Sự', icon: 'users', path: '/employees' },
        { id: 'branches', label: 'Danh mục Chi nhánh & Kiosk', icon: 'store', path: '/branches' },
        { id: 'shift-master', label: 'Bộ Khung Ca Mẫu', icon: 'calendar', path: '/shifts/templates' },
        { id: 'dispatch-network', label: 'Ma Trận Điều Động Chi Nhánh', icon: 'pulse', path: '/admin/dispatch-network' },
      ],
    },
  ],

  // 2. Quản lý Cửa hàng (Store Manager)
  STORE_MANAGER: [
    { id: 'dashboard', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    {
      id: 'store-mgmt-group',
      label: 'Quản Lý Nhân Sự & Ca Trực',
      icon: 'users',
      children: [
        { id: 'employees', label: 'Khai Báo Nhân Sự Chi Nhánh', icon: 'users', path: '/employees' },
        { id: 'store-schedules', label: 'Lịch Phân Công Ca Tuần', icon: 'calendar', path: '/store-manager/schedules' },
        { id: 'shift-requests', label: 'Duyệt Đơn Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'dispatches', label: 'Điều Động Nhân Sự', icon: 'users', path: '/store-manager/dispatches' },
        { id: 'kiosk-codes', label: 'Quản Lý Trạm Kiosk', icon: 'screen', path: '/store-manager/kiosk-codes' },
      ],
    },
  ],

  // 3. Chủ Doanh Nghiệp (Business Owner)
  BUSINESS_OWNER: [
    { id: 'dashboard', label: 'Bảng Điều Khiển Tổng Quan', icon: 'home', path: '/dashboard' },
    {
      id: 'owner-mgmt-group',
      label: 'Quản Trị Hệ Thống & Audit',
      icon: 'building',
      children: [
        { id: 'employees', label: 'Hồ Sơ Nhân Sự Chuỗi', icon: 'users', path: '/employees' },
        { id: 'branches', label: 'Giám Sát Chi Nhánh', icon: 'store', path: '/branches' },
        { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'calendar', path: '/shifts/templates' },
        { id: 'dispatch-network', label: 'Ma Trận Điều Động Chi Nhánh', icon: 'pulse', path: '/admin/dispatch-network' },
      ],
    },
  ],

  // 4. Trưởng Ca Trực (Shift Leader)
  SHIFT_LEADER: [
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    {
      id: 'leader-tools-group',
      label: 'Giám Sát & Tiện Ích Trưởng Ca',
      icon: 'pulse',
      children: [
        { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
        { id: 'live-roster', label: 'Bảng Trực Ca Live (Giám Sát Real-time)', icon: 'pulse', path: '/store-manager/live-roster' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
        { id: 'shift-handover', label: 'Bàn Giao Ca Trực', icon: 'lock' },
      ],
    },
  ],

  // 5. Thu Ngân (Cashier)
  CASHIER: [
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    {
      id: 'cashier-tools-group',
      label: 'Tiện Ích Thu Ngân',
      icon: 'pulse',
      children: [
        { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
        { id: 'cash-handover', label: 'Bàn Giao Két Tiền', icon: 'lock' },
      ],
    },
  ],

  // 6. Nhân Viên Bán Hàng (Sales Staff)
  SALES_STAFF: [
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    {
      id: 'sales-tools-group',
      label: 'Tiện Ích Bán Hàng',
      icon: 'pulse',
      children: [
        { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
      ],
    },
  ],

  // 7. Nhân Viên Bảo Vệ (Security Guard)
  SECURITY_GUARD: [
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    {
      id: 'security-tools-group',
      label: 'Tiện Ích Ca Trực',
      icon: 'pulse',
      children: [
        { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
        { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock' },
      ],
    },
  ],

  // Alias fallbacks
  SECURITY: [
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    {
      id: 'security-tools-group',
      label: 'Tiện Ích Ca Trực',
      icon: 'pulse',
      children: [
        { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
        { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock' },
      ],
    },
  ],

  // General Staff / Employee
  EMPLOYEE: [
    { id: 'my-calendar', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/my-calendar' },
    {
      id: 'employee-tools-group',
      label: 'Tiện Ích Nhân Viên',
      icon: 'pulse',
      children: [
        { id: 'shift-requests', label: 'Đơn Xin Đổi & Điều Chỉnh Lịch', icon: 'document', path: '/employee/shift-requests' },
        { id: 'attendance-otp', label: 'Mã Điểm Danh Kiosk (OTP)', icon: 'screen', path: '/employee/attendance-otp' },
        { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', path: '/employee/attendance-history' },
      ],
    },
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
