# 🏖️ Module: Leave — Quản lý nghỉ phép

## Phạm vi nghiệp vụ
Module `leave` quản lý đơn xin nghỉ phép của nhân viên:
- Tạo đơn nghỉ phép
- Duyệt / từ chối đơn (Manager)
- Xem số ngày phép còn lại
- Lịch sử nghỉ phép

## Cấu trúc

```
leave/
├── README.md
├── components/
│   ├── LeaveRequestForm/
│   ├── LeaveRequestCard/
│   └── LeaveBalance/
├── pages/
│   ├── LeaveRequestPage/
│   └── LeaveApprovalPage/
├── services/
│   └── leave.service.js
└── hooks/
    ├── useLeaveRequest.js
    └── useLeaveBalance.js
```
