# 🔐 Module: Auth — Xác thực & Phân quyền

## Phạm vi nghiệp vụ
Module `auth` quản lý toàn bộ chức năng liên quan đến xác thực người dùng:
- Đăng nhập (Login)
- Đăng ký (Register)
- Quên mật khẩu (Forgot Password)
- Đổi mật khẩu (Change Password)
- Quản lý session / token

## Cấu trúc

```
auth/
├── README.md
├── components/
│   ├── LoginForm/
│   │   ├── index.jsx
│   │   └── LoginForm.module.css
│   └── RegisterForm/
│       ├── index.jsx
│       └── RegisterForm.module.css
├── pages/
│   ├── LoginPage/
│   │   ├── index.jsx
│   │   └── LoginPage.module.css
│   └── RegisterPage/
│       ├── index.jsx
│       └── RegisterPage.module.css
├── services/
│   └── auth.service.js
├── hooks/
│   └── useAuth.js
└── context/
    └── AuthContext.jsx
```

## Ghi chú
- `AuthContext` nên được bọc ở **App level** (`App.jsx`) vì mọi module đều cần biết trạng thái đăng nhập.
- Service `auth.service.js` chỉ xử lý gọi API login/register/logout.
- Hook `useAuth` wrap lại Context để dễ sử dụng: `const { user, login, logout } = useAuth()`.
