# Cấu hình API cho web

`axios.config.js` dùng `VITE_API_URL` và gửi cookie phiên bằng `withCredentials`.
Các request thay đổi dữ liệu gửi header `X-RWFM-Request: 1`.
Khi tải lại trang, `AuthContext` gọi `GET /Auth/me` để khôi phục hồ sơ từ phiên backend.

## Khi triển khai

- Chạy API qua HTTPS. Môi trường Development hỗ trợ chạy HTTP trên localhost.
- Nếu web gọi API khác origin, cấu hình danh sách origin frontend chính xác ở backend, ví dụ `WebSession__AllowedOrigins__0=https://web.example.com`.
- Nếu web và API nằm khác site, bật `WebSession__CrossSite=true` để gửi cookie `SameSite=None; Secure`. Trình duyệt vẫn có thể chặn cookie bên thứ ba. Triển khai cùng site giúp tránh phụ thuộc vào thiết lập này.
- Backend lưu phiên trong Redis khi có `ConnectionStrings__RedisConnection`. Nếu dùng nhiều API instance, cấu hình tất cả instance dùng chung Redis. Với cache trong bộ nhớ backend, phiên mất khi API khởi động lại.
