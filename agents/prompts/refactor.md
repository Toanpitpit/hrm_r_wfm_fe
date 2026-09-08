# 🔄 Prompt: Refactor Code

## Hướng dẫn sử dụng
Copy toàn bộ nội dung bên dưới, thay thế các `[PLACEHOLDER]` bằng thông tin thực tế, sau đó gửi cho AI.

---

## Prompt Template

```
Tôi cần refactor code trong dự án React.

### Thông tin refactor:
- **File cần refactor**: [ĐƯỜNG_DẪN_FILE]
- **Lý do refactor**: [LÝ_DO] (VD: code quá dài, logic lặp lại, performance kém, không đúng conventions)
- **Phạm vi**: [TOÀN_BỘ_FILE / CHỈ_MỘT_PHẦN]

### Code hiện tại:
```jsx
[DÁN_CODE_CẦN_REFACTOR]
```

### Mục tiêu refactor:
- [ ] Tách logic ra custom hook
- [ ] Tách UI ra component riêng
- [ ] Tối ưu performance (useMemo, useCallback, React.memo)
- [ ] Áp dụng đúng coding standards
- [ ] Giảm code duplication
- [ ] Cải thiện error handling
- [ ] [MỤC_TIÊU_KHÁC]

### Quy tắc khi refactor:
1. KHÔNG thay đổi behavior hiện tại (output phải giống y hệt).
2. Tuân thủ coding standards (`agents/rules/coding-standards.md`).
3. Đặt file đúng vị trí theo cấu trúc thư mục dự án.
4. Nếu tách ra file mới → cập nhật import ở file gốc.
5. Giải thích lý do cho mỗi thay đổi.

### Output mong muốn:
- Code đã refactor (tất cả files liên quan).
- Giải thích từng thay đổi và lý do.
- Danh sách files mới tạo / files bị thay đổi.
- Xác nhận behavior không thay đổi.
```
