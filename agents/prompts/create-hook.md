# 🪝 Prompt: Tạo Custom Hook

## Hướng dẫn sử dụng
Copy toàn bộ nội dung bên dưới, thay thế các `[PLACEHOLDER]` bằng thông tin thực tế, sau đó gửi cho AI.

---

## Prompt Template

```
Tôi cần tạo một custom hook cho dự án React.

### Thông tin hook:
- **Tên hook**: use[TÊN] (VD: useDebounce, useAuth, useFetch, useToggle)
- **Mô tả chức năng**: [MÔ_TẢ] (VD: Hook debounce giá trị input sau N ms)
- **Params đầu vào**: [PARAMS] (VD: value, delay = 300)
- **Giá trị trả về**: [RETURN_VALUES] (VD: debouncedValue)
- **Có gọi API không?**: [CÓ/KHÔNG] (nếu có, chỉ rõ service nào)
- **Có dùng Context không?**: [CÓ/KHÔNG]

### Quy tắc bắt buộc:
1. Đặt file tại: `src/hooks/use[Tên].js`
2. Tên hook bắt đầu bằng `use` (React convention).
3. Sử dụng `useMemo` cho computed values tốn tài nguyên.
4. Sử dụng `useCallback` cho callback functions.
5. Cleanup side effects trong `useEffect` return.
6. KHÔNG xử lý UI (hiển thị toast, redirect) — chỉ return data và functions.
7. Thêm JSDoc comment mô tả params, return, và ví dụ sử dụng.

### Output mong muốn:
- File `use[Tên].js` hoàn chỉnh.
- JSDoc documentation đầy đủ.
- Ví dụ cách sử dụng hook trong component.
```
