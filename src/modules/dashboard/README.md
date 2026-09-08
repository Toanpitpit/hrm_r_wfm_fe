# 📊 Module: Dashboard — Trang tổng quan

## Phạm vi nghiệp vụ
Module `dashboard` hiển thị tổng quan thông tin cho người dùng sau khi đăng nhập:
- Thống kê nhanh (số nhân viên, số ca hôm nay, số đơn nghỉ phép,...)
- Biểu đồ tổng quan
- Thông báo / hoạt động gần đây

## Cấu trúc

```
dashboard/
├── README.md
├── components/         ← StatCard, ChartWidget, NotificationList,...
├── pages/              ← DashboardPage
├── services/           ← dashboard.service.js (lấy dữ liệu thống kê)
└── hooks/              ← useDashboardStats.js
```
