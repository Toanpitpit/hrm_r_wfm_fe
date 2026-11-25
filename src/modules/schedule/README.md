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
│   ├── ShiftRequestsWorkspace/    # Component nghiệp vụ của trang đơn
│   ├── ShiftRequestForm/          # Form dùng chung cho trang và modal
│   ├── MySwapRequestList/         # Đơn cá nhân và thao tác gửi/nhận
│   ├── StoreSwapRequestReview/    # Bộ lọc, bảng duyệt và phân trang
│   ├── ShiftRequestStats/
│   ├── ShiftRequestStatusBadge/
│   ├── ShiftRequestFeedback/
│   ├── ShiftSwapReviewList.jsx    # Danh sách duyệt nhúng trong tab lịch tuần
│   ├── ShiftSwapModal.jsx
│   ├── MySwapRequestsModal.jsx
│   └── ShiftSwapReviewModal.jsx
├── pages/
│   ├── ShiftRequestsPage/
│   ├── WeeklySchedulePage/
│   └── ShiftMasterPage/
├── services/
│   └── schedule.service.js
├── hooks/
│   ├── useShiftRequests.js        # Hook duy nhất cho toàn bộ luồng đơn
│   ├── useWeeklySchedule.js
│   └── useShiftTemplate.js
└── utils/
    └── shiftRequest.utils.js      # Identity, ngày, validation và payload
```

## Luồng đơn SWAP / LEAVE

`Page → Component nghiệp vụ → useShiftRequests → schedule.service → Backend`

Page giữ layout và điều hướng. Component nghiệp vụ gọi hook và truyền từng prop dữ liệu/handler
cho component giao diện; toast, xác nhận hủy và đóng modal được xử lý tại component
nghiệp vụ. Component giao diện không gọi service. Hook trả state, lỗi tải, lỗi từng
trường, số đếm, dữ liệu phân trang và kết quả thao tác `{ success, message, data }`.

Hook hỗ trợ các chế độ, không tạo thêm hook con:

| `mode` | Dữ liệu tải |
| --- | --- |
| `workspace` | Nhân viên: ca sắp tới và đơn cá nhân; quản lý: đơn chi nhánh |
| `create` | Tạo đơn cho `shift` truyền vào; chỉ tải đồng nghiệp/ca đổi khi chọn SWAP |
| `history` | Đơn cá nhân, phản hồi đồng nghiệp và hủy đơn |
| `review` | Đơn chi nhánh và thao tác phê duyệt |

`enabled: false` ngừng tải dữ liệu. `user` mặc định lấy hồ sơ đăng nhập; `branchId`
có thể được truyền từ lịch tuần. Không tự chọn chi nhánh 1 khi thiếu thông tin.
Danh sách đồng nghiệp được lấy theo chi nhánh và ngày ca đã chọn; khi đổi lựa chọn,
request cũ bị hủy và các trường phụ thuộc được reset. Các request mutation không
bị hủy giữa chừng; kết quả thuộc màn hình đã đóng hoặc ngữ cảnh cũ được bỏ qua.

LEAVE gửi `targetEmployeeId` và `targetAssignmentId` bằng `null`; SWAP cần cả hai.
Backend vẫn quyết định trạng thái đơn, kiểm tra nghiệp vụ và cập nhật lịch. Không
bổ sung chức năng tạo TRANSFER trong đợt refactor này; đơn TRANSFER cũ vẫn hiển thị.

Mỗi hàm fetch và thao tác có tên cụ thể, gọi trực tiếp service tương ứng; không có
lớp thực thi request tổng quát. Với màn duyệt đơn chi nhánh, backend xử lý filter,
tìm kiếm, thống kê và phân trang trong truy vấn database. Hook chỉ giữ tham số
`status`, `search`, `page`, `pageSize`, gọi lại API khi chúng đổi và cung cấp response
cho component. Service chỉ chuyển tham số sang Axios, không xử lý dữ liệu bảng.
Lịch sử đơn cá nhân vẫn lọc và phân trang trong hook; thay đổi này chỉ áp dụng màn duyệt.

`GET /api/shifts/swap-requests/{branchId}?status=PENDING&search=...&page=2&pageSize=10`
trả `data: { items, totalItems, page, pageSize, statistics }`. `totalItems` tính theo
bộ lọc/từ khóa; `statistics` gồm `totalCount`, `pendingCount`, `approvedCount`,
`rejectedCount`, `expiredCount` của toàn chi nhánh. Hook không đếm lại từ `items`.
Backend tự điều chỉnh trang vượt giới hạn (ví dụ sau khi duyệt đơn cuối trang),
xếp đơn theo `createdAt` rồi mã đơn giảm dần. `page >= 1`, `pageSize` từ 1 đến 100,
từ khóa tối đa 200 ký tự. Frontend/backend cần cập nhật cùng phiên bản response này.

Sau thao tác thành công, hook tải lại đúng nhóm dữ liệu liên quan. Modal tạo đơn gọi
`onSuccess` để lịch cá nhân tải lại; modal phê duyệt gọi `onReviewed` để lịch tuần
tải lại. Tải lại thất bại được hiển thị riêng, không biến thao tác đã thành công
thành lỗi gửi đơn khiến người dùng gửi trùng.

## Kiểm tra hồi quy

`npm run test:shift-requests`

Bộ kiểm tra chạy Chromium với Vite và mock toàn bộ API, không ghi dữ liệu backend.
Ngoài hook và modal, test chạy cả route ứng dụng `/employee/shift-requests` qua
`AuthProvider`, router, sidebar và giao diện thật. CDP kiểm tra request initiator
có tên hàm hook; đổi filter, từ khóa, trang hoặc cỡ trang của màn duyệt phát sinh GET
với query tương ứng. Test cũng kiểm tra thống kê từ server, lỗi/retry và response cũ.
Cần Playwright và Chromium có sẵn. Nếu dùng bản cài ngoài dự án, đặt
`PLAYWRIGHT_MODULE` tới `playwright/index.mjs`; có thể đặt
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` tới executable Chromium hiện có.
Các file `tests/shift-requests.html` và `tests/shift-requests.harness.jsx` chỉ phục vụ
kiểm tra, không được import vào ứng dụng production.

