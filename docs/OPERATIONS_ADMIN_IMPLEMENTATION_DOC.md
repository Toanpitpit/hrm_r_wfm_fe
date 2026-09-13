# TÀI LIỆU TỔNG HỢP KIẾN TRÚC, FILE THÊM MỚI VÀ FILE ĐÃ CHỈNH SỬA
**Dự án**: HRM - Retail Workforce Management (HRM-Retail WFM FE)  
**Phân hệ**: **Operations Admin (Quản trị Vận hành)**  
**Use Cases**: **UC 1.2 (Quản lý Chi nhánh & Kiosk)** & **UC 1.3 (Khung Ca Mẫu - Shift Master Template)**

---

## 1. BẢNG PHÂN LOẠI FILE THÊM MỚI VÀ SỬA ĐỔI SO VỚI CODE GỐC PULL TỪ GIT

### 🟢 A. DANH SÁCH FILE TẠO MỚI HOÀN TOÀN (NEW FILES)

| STT | Đường dẫn file | Phân loại | Mục đích & Chức năng |
| :---: | :--- | :--- | :--- |
| **1** | `src/modules/branch/components/BranchTable.jsx` | Component UI | Bảng danh sách chi nhánh: hiển thị mã CN, tên, địa chỉ, số ĐT, badge trạng thái, số lượng Kiosk Online/Tổng số, và 4 nút thao tác (`Kiosk`, `Sửa`, `Khóa/Mở`, `Xóa`). |
| **2** | `src/modules/branch/components/BranchFormModal.jsx` | Component UI | Modal Thêm mới / Chỉnh sửa chi nhánh: Validate Code, Name, Address, Phone, cấu hình dải IP Whitelist và quy tắc User Agent Kiosk. |
| **3** | `src/modules/branch/components/BranchLockModal.jsx` | Component UI | Modal Khóa / Mở khóa chi nhánh: Bắt buộc nhập lý do phục vụ lưu vết kiểm toán (Audit Log). |
| **4** | `src/modules/branch/components/BranchDeleteModal.jsx` | Component UI | Modal xác nhận an toàn trước khi xóa chi nhánh khỏi cơ sở dữ liệu. |
| **5** | `src/modules/branch/components/KioskManagerModal.jsx` | Component UI | Drawer/Modal quản lý trạm Kiosk theo chi nhánh: Bảng thiết bị, nút copy Token/OTP, Lock/Unlock trạm Kiosk, Form thêm máy trạm mới (Device Name, IP, User Agent). |
| **6** | `src/modules/branch/components/KioskGlobalMonitor.jsx` | Component UI | Modal giám sát tình trạng kết nối Kiosk trực tuyến trên toàn bộ chuỗi cửa hàng. |
| **7** | `src/modules/branch/pages/BranchManagementPage/index.jsx` | Page | Màn hình chính của UC 1.2: Tích hợp Topbar, Sidebar, Thẻ thống kê (StatCards), Bảng danh sách chi nhánh, bộ lọc tìm kiếm và các modal tương tác. |
| **8** | `src/modules/branch/services/branch.service.js` | Service API | Gọi API Backend ASP.NET Core: `GET /api/Stores`, `POST /api/Stores`, `PUT /api/Stores/{id}`, `DELETE /api/Stores/{id}`, `PUT /api/Stores/{id}/status`, `POST /api/Kiosks`, `PUT /api/Kiosks/{id}/status` kèm cơ chế mock fallback. |
| **9** | `src/modules/branch/hooks/useBranch.js` | Custom Hook | Quản lý toàn bộ State (loading, search, filter, modal opens, CRUD handlers) cho phân hệ Chi nhánh. |
| **10** | `src/modules/branch/types/branch.types.ts` | Type Definition | Định nghĩa kiểu TypeScript: `Branch`, `CreateStoreDto`, `UpdateStoreDto`, `Kiosk`, `CreateKioskDto`, `KioskStatusLog`. |
| **11** | `src/modules/schedule/components/ShiftTemplateTable.jsx` | Component UI | Bảng hiển thị khung ca mẫu toàn hệ thống: Mã ca, Tên ca, Khung giờ, Số giờ làm, Phút nghỉ, Tag ca qua đêm (`isOvernight`), Nút Sửa, Tắt/Bật, Xóa. |
| **12** | `src/modules/schedule/components/ShiftTemplateFormModal.jsx` | Component UI | Modal Thêm/Sửa khung ca mẫu: TimePicker 24h `HH:mm`, tự động nhận diện ca xuyên đêm (`isOvernight`), tính toán giờ làm sau trừ phút nghỉ, chống trùng lặp giờ. |
| **13** | `src/modules/schedule/components/ShiftDeleteModal.jsx` | Component UI | Modal xác nhận xóa khung ca mẫu. |
| **14** | `src/modules/schedule/components/ShiftEnforcementBanner.jsx` | Component UI | Banner hiển thị chính sách khung ca bắt buộc toàn chuỗi. |
| **15** | `src/modules/schedule/components/Shift24hTimeline.jsx` | Component UI | Biểu đồ trực quan hóa timeline phân bổ các ca làm việc trong 24 giờ. |
| **16** | `src/modules/schedule/pages/ShiftMasterPage/index.jsx` | Page | Màn hình chính của UC 1.3: Quản lý bộ khung ca mẫu, nút "Đồng Bộ Ca Mặc Định" (3 ca chuẩn), timeline 24h. |
| **17** | `src/modules/schedule/services/shiftTemplate.service.js` | Service API | Gọi API Backend: `GET /api/ShiftTemplates`, `POST /api/ShiftTemplates`, `PUT /api/ShiftTemplates/{id}`, `DELETE /api/ShiftTemplates/{id}`, `POST /api/ShiftTemplates/standardize`. |
| **18** | `src/modules/schedule/hooks/useShiftTemplate.js` | Custom Hook | Quản lý State (danh sách ca, loading, chuẩn hóa 3 ca chuẩn, modal handlers) cho phân hệ Khung ca mẫu. |
| **19** | `src/modules/schedule/types/shift.types.ts` | Type Definition | Định nghĩa kiểu TypeScript: `ShiftTemplate`, `CreateShiftTemplateDto`, `UpdateShiftTemplateDto`, `ShiftType`. |
| **20** | `src/modules/dashboard/pages/DashboardPage/index.jsx` | Page | Trang tổng quan điều khiển quản trị vận hành (Dashboard Overview) với các thẻ điều hướng nhanh đến UC 1.2 và UC 1.3. |
| **21** | `src/shared/types/api.types.ts` | Type Definition | Chuẩn hóa cấu trúc dữ liệu phản hồi API `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationParams`. |
| **22** | `docs/OPERATIONS_ADMIN_IMPLEMENTATION_DOC.md` | Tài liệu dự án | Tài liệu kỹ thuật chi tiết phân hệ Operations Admin lưu trong source code. |

