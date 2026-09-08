# 🖼️ Assets — Tài nguyên tĩnh

## Mục đích
Thư mục `assets/` chứa các tài nguyên tĩnh của dự án.

## Cấu trúc

```
assets/
├── README.md
├── images/         ← Hình ảnh (png, jpg, webp)
├── icons/          ← Icons (svg)
└── fonts/          ← Font tùy chỉnh (nếu không dùng Google Fonts)
```

## Quy tắc

1. **Phân loại theo thư mục con**: images, icons, fonts.
2. **Đặt tên file**: kebab-case → `hero-banner.png`, `arrow-right.svg`.
3. **Ưu tiên SVG** cho icons (nhẹ, scalable).
4. **Ưu tiên WebP** cho hình ảnh (nhẹ hơn PNG/JPG).
5. **KHÔNG** đặt file CSS hay JS vào đây.

## Cách import

```jsx
// Hình ảnh
import heroBanner from '@/assets/images/hero-banner.png';
<img src={heroBanner} alt="Hero Banner" />

// SVG as component (Vite hỗ trợ)
import Logo from '@/assets/icons/logo.svg';
```
