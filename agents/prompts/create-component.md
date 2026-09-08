# 🧩 Prompt: Tạo Component mới

## Hướng dẫn sử dụng
Copy toàn bộ nội dung bên dưới, thay thế các `[PLACEHOLDER]` bằng thông tin thực tế, sau đó gửi cho AI.

---

## Prompt Template

```
Tôi cần tạo một React component mới cho dự án.

### Thông tin component:
- **Tên component**: [TÊN_COMPONENT] (VD: EmployeeCard, ShiftTable)
- **Thuộc module nào?**: [TÊN_MODULE] (VD: employee, attendance, schedule. Nếu dùng chung → "shared")
- **Mô tả chức năng**: [MÔ_TẢ] (VD: Hiển thị thông tin nhân viên dạng card)
- **Props nhận vào**: [DANH_SÁCH_PROPS] (VD: employee: { name, email, avatar }, onClick)
- **Có state riêng không?**: [CÓ/KHÔNG] (nếu có, liệt kê state)

### Quy tắc bắt buộc:
1. Nếu thuộc module → Đặt tại: `src/modules/[MODULE]/components/[TÊN_COMPONENT]/index.jsx`
   Nếu dùng chung → Đặt tại: `src/shared/components/[TÊN_COMPONENT]/index.jsx`
2. CSS dùng CSS Modules: `[TÊN_COMPONENT]/[TÊN_COMPONENT].module.css` (cùng folder)
3. Component phải là Dumb Component — chỉ nhận props, không gọi API.
4. Sử dụng destructuring cho props.
5. Export default component.
6. Thứ tự import: React → Hooks → Components → Styles.
7. Biến boolean đặt tên với tiền tố is/has/can.
8. Nếu component nhận callback → dùng PropTypes hoặc comment rõ kiểu dữ liệu.

### Output mong muốn:
- File `index.jsx` hoàn chỉnh.
- File `.module.css` với styles cơ bản.
- Ví dụ cách sử dụng component.
```