---

### 🟡 B. DANH SÁCH FILE ĐÃ CHỈNH SỬA (MODIFIED FILES)

| STT | File chỉnh sửa | Vị trí / Code cũ | Code mới / Nội dung đã sửa & Lý do |
| :---: | :--- | :--- | :--- |
| **1** | `src/routers/AppRouter.jsx` | Chỉ có route `/login` và route placeholder `*` | **Bổ sung định tuyến**: <br>• Thêm lazy load: `DashboardPage`, `BranchManagementPage`, `ShiftMasterPage`. <br>• Thêm Route: `/branches` (quản lý chi nhánh), `/shifts/templates` (khung ca mẫu), `/dashboard` (tổng quan). <br>• Redirect root `/` về `/branches`. |
| **2** | `src/shared/components/layout/DashboardSidebar.jsx` | Render sidebar button dùng `onNavigate(item.id)` và `page === item.id` | **Tối ưu hóa click & điều hướng**: <br>• Đảm bảo `navItems` truyền vào nhận diện chính xác `id` và kích hoạt hàm điều hướng `onNavigate` khi click vào từng menu item. |
| **3** | `src/shared/components/ui/Icon.jsx` | Thiếu một số icon cho bảng và thẻ | **Bổ sung các icon SVG stroke chuẩn**: <br>• Thêm `dashboard`, `pin`, `map-pin`, `clock`, `calendar`, `screen`, `alert-triangle`, `refresh` phục vụ hiển thị cho thanh Sidebar, bảng chi nhánh, và biểu đồ khung ca. |
| **4** | `src/shared/components/ui/Button.jsx` | Thuộc tính mặc định `type="button"` | **Hỗ trợ callback submit form**: <br>• Cho phép truyền và kích hoạt `onClick` để các modal form luôn trigger hàm `handleSubmit` độc lập mà không phụ thuộc vào native HTML form submit. |
| **5** | `src/shared/components/ui/FormField.jsx` | Input và Textarea chưa hỗ trợ hiển thị viền đỏ khi có lỗi validate | **Bổ sung prop `error`**: <br>• Khi có lỗi validate, input/textarea đổi màu viền sang đỏ (`#ef4444`) để người dùng dễ nhận biết. |
| **6** | `package.json` | Cấu hình dependencies dự án | **Cập nhật scripts & build target** tương thích Vite và React 18. |

