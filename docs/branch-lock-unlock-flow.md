# Hướng Dẫn & Tài Liệu Luồng Khóa / Mở Khóa Chi Nhánh (/branches)

Tài liệu này mô tả chi tiết kiến trúc, các file đã tạo/chỉnh sửa và hướng dẫn kiểm thử thủ công (manual test) cho tính năng **Khóa và Mở Khóa Chi Nhánh** trên hệ thống RWFM.

---

## 1. Danh sách các file đã tạo & chỉnh sửa

### File tạo mới
- [`src/modules/branch/components/LockBlockersList.jsx`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/components/LockBlockersList.jsx): Component hiển thị danh sách các điều kiện chặn (blockers) kèm icon cảnh báo, đếm số lượng, tính năng expand/collapse xem chi tiết từng item và nút "Kiểm tra lại".
- [`src/modules/branch/components/LockConfigForm.jsx`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/components/LockConfigForm.jsx): Component cấu hình khóa ở Bước 2 gồm Textarea lý do (10-500 ký tự có đếm ký tự), Radio xử lý nhân sự (Giữ nguyên vs Điều chuyển kèm Select chi nhánh đích), Select ca tương lai và Input gõ mã chi nhánh xác nhận.
- [`src/modules/branch/components/UnlockModal.jsx`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/components/UnlockModal.jsx): Modal xác nhận mở khóa chi nhánh kèm lý do tùy chọn, hỗ trợ focus trap và đóng bằng Esc.
- [`src/modules/branch/hooks/useBranchLockCheck.js`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/hooks/useBranchLockCheck.js): Hook gọi `GET /api/branches/{id}/lock-check`, quản lý trạng thái loading skeleton và blockers.
- [`src/modules/branch/hooks/useLockBranch.js`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/hooks/useLockBranch.js): Hook gửi `POST /api/branches/{id}/lock`, xử lý lỗi 409 Conflict, 400/403 và chống bấm đúp.
- [`src/modules/branch/hooks/useUnlockBranch.js`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/hooks/useUnlockBranch.js): Hook gửi `POST /api/branches/{id}/unlock` và xử lý trạng thái mở khóa.
- [`docs/branch-lock-unlock-flow.md`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/docs/branch-lock-unlock-flow.md): Tài liệu kỹ thuật và checklist kiểm thử thủ công.

### File đã cập nhật
- [`src/modules/branch/types/branch.types.ts`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/types/branch.types.ts): Định nghĩa contract TypeScript cho `BranchLockCheckResponse`, `LockBlocker`, `LockBlockerItem`, `BranchLockDto`, `BranchUnlockDto`, `StaffHandlingMode`, `FutureShiftHandling`, bổ sung trường `lockedBy`, `lockedAt` trong `Branch`.
- [`src/modules/branch/services/branch.service.js`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/services/branch.service.js): Bổ sung `checkBranchLock`, `lockBranch`, `unlockBranch` kết nối backend và tích hợp fallback simulation (giả lập blocker cho CH02 phục vụ kiểm thử).
- [`src/modules/branch/components/BranchLockModal.jsx`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/components/BranchLockModal.jsx): Nâng cấp thành modal nhiều bước hoàn chỉnh (Bước 1: Kiểm tra điều kiện -> Bước 2: Cấu hình khóa -> Bước 3: Gửi API có xử lý 409 quay lại bước 1, 400/403 hiện alert).
- [`src/modules/branch/components/BranchTable.jsx`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/components/BranchTable.jsx): Bổ sung tooltip chi tiết trên badge "Tạm khóa" (lý do, người khóa, thời gian khóa), kiểm tra quyền `branch.lock`, và disable nút khi request in-progress.
- [`src/modules/branch/hooks/useBranch.js`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/hooks/useBranch.js): Tích hợp quản lý state mở khóa `unlockModalOpen`, `unlockingBranch`, `isActionInProgress`, và các callback refetch dữ liệu sau khi khóa / mở khóa.
- [`src/modules/branch/pages/BranchManagementPage/index.jsx`](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/src/modules/branch/pages/BranchManagementPage/index.jsx): Tích hợp đồng thời `BranchLockModal` và `UnlockModal`, truyền `onLock` và `onUnlock` cho bảng dữ liệu và bản đồ.

---

## 2. Hướng dẫn Test Thủ Công (Manual Testing)

