# 👤 Module: Employee — Quản lý nhân sự

## Phạm vi nghiệp vụ
Module `employee` quản lý toàn bộ thông tin nhân viên:
- Danh sách nhân viên (CRUD)
- Hồ sơ nhân viên chi tiết
- Tìm kiếm, lọc nhân viên
- Phân quyền theo vai trò (role)

## Cấu trúc

```
employee/
├── README.md
├── components/
│   ├── EmployeeCard/
│   ├── EmployeeForm/
│   ├── EmployeeTable/
│   └── EmployeeFilter/
├── pages/
│   ├── EmployeeListPage/
│   └── EmployeeDetailPage/
├── services/
│   └── employee.service.js
└── hooks/
    ├── useEmployeeList.js
    └── useEmployeeDetail.js
```

## API Endpoints tham khảo
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /employees | Lấy danh sách nhân viên |
| GET | /employees/:id | Lấy chi tiết nhân viên |
| POST | /employees | Tạo nhân viên mới |
| PUT | /employees/:id | Cập nhật nhân viên |
| DELETE | /employees/:id | Xóa nhân viên |
