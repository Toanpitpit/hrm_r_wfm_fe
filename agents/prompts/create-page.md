# 📄 Prompt: Tạo Page mới

## Hướng dẫn sử dụng
Copy toàn bộ nội dung bên dưới, thay thế các `[PLACEHOLDER]` bằng thông tin thực tế, sau đó gửi cho AI.

---

## Prompt Template

```
Tôi cần tạo một page mới cho dự án React.

### Thông tin page:
- **Tên page**: [TÊN_PAGE] (VD: LoginPage, EmployeeListPage, SchedulePage)
- **Thuộc module**: [TÊN_MODULE] (VD: auth, employee, schedule)
- **Route path**: [ĐƯỜNG_DẪN] (VD: /login, /dashboard, /users)
- **Mô tả chức năng**: [MÔ_TẢ] (VD: Trang đăng nhập với form email/password)
- **Cần xác thực không?**: [CÓ/KHÔNG] (nếu có, bọc trong ProtectedRoute)
- **Dữ liệu cần fetch**: [DANH_SÁCH_API] (VD: getUsers từ user.service.js)
- **Components con sử dụng**: [DANH_SÁCH_COMPONENTS] (VD: UserCard, SearchBar)

### Quy tắc bắt buộc:
1. Đặt file tại: `src/modules/[MODULE]/pages/[TênPage]/index.jsx`
2. CSS dùng CSS Modules: `src/modules/[MODULE]/pages/[TênPage]/[TênPage].module.css`
3. Page đóng vai trò **Container Component**:
   - Lấy dữ liệu thông qua Custom Hooks hoặc Context.
   - Truyền dữ liệu xuống Components con qua props.
   - KHÔNG gọi API trực tiếp trong page — phải thông qua services/hooks.
4. Xử lý loading state và error state rõ ràng.
5. Thứ tự import: React → Hooks/Context → Services → Components → Styles.
6. Sử dụng `useMemo` / `useCallback` khi cần tối ưu performance.

### Output mong muốn:
- File `index.jsx` hoàn chỉnh.
- File `.module.css` với layout cơ bản.
- Cập nhật router tại `src/routers/` (nếu cần).
- Ví dụ cách page hoạt động.
```
