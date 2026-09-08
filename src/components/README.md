# 🧩 Components — UI Components dùng chung

## Mục đích
Thư mục `components/` chứa các **Dumb Components** (UI thuần) — những component có thể tái sử dụng ở nhiều nơi trong dự án.

## Cấu trúc

```
components/
├── README.md
├── Button/
│   ├── index.jsx
│   └── Button.module.css
├── Modal/
│   ├── index.jsx
│   └── Modal.module.css
├── Loading/
│   ├── index.jsx
│   └── Loading.module.css
└── ...
```

## Quy tắc

1. **Mỗi component = 1 folder** chứa `index.jsx` + `[Tên].module.css`.
2. **Tên folder**: PascalCase → `Button/`, `UserCard/`, `SearchBar/`.
3. **Chỉ là Dumb Component**:
   - ✅ Nhận dữ liệu qua `props`.
   - ✅ Hiển thị UI.
   - ✅ Gọi callback từ props (VD: `onClick`, `onChange`).
   - ❌ **KHÔNG** gọi API.
   - ❌ **KHÔNG** chứa business logic phức tạp.
   - ❌ **KHÔNG** import services hay context.
4. **Export default** component.
5. Dùng **CSS Modules** cho styling.

## Ví dụ

### `Button/index.jsx`
```jsx
import styles from './Button.module.css';

const Button = ({ label, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
```

### `Button/Button.module.css`
```css
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s ease;
}

.button:hover { opacity: 0.85; }
.button:disabled { cursor: not-allowed; opacity: 0.5; }

.primary { background-color: var(--color-primary); color: #fff; }
.secondary { background-color: var(--color-secondary); color: #fff; }
.outline { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); }
```
