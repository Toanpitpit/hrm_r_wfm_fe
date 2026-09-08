# 🌐 Project Overview — Ngữ cảnh dự án cho AI

## Mục đích
File này cung cấp **ngữ cảnh tổng quan** về dự án để AI hiểu đúng codebase ngay từ đầu.  
**Đính kèm nội dung này** khi bắt đầu session mới với AI.

---

## Thông tin dự án

- **Tên dự án**: SWP391 Frontend
- **Framework**: React JS (Vite)
- **Ngôn ngữ**: JavaScript (ES6+)
- **Package Manager**: npm

## Tech Stack

| Hạng mục | Công nghệ |
|---|---|
| Build Tool | Vite |
| UI Library | React JS |
| State Management | React Context + Custom Hooks |
| Data Fetching | Axios |
| Routing | React Router DOM |
| Styling | CSS Modules + BEM (global) |
| Backend API | RESTful API (JSON response) |

## Cấu trúc thư mục

```
src/
├── config/        # Cấu hình Axios, env, thư viện
├── components/    # UI Components dùng chung (Dumb Components)
├── pages/         # Các trang chính (Container Components)
├── styles/        # CSS global, variables, reset, typography
├── assets/        # Hình ảnh, icons, fonts
├── services/      # Gọi API bằng Axios (tách theo module)
├── constants/     # Hằng số: API endpoints, mã lỗi, text
├── routers/       # Cấu hình React Router DOM
├── hooks/         # Custom Hooks (useDebounce, useAuth,...)
├── context/       # React Context & Providers (AuthContext,...)
├── App.jsx        # Root component
└── main.jsx       # Entry point
```

## Quy ước đặt tên

- **Components / Pages**: PascalCase folder → `Button/index.jsx`
- **Services**: camelCase + `.service.js` → `auth.service.js`
- **Hooks**: `use` prefix → `useDebounce.js`
- **Constants**: camelCase + `.constants.js` → `api.constants.js`
- **Context**: PascalCase + `Context.jsx` → `AuthContext.jsx`
- **CSS Modules**: `[name].module.css`
- **Biến**: camelCase, boolean dùng `is/has/can` prefix

## Workflow khi code tính năng mới

```
constants → services → context → hooks → components → pages → routers
```

## Các quy tắc quan trọng

1. **Components chỉ nhận props** — không gọi API, không chứa business logic.
2. **Pages là Container** — lấy data qua hooks/context, truyền xuống components.
3. **Services chỉ xử lý Request/Response** — return dữ liệu sạch (JSON đã parse).
4. **Hooks xử lý logic** — kết nối services với UI, quản lý state, tối ưu performance.
5. **CSS Modules cho component-level**, BEM cho global CSS.
6. **Import theo thứ tự**: React → Hooks/Context → Services → Components → Styles.