Khởi động ứng dụng bằng lệnh:
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ: `http://localhost:5173/branches`.

---

### Kịch bản 1: Luồng Khóa Chi Nhánh có điều kiện chặn (canLock = false)

1. **Thao tác**:
   - Tại danh sách chi nhánh dạng bảng, tìm chi nhánh **CH02** (Cửa hàng Tiện lợi Chi nhánh Lê Văn Việt).
   - Nhấn nút **"Khóa"**.
2. **Quan sát Bước 1 (Kiểm tra điều kiện)**:
   - Modal hiển thị loading skeleton trong khoảng 600ms mô phỏng `GET /api/branches/{id}/lock-check`.
   - Banner màu đỏ cảnh báo: *"Không thể khóa chi nhánh lúc này"*.
   - Danh sách blockers xuất hiện:
     - Mục 1: *"Có 3 ca làm việc đang diễn ra chưa được chốt giờ ra"* kèm badge `3 mục`.
     - Mục 2: *"Tồn đọng 1 biên bản kiểm kê hàng hóa chưa hoàn tất duyệt"* kèm badge `1 mục`.
   - Bấm vào biểu tượng mũi tên xuống (chevron) ở mỗi mục để xem chi tiết từng mã ca/biên bản (VD: `#SH-101`, `#AUD-882`).
   - Nút **"Tiếp Tục Cấu Hình"** ở footer bị disable mờ, không cho sang Bước 2.
   - Bấm nút **"Kiểm Tra Lại"**: Quan sát loading skeleton chạy lại và kiểm tra lại API.

---

### Kịch bản 2: Luồng Khóa Chi Nhánh đủ điều kiện (canLock = true)

1. **Thao tác**:
   - Tại danh sách chi nhánh, tìm chi nhánh **CH01** (Chi nhánh Cầu Giấy) đang ở trạng thái Hoạt động.
   - Nhấn nút **"Khóa"**.
2. **Quan sát Bước 1**:
   - Hiển thị banner màu xanh lá: *"Chi nhánh đủ điều kiện để thực hiện khóa"*.
   - Thẻ thông tin: *"Có 18 nhân viên bị ảnh hưởng khi chi nhánh tạm dừng."*
   - Nút **"Tiếp Tục Cấu Hình"** bật sáng màu đỏ và có thể click.
3. **Chuyển sang Bước 2 (Cấu hình khóa)**:
   - Nhấn **"Tiếp Tục Cấu Hình"**.
   - Breadcrumb bước ở góc dưới hiển thị: `1 Kiểm tra` → `2 Cấu hình khóa` (active).
   - Nút **"Quay Lại"** cho phép quay về Bước 1 bất kỳ lúc nào.
4. **Kiểm tra Validate Form Bước 2**:
   - **Lý do khóa**:
     - Gõ dưới 10 ký tự: Bộ đếm hiện màu xám/cảnh báo `X/500 ký tự (tối thiểu 10)`.
     - Gõ từ 10 đến 500 ký tự: Bộ đếm đổi sang màu xanh teal. Nút "Xác nhận khóa" vẫn disable nếu chưa nhập mã.
   - **Xử lý nhân sự**:
     - Chọn option 1: *"Giữ nguyên tại chi nhánh, chặn chấm công và đăng nhập"*.
     - Chọn option 2: *"Điều chuyển tạm sang chi nhánh khác"*: Dropdown chọn chi nhánh đích xuất hiện, chỉ liệt kê các chi nhánh đang Hoạt động (không chứa chi nhánh CH01 hiện tại).
   - **Ca đã xếp trong tương lai**:
     - Lựa chọn giữa: "Hủy toàn bộ", "Chuyển sang chi nhánh khác", hoặc "Giữ ở trạng thái treo".
   - **Xác nhận mã chi nhánh**:
     - Gõ sai hoặc gõ thiếu: Ô nhập viền màu cam, nút **"Xác Nhận Khóa"** vẫn bị disable.
     - Gõ chính xác mã: `CH01`: Ô nhập chuyển sang viền xanh lá kèm nhãn *"Khớp mã"*, nút **"Xác Nhận Khóa"** được kích hoạt.
