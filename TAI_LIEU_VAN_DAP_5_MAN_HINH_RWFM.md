# HỆ THỐNG R-WFM (RETAIL CHAIN WORKFORCE MANAGEMENT PLATFORM)
## CẨM NANG VẤN ĐÁP CODE V2.0 — BÁO CÁO HỘI ĐỒNG TỐT NGHIỆP
### PHÂN HỆ QUẢN TRỊ CƠ SỞ & NGUỒN LỰC VẬN HÀNH (BỘ 5 MÀN HÌNH CHỨC NĂNG)

> **File Word hoàn chỉnh (.docx):** [TAI_LIEU_VAN_DAP_5_MAN_HINH_RWFM.docx](file:///c:/Users/Admin/Documents/GitHub/hrm_r_wfm_fe/TAI_LIEU_VAN_DAP_5_MAN_HINH_RWFM.docx)  
> **Cơ sở cấu trúc:** Tách từ 3 trang code gốc thành 5 màn hình chức năng độc lập theo chuẩn kỹ nghệ phần mềm:
> 1. **Màn 1:** Quản Trị Master Data Phân Cấp Chi Nhánh (`/tiers` hoặc tab Master Tier)
> 2. **Màn 2:** Điều Chuyển & Phân Bổ Phân Cấp Chi Nhánh (`/branch-tiers`)
> 3. **Màn 3:** Quản Lý Danh Mục & Kiểm Soát Vận Hành Chi Nhánh (`/branches` - List View)
> 4. **Màn 4:** Giám Sát Không Gian Bản Đồ GIS Geofence (`/branches` - Map View)
> 5. **Màn 5:** Quản Trị Khung Ca Mẫu & Công Cụ Batch Engine (`/shifts/templates`)

---

## PHẦN 1: BẢNG ĐỐI SOÁT 5 MÀN HÌNH CHỨC NĂNG CỦA ỨNG VIÊN

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   LUỒNG VẬN HÀNH 5 MÀN HÌNH CHỨC NĂNG KHÉP KÍN                                   │
│                                                                                                  │
│ [MÀN 1: MASTER DATA TIER] ──► [MÀN 2: ĐIỀU CHUYỂN TIER] ──► [MÀN 3: VẬN HÀNH CHI NHÁNH]          │
│ Định biên Min/Max staff        Nhóm Tier & Đổi cấp độ       Tự động map Tier; Khóa HTTP 423      │
│                                                                     │                            │
│                                                                     ▼                            │
│ [MÀN 5: KHUNG CA & BATCH ENGINE] ◄─────────────────────── [MÀN 4: BẢN ĐỒ GIS GEOFENCE]           │
│ Ca Hybrid & Quét trùng giờ O(N^2)                          Tọa độ WGS84 & Hàng rào mét thực địa  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Màn Hình Báo Cáo | Route URL / View | Bản Chất Component Code | File Backend Phụ Trách | Nghiệp Vụ & Giải Thuật Cốt Lõi |
| :--- | :--- | :--- | :--- | :--- |
| **Màn 1: Master Data Tier** | `/tiers` (hoặc tab Master Tier) | `TierManagementPage/index.jsx`<br>`TierTable.jsx`, `TierFormModal.jsx` | `TiersController.cs`<br>`TierService.cs` | Quy chuẩn định biên `MinStaff <= MaxStaff`; Ràng buộc toàn vẹn chặn xóa Orphan Guard. |
| **Màn 2: Điều Chuyển Tier** | `/branch-tiers` | `BranchTierManagementPage/index.jsx`<br>`useBranchTier.js`, `ChangeTierModal.jsx` | `BranchesController.cs`<br>`BranchService.cs` | Thống kê Tier động; Nhóm chi nhánh theo Color Palette; Modal đổi Tier cập nhật CSDL. |
| **Màn 3: Vận Hành Chi Nhánh** | `/branches` (List View) | `BranchManagementPage/index.jsx`<br>`BranchTable.jsx`, `useLockBranch.js` | `BranchesController.cs`<br>`BranchService.cs` | Tự động khớp Tier theo quân số; Quản lý thông tin pháp lý; Cơ chế Khóa chi nhánh HTTP 423. |
| **Màn 4: Bản Đồ GIS Geofence** | `/branches` (Map View) | `BranchMapView.jsx`<br>`BranchMapPicker.jsx` | `BranchesController.cs`<br>`NetTopologySuite GIS` | Nền bản đồ vệ tinh ArcGIS; Tọa độ WGS84 Point SRID 4326; Vòng tròn Geofence mét thực địa. |
| **Màn 5: Khung Ca & Batch** | `/shifts/templates` | `ShiftMasterPage/index.jsx`<br>`ShiftTemplateFormModal.jsx` | `ShiftTemplatesController.cs`<br>`ShiftTemplateService.cs` | Chế độ ca Hybrid Global/Custom; Tự nhận diện ca qua đêm (+1440m); Quét trùng giờ $O(N^2)$. |

---

## PHẦN 2: TRACE CHI TIẾT TỪNG MÀN HÌNH THEO 6 TIÊU CHÍ VẤN ĐÁP

### MÀN HÌNH 1: QUẢN TRỊ MASTER DATA PHÂN CẤP CHI NHÁNH
1. **API NÀO TRẢ VỀ:** `POST /api/tiers` (tạo mới), `DELETE /api/tiers/{id}` (xóa), `GET /api/tiers` (danh mục).
2. **LOGIC TÍNH TOÁN & THUẬT TOÁN:**
   - Tệp `TierService.cs` (dòng 42-68): Kiểm tra logic định biên `MaxStaffCount >= MinStaffCount` và tính duy nhất của `TierName`.
   - Integrity Guard (dòng 103-119): Eager loading `.Include(t => t.Branches)`. Nếu `tier.Branches.Any()` $\rightarrow$ chặn xóa ngay (HTTP 400), ngăn chặn bản ghi mồ côi (Orphan records).
3. **ĐƯỜNG ĐI TRÊN FRONTEND:** `TierFormModal.jsx` $\rightarrow$ `useTier.js` $\rightarrow$ `tier.service.js` $\rightarrow$ State `tierList` $\rightarrow$ `TierTable.jsx`.
4. **ĐƯỜNG ĐI TRÊN BACKEND:** `TiersController.cs` (dòng 48 & 80) $\rightarrow$ `TierService.cs` $\rightarrow$ Bảng `branch_tiers`.
5. **DATABASE STORAGE:** Bảng `branch_tiers`, khóa ngoại `branches.TierId` đặt `ON DELETE RESTRICT`.
6. **LỜI THOẠI VẤN ĐÁP MẪU:**
   > *"Kính thưa Hội đồng, Màn hình 1 là màn hình Quản trị Master Data Phân Cấp. Tại đây em thiết lập quy chuẩn định biên nhân sự cốt lõi cho toàn chuỗi cửa hàng. Logic tại TierService.cs dòng 48 chặn hoàn toàn các lỗi sai logic như Max nhỏ hơn Min. Đồng thời tại dòng 112 cài đặt cơ chế Integrity Guard: nếu phân cấp đang có chi nhánh liên kết thì hệ thống chặn xóa ngay lập tức để ngăn ngừa dữ liệu mồ côi."*

---

### MÀN HÌNH 2: ĐIỀU CHUYỂN & PHÂN BỔ PHÂN CẤP CHI NHÁNH
1. **API NÀO TRẢ VỀ:** `GET /api/branches` kết hợp `GET /api/tiers`; `PUT /api/branches/{id}` (cập nhật Tier).
2. **LOGIC TÍNH TOÁN & THUẬT TOÁN:**
   - `BranchTierManagementPage/index.jsx` và `useBranchTier.js`: Phân loại và nhóm chi nhánh theo các dải màu `TIER_COLOR_PALETTE`.
   - Xử lý điều chuyển: `ChangeTierModal.jsx` cho phép thay đổi phân cấp; Backend cập nhật `branches.TierId` và ghi nhận lịch sử.
3. **ĐƯỜNG ĐI TRÊN FRONTEND:** `BranchTierManagementPage` $\rightarrow$ Click 'Đổi Cấp Độ' $\rightarrow$ `ChangeTierModal` $\rightarrow$ `useBranchTier.js` $\rightarrow$ Cập nhật tức thì badge phân cấp trên UI.
4. **LỜI THOẠI VẤN ĐÁP MẪU:**
   > *"Thưa Thầy/Cô, Màn hình 2 đóng vai trò là Trung tâm Phân Bổ & Điều Chuyển Tier. Khác với màn 1 chỉ quản lý danh mục định nghĩa, màn 2 giám sát thực tế xem chi nhánh nào đang thuộc cấp độ nào. Khi một chi nhánh tăng trưởng doanh thu và nhân sự vượt định biên, cửa hàng trưởng hoặc Admin mở ChangeTierModal để điều chuyển phân cấp, hệ thống tự động cập nhật liên kết trong CSDL và phản ánh ngay lên giao diện."*

---

### MÀN HÌNH 3: QUẢN LÝ DANH MỤC & KIỂM SOÁT VẬN HÀNH CHI NHÁNH
1. **API NÀO TRẢ VỀ:** `POST /api/branches` (tạo mới), `PATCH /api/branches/{id}/status` (khóa/mở khóa), `GET /api/branches`.
2. **LOGIC TÍNH TOÁN & THUẬT TOÁN:**
   - `BranchService.cs` (dòng 117-231): Tự động khớp Tier theo quân số dự kiến nếu người dùng không chọn TierId thủ công.
   - Cơ chế Khóa Chi Nhánh: `IsBranchLocked(branch)` kiểm tra trạng thái; nếu chi nhánh đang bị khóa do bảo trì/sửa chữa, backend từ chối mọi thao tác xếp ca hoặc phân bổ nhân sự (HTTP 423 Locked).
3. **ĐƯỜNG ĐI TRÊN FRONTEND:** `BranchManagementPage` $\rightarrow$ `useBranch.js` và `useLockBranch.js` $\rightarrow$ `branch.service.js` $\rightarrow$ Render bảng và nút tác vụ Khóa/Mở khóa.
4. **LỜI THOẠI VẤN ĐÁP MẪU:**
   > *"Dạ, Màn hình 3 là Màn hình Quản Lý Vận Hành Chi Nhánh. Điểm thông minh ở màn hình này là khi khởi tạo cửa hàng, hệ thống có giải thuật tự động khớp Tier theo quy mô quân số tại BranchService.cs dòng 210. Đồng thời, tính năng Khóa Chi Nhánh thông qua hook useLockBranch cho phép tạm dừng hoạt động cửa hàng, trả về mã HTTP 423 Locked để bảo vệ dữ liệu ca làm việc không bị xáo trộn khi cửa hàng đang sửa chữa."*

---

### MÀN HÌNH 4: GIÁM SÁT KHÔNG GIAN BẢN ĐỒ GIS GEOFENCE
1. **API NÀO TRẢ VỀ:** `GET /api/branches` (Bóc tách `Location`, `Latitude`, `Longitude`, `GeofenceRadiusMeters`).
2. **LOGIC TÍNH TOÁN & ĐẶC TẢ GIS KHÔNG GIAN:**
   - Tọa độ GPS chuẩn không gian WGS84: Lưu trữ bằng `NetTopologySuite.Geometries.Point` với SRID 4326.
   - Bán kính điểm danh Geofence mét thực địa: Dùng component `<Circle>` của Leaflet vẽ vòng tròn bán kính đúng số mét trên thực địa bao quanh Marker.
   - Tích hợp lớp bản đồ ArcGIS World Street Map & Dark Gray Base không giới hạn quota API.
3. **ĐƯỜNG ĐI TRÊN FRONTEND:** `BranchManagementPage` (chuyển chế độ xem bản đồ) $\rightarrow$ `BranchMapView.jsx` nạp tọa độ $\rightarrow$ Ghim Marker theo màu Tier $\rightarrow$ Vẽ vòng tròn Geofence.
4. **LỜI THOẠI VẤN ĐÁP MẪU:**
   > *"Kính thưa Hội đồng, Màn hình 4 là Màn hình Giám Sát Không Gian Bản Đồ GIS Geofence. Toàn bộ tọa độ cửa hàng được xử lý bằng thư viện không gian địa lý NetTopologySuite với chuẩn không gian quốc tế SRID 4326. Trên bản đồ vệ tinh ArcGIS, hệ thống dựng các vòng tròn hàng rào điện tử Geofence chính xác theo mét thực địa. Vùng không gian này là căn cứ số học để ứng dụng di động kiểm tra vị trí nhân viên khi quét điểm danh đầu ca."*

---

### MÀN HÌNH 5: QUẢN TRỊ KHUNG CA MẪU & CÔNG CỤ BATCH ENGINE
1. **API NÀO TRẢ VỀ:** `PATCH /api/branches/{id}/shift-mode`, `POST /api/shift-templates`.
2. **LOGIC TÍNH TOÁN & THUẬT TOÁN ĐỈNH CAO:**
   - Cơ chế ca Hybrid: `ShiftTemplateService.cs` (dòng 609-700) tự động clone toàn bộ ca chung sang ca riêng (`CR_{branchId}_{code}`) khi bật CUSTOM; kiểm soát lịch tương lai yêu cầu xác nhận 2 bước.
   - Ca qua đêm (+1440m): `ShiftCalculationHelper.cs` kiểm tra `endTime <= startTime` $\rightarrow$ `isOvernight = true`, cộng 1440 phút tính giờ công và phụ cấp ca đêm (22:00 - 06:00).
   - Bộ quét xung đột Batch Mode: `ShiftTemplateFormModal.jsx` (dòng 244-275) kiểm tra giao khoảng thời gian tuyến tính $\max(\text{Start}_A, \text{Start}_B) < \min(\text{End}_A, \text{End}_B)$, tự động khóa nút Submit.
3. **LỜI THOẠI VẤN ĐÁP MẪU:**
   > *"Thưa Thầy/Cô, Màn hình 5 là Màn hình Khung Ca Mẫu & Công Cụ Tạo Ca Batch Engine. Điểm đặc sắc nhất là công cụ tạo ca hàng loạt được tích hợp giải thuật Quét Xung Đột Thời Gian thời gian thực tại ShiftTemplateFormModal.jsx. Mọi ca làm việc — bao gồm cả ca đêm vắt qua ngày hôm sau — đều được đưa về thang đo số phút tuyến tính một chiều để kiểm tra giao khoảng thời gian. Nút Lưu sẽ bị vô hiệu hóa ngay khi có bất kỳ sự chồng chéo giờ nào, bảo đảm an toàn tuyệt đối cho dữ liệu chấm công."*

---

## PHẦN 3: KỊCH BẢN DEMO THỰC CHIẾN 3 PHÚT & BỘ CÂU HỎI VẤN ĐÁP (FAQ)

| Thời Gian | Màn Hình & Thao Tác | Lời Thuyết Minh & Code Anchors |
| :---: | :--- | :--- |
| **00:00 - 00:35** | **Màn 1 (`/tiers` hoặc tab Master Tier)**<br>Thử tạo Tier với Min=20, Max=10 | Em chứng minh kiểm soát định biên: Nếu Max < Min, hệ thống báo lỗi ngay tại `TierService.cs` dòng 48. Sửa lại Min=20, Max=50, bấm Lưu $\rightarrow$ Bảng nạp tức thì. |
| **00:35 - 01:10** | **Màn 2 (`/branch-tiers`)**<br>Bấm 'Đổi Cấp Độ' cho 1 chi nhánh | Màn 2 quản lý việc phân bổ thực tế. Khi em chuyển chi nhánh sang Tier 1 qua ChangeTierModal, hệ thống đổi badge màu và cập nhật lại thống kê toàn chuỗi. |
| **01:10 - 01:45** | **Màn 3 (`/branches` - Danh sách)**<br>Bấm nút Khóa chi nhánh | Chi nhánh tự động nhận diện Tier theo số nhân viên. Thao tác Khóa chi nhánh kích hoạt `useLockBranch`, bảo vệ CSDL với mã HTTP 423 Locked. |
| **01:45 - 02:20** | **Màn 4 (`/branches` - Bản đồ GIS)**<br>Xem Marker và vòng tròn Geofence | Toàn bộ chi nhánh được định vị trên nền bản đồ số vệ tinh ArcGIS với chuẩn WGS84 SRID 4326. Vòng tròn Geofence xanh mờ xác định ranh giới chấm công GPS. |
| **02:20 - 03:00** | **Màn 5 (`/shifts/templates`)**<br>Mở Batch Mode, nhập 2 ca trùng giờ | Hệ thống hỗ trợ ca Hybrid tự clone ca. Khi nhập 2 ca chồng chéo giờ ở Batch Mode, thuật toán Overlap Detection lập tức cảnh báo đỏ và khóa nút Lưu. |

### TOP 4 CÂU HỎI VẤN ĐÁP CODE GIẢNG VIÊN THƯỜNG HỎI:
- **❓ Câu 1: Tại sao tách riêng Màn 1 (Master Data Tier) và Màn 2 (Điều chuyển Tier) mà không gộp chung?**  
  👉 *Trả lời:* Theo nguyên tắc Single Responsibility của kiến trúc phần mềm, Màn 1 là cấu hình danh mục tiêu chuẩn (Master Data) do Admin cấp cao toàn quyền định nghĩa định biên Min/Max. Màn 2 là màn hình nghiệp vụ vận hành phân bổ (Allocation), cho phép theo dõi thực tế chi nhánh và điều chuyển cấp bậc khi có quyết định nâng cấp cửa hàng.
- **❓ Câu 2: Bản đồ GIS ở Màn 4 có liên quan gì đến ứng dụng chấm công trên Mobile không?**  
  👉 *Trả lời:* Rất mật thiết. Màn 4 lưu trữ tọa độ WGS84 Point SRID 4326 và bán kính `GeofenceRadiusMeters` vào CSDL MySQL. Khi nhân viên mở ứng dụng di động để bấm chấm công, Mobile App lấy tọa độ GPS hiện tại của máy và đối chiếu với tọa độ cùng bán kính Geofence đã cấu hình ở Màn 4 này.
- **❓ Câu 3: Thuật toán Overlap Detection hoạt động thế nào với ca làm việc qua đêm?**  
  👉 *Trả lời:* Nếu ca kết thúc nhỏ hơn hoặc bằng giờ bắt đầu (ví dụ 22:00 đến 06:00), hàm `normalizeTimeRange` tự cộng thêm 1440 phút (24h) vào giờ kết thúc. Nhờ đó khoảng thời gian được trải thẳng trên trục số tuyến tính một chiều, áp dụng chính xác công thức giao khoảng $\max(\text{Start}_A, \text{Start}_B) < \min(\text{End}_A, \text{End}_B)$.
- **❓ Câu 4: Nếu xóa một phân cấp Tier đang có chi nhánh trực thuộc thì sao?**  
  👉 *Trả lời:* Hệ thống bảo vệ 2 tầng: Ở tầng Service (`TierService.cs` dòng 112), hệ thống kiểm tra `tier.Branches.Any()` và từ chối xóa kèm mã lỗi 400. Ở tầng Database, khóa ngoại `branches.TierId` đặt `ON DELETE RESTRICT`, ngăn chặn triệt để hiện tượng bản ghi mồ côi (Orphan records).
