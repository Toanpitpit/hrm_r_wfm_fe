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
lớp thực thi request tổng quát. Filter, tìm kiếm, thống kê, reset trang và `slice`
dữ liệu trang được tính trong `useShiftRequests`, không đặt trong component hoặc service.
Các component danh sách chỉ nhận `requests` của trang, `totalItems`, thông tin trang
và callback. `reviewTabs` và `reviewStats` cũng được tính trong hook.

Sau thao tác thành công, hook tải lại đúng nhóm dữ liệu liên quan. Modal tạo đơn gọi
`onSuccess` để lịch cá nhân tải lại; modal phê duyệt gọi `onReviewed` để lịch tuần
tải lại. Tải lại thất bại được hiển thị riêng, không biến thao tác đã thành công
thành lỗi gửi đơn khiến người dùng gửi trùng.

## Kiểm tra hồi quy

`npm run test:shift-requests`

Bộ kiểm tra chạy Chromium với Vite và mock toàn bộ API, không ghi dữ liệu backend.
Ngoài hook và modal, test chạy cả route ứng dụng `/employee/shift-requests` qua
`AuthProvider`, router, sidebar và giao diện thật. CDP kiểm tra request initiator
có tên hàm hook; đổi filter hoặc trang không phát sinh thêm request nghiệp vụ.
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
| Tải đơn chi nhánh | `fetchStoreRequests` | `getStoreSwapRequests` | `GET /shifts/swap-requests/{branchId}` |
| Tải đồng nghiệp | `fetchColleagues` | `getColleaguesForSwap` | `GET /shifts/colleagues/{branchId}?workDate=...` |
| Tải ca đổi | `fetchColleagueShifts` | `getColleagueShifts` | `GET /shifts/colleague-shifts/{employeeId}?requestingAssignmentId=...` |
| Gửi đơn | `submitRequest` | `createSwapRequest` | `POST /shifts/swap-request` |
| Đồng nghiệp phản hồi | `respondToRequest` | `respondToSwapRequest` | `POST /shifts/swap-peer-review` |
| Hủy đơn | `cancelRequest` | `cancelSwapRequest` | `POST /shifts/swap-cancel/{id}` |
| Quản lý xét duyệt | `reviewRequest` | `reviewSwapRequest` | `POST /shifts/swap-review` |

Backend nhận các route trên tại `ShiftSwapsController`; ca của mình nằm trong
`ShiftsController`. Các route đổi ca có alias `/shift-swaps` hiện có.

Để trỏ logic filter/phân trang trong Sources: tìm `filteredStoreRequests`,
`filteredMyRequests`, `pagedStoreRequests`, `pagedMyRequests` và các setter
`setReviewFilter`, `setSearchTerm`, `setReviewPage`, `setReviewPageSize`,
`setMyTab`, `setMyPage`, `setMyPageSize`. Chúng không gọi HTTP.

Network Initiator vẫn có dòng Axios/service vì service gửi HTTP. Mở stack và
Sources để lần tới hàm hook có tên ở bảng trên; không kỳ vọng hook là một URL API.

## Tích hợp lịch tuần sau merge

Lịch tuần giữ ba tab phân bổ, định mức và xét duyệt. `ShiftSwapReviewList` dùng
`useShiftRequests` để tải, lọc, đếm và duyệt đơn; modal dùng cùng component này.
Sau khi duyệt thành công, callback cập nhật ma trận tuần và số đơn chờ duyệt.
Hai nút xóa gọi riêng `DELETE /shifts/assignments/weekly` (giữ định mức) và
`DELETE /shifts/schedules/weekly` (xóa khung ca/định mức); backend cần có các API
đã được bổ sung từ nhánh `origin/main`.
