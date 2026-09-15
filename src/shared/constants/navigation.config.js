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
    { id: 'weekly-schedules', label: 'Lịch Ca Chi Nhánh', icon: 'calendar', path: '/store-manager/schedules' },
    { type: 'group', label: 'Quản lý Kiosk & Điểm Danh' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { id: 'kiosk-list', label: 'Danh Sách Trạm Kiosk', icon: 'screen', onClick: () => alert('Tính năng Danh sách trạm Kiosk đang được phát triển.') },
    { id: 'attendance', label: 'Điểm Danh Chi Nhánh', icon: 'pulse', onClick: () => alert('Tính năng Điểm danh chi nhánh đang được phát triển.') },
    { type: 'group', label: 'Nhân sự Chi Nhánh' },
    { id: 'store-employees', label: 'Nhân sự Chi Nhánh', icon: 'users', onClick: () => alert('Tính năng Quản lý nhân sự chi nhánh đang được phát triển.') },
  ],

  // 3. Trưởng Ca Trực (Shift Leader)
  SHIFT_LEADER: [
    { id: 'weekly-schedules', label: 'Lịch Ca Chi Nhánh', icon: 'calendar', path: '/store-manager/schedules' },
    { id: 'employee-schedule', label: 'Lịch Làm Việc Cá Nhân', icon: 'clock', path: '/employee/schedule' },
    { type: 'group', label: 'Quản lý Kiosk & Điểm Danh' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { id: 'attendance', label: 'Điểm Danh & Bàn Giao Ca', icon: 'pulse', onClick: () => alert('Tính năng Điểm danh & Bàn giao ca đang được phát triển.') },
  ],

  // 4. Chủ Doanh Nghiệp (Business Owner)
  BUSINESS_OWNER: [
    { id: 'dashboard', label: 'Bảng Điều Khiển Tổng Quan', icon: 'home', path: '/dashboard' },
    { type: 'group', label: 'Báo Cáo & Audit System' },
    { id: 'branches', label: 'Giám Sát Chi Nhánh', icon: 'store', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'calendar', path: '/shifts/templates' },
  ],

  // 5. Nhân Viên Bán Hàng / Thu Ngân / Bảo Vệ (Store Staff)
  CASHIER: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/schedule' },
  ],
  SALES_STAFF: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/schedule' },
  ],
  SECURITY_GUARD: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Cá Nhân', icon: 'calendar', path: '/employee/schedule' },
  ],
};

/**
 * Hàm hỗ trợ lấy danh sách Menu phù hợp với Role
 */
export const getNavItemsForRole = (roleCode) => {
  const normalized = (roleCode || '').toUpperCase();
  if (NAV_ITEMS_BY_ROLE[normalized]) {
    return NAV_ITEMS_BY_ROLE[normalized];
  }
  if (normalized.includes('LEADER')) {
    return NAV_ITEMS_BY_ROLE.SHIFT_LEADER;
  }
  if (normalized.includes('MANAGER')) {
    return NAV_ITEMS_BY_ROLE.STORE_MANAGER;
  }
  if (normalized.includes('OWNER')) {
    return NAV_ITEMS_BY_ROLE.BUSINESS_OWNER;
  }
  if (normalized.includes('STAFF') || normalized.includes('CASHIER') || normalized.includes('SECURITY') || normalized.includes('EMPLOYEE')) {
    return NAV_ITEMS_BY_ROLE.CASHIER;
  }
  return NAV_ITEMS_BY_ROLE.OPERATIONS_ADMIN;
};