5. **Gửi khóa (Bước 3)**:
   - Bấm **"Xác Nhận Khóa"**.
   - Quan sát nút có icon loading xoay, chống double-click.
   - Khi hoàn tất:
     - Modal tự động đóng.
     - Toast thông báo: *"Đã khóa chi nhánh 'Cửa hàng Tiện lợi Chi nhánh Cầu Giấy' thành công!"*.
     - Danh sách chi nhánh cập nhật ngay: CH01 chuyển sang badge **"Tạm khóa"**.
     - Thẻ thống kê: Số lượng *ĐANG HOẠT ĐỘNG* giảm 1, số lượng *TẠM KHÓA / BẢO TRÌ* tăng 1.

---

### Kịch bản 3: Xử lý lỗi Conflict (409) và lỗi Client (400/403)

- **Lỗi 409 Conflict**:
  - Khi backend trả về HTTP 409 (ví dụ trong lúc admin đang nhập lý do thì có nhân viên check-in ca mới): modal tự động quay về Bước 1, hiển thị banner cảnh báo và nạp blockers mới trả về từ response.
- **Lỗi 400 / 403**:
  - Modal giữ nguyên ở Bước 2, hiển thị banner cảnh báo lỗi màu đỏ ngay phía trên form mà không làm mất nội dung người dùng vừa nhập.

---

### Kịch bản 4: Luồng Mở Khóa Chi Nhánh

1. **Thao tác**:
   - Tìm một chi nhánh đang ở trạng thái **Tạm khóa** (ví dụ CH01 vừa khóa ở kịch bản 2 hoặc CH03).
   - Cột thao tác của dòng đó hiển thị nút màu xanh lá **"Mở"**.
   - Bấm nút **"Mở"**.
2. **Quan sát `UnlockModal`**:
   - Tiêu đề modal: *"Mở Khóa Chi Nhánh: [Tên CN]"*.
   - Banner thông báo xác nhận khôi phục tính năng chấm công và trạm Kiosk.
   - Nếu chi nhánh có lý do khóa trước đó, hiển thị khối ghi chú trích dẫn lý do cũ.
   - Textarea "Lý do mở khóa" (tùy chọn).
3. **Xác nhận mở khóa**:
   - Nhấn **"Xác Nhận Mở Khóa"**.
   - Nút hiển thị loading spinner.
   - Thành công: Modal đóng, Toast thành công xuất hiện, trạng thái chi nhánh đổi lại thành **"Hoạt động"**, thẻ thống kê tự động cập nhật lại.

---

### Kịch bản 5: Kiểm tra Tooltip Badge và Phân quyền

1. **Tooltip trên Badge "Tạm khóa"**:
   - Di chuột (hover) vào Badge màu đỏ **"Tạm khóa"** của chi nhánh bị khóa.
   - Quan sát popup tooltip màu tối xuất hiện phía trên badge, hiển thị đầy đủ 3 trường:
     - *Lý do khóa*
     - *Người khóa* (VD: "Nguyễn Văn Quản Lý")
     - *Thời gian khóa* (định dạng `HH:mm DD/MM/YYYY`)
2. **Kiểm tra Phân quyền (`branch.lock`)**:
   - Mở DevTools Console, giả lập user không có quyền bằng cách:
     ```javascript
     localStorage.setItem('user', JSON.stringify({ username: 'staff1', role: 'EMPLOYEE', permissions: ['branch.view'] }));
     location.reload();
     ```
   - Quan sát nút **"Khóa"** tại các dòng chi nhánh:
     - Bị mờ (opacity 0.6) và disable con trỏ chuột (`cursor: not-allowed`).
     - Hover chuột hiển thị tooltip: *"Bạn không có quyền khóa chi nhánh (branch.lock)"*.
   - Khôi phục tài khoản Admin:
     ```javascript
     localStorage.setItem('user', JSON.stringify({ username: 'ops.admin@rwfm.vn', role: 'OPERATIONS_ADMIN', permissions: ['branch.lock'] }));
     location.reload();
     ```
     Nút "Khóa" sáng và hoạt động bình thường.
3. **Phím tắt & Focus Trap**:
   - Khi modal (LockModal hoặc UnlockModal) đang mở:
     - Nhấn phím `Tab` và `Shift + Tab` liên tục: Con trỏ chỉ di chuyển tuần hoàn giữa các phần tử bên trong modal, không thoát ra ngoài trang nền.
     - Nhấn phím `Escape`: Modal lập tức đóng an toàn (trừ khi đang trong quá trình submit API).
