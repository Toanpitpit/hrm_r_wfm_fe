# 📦 Modules — Phân hệ nghiệp vụ (Modular Architecture)

## Mục đích
Thư mục `modules/` là trung tâm tổ chức code theo **phân hệ nghiệp vụ**.  
Mỗi module là một **đơn vị độc lập**, chứa đầy đủ components, pages, services, hooks của riêng nó.

## Cấu trúc tổng quan

```
modules/
├── README.md               ← Bạn đang đọc file này
├── auth/                   ← Đăng nhập, đăng ký, quên mật khẩu
│   ├── components/         ← UI components riêng cho Auth
│   ├── pages/              ← LoginPage, RegisterPage,...
│   ├── services/           ← auth.service.js
│   └── hooks/              ← useAuth.js
├── dashboard/              ← Trang tổng quan
├── employee/               ← Quản lý nhân sự
├── department/             ← Quản lý phòng ban
├── attendance/             ← Chấm công
├── schedule/               ← Quản lý ca làm việc
└── leave/                  ← Quản lý nghỉ phép
```

## Quy tắc quan trọng

### 1. Mỗi module là một đơn vị độc lập
```
modules/employee/
├── components/              ← UI components CHỈ DÙNG trong module này
│   ├── EmployeeCard/
│   │   ├── index.jsx
│   │   └── EmployeeCard.module.css
│   └── EmployeeForm/
│       ├── index.jsx
│       └── EmployeeForm.module.css
├── pages/                   ← Các trang của module
│   ├── EmployeeListPage/
│   │   ├── index.jsx
│   │   └── EmployeeListPage.module.css
│   └── EmployeeDetailPage/
│       ├── index.jsx
│       └── EmployeeDetailPage.module.css
├── services/                ← Gọi API liên quan đến employee
│   └── employee.service.js
├── hooks/                   ← Custom hooks riêng
│   ├── useEmployeeList.js
│   └── useEmployeeDetail.js
└── context/                 ← Context riêng (nếu cần)
    └── EmployeeContext.jsx
```

### 2. Không import chéo giữa các module
```jsx
// ✅ ĐÚNG — Import từ shared
import Button from '@/shared/components/Button';

// ✅ ĐÚNG — Import trong cùng module
import EmployeeCard from '../components/EmployeeCard';

// ❌ SAI — Import từ module khác
import AttendanceCard from '@/modules/attendance/components/AttendanceCard';
```

> Nếu 2 module cần dùng chung 1 component → chuyển component đó vào `src/shared/components/`.

### 3. Khi nào tạo module mới?
- Khi có **1 phân hệ nghiệp vụ mới** cần quản lý riêng (VD: thêm quản lý lương).
- Khi **1 nhóm chức năng** có đủ pages + services + components riêng.

### 4. Phân chia task team theo module
- Mỗi thành viên / nhóm nhỏ phụ trách **1-2 modules**.
- Feature branch theo module: `feature/employee`, `feature/attendance`.
- Giảm conflict Git vì mỗi người code ở folder riêng.

## Workflow khi code tính năng mới trong module

```
1️⃣  constants (nếu cần)   →  Thêm endpoints vào shared/constants/
2️⃣  services               →  Viết API call tại modules/[tên]/services/
3️⃣  context (nếu cần)      →  Tạo Context tại modules/[tên]/context/
4️⃣  hooks                  →  Viết hook tại modules/[tên]/hooks/
5️⃣  components             →  Tạo UI tại modules/[tên]/components/
6️⃣  pages                  →  Ráp vào page tại modules/[tên]/pages/
7️⃣  routers                →  Đăng ký route tại src/routers/
```
