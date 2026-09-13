# 📚 Shared SRS System Context — Ngữ Cảnh Dự Án R-WFM

Tài liệu này được trích xuất từ bộ ngữ cảnh chuẩn của dự án tại `docs/context/`.

---

## 1. Tổng Quan Dự Án
- **Tên dự án**: Retail Chain Workforce Management Platform (R-WFM).
- **Phân loại đề tài**: HRM - Nhân sự vận hành (Kỳ Fall 2026).
- **Quy mô**: Chuỗi siêu thị mini / cửa hàng tiện lợi từ 2-5 chi nhánh.

## 2. Các Vai Trò Trong Hệ Thống (Roles)
1. **Business Owner**: Quản trị vĩ mô, xem Dashboard toàn chuỗi & Audit Log.
2. **Operations Admin**: Quản trị Master Data (Chi nhánh, Khung ca mẫu, Cấp tài khoản Manager).
3. **Store Manager (Cửa hàng trưởng)**: Lập lịch tuần, duyệt đổi ca, tạo phiếu mượn người chi nhánh, khóa công tháng.
4. **Shift Leader (Trưởng ca)**: Chấm công Kiosk, giám sát quân số thực tế, báo vắng mặt/gian lận, ký chốt biên bản giao ca.
5. **Cashier (Thu ngân)**: Check-in Kiosk kèm khai báo tiền lẻ đầu ca, kiểm đếm két bàn giao cuối ca.
6. **Sales Staff (Nhân viên Quầy kệ)**: Đăng ký ca trống, check-in/out Kiosk, gửi yêu cầu xin đổi ca.
7. **Security Guard (Bảo vệ)**: Check-in/out Kiosk, khai báo thẻ xe qua đêm & niêm phong kho/cửa cuốn.
8. **Temporary Dispatched Staff (Nhân viên điều động)**: Tự động đồng bộ quyền check-in tại chi nhánh mượn từ $D_1 \rightarrow D_2$.

## 3. Danh Mục 5 Module Vận Hành
- **Module 1**: Quản trị Master Data & Executive Dashboard toàn chuỗi.
- **Module 2**: Lập lịch ca tuần & Quản lý đổi ca.
- **Module 3**: Điểm danh Kiosk quầy & Giám sát hiện diện.
- **Module 4**: Điều động nhân sự tạm thời liên chi nhánh (Cross-Branch Dispatch).
- **Module 5**: Số hóa biên bản bàn giao ca (Két tiền, An ninh) & Xuất dữ liệu bảng công cho Kế toán.

> Tham khảo chi tiết đầy đủ tại thư mục gốc: `docs/context/`
