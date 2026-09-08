# 🌐 Project Overview — Ngữ cảnh dự án cho AI

## Mục đích
File này cung cấp **ngữ cảnh tổng quan** về dự án để AI hiểu đúng codebase ngay từ đầu.  
**Đính kèm nội dung này** khi bắt đầu session mới với AI.

---

## Thông tin dự án

- **Tên dự án**: SWP391 — HRM & Workforce Management
- **Framework**: React JS (Vite)
- **Ngôn ngữ**: JavaScript (ES6+)
- **Package Manager**: npm
- **Kiến trúc**: Monolith, Modular Architecture (chia theo phân hệ nghiệp vụ)
- **Quản lý code**: Git, chuẩn Gitflow

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
| Database | SQL (SQL Server/MySQL/PostgreSQL) |

## Cấu trúc thư mục (Modular Architecture)

```
frontend/
├── agents/                          🤖 AI Prompts & Skills cho team
│   ├── rules/coding-standards.md
│   ├── prompts/                     Prompt templates
│   └── context/project-overview.md  ← File này
│
├── src/
│   ├── modules/                     📦 PHÂN HỆ NGHIỆP VỤ
│   │   ├── auth/                    Đăng nhập, đăng ký
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── context/
│   │   ├── dashboard/               Trang tổng quan
│   │   ├── employee/                Quản lý nhân sự
│   │   ├── department/              Quản lý phòng ban
│   │   ├── attendance/              Chấm công
│   │   ├── schedule/                Ca làm việc
│   │   └── leave/                   Nghỉ phép
│   │
│   ├── shared/                      🔗 DÙNG CHUNG cho tất cả modules
│   │   ├── components/              Button, Modal, Table, Layout,...
│   │   ├── hooks/                   useDebounce, useToggle,...
│   │   ├── constants/               API endpoints, messages,...
│   │   ├── context/                 ThemeContext,...
│   │   └── utils/                   format, validate,...
│   │
│   ├── config/                      ⚙️ Axios config, env setup
│   ├── routers/                     🛤️ React Router DOM
│   ├── styles/                      🎨 CSS global, variables, reset
│   ├── assets/                      🖼️ Hình ảnh, icons, fonts
│   ├── App.jsx
│   └── main.jsx
│
├── .env / .env.development / .env.production
└── vite.config.js
```

## Quy tắc quan trọng

### Modular Architecture
1. **Code nghiệp vụ** nằm trong `modules/[tên_module]/`.
2. **Code dùng chung** nằm trong `shared/`.
3. **KHÔNG import chéo** giữa các module. Nếu cần dùng chung → chuyển vào `shared/`.
4. Mỗi module có **components, pages, services, hooks riêng**.

### Gitflow
- `main` — Production, luôn stable
- `develop` — Nhánh phát triển chính
- `feature/[module-name]` — Nhánh tính năng theo module
- `hotfix/[bug-name]` — Sửa lỗi khẩn cấp
- `release/[version]` — Chuẩn bị release

### Quy ước đặt tên
- **Components / Pages**: PascalCase folder → `Button/index.jsx`
- **Services**: camelCase + `.service.js` → `auth.service.js`
- **Hooks**: `use` prefix → `useDebounce.js`
- **Constants**: camelCase + `.constants.js` → `api.constants.js`
- **Context**: PascalCase + `Context.jsx` → `AuthContext.jsx`
- **CSS Modules**: `[name].module.css`
- **Biến**: camelCase, boolean dùng `is/has/can` prefix

### Workflow khi code tính năng mới trong module
```
shared/constants → modules/[tên]/services → modules/[tên]/context
→ modules/[tên]/hooks → modules/[tên]/components → modules/[tên]/pages → routers
```

### Import rules
```jsx
// ✅ Import từ shared
import Button from '@/shared/components/Button';

// ✅ Import trong cùng module (relative path)
import EmployeeCard from '../components/EmployeeCard';

// ✅ Import config
import axiosInstance from '@/config/axios.config';

// ❌ KHÔNG import từ module khác
import AttendanceCard from '@/modules/attendance/components/AttendanceCard';
```
