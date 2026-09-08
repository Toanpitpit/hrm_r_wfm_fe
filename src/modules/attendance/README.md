# ⏰ Module: Attendance — Chấm công

## Phạm vi nghiệp vụ
Module `attendance` quản lý việc chấm công của nhân viên:
- Check-in / Check-out
- Xem lịch sử chấm công
- Báo cáo đi muộn / về sớm
- Thống kê giờ công

## Cấu trúc

```
attendance/
├── README.md
├── components/
│   ├── CheckInButton/
│   ├── AttendanceTable/
│   └── AttendanceCalendar/
├── pages/
│   ├── AttendancePage/
│   └── AttendanceHistoryPage/
├── services/
│   └── attendance.service.js
└── hooks/
    ├── useAttendance.js
    └── useAttendanceHistory.js
```
