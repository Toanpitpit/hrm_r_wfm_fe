-- ==============================================================================
-- R-WFM (RETAIL WORKFORCE MANAGEMENT) DATABASE SCHEMA FOR MYSQL 8.0+
-- Database Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. CREATE DATABASE
-- ------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `rwfm_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `rwfm_db`;

-- ==============================================================================
-- CLUSTER 1: CƠ SỞ DỮ LIỆU TỔ CHỨC & QUẢN LÝ TÀI KHOẢN (ORGANIZATION & RBAC)
-- ==============================================================================

-- 1.1. Danh mục Chi nhánh
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính tự tăng',
  `branch_code` VARCHAR(20) NOT NULL COMMENT 'Mã chi nhánh duy nhất (VD: CH01, CH02)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Tên chi nhánh (VD: Cửa hàng Tiện lợi Chi nhánh Cầu Giấy)',
  `address` VARCHAR(255) NOT NULL COMMENT 'Địa chỉ thực tế',
  `kiosk_allowed_ip` VARCHAR(45) NULL DEFAULT NULL COMMENT 'IP mạng nội bộ quầy thu ngân để chống điểm danh từ xa (IPv4/IPv6)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái: ACTIVE | INACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật gần nhất',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branches_code` (`branch_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý danh mục 2-5 cơ sở kinh doanh độc lập trong chuỗi';

-- 1.2. Từ điển Vai trò (Roles)
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính vai trò',
  `role_code` VARCHAR(30) NOT NULL COMMENT 'Mã vai trò định danh (VD: BUSINESS_OWNER, STORE_MANAGER, ...)',
  `role_name` VARCHAR(50) NOT NULL COMMENT 'Tên tiếng Việt hiển thị',
  `description` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Mô tả quyền hạn chức năng',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Từ điển vai trò hệ thống RBAC';

-- 1.3. Hồ sơ Nhân sự (Users)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính nhân viên',
  `employee_code` VARCHAR(20) NOT NULL COMMENT 'Mã nhân viên nội bộ (VD: NV001)',
  `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên nhân viên',
  `email` VARCHAR(100) NOT NULL COMMENT 'Email đăng nhập hệ thống',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Số điện thoại liên hệ',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã hash (BCrypt/Argon2)',
  `kiosk_pin_hash` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Mã PIN 4-6 số đã hash để check-in tại trạm Kiosk',
  `role_id` TINYINT UNSIGNED NOT NULL COMMENT 'ID vai trò chính',
  `employment_type` VARCHAR(20) NOT NULL COMMENT 'Hình thức làm việc: FULL_TIME | PART_TIME',
  `home_branch_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Chi nhánh gốc, NULL nếu là Admin toàn chuỗi',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái: ACTIVE | ON_LEAVE | TERMINATED',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo tài khoản',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật gần nhất',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_employee_code` (`employee_code`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  KEY `idx_users_branch_status` (`home_branch_id`, `status`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_users_home_branch` FOREIGN KEY (`home_branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hồ sơ nhân sự toàn hệ thống';

-- ==============================================================================
-- CLUSTER 2: QUẢN LÝ THIẾT BỊ TRẠM KIOSK (KIOSK SECURITY)
-- ==============================================================================

-- 2.1. Danh mục Thiết bị Kiosk
DROP TABLE IF EXISTS `kiosk_devices`;
CREATE TABLE `kiosk_devices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính máy Kiosk',
  `branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh đặt máy Kiosk',
  `kiosk_code` VARCHAR(50) NOT NULL COMMENT 'Mã thiết bị định danh (VD: CH01-POS01)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Tên hiển thị trạm Kiosk (VD: Máy Kiosk Cầu Giấy 01)',
  `device_token` VARCHAR(255) NOT NULL COMMENT 'Token bí mật lưu tại LocalStorage thiết bị',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái: ACTIVE | INACTIVE | DELETED',
  `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Địa chỉ IP khi trạm gửi heartbeat ping',
  `last_ping_at` DATETIME NULL DEFAULT NULL COMMENT 'Thời điểm ping trực tuyến gần nhất',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đăng ký thiết bị',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kiosk_devices_code` (`kiosk_code`),
  UNIQUE KEY `uq_kiosk_devices_token` (`device_token`),
  KEY `idx_kiosk_token_status` (`device_token`, `status`),
  KEY `idx_kiosk_branch_status` (`branch_id`, `status`),
  CONSTRAINT `fk_kiosk_devices_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục máy Kiosk điểm danh tại quầy';

-- 2.2. Mã Kích hoạt Kiosk (OTP Kiosk Pairing)
DROP TABLE IF EXISTS `kiosk_activation_codes`;
CREATE TABLE `kiosk_activation_codes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính mã kích hoạt',
  `branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh cấp mã kích hoạt',
  `kiosk_name` VARCHAR(100) NOT NULL COMMENT 'Tên định danh đặt cho máy',
  `code` VARCHAR(20) NOT NULL COMMENT 'Mã OTP kết nối (VD: POS-1234)',
  `generated_by` BIGINT UNSIGNED NOT NULL COMMENT 'Store Manager tạo mã kích hoạt',
  `created_kiosk_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'ID máy Kiosk sinh ra sau kích hoạt thành công',
  `expires_at` DATETIME NOT NULL COMMENT 'Hiệu lực kích hoạt (mặc định 15 phút)',
  `is_used` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '0: Chưa kích hoạt, 1: Đã kích hoạt',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm sinh mã',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kiosk_activation_code` (`code`),
  KEY `idx_activation_lookup` (`code`, `is_used`, `expires_at`),
  CONSTRAINT `fk_kiosk_act_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_kiosk_act_generated_by` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_kiosk_act_created_kiosk` FOREIGN KEY (`created_kiosk_id`) REFERENCES `kiosk_devices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mã OTP kích hoạt trạm Kiosk mới';

-- ==============================================================================
-- CLUSTER 3: ĐỊNH NGHĨA CA & LẬP LỊCH TUẦN (SHIFT SCHEDULING)
-- ==============================================================================

-- 3.1. Khung Ca Mẫu Toàn Hệ Thống (Shift Master Templates)
DROP TABLE IF EXISTS `shift_templates`;
CREATE TABLE `shift_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính mẫu ca',
  `template_code` VARCHAR(20) NOT NULL COMMENT 'Mã ca mẫu (VD: CA_SANG, CA_CHIEU, CA_DEM)',
  `name` VARCHAR(50) NOT NULL COMMENT 'Tên hiển thị khung ca',
  `start_time` TIME NOT NULL COMMENT 'Giờ bắt đầu ca (VD: 06:00:00)',
  `end_time` TIME NOT NULL COMMENT 'Giờ kết thúc ca (VD: 14:00:00)',
  `is_overnight` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '1 nếu ca làm việc xuyên đêm qua ngày hôm sau',
  `break_duration_minutes` INT NOT NULL DEFAULT 0 COMMENT 'Thời gian nghỉ giữa ca tính theo phút',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '1: Đang áp dụng, 0: Tạm ngưng',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shift_templates_code` (`template_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Khung ca mẫu dùng chung cho toàn hệ thống';

-- 3.2. Phiên Lịch Làm Việc Chi Nhánh Theo Ngày (Work Schedules)
DROP TABLE IF EXISTS `work_schedules`;
CREATE TABLE `work_schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính phiên ca làm việc',
  `branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh áp dụng lịch',
  `shift_template_id` INT UNSIGNED NOT NULL COMMENT 'Khung ca làm việc áp dụng',
  `work_date` DATE NOT NULL COMMENT 'Ngày làm việc thực tế (YYYY-MM-DD)',
  `required_cashier` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Định biên nhân sự Thu ngân cần có',
  `required_sales` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Định biên nhân sự Bán hàng cần có',
  `required_security` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Định biên nhân sự Bảo vệ cần có',
  `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'Trạng thái: DRAFT | PUBLISHED | COMPLETED | LOCKED',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT 'Store Manager tạo lịch',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm lập lịch',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_shift_date` (`branch_id`, `shift_template_id`, `work_date`),
  KEY `idx_schedule_query` (`branch_id`, `work_date`, `status`),
  CONSTRAINT `fk_schedules_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_schedules_template` FOREIGN KEY (`shift_template_id`) REFERENCES `shift_templates` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_schedules_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiên ca làm việc theo ngày và theo chi nhánh';

-- 3.3. Phân Bổ Nhân Sự Vào Ca (Shift Assignments)
DROP TABLE IF EXISTS `shift_assignments`;
CREATE TABLE `shift_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính phân bổ ca',
  `schedule_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID phiên ca làm việc',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID nhân viên được gán vào ca',
  `assigned_role_id` TINYINT UNSIGNED NOT NULL COMMENT 'Vị trí/vai trò đảm nhận trong ca trực',
  `assignment_type` VARCHAR(20) NOT NULL COMMENT 'Hình thức gán: ASSIGNED (Chỉ định) | REGISTERED (Đăng ký)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' COMMENT 'Trạng thái: PENDING | CONFIRMED | CANCELLED',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_schedule_user` (`schedule_id`, `user_id`),
  KEY `idx_assignment_check_conflict` (`user_id`, `schedule_id`),
  CONSTRAINT `fk_shift_assignments_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shift_assignments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_shift_assignments_role` FOREIGN KEY (`assigned_role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phân bổ cụ thể nhân sự vào từng ca trực';

-- 3.4. Yêu Cầu Đổi Ca Trực Giữa Nhân Viên (Shift Swap Requests)
DROP TABLE IF EXISTS `shift_swap_requests`;
CREATE TABLE `shift_swap_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính yêu cầu đổi ca',
  `requesting_assignment_id` BIGINT UNSIGNED NOT NULL COMMENT 'Ca của nhân viên đề nghị đổi',
  `target_assignment_id` BIGINT UNSIGNED NOT NULL COMMENT 'Ca của nhân viên nhận yêu cầu',
  `reason` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Lý do đổi ca',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái: PENDING | APPROVED | REJECTED | CANCELLED',
  `reviewed_by` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Store Manager / Shift Leader duyệt yêu cầu',
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm phê duyệt/từ chối',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi yêu cầu',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_swap_req_requesting` FOREIGN KEY (`requesting_assignment_id`) REFERENCES `shift_assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_swap_req_target` FOREIGN KEY (`target_assignment_id`) REFERENCES `shift_assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_swap_req_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu đổi ca trực giữa 2 nhân viên';

-- ==============================================================================
-- CLUSTER 4: ĐIỀU ĐỘNG NHÂN SỰ TẠM THỜI (STAFF DISPATCH)
-- ==============================================================================

-- 4.1. Lệnh Điều Động Mượn Nhân Sự Chéo Chi Nhánh
DROP TABLE IF EXISTS `temporary_dispatches`;
CREATE TABLE `temporary_dispatches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính lệnh điều động',
  `source_branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh cho mượn nhân sự',
  `target_branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh mượn nhân sự',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Nhân viên được điều động',
  `start_date` DATE NOT NULL COMMENT 'Ngày bắt đầu biệt phái',
  `end_date` DATE NOT NULL COMMENT 'Ngày kết thúc biệt phái',
  `requested_by` BIGINT UNSIGNED NOT NULL COMMENT 'Store Manager bên mượn đề xuất',
  `approved_by` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Store Manager bên cho mượn phê duyệt',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái: PENDING | APPROVED | REJECTED | REVOKED | EXPIRED',
  `note` TEXT NULL DEFAULT NULL COMMENT 'Ghi chú lý do điều động',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo lệnh',
  PRIMARY KEY (`id`),
  KEY `idx_dispatch_active_check` (`user_id`, `start_date`, `end_date`, `status`),
  CONSTRAINT `fk_dispatch_source_branch` FOREIGN KEY (`source_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dispatch_target_branch` FOREIGN KEY (`target_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dispatch_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dispatch_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dispatch_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lệnh điều động mượn nhân sự chéo chi nhánh';

-- ==============================================================================
-- CLUSTER 5: CHẤM CÔNG KIOSK & QUẢN TRỊ LÀM THÊM GIỜ (ATTENDANCE & OVERTIME)
-- ==============================================================================

-- 5.1. Nhật Ký Điểm Danh Máy Kiosk (Attendance Logs)
DROP TABLE IF EXISTS `attendance_logs`;
CREATE TABLE `attendance_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính bản ghi chấm công',
  `assignment_id` BIGINT UNSIGNED NOT NULL COMMENT 'Liên kết 1-1 với ca trực được phân công',
  `branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh đặt máy Kiosk thực hiện check-in',
  `kiosk_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Trạm Kiosk thực hiện điểm danh',
  `check_in_time` DATETIME NOT NULL COMMENT 'Thời điểm check-in (Timestamp do máy chủ ghi nhận)',
  `check_out_time` DATETIME NULL DEFAULT NULL COMMENT 'Thời điểm check-out (Timestamp do máy chủ ghi nhận)',
  `opening_float_cash` DECIMAL(12, 2) NULL DEFAULT NULL COMMENT 'Tiền lẻ đầu ca do thu ngân khai báo khi check-in',
  `is_fraud_flagged` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Cờ báo nghi vấn gian lận điểm danh (1: Bị gắn cờ, 0: Bình thường)',
  `fraud_flagged_by` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Shift Leader gắn cờ nghi vấn',
  `fraud_reason` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Lý do gắn cờ gian lận',
  `actual_work_minutes` INT GENERATED ALWAYS AS (
    CASE 
      WHEN `check_out_time` IS NOT NULL AND `check_out_time` >= `check_in_time` 
      THEN TIMESTAMPDIFF(MINUTE, `check_in_time`, `check_out_time`) 
      ELSE NULL 
    END
  ) VIRTUAL COMMENT 'Cột ảo tự động tính số phút làm việc thực tế từ check-in đến check-out',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo bản ghi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_assignment` (`assignment_id`),
  KEY `idx_attendance_headcount` (`check_in_time`, `branch_id`),
  CONSTRAINT `fk_attendance_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `shift_assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_kiosk` FOREIGN KEY (`kiosk_id`) REFERENCES `kiosk_devices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_fraud_flagged_by` FOREIGN KEY (`fraud_flagged_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký quét công của nhân viên tại máy Kiosk';

-- 5.2. Yêu Cầu và Duyệt Làm Thêm Giờ (Overtime Requests)
DROP TABLE IF EXISTS `overtime_requests`;
CREATE TABLE `overtime_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính yêu cầu OT',
  `attendance_log_id` BIGINT UNSIGNED NOT NULL COMMENT 'Bản ghi chấm công phát sinh ngoài giờ',
  `ot_type` VARCHAR(30) NOT NULL COMMENT 'Loại OT: POST_SHIFT_EXTENSION (Tăng ca cuối ca) | PLANNED_OVERTIME (OT kế hoạch)',
  `requested_minutes` INT NOT NULL COMMENT 'Số phút OT đề xuất',
  `approved_minutes` INT NOT NULL DEFAULT 0 COMMENT 'Số phút OT được quản lý phê duyệt',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái: PENDING | APPROVED | REJECTED',
  `verified_by_leader` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Trưởng ca trực xác nhận',
  `approved_by_manager` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Quản lý cửa hàng phê duyệt',
  `manager_notes` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Ý kiến/lý do của quản lý cửa hàng',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi yêu cầu OT',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ot_attendance_log` FOREIGN KEY (`attendance_log_id`) REFERENCES `attendance_logs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_verified_by_leader` FOREIGN KEY (`verified_by_leader`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_approved_by_manager` FOREIGN KEY (`approved_by_manager`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu và phê duyệt giờ làm việc ngoài giờ (OT)';

-- ==============================================================================
-- CLUSTER 6: SỐ HÓA BIÊN BẢN GIAO CA ĐẶC THÙ (HANDOVER PROTOCOLS)
-- ==============================================================================

-- 6.1. Biên Bản Tổng Quan Chốt Ca Làm Việc (Shift Handovers)
DROP TABLE IF EXISTS `shift_handovers`;
CREATE TABLE `shift_handovers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính biên bản giao ca',
  `schedule_id` BIGINT UNSIGNED NOT NULL COMMENT 'Liên kết 1-1 với phiên ca làm việc',
  `shift_leader_id` BIGINT UNSIGNED NOT NULL COMMENT 'Trưởng ca ký chốt giao ban',
  `handover_status` VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS' COMMENT 'Trạng thái: IN_PROGRESS | COMPLETED | DISCREPANCY_FLAGGED',
  `signed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm ký chốt biên bản giao ca',
  `general_notes` TEXT NULL DEFAULT NULL COMMENT 'Ghi chú tình hình vận hành chung trong ca',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shift_handover_schedule` (`schedule_id`),
  CONSTRAINT `fk_handover_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_handover_shift_leader` FOREIGN KEY (`shift_leader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biên bản tổng quan chốt ca làm việc';

-- 6.2. Biên Bản Bàn Giao Quỹ Két Thu Ngân (Cash Handovers)
DROP TABLE IF EXISTS `cash_handovers`;
CREATE TABLE `cash_handovers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính bàn giao tiền két',
  `shift_handover_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID biên bản giao ca tổng',
  `cashier_id` BIGINT UNSIGNED NOT NULL COMMENT 'Thu ngân thực hiện bàn giao két tiền',
  `opening_cash` DECIMAL(12, 2) NOT NULL COMMENT 'Tiền mặt đầu ca (tiền lẻ thối)',
  `system_expected_cash` DECIMAL(12, 2) NOT NULL COMMENT 'Tiền hệ thống POS dự kiến sau ca',
  `closing_actual_cash` DECIMAL(12, 2) NOT NULL COMMENT 'Tiền mặt đếm thực tế khi chốt ca',
  `difference_amount` DECIMAL(12, 2) GENERATED ALWAYS AS (`closing_actual_cash` - `system_expected_cash`) VIRTUAL COMMENT 'Cột ảo chênh lệch = Thực tế - Kỳ vọng',
  `discrepancy_reason` TEXT NULL DEFAULT NULL COMMENT 'Bắt buộc giải trình nếu chênh lệch tiền',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm lập biên bản tiền',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cash_handover_parent` FOREIGN KEY (`shift_handover_id`) REFERENCES `shift_handovers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cash_handover_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biên bản bàn giao quỹ két thu ngân';

-- 6.3. Biên Bản Bàn Giao Hiện Trạng An Ninh Kho Bãi (Security Handovers)
DROP TABLE IF EXISTS `security_handovers`;
CREATE TABLE `security_handovers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính bàn giao an ninh',
  `shift_handover_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID biên bản giao ca tổng',
  `security_guard_id` BIGINT UNSIGNED NOT NULL COMMENT 'Bảo vệ phụ trách ca trực',
  `overnight_vehicle_count` SMALLINT NOT NULL DEFAULT 0 COMMENT 'Số lượng xe gửi qua đêm tại bãi',
  `is_warehouse_locked` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '1: Đã kiểm tra khóa kho bãi, 0: Chưa khóa',
  `is_shutter_closed` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '1: Đã đóng cửa cuốn an toàn, 0: Chưa đóng',
  `security_notes` TEXT NULL DEFAULT NULL COMMENT 'Ghi chú an ninh/sự cố bất thường',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm lập biên bản an ninh',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sec_handover_parent` FOREIGN KEY (`shift_handover_id`) REFERENCES `shift_handovers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sec_handover_guard` FOREIGN KEY (`security_guard_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biên bản bàn giao hiện trạng an ninh kho bãi';

-- ==============================================================================
-- CLUSTER 7: KHÓA DỮ LIỆU & XUẤT BẢNG CÔNG KẾ TOÁN (TIMESHEET & AUDIT)
-- ==============================================================================

-- 7.1. Bảng Chốt Công Tháng Theo Chi Nhánh (Monthly Timesheets)
DROP TABLE IF EXISTS `monthly_timesheets`;
CREATE TABLE `monthly_timesheets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính bảng chốt công tháng',
  `branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Chi nhánh chốt bảng công',
  `period_month` TINYINT UNSIGNED NOT NULL COMMENT 'Tháng tính công (1-12)',
  `period_year` SMALLINT UNSIGNED NOT NULL COMMENT 'Năm tính công (VD: 2026)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT 'Trạng thái: OPEN | LOCKED',
  `locked_by` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Người thực hiện khóa sổ kế toán',
  `locked_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm bấm khóa bảng công',
  `exported_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm xuất file Excel/ERP tính lương',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_period` (`branch_id`, `period_month`, `period_year`),
  CONSTRAINT `fk_timesheet_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_timesheet_locked_by` FOREIGN KEY (`locked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chốt công tháng theo từng chi nhánh';

-- 7.2. Nhật Ký Kiểm Toán Toàn Chuỗi (System Audit Logs)
DROP TABLE IF EXISTS `system_audit_logs`;
CREATE TABLE `system_audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính nhật ký kiểm toán',
  `actor_id` BIGINT UNSIGNED NOT NULL COMMENT 'Người thực hiện hành vi',
  `action` VARCHAR(50) NOT NULL COMMENT 'Mã hành động (PUBLISH_SCHEDULE, APPROVE_DISPATCH, FLAG_FRAUD, LOCK_TIMESHEET, ...)',
  `target_table` VARCHAR(50) NOT NULL COMMENT 'Tên bảng bị tác động',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID của bản ghi bị tác động',
  `old_values` JSON NULL DEFAULT NULL COMMENT 'Dữ liệu trước khi sửa đổi (định dạng JSON)',
  `new_values` JSON NULL DEFAULT NULL COMMENT 'Dữ liệu sau khi sửa đổi (định dạng JSON)',
  `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Địa chỉ IP thực hiện thao tác',
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm xảy ra hành động',
  PRIMARY KEY (`id`),
  KEY `idx_audit_time_action` (`timestamp`, `action`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký kiểm toán hệ thống toàn chuỗi';

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO TIÊU CHUẨN (SEED DATA)
-- ==============================================================================

-- Seed vai trò hệ thống RBAC (Roles)
INSERT INTO `roles` (`id`, `role_code`, `role_name`, `description`) VALUES
(1, 'BUSINESS_OWNER', 'Chủ Doanh Nghiệp', 'Xem báo cáo chuỗi, phân tích chi phí công và phê duyệt cấp cao'),
(2, 'OPERATIONS_ADMIN', 'Quản Trị Vận Hành', 'Quản trị chi nhánh, thiết bị Kiosk, khung ca mẫu và giám sát toàn hệ thống'),
(3, 'STORE_MANAGER', 'Quản Lý Cửa Hàng', 'Lập lịch tuần, duyệt đổi ca, duyệt điều động và khóa bảng công chi nhánh'),
(4, 'SHIFT_LEADER', 'Trưởng Ca Trực', 'Điều phối ca trực, gắn cờ nghi vấn chấm công, xác nhận OT và ký biên bản giao ca'),
(5, 'CASHIER', 'Thu Ngân', 'Thực hiện bán hàng, khai báo tiền lẻ đầu ca và bàn giao két tiền'),
(6, 'SALES_STAFF', 'Nhân Viên Bán Hàng', 'Nhận ca trực, điểm danh tại Kiosk và hỗ trợ khách hàng'),
(7, 'SECURITY_GUARD', 'Nhân Viên Bảo Vệ', 'Trực an ninh bãi xe, kiểm tra khóa kho bãi và ký bàn giao an ninh');

-- Seed 3 khung ca mẫu chuẩn hóa (Shift Templates)
INSERT INTO `shift_templates` (`template_code`, `name`, `start_time`, `end_time`, `is_overnight`, `break_duration_minutes`, `is_active`) VALUES
('CA_SANG', 'Ca Sáng (06:00 - 14:00)', '06:00:00', '14:00:00', 0, 30, 1),
('CA_CHIEU', 'Ca Chiều (14:00 - 22:00)', '14:00:00', '22:00:00', 0, 30, 1),
('CA_DEM', 'Ca Đêm (22:00 - 06:00)', '22:00:00', '06:00:00', 1, 60, 1);
