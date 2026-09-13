// Tiện ích dùng chung cho dashboard admin.

// Định dạng tiền tệ VND: 79000 -> "79.000đ"
export const fmtVND = (n) => n.toLocaleString('vi-VN') + 'đ';

// Định dạng số: 12840 -> "12.840"
export const fmtNum = (n) => n.toLocaleString('vi-VN');

// Chuyển mã màu hex (#f5b14a) sang rgba với độ trong suốt cho trước.
// Hỗ trợ cả dạng rút gọn (#fff).
export function hexA(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(245,177,74,${alpha})`;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (isNaN(n)) return `rgba(245,177,74,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