## Điểm trỏ code khi kiểm tra dự án

| Thao tác | Hàm trong `useShiftRequests.js` | Service | API |
| --- | --- | --- | --- |
| Tải ca của mình | `fetchMyShifts` | `getMyShifts` | `GET /shifts/my-shifts` |
| Tải đơn cá nhân | `fetchMyRequests` | `getMySwapRequests` | `GET /shifts/my-swap-requests` |
| Tải/lọc/phân trang đơn chi nhánh | `fetchStoreRequests` | `getStoreSwapRequests` | `GET /shifts/swap-requests/{branchId}?status=...&search=...&page=...&pageSize=...` |
| Tải đồng nghiệp | `fetchColleagues` | `getColleaguesForSwap` | `GET /shifts/colleagues/{branchId}?workDate=...` |
| Tải ca đổi | `fetchColleagueShifts` | `getColleagueShifts` | `GET /shifts/colleague-shifts/{employeeId}?requestingAssignmentId=...` |
| Gửi đơn | `submitRequest` | `createSwapRequest` | `POST /shifts/swap-request` |
| Đồng nghiệp phản hồi | `respondToRequest` | `respondToSwapRequest` | `POST /shifts/swap-peer-review` |
| Hủy đơn | `cancelRequest` | `cancelSwapRequest` | `POST /shifts/swap-cancel/{id}` |
| Quản lý xét duyệt | `reviewRequest` | `reviewSwapRequest` | `POST /shifts/swap-review` |

Backend nhận các route trên tại `ShiftSwapsController`; ca của mình nằm trong
`ShiftsController`. Các route đổi ca có alias `/shift-swaps` hiện có.

Để lần luồng duyệt trong Sources: tìm `setReviewFilter`, `setSearchTerm`,
`setReviewPage`, `setReviewPageSize` → effect → `fetchStoreRequests` →
`getStoreSwapRequests`. Backend: `ShiftSwapsController.GetSwapRequests` →
`ShiftSwapService.GetSwapRequestsByStoreAsync` (`Where`, `CountAsync`, `Skip`, `Take`).
`pagedStoreRequests` là dữ liệu trang backend trả về, không phải kết quả `slice` frontend.

Network Initiator vẫn có dòng Axios/service vì service gửi HTTP. Mở stack và
Sources để lần tới hàm hook có tên ở bảng trên; không kỳ vọng hook là một URL API.

## Tích hợp lịch tuần sau merge

Lịch tuần chỉ giữ hai tab phân bổ và định mức; duyệt đơn có mục riêng ở sidebar.
Component dùng chung `ShiftSwapReviewList`/modal dùng `useShiftRequests` và cùng API
phân trang backend, có điều khiển phân trang để truy cập đủ các đơn.
Hai nút xóa gọi riêng `DELETE /shifts/assignments/weekly` (giữ định mức) và
`DELETE /shifts/schedules/weekly` (xóa khung ca/định mức); backend cần có các API
đã được bổ sung từ nhánh `origin/main`.
