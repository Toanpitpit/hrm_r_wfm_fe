# 📄 Pages — Các trang chính

## Mục đích
Thư mục `pages/` chứa các **Container Components** — mỗi page tương ứng với 1 route trong ứng dụng.

## Cấu trúc

```
pages/
├── README.md
├── HomePage/
│   ├── index.jsx
│   └── HomePage.module.css
├── LoginPage/
│   ├── index.jsx
│   └── LoginPage.module.css
├── DashboardPage/
│   ├── index.jsx
│   └── DashboardPage.module.css
└── ...
```

## Quy tắc

1. **Mỗi page = 1 folder** chứa `index.jsx` + `[TênPage].module.css`.
2. **Tên folder**: PascalCase, hậu tố `Page` → `LoginPage/`, `UserListPage/`.
3. **Page là Container Component**:
   - ✅ Lấy dữ liệu thông qua **Custom Hooks** hoặc **Context**.
   - ✅ Truyền dữ liệu xuống `components/` con qua props.
   - ✅ Xử lý loading / error state.
   - ❌ **KHÔNG** gọi API trực tiếp (phải qua services + hooks).
   - ❌ **KHÔNG** chứa UI component tái sử dụng (đưa vào `components/`).
4. Dùng `React.lazy()` + `Suspense` cho **lazy loading** page.
5. Dùng `useMemo` / `useCallback` khi cần tối ưu.

## Ví dụ

### `HomePage/index.jsx`
```jsx
import { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import Loading from '@/components/Loading';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { products, isLoading, error } = useProducts();

  const featuredProducts = useMemo(
    () => products.filter(p => p.isFeatured),
    [products]
  );

  if (isLoading) return <Loading />;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Sản phẩm nổi bật</h1>
      <div className={styles.grid}>
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
```
