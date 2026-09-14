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
    { id: 'dashboard', label: 'Tổng quan cửa hàng', icon: 'home', path: '/store-manager/kiosk-codes' },
    { type: 'group', label: 'Quản lý Kiosk & Điểm Danh' },
    { id: 'kiosk-codes', label: 'Mã Kích Hoạt Kiosk', icon: 'lock', path: '/store-manager/kiosk-codes' },
    { id: 'kiosk-list', label: 'Danh Sách Trạm Kiosk', icon: 'screen', onClick: () => alert('Tính năng Danh sách trạm Kiosk đang được phát triển.') },
    { id: 'attendance', label: 'Điểm Danh Chi Nhánh', icon: 'pulse', onClick: () => alert('Tính năng Điểm danh chi nhánh đang được phát triển.') },
    { type: 'group', label: 'Nhân sự & Lịch Ca Chi Nhánh' },
    { id: 'store-schedule', label: 'Lịch Ca Chi Nhánh', icon: 'calendar', onClick: () => alert('Tính năng Lịch ca chi nhánh đang được phát triển.') },
    { id: 'store-employees', label: 'Nhân sự Chi Nhánh', icon: 'users', onClick: () => alert('Tính năng Quản lý nhân sự chi nhánh đang được phát triển.') },
  ],

  // 3. Chủ Doanh Nghiệp (Business Owner)
  BUSINESS_OWNER: [
    { id: 'dashboard', label: 'Bảng Điều Khiển Tổng Quan', icon: 'home', path: '/dashboard' },
    { type: 'group', label: 'Báo Cáo & Audit System' },
    { id: 'branches', label: 'Giám Sát Chi Nhánh', icon: 'store', path: '/branches' },
    { id: 'shift-master', label: 'Khung Ca Hệ Thống', icon: 'calendar', path: '/shifts/templates' },
  ],

  // 4. Nhân Viên Bảo Vệ (Security)
  SECURITY: [
    { id: 'employee-schedule', label: 'Lịch Trực Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { type: 'group', label: 'Tiện Ích Ca Trực' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', onClick: () => alert('Tính năng Lịch sử điểm danh đang được phát triển.') },
    { id: 'employee-incidents', label: 'Báo Cáo Ca Trực & Sự Cố', icon: 'lock', onClick: () => alert('Tính năng Báo cáo sự cố ca trực đang được phát triển.') },
  ],

  // 5. Nhân Viên Cửa Hàng (Employee / Staff)
  EMPLOYEE: [
    { id: 'employee-schedule', label: 'Lịch Làm Việc Ca Tuần', icon: 'calendar', path: '/employee/schedule' },
    { type: 'group', label: 'Tiện Ích Nhân Viên' },
    { id: 'employee-attendance', label: 'Lịch Sử Điểm Danh', icon: 'pulse', onClick: () => alert('Tính năng Lịch sử điểm danh đang được phát triển.') },
  ],
};

/**
 * Hàm hỗ trợ lấy danh sách Menu phù hợp với Role
 */
export const getNavItemsForRole = (roleCode) => {
  const normalized = (roleCode || '').toUpperCase();
  return NAV_ITEMS_BY_ROLE[normalized] || NAV_ITEMS_BY_ROLE.OPERATIONS_ADMIN;
};
