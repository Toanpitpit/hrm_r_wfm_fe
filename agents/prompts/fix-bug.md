# 🐛 Prompt: Fix Bug

## Hướng dẫn sử dụng
Copy toàn bộ nội dung bên dưới, thay thế các `[PLACEHOLDER]` bằng thông tin thực tế, sau đó gửi cho AI.

---

## Prompt Template

```
Tôi cần fix một bug trong dự án React.

### Mô tả bug:
- **File bị lỗi**: [ĐƯỜNG_DẪN_FILE] (VD: src/pages/LoginPage/index.jsx)
- **Hành vi mong muốn**: [MÔ_TẢ] (VD: Form submit phải gọi API login và redirect về dashboard)
- **Hành vi thực tế (bug)**: [MÔ_TẢ_LỖI] (VD: Click submit không có phản hồi, console báo lỗi 401)
- **Error message (nếu có)**: [ERROR_LOG]
- **Bước tái hiện bug**:
  1. [BƯỚC_1]
  2. [BƯỚC_2]
  3. ...

### Code hiện tại:
```jsx
[DÁN_CODE_BỊ_LỖI_VÀO_ĐÂY]
```

### Quy tắc khi fix:
1. Giải thích nguyên nhân root cause trước khi sửa.
2. Chỉ sửa phần code liên quan, KHÔNG refactor toàn bộ file.
3. Giữ nguyên coding standards của dự án (xem `agents/rules/coding-standards.md`).
4. Nếu bug liên quan đến API → kiểm tra service file tương ứng.
5. Nếu bug liên quan đến state → kiểm tra hook/context tương ứng.
6. Thêm comment giải thích chỗ fix nếu logic phức tạp.

### Output mong muốn:
- Giải thích nguyên nhân bug (root cause analysis).
- Code đã sửa (chỉ phần thay đổi, dạng diff nếu có thể).
- Gợi ý cách phòng tránh bug tương tự trong tương lai.
```