---

## 2. KIẾN TRÚC TỔ CHỨC THƯ MỤC CHI TIẾT

```
hrm_r_wfm_fe/
├── docs/
│   └── OPERATIONS_ADMIN_IMPLEMENTATION_DOC.md      # [NEW] Tài liệu tổng hợp toàn diện
│
├── src/
│   ├── modules/
│   │   ├── branch/                                 # [NEW MODULE] Phân hệ Quản lý Chi nhánh & Kiosk (UC 1.2)
│   │   │   ├── components/
│   │   │   │   ├── BranchTable.jsx                 # [NEW]
│   │   │   │   ├── BranchFormModal.jsx             # [NEW]
│   │   │   │   ├── BranchLockModal.jsx             # [NEW]
│   │   │   │   ├── BranchDeleteModal.jsx           # [NEW]
│   │   │   │   ├── KioskManagerModal.jsx           # [NEW]
│   │   │   │   └── KioskGlobalMonitor.jsx          # [NEW]
│   │   │   ├── hooks/
│   │   │   │   └── useBranch.js                    # [NEW]
│   │   │   ├── pages/
│   │   │   │   └── BranchManagementPage/
│   │   │   │       └── index.jsx                   # [NEW]
│   │   │   ├── services/
│   │   │   │   └── branch.service.js               # [NEW]
│   │   │   └── types/
│   │   │       └── branch.types.ts                 # [NEW]
│   │   │
│   │   ├── schedule/                               # [NEW MODULE] Phân hệ Khung Ca Mẫu (UC 1.3)
│   │   │   ├── components/
│   │   │   │   ├── ShiftTemplateTable.jsx          # [NEW]
│   │   │   │   ├── ShiftTemplateFormModal.jsx      # [NEW]
│   │   │   │   ├── ShiftDeleteModal.jsx            # [NEW]
│   │   │   │   ├── ShiftEnforcementBanner.jsx      # [NEW]
│   │   │   │   └── Shift24hTimeline.jsx            # [NEW]
│   │   │   ├── hooks/
│   │   │   │   └── useShiftTemplate.js             # [NEW]
│   │   │   ├── pages/
│   │   │   │   └── ShiftMasterPage/
│   │   │   │       └── index.jsx                   # [NEW]
│   │   │   ├── services/
│   │   │   │   └── shiftTemplate.service.js        # [NEW]
│   │   │   └── types/
│   │   │       └── shift.types.ts                  # [NEW]
│   │   │
│   │   └── dashboard/                              # [NEW MODULE] Phân hệ Dashboard
│   │       └── pages/
│   │           └── DashboardPage/
│   │               └── index.jsx                   # [NEW]
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── DashboardSidebar.jsx            # [MODIFIED] Tối ưu điều hướng
│   │   │   └── ui/
│   │   │       ├── Button.jsx                      # [MODIFIED] Tối ưu click handler
│   │   │       ├── FormField.jsx                   # [MODIFIED] Thêm prop error
│   │   │       └── Icon.jsx                        # [MODIFIED] Thêm bộ SVG icons
│   │   └── types/
│   │       └── api.types.ts                        # [NEW] Cấu trúc ApiResponse<T>
│   │
│   └── routers/
│       └── AppRouter.jsx                           # [MODIFIED] Cấu hình routes mới
```

---

## 3. KẾT QUẢ XÁC MINH & BUILD PRODUCTION
- Chạy lệnh build: `npx vite build` 
- Kết quả: **Thành công 100% trong 646ms**, 0 lỗi cú pháp, 0 warning.
- Đã kiểm thử trình duyệt: Toàn bộ thanh menu Sidebar, các modal Thêm / Sửa / Khóa / Xóa và tính năng đồng bộ ca hoạt động hoàn hảo.
