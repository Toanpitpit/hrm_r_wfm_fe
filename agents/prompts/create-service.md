# 🔌 Prompt: Tạo Service gọi API

## Hướng dẫn sử dụng
Copy toàn bộ nội dung bên dưới, thay thế các `[PLACEHOLDER]` bằng thông tin thực tế, sau đó gửi cho AI.

---

## Prompt Template

```
Tôi cần tạo một service file để gọi API cho dự án React.

### Thông tin service:
- **Tên module**: [TÊN_MODULE] (VD: auth, user, product)
- **Base URL**: Sử dụng Axios instance từ `@/config/axios.config`
- **Danh sách API endpoints**:
  1. [METHOD] [ENDPOINT] — [MÔ_TẢ] (VD: GET /users — Lấy danh sách users)
  2. [METHOD] [ENDPOINT] — [MÔ_TẢ]
  3. ...

### Quy tắc bắt buộc:
1. Đặt file tại: `src/modules/[TÊN_MODULE]/services/[tên_module].service.js`
2. Import Axios instance từ `@/config/axios.config`.
3. Mỗi hàm export riêng lẻ (named export), đặt tên theo pattern: `[hành_động][Đối_tượng]`
   - VD: `getUsers`, `createUser`, `updateUserById`, `deleteUser`
4. Mỗi hàm chỉ xử lý Request/Response, return `response.data` (dữ liệu sạch).
5. KHÔNG xử lý UI logic (loading, toast, redirect) trong service.
6. Params truyền qua object cho GET, body truyền trực tiếp cho POST/PUT.
7. Thêm JSDoc comment mô tả params và return type.

### Output mong muốn:
- File `.service.js` hoàn chỉnh.
- Đăng ký endpoint vào `src/shared/constants/api.constants.js` nếu chưa có.
- Ví dụ cách gọi service từ hook hoặc component.
```
