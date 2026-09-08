# 🎨 Styles — CSS Global & Design Tokens

## Mục đích
Thư mục `styles/` chứa các file CSS **toàn cục** cho dự án: biến màu sắc, typography, reset, và các utility classes.

## Cấu trúc

```
styles/
├── README.md
├── variables.css    ← Biến CSS (màu, font, spacing, border-radius,...)
├── reset.css        ← Reset CSS mặc định trình duyệt
├── typography.css   ← Font families, font sizes, line heights
└── global.css       ← Import tất cả file trên + styles toàn cục
```

## Quy tắc Styling

### 1. Component-level → Dùng CSS Modules
```jsx
// ✅ Mỗi component có file .module.css riêng
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>
```

### 2. Global-level → Dùng chuẩn BEM
```css
/* ✅ block__element--modifier */
.card { }
.card__title { }
.card__title--active { }

/* ❌ Không dùng */
.cardTitle { }
.card .title.active { }
```

### 3. Biến CSS → Đặt trong `:root`
```css
/* styles/variables.css */
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #6366f1;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-bg: #ffffff;
  --color-text: #1f2937;

  /* Font */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border */
  --border-radius: 8px;
  --border-color: #e5e7eb;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 4. Thứ tự thuộc tính CSS (khuyến khích)
```css
.element {
  /* 1. Positioning */
  position: relative;
  top: 0;
  z-index: 1;

  /* 2. Box Model */
  display: flex;
  width: 100%;
  padding: var(--spacing-md);
  margin: 0;

  /* 3. Typography */
  font-size: var(--font-size-base);
  color: var(--color-text);

  /* 4. Visual */
  background: var(--color-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);

  /* 5. Animation */
  transition: all 0.2s ease;
}
```

## Lưu ý quan trọng

> ⚠️ **KHÔNG** viết CSS inline trong JSX (trừ dynamic styles).  
> ⚠️ **KHÔNG** hard-code màu sắc — luôn dùng CSS variables từ `variables.css`.  
> ⚠️ **KHÔNG** dùng `!important` trừ khi thực sự cần thiết.
