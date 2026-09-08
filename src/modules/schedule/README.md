# 📅 Module: Schedule — Quản lý ca làm việc

## Phạm vi nghiệp vụ
Module `schedule` quản lý lịch làm việc và ca (Workforce Management):
- Tạo / sửa ca làm việc (shift)
- Phân ca cho nhân viên
- Xem lịch làm việc theo tuần / tháng
- Đổi ca, hoán đổi lịch

## Cấu trúc

```
schedule/
├── README.md
├── components/
│   ├── ShiftCard/
│   ├── ScheduleCalendar/
│   └── ShiftAssignForm/
├── pages/
│   ├── SchedulePage/
│   └── ShiftManagementPage/
├── services/
│   └── schedule.service.js
└── hooks/
    ├── useSchedule.js
    └── useShiftList.js
```
