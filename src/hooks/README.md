# 🪝 Hooks — Custom Hooks

## Mục đích
Thư mục `hooks/` chứa các **Custom Hooks** được dùng chung trong dự án.  
Hooks giúp **tách biệt logic** ra khỏi component, dễ tái sử dụng và test.

## Cấu trúc

```
hooks/
├── README.md
├── useDebounce.js      ← Debounce giá trị input
├── useToggle.js        ← Toggle boolean state
├── useFetch.js         ← Fetch data từ API (generic)
├── useLocalStorage.js  ← Đồng bộ state với localStorage
└── ...
```

## Quy tắc

1. **Đặt tên**: `use[TênChứcNăng].js` (camelCase, tiền tố `use`).
2. **Mỗi hook = 1 file**.
3. **Export default** hook function.
4. Dùng `useMemo` cho computed values tốn tài nguyên.
5. Dùng `useCallback` cho callback functions.
6. **Cleanup** side effects trong `useEffect` return.
7. **KHÔNG** xử lý UI (toast, redirect) — chỉ return data và functions.
8. Thêm **JSDoc** mô tả params, return, và ví dụ.

## Ví dụ — `useDebounce.js`

```javascript
import { useState, useEffect } from 'react';

/**
 * Hook debounce giá trị input sau N milliseconds.
 * Hữu ích cho search input để tránh gọi API liên tục.
 *
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms), mặc định 300ms
 * @returns {any} - Giá trị đã được debounce
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearch) fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
```

## Ví dụ — `useToggle.js`

```javascript
import { useState, useCallback } from 'react';

/**
 * Hook toggle boolean state.
 *
 * @param {boolean} initialValue - Giá trị ban đầu, mặc định false
 * @returns {[boolean, Function]} - [value, toggle]
 *
 * @example
 * const [isOpen, toggleOpen] = useToggle(false);
 * <button onClick={toggleOpen}>{isOpen ? 'Đóng' : 'Mở'}</button>
 */
const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(prev => !prev), []);
  return [value, toggle];
};

export default useToggle;
```
