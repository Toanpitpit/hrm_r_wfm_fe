# Mục tiêu

Thiết kế và xây dựng giao diện xác thực cho dự án SWP391 — HRM & Workforce Management. Dựa trên phản hồi, hệ thống sẽ tách biệt hoàn toàn 2 luồng đăng nhập thành 2 trang (page) và 2 route riêng biệt:

1. **Trang Đăng nhập Web (Standard Login)**: Route `/login`. (Sẽ được ưu tiên thực thi trước).
2. **Trang Đăng nhập Kiosk (Kiosk Login)**: Route `/kiosk-login`.

Cả hai trang sẽ được đặt trong module `auth`. Ngoài CSS Modules có sẵn, dự án sẽ tích hợp thêm công cụ CSS framework (đề xuất: **Tailwind CSS**) để hỗ trợ code giao diện nhanh và đẹp hơn.

---

## Chi tiết Input / Output & Thiết kế Form

### 1. Form Đăng nhập Web (Standard Login) - **ƯU TIÊN THỰC THI TRƯỚC**
- **Đường dẫn**: `/login`
- **Input (UI)**:
  - Trường `username` (Text Input) - Bắt buộc.
  - Trường `password` (Password Input) - Bắt buộc.
  - Nút "Đăng nhập".
- **Output (Data Fetching)**: 
  - Gọi service: `authService.login({ username, password })`.
  - Nhận về `token` và thông tin `user` (UserSummaryDto).
  - Lưu token và cập nhật global state (Context/Redux). Chuyển hướng vào `/dashboard`.

### 2. Form Đăng nhập Kiosk (Kiosk Login) - **THỰC THI SAU**
- **Đường dẫn**: `/kiosk-login`
- **Input (UI)**:
  - Trường `employeeCode` (Text/Number Input) - Bắt buộc.
  - Trường `pinCode` (Password Input dạng phím số PIN) - Bắt buộc.
  - Trường `storeId` (Select Box chọn cửa hàng) - Bắt buộc. Dùng **Mock data tạm thời**: `[{ id: 123, name: "Cửa hàng Mẫu 123" }]`.
  - Nút "Đăng nhập Kiosk".
- **Output (Data Fetching)**:
  - Gọi service: `authService.kioskLogin({ employeeCode, pinCode, storeId })`.
  - Xử lý các logic lỗi đặc thù.
  - Nhận về `token` và thông tin `user`.
---

## Proposed Changes (Các thay đổi đề xuất)

### 1. Cấu hình Styling Framework
- **[NEW/MODIFY] Cài đặt Tailwind CSS**: Chạy các lệnh `npm install -D tailwindcss postcss autoprefixer`, khởi tạo `tailwind.config.js` và cấu hình vào file CSS global của hệ thống để hỗ trợ viết CSS tiện lợi thay vì chỉ dùng CSS Modules thuần.

### 2. Frontend Auth Module

#### [NEW] [auth.service.js](file:///d:/Semester9/SWP391/project/frontend/src/modules/auth/services/auth.service.js)
Tạo file service định nghĩa các hàm gọi API:
- `login(data)`: Gửi POST request tới `/api/Auth/login`.

#### [NEW] [useAuth.js](file:///d:/Semester9/SWP391/project/frontend/src/modules/auth/hooks/useAuth.js)
Tạo custom hook quản lý state loading, error và gọi API từ `auth.service.js`.

#### [NEW] [LoginPage/index.jsx](file:///d:/Semester9/SWP391/project/frontend/src/modules/auth/pages/LoginPage/index.jsx)
Container component chính cho trang đăng nhập Web.
- Giao diện đăng nhập sẽ được thiết kế trực quan, hiện đại bằng Tailwind CSS (hoặc Bootstrap nếu được cài).
- Bắt lỗi input rỗng, hiển thị toast/alert khi API trả về lỗi.

#### [NEW] [LoginPage.module.css](file:///d:/Semester9/SWP391/project/frontend/src/modules/auth/pages/LoginPage/LoginPage.module.css)
File CSS Modules chứa styles bổ sung nếu Tailwind CSS không đủ đáp ứng hoặc cần module hóa một số style đặc thù.

### 3. Routing (Router)
- Cập nhật file cấu hình router của dự án để thêm route `/login` trỏ tới `LoginPage`.

*(Lưu ý: Các component và service của KioskLogin sẽ được tách riêng ra `KioskLoginPage` sau khi hoàn tất `LoginPage`)*

---

## Verification Plan

### Manual Verification
- Chạy thử dự án React bằng `npm run dev`.
- Truy cập vào `/login` trên trình duyệt và kiểm tra giao diện đăng nhập (kiểm tra Tailwind CSS đã nhận class chưa).
- Thử nghiệm nhập thiếu dữ liệu để kiểm tra tính năng validation.
- Gọi thử API đăng nhập với dữ liệu đúng/sai để xem phản hồi hiển thị trên UI.
