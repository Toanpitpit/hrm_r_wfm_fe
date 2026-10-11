/**
 * ==============================================================================
 * MODULE: Khung Ca Mẫu (Shift Master Template)
 * CONSTANTS: shift.constants.js
 * ==============================================================================
 * Nơi lưu trữ tập trung:
 * - Màu sắc định danh ca làm việc
 * - Cấu hình loại ca, phạm vi, chế độ
 * - Thông báo lỗi nghiệp vụ chuẩn hóa tiếng Việt
 */

// Bảng màu nhận diện loại ca chuẩn toàn hệ thống
export const SHIFT_TYPE_COLORS = {
  Morning: {
    primary: '#38bdf8', // Xanh dương tươi
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
    label: 'Ca Sáng',
  },
  Afternoon: {
    primary: '#f59e0b', // Vàng cam ấm
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    label: 'Ca Chiều',
  },
  Night: {
    primary: '#a855f7', // Tím neon ca đêm
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.35)',
    label: 'Ca Đêm',
  },
  Other: {
    primary: '#10b981', // Xanh lá / Khác
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    label: 'Khác',
  },
};

// Lấy màu hiển thị theo shiftType hoặc fallback
export const getShiftTypeColor = (type, isOvernight = false) => {
  if (isOvernight || type === 'Night') return SHIFT_TYPE_COLORS.Night.primary;
  if (type === 'Morning') return SHIFT_TYPE_COLORS.Morning.primary;
  if (type === 'Afternoon') return SHIFT_TYPE_COLORS.Afternoon.primary;
  if (type === 'Other' || type === 'PartTime') return SHIFT_TYPE_COLORS.Other.primary;
  return SHIFT_TYPE_COLORS.Morning.primary;
};

// Danh mục loại ca
export const SHIFT_TYPES = [
  { value: 'Morning', label: 'Ca Sáng (06:00 - 14:00)' },
  { value: 'Afternoon', label: 'Ca Chiều (14:00 - 22:00)' },
  { value: 'Night', label: 'Ca Đêm (22:00 - 06:00)' },
  { value: 'Other', label: 'Khác (Linh hoạt / Part-time)' },
];

// Chế độ ca của chi nhánh
export const BRANCH_SHIFT_MODES = {
  GLOBAL: {
    value: 'GLOBAL',
    label: 'Dùng ca chung',
    badgeText: 'Ca chung',
    badgeTone: 'neutral',
  },
  CUSTOM: {
    value: 'CUSTOM',
    label: 'Dùng ca riêng',
    badgeText: 'Ca riêng',
    badgeTone: 'accent',
  },
};

// Phạm vi ca
export const SHIFT_SCOPES = {
  GLOBAL: 'GLOBAL',
  BRANCH: 'BRANCH',
};

// Thông báo lỗi nghiệp vụ
export const SHIFT_ERROR_MESSAGES = {
  NO_ACTIVE_CUSTOM_SHIFT:
    'Chi nhánh chưa có ca riêng nào đang áp dụng, hãy thêm ca riêng trước.',
  FUTURE_SCHEDULES_EXIST: (count = 0) =>
    `Có ${count} ca đã xếp trong tương lai thuộc bộ ca hiện tại. Lịch đã xếp giữ nguyên, chỉ áp dụng cho lịch xếp mới.`,
  IMPACT_CONFIRM_REQUIRED: (count = 0) =>
    `Thay đổi này ảnh hưởng ${count} chi nhánh đang dùng ca chung.`,
  BRANCH_LOCKED:
    'Chi nhánh đang bị khóa, không thể thay đổi thiết lập khung ca.',
  DUPLICATE_TIME:
    'Khung giờ làm việc này trùng hoặc chồng lấn với ca khác trong cùng bộ ca.',
  DUPLICATE_CODE: 'Mã khung ca đã tồn tại trong hệ thống.',
};

export const SHIFT_POLICY_BANNER_TEXT =
  'Mỗi chi nhánh dùng bộ ca chung của chuỗi hoặc bộ ca riêng của chính mình, không dùng lẫn cả hai.';
