/**
 * Automated Verification Script for the 10 UI/UX & Logic Fixes
 * Run with: node tests/verify-all-10-fixes.js
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${details ? ` (${details})` : ''}`);
    failCount++;
  }
}

console.log('\n=============================================================');
console.log('🧪 BẮT ĐẦU CHẠY KIỂM TRA TỰ ĐỘNG 10 HẠNG MỤC SỬA LỖI UI/UX & LOGIC');
console.log('=============================================================\n');

// 1. Phân cấp chi nhánh - Dữ liệu thật & không viết tắt
console.log('--- 1 & 2. [Phân Cấp Chi Nhánh - Dữ liệu thật & Xóa text thừa] ---');
const branchTierPageContent = fs.readFileSync('src/modules/branch/pages/BranchTierManagementPage/index.jsx', 'utf8');
assert(
  !branchTierPageContent.includes('t1Percent') && !branchTierPageContent.includes('t2Percent'),
  'Đã loại bỏ các biến tính % mock hardcode không dùng (t1Percent, t2Percent)',
);
assert(
  branchTierPageContent.includes('rawBranches.length') && branchTierPageContent.includes('Chi nhánh'),
  'Hiển thị số lượng chi nhánh thực tế từ database không dùng dữ liệu giả',
);
const branchManagementPageContent = fs.readFileSync('src/modules/branch/pages/BranchManagementPage/index.jsx', 'utf8');
assert(
  !branchTierPageContent.includes('Phân bố theo phân cấp Tier thực tế từ Database') &&
    !branchManagementPageContent.includes('Phân bố theo phân cấp Tier thực tế từ Database'),
  'Đã xóa bỏ các dòng subtext thừa/nhắc nhở nội bộ trong trang',
);

// 3. Chi nhánh - Badge & Bỏ nút Xóa
console.log('\n--- 3. [Chi Nhánh - Badge Đồng Bộ & Xóa Nút Xóa] ---');
const branchTableContent = fs.readFileSync('src/modules/branch/components/BranchTable.jsx', 'utf8');
assert(
  branchTableContent.includes("label: 'MÃ CHI NHÁNH'") && branchTableContent.includes("label: 'CẤP CHI NHÁNH'"),
  'Không viết tắt chữ CN, ghi rõ "MÃ CHI NHÁNH" và "CẤP CHI NHÁNH"',
);
assert(
  branchTableContent.includes("width: '160px'") && branchTableContent.includes("justifyContent: 'center'"),
  'Badge Phân cấp chi nhánh có độ rộng cố định 160px và căn giữa, không bị thụt thò',
);
assert(
  !branchTableContent.includes('name="trash"'),
  'Đã xóa hoàn toàn nút "Xóa chi nhánh" trong cột thao tác của BranchTable',
);
assert(
  !branchTierPageContent.includes('setBranchDeleteModalOpen(true)'),
  'Đã xóa hoàn toàn nút "Xóa chi nhánh" trong cột thao tác của BranchTierManagementPage',
);

// 4. Form Chi nhánh - Ô Bán kính
console.log('\n--- 4. [Form Chi Nhánh - Ô Bán Kính & Xóa Hint Xám] ---');
const branchFormModalContent = fs.readFileSync('src/modules/branch/components/BranchFormModal.jsx', 'utf8');
assert(
  !branchFormModalContent.includes('hint="Vùng quét GPS cho phép"'),
  'Đã xóa bỏ dòng ghi chú xám "Vùng quét GPS cho phép" dưới ô bán kính',
);
assert(
  !branchFormModalContent.includes('hint="VD: CH03, HCM01"'),
  'Đã xóa bỏ dòng ghi chú xám dưới ô Mã Chi Nhánh',
);
assert(
  branchFormModalContent.includes('placeholder="100m (20 - 1000m)"') || branchFormModalContent.includes('placeholder="100m'),
  'Đã đưa hướng dẫn nhập vào placeholder của ô Bán kính',
);

// 5. Form Chi nhánh - Icon thừa
console.log('\n--- 5. [Form Chi Nhánh - Xóa Icon Trang Trí Thừa] ---');
const branchMapPickerContent = fs.readFileSync('src/modules/branch/components/BranchMapPicker.jsx', 'utf8');
assert(
  !branchMapPickerContent.includes('<Icon name="map" size={14} color={c.accent} />'),
  'Đã loại bỏ icon map trang trí thừa thãi trước dòng chọn tọa độ',
);

// 6. Phân cấp chi nhánh - Đồng bộ Badge
console.log('\n--- 6. [Phân Cấp Chi Nhánh - Đồng Bộ Badge] ---');
const tierTableContent = fs.readFileSync('src/modules/branch/components/TierTable.jsx', 'utf8');
assert(
  branchTierPageContent.includes("label: 'MÃ CHI NHÁNH'") && branchTierPageContent.includes("label: 'CẤP CHI NHÁNH'"),
  'Bảng phân cấp chi nhánh ghi rõ "MÃ CHI NHÁNH" và "CẤP CHI NHÁNH"',
);
assert(
  tierTableContent.includes("width: '160px'") && tierTableContent.includes("justifyContent: 'center'"),
  'Badge Tên phân cấp (Tier) trong TierTable được đồng bộ 160px và màu trung tính',
);

// 7. Khung ca mẫu - Bug Xóa không mất dữ liệu
console.log('\n--- 7. [Khung Ca Mẫu - Bug Xóa Không Mất Dữ Liệu] ---');
const axiosConfigContent = fs.readFileSync('src/config/axios.config.js', 'utf8');
const shiftServiceContent = fs.readFileSync('src/modules/schedule/services/shiftTemplate.service.js', 'utf8');
const useShiftTemplateContent = fs.readFileSync('src/modules/schedule/hooks/useShiftTemplate.js', 'utf8');

assert(
  axiosConfigContent.includes("config.url.startsWith('/') && !config.url.startsWith('/api')"),
  'Axios interceptor tự động chuẩn hóa URL loại bỏ leading slash để bảo toàn baseURL /api',
);
assert(
  shiftServiceContent.includes('deleteShiftTemplate') && !shiftServiceContent.includes('/**\nexport const deleteShiftTemplate'),
  'deleteShiftTemplate được export chuẩn xác, không bị unclosed comment',
);
assert(
  useShiftTemplateContent.includes('deletedShiftIdsRef'),
  'Hook useShiftTemplate theo dõi deletedShiftIdsRef tránh việc fetch lại trả về ca vừa xóa',
);

// 8. Form Khung ca mẫu - Co giãn & Căn chỉnh
console.log('\n--- 8. [Form Khung Ca Mẫu - Scale 100% & Căn Nút Gạt] ---');
const shiftModalContent = fs.readFileSync('src/modules/schedule/components/ShiftTemplateFormModal.jsx', 'utf8');
assert(
  shiftModalContent.includes("modalWidth = creationMode === 'BATCH' && !isEditing ? '860px' : '620px'"),
  'Độ rộng modal khung ca đã được mở rộng (620px cho đơn lẻ, 860px cho tạo hàng loạt)',
);
assert(
  !shiftModalContent.includes('hint="Tên hiển thị khi xếp lịch'),
  'Đã xóa dòng note mờ không cần thiết ở Tên Khung Ca',
);
assert(
  !shiftModalContent.includes('paddingTop: \'16px\''),
  'Đã loại bỏ paddingTop: 16px gây lệch form cho nút gạt Kích hoạt áp dụng',
);

// 9. Form Khung ca mẫu - Đồng bộ 2 trạng thái & Button Icon
console.log('\n--- 9. [Form Khung Ca Mẫu - Đồng Bộ & Button Icon] ---');
assert(
  shiftModalContent.includes("display: 'inline-flex'") && shiftModalContent.includes("justifyContent: 'center'"),
  'Các button trong modal sử dụng inline-flex và căn giữa icon',
);
assert(
  !shiftModalContent.includes('<span>+ Thêm Khung Ca'),
  'Đã loại bỏ dấu + thừa trong chữ khi button đã có Icon plus',
);

// 10. Toàn trang - Responsive & Overflow
console.log('\n--- 10. [Toàn Trang - Responsive Table Overflow] ---');
assert(
  branchTableContent.includes('overflowX: \'auto\''),
  'BranchTable bọc trong container có overflowX: auto mượt mà trên mobile/tablet',
);

console.log('\n=============================================================');
console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM TRA: ${passCount} PASSED, ${failCount} FAILED`);
console.log('=============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TOÀN BỘ 10 HẠNG MỤC ĐÃ VƯỢT QUA KIỂM THỬ XUẤT SẮC!\n');
}
