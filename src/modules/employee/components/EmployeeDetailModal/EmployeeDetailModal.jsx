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
  newEmployeeIds = [],
}) {
  const { c, fonts } = useAdminTheme();

  if (!employee) return null;

  const avatarLetter = (employee.fullName || 'N').trim().charAt(0).toUpperCase();
  const isInactive = employee.status === 'INACTIVE';

  const isNew = (() => {
    if (employee.isNew) return true;
    const strId = String(employee.id || '');
    const code = (employee.employeeCode || '').trim().toUpperCase();
    if (newEmployeeIds && newEmployeeIds.length > 0) {
      if (
        newEmployeeIds.some((item) => {
          const val = typeof item === 'object' ? String(item.id || item.code || '') : String(item);
          return val === strId || (code && val.toUpperCase() === code);
        })
      ) {
        return true;
      }
    }
    // Không đánh dấu NEW cho các tài khoản seed mặc định ban đầu của hệ thống
    const numId = Number(employee.id);
    const isSeeded = numId > 0 && numId <= 61;
    if (isSeeded) return false;

    if (employee.createdAt) {
      const createdTime = new Date(employee.createdAt).getTime();
      if (!isNaN(createdTime)) {
        const diffHours = (Date.now() - createdTime) / (1000 * 60 * 60);
        if (diffHours >= 0 && diffHours < 48) {
          return true;
        }
      }
    }
    return false;
  })();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Hồ Sơ Chi Tiết Nhân Sự Cửa Hàng"
      sub={`Thông tin định danh và phân bổ chi nhánh của tài khoản #${employee.id}`}
      width={560}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
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
            border: isNew ? '1px solid rgba(16, 185, 129, 0.4)' : `1px solid ${c.border}`,
            boxShadow: isNew ? '0 0 15px rgba(16, 185, 129, 0.08)' : 'none',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: isNew
                ? 'linear-gradient(135deg, #064e3b, #022c22)'
                : 'linear-gradient(135deg, #443419, #1b1710)',
              border: `2px solid ${isNew ? '#10b981' : c.accent}`,
              color: isNew ? '#34d399' : c.accent,
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
              {isNew && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.6px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                  title="Nhân viên mới được thêm vào hệ thống"
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 0 3px #ffffff',
                    }}
                  />
                  NEW
                </span>
              )}
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
              Email
            </div>
            <div style={{ fontSize: '14px', color: c.fg, marginTop: '4px', fontWeight: 500 }}>
              {employee.email || 'Chưa cập nhật'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: c.fgSubtle, fontWeight: 700 }}>
              Chi Nhánh Công Tác
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
              {CONTRACT_TYPE_MAP[employee.contractType || employee.employmentType] || employee.contractType || employee.employmentType || 'Toàn thời gian'}
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
          <strong>Lưu ý Phân Quyền</strong> Hồ sơ nhân sự này thuộc phạm vi quản lý của {employee.branchName || 'Chi nhánh'}. Mọi thao tác khai báo, chỉnh sửa hợp đồng hoặc đổi trạng thái đều được ghi nhận vào `SystemAuditLog`.
        </div>
      </div>
    </Modal>
  );
}
