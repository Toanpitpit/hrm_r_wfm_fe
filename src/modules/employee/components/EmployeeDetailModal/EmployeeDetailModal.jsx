import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';

const CONTRACT_TYPE_MAP = {
  FULL_TIME: 'Toàn thời gian (Full-time)',
  PART_TIME: 'Bán thời gian (Part-time)',
  SEASONAL: 'Thời vụ (Seasonal)',
  PROBATION: 'Thử việc (Probation)',
};

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEdit,
  onResetPassword,
  canManageSystem = false,
}) {
  const { c, fonts } = useAdminTheme();

  if (!employee) return null;

  const avatarLetter = (employee.fullName || 'N').trim().charAt(0).toUpperCase();
  const isInactive = employee.status === 'INACTIVE';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Hồ Sơ Chi Tiết Nhân Sự Cửa Hàng"
      sub={`Thông tin định danh và phân bổ chi nhánh của tài khoản #${employee.id}`}
      width={560}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {canManageSystem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  onResetPassword(employee);
                }}
                style={{ color: '#f2ca50', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon name="lock" size={14} />
                <span>Reset Mật Khẩu</span>
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="edit" size={14} />
              <span>Chỉnh Sửa Hồ Sơ</span>
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: c.bgCard,
            borderRadius: '10px',
            border: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #443419, #1b1710)',
              border: `2px solid ${c.accent}`,
              color: c.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: c.fg }}>
                {employee.fullName || 'Chưa đặt tên'}
              </h3>
              {isInactive ? (
                <Badge variant="danger">Đã khóa tài khoản</Badge>
              ) : (
                <Badge variant="success">Đang hoạt động</Badge>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span
                style={{
                  fontFamily: fonts.mono,
                  background: c.bgRaised,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${c.border}`,
                  color: '#f2ca50',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                {employee.employeeCode || `NV-${employee.id}`}
              </span>
              <span style={{ color: c.fgSubtle, fontSize: '13px' }}>•</span>
              <Badge variant="warning">{employee.roleName || employee.roleCode}</Badge>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            padding: '14px',
            background: c.bgRaised,
            borderRadius: '8px',
            border: `1px solid ${c.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Số Điện Thoại Liên Hệ
            </div>
            <div style={{ fontSize: '14px', color: c.fg, marginTop: '4px', fontWeight: 500 }}>
              {employee.phone || 'Chưa cập nhật'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Hòm Thư Điện Tử (Email)
            </div>
            <div style={{ fontSize: '14px', color: c.fg, marginTop: '4px', fontWeight: 500 }}>
              {employee.email || 'Chưa cập nhật'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Chi Nhánh Công Tác (Home Branch)
            </div>
            <div style={{ fontSize: '14px', color: c.fg, marginTop: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="pin" size={14} color={c.accent} />
              <span>{employee.branchName || `Chi nhánh #${employee.homeBranchId || employee.branchId}`}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Hình Thức Hợp Đồng
            </div>
            <div style={{ fontSize: '14px', color: '#f2ca50', marginTop: '4px', fontWeight: 500 }}>
              {CONTRACT_TYPE_MAP[employee.contractType] || employee.contractType || 'Toàn thời gian'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Thời Gian Tạo Hồ Sơ
            </div>
            <div style={{ fontSize: '13px', color: c.fgSubtle, marginTop: '4px' }}>
              {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Cơ Chế Bảo Mật & Xác Thực
            </div>
            <div style={{ fontSize: '13px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon name="check" size={13} />
              <span>Băm BCrypt & Welcome Email</span>
            </div>
          </div>
        </div>

        {/* Audit Notice */}
        <div
          style={{
            fontSize: '12px',
            color: c.fgSubtle,
            lineHeight: '1.5',
            padding: '10px 14px',
            background: c.bgCard,
            borderRadius: '6px',
            borderLeft: `3px solid ${c.accent}`,
          }}
        >
          <strong>Lưu ý Phân Quyền RBAC:</strong> Hồ sơ nhân sự này thuộc phạm vi quản lý của {employee.branchName || 'Chi nhánh'}. Mọi thao tác khai báo, chỉnh sửa hợp đồng hoặc đổi trạng thái đều được ghi nhận vào `SystemAuditLog`.
        </div>
      </div>
    </Modal>
  );
}
