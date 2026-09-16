import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';

// Styling map cho 5 vai trò cửa hàng + quản trị
const ROLE_BADGE_MAP = {
  OPERATIONS_ADMIN: { label: 'Admin Vận Hành', variant: 'danger' },
  BUSINESS_OWNER: { label: 'Chủ Doanh Nghiệp', variant: 'purple' },
  STORE_MANAGER: { label: 'Cửa Hàng Trưởng', variant: 'warning' },
  SHIFT_LEADER: { label: 'Trưởng Ca', variant: 'blue' },
  CASHIER: { label: 'Thu Ngân', variant: 'success' },
  SALES_STAFF: { label: 'Bán Hàng', variant: 'info' },
  SECURITY_GUARD: { label: 'Bảo Vệ', variant: 'secondary' },
};

const CONTRACT_TYPE_MAP = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  SEASONAL: 'Thời vụ',
  PROBATION: 'Thử việc',
};

export default function EmployeeTable({
  employees = [],
  loading = false,
  onViewDetail,
  onEdit,
  onResetPassword,
  onToggleStatus,
  canManageSystem = false, // True for Admin & Business Owner
}) {
  const { c, fonts } = useAdminTheme();

  if (loading) {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          color: c.fgSubtle,
          background: c.bgRaised,
          borderRadius: '10px',
          border: `1px solid ${c.border}`,
        }}
      >
        <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
          <Icon name="refresh" size={24} color={c.accent} />
        </div>
        <p style={{ marginTop: '12px', fontSize: '14px' }}>Đang tải danh sách hồ sơ nhân sự...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div
        style={{
          padding: '56px 20px',
          textAlign: 'center',
          background: c.bgRaised,
          borderRadius: '10px',
          border: `1px dashed ${c.border}`,
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.accent,
            marginBottom: '14px',
          }}
        >
          <Icon name="users" size={24} />
        </div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: c.fg, marginBottom: '6px' }}>
          Không tìm thấy hồ sơ nhân sự
        </h4>
        <p style={{ fontSize: '13px', color: c.fgSubtle, maxWidth: '400px', margin: '0 auto' }}>
          Chưa có nhân viên nào phù hợp với bộ lọc hiện tại hoặc danh mục đang trống.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: '10px',
        border: `1px solid ${c.border}`,
        background: c.bgRaised,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13.5px',
          fontFamily: fonts.body,
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              background: c.bgCard,
              borderBottom: `1px solid ${c.border}`,
              color: c.fgSubtle,
              fontSize: '11.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            <th style={{ padding: '12px 16px' }}>Nhân Sự</th>
            <th style={{ padding: '12px 16px' }}>Mã NV</th>
            <th style={{ padding: '12px 16px' }}>Vai Trò (Role)</th>
            <th style={{ padding: '12px 16px' }}>Chi Nhánh Công Tác</th>
            <th style={{ padding: '12px 16px' }}>Hình Thức HĐ</th>
            <th style={{ padding: '12px 16px' }}>Liên Hệ</th>
            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Trạng Thái</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => {
            const isInactive = emp.status === 'INACTIVE';
            const roleBadge = ROLE_BADGE_MAP[emp.roleCode] || {
              label: emp.roleName || emp.roleCode || 'Nhân Viên',
              variant: 'secondary',
            };

            const avatarLetter = (emp.fullName || 'N').trim().charAt(0).toUpperCase();

            return (
              <tr
                key={emp.id || index}
                style={{
                  borderBottom: `1px solid ${c.border}`,
                  transition: 'background 0.15s ease',
                  opacity: isInactive ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.bgCard;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Họ tên & Avatar */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3a2e15, #1f1b14)',
                        border: `1px solid ${c.accent}`,
                        color: c.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {avatarLetter}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: c.fg }}>
                        {emp.fullName || 'Chưa đặt tên'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '2px' }}>
                        ID #{emp.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Mã nhân viên */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      background: c.bgCard,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${c.border}`,
                      color: '#f2ca50',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    {emp.employeeCode || `NV-${emp.id}`}
                  </span>
                </td>

                {/* Vai trò */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Badge variant={roleBadge.variant}>
                    {roleBadge.label}
                  </Badge>
                </td>

                {/* Chi nhánh công tác */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="pin" size={14} color={c.fgSubtle} />
                    <span style={{ color: c.fg }}>
                      {emp.branchName || `Chi nhánh #${emp.homeBranchId || emp.branchId}`}
                    </span>
                  </div>
                </td>

                {/* Hình thức hợp đồng */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: c.fgSubtle, fontSize: '12.5px' }}>
                    {CONTRACT_TYPE_MAP[emp.contractType] || emp.contractType || 'Full-time'}
                  </span>
                </td>

                {/* Liên hệ */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: c.fg, fontSize: '12.5px' }}>{emp.phone || 'Chưa có SĐT'}</div>
                  <div style={{ color: c.fgSubtle, fontSize: '11.5px', marginTop: '2px' }}>
                    {emp.email || 'Chưa có email'}
                  </div>
                </td>

                {/* Trạng thái */}
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {isInactive ? (
                    <Badge variant="danger">Đã khóa</Badge>
                  ) : (
                    <Badge variant="success">Hoạt động</Badge>
                  )}
                </td>

                {/* Hành động */}
                <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    {/* Xem chi tiết */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(emp)}
                      title="Xem chi tiết hồ sơ"
                    >
                      <Icon name="eye" size={15} />
                    </Button>

                    {/* Chỉnh sửa hồ sơ */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(emp)}
                      title="Chỉnh sửa hồ sơ & hợp đồng"
                    >
                      <Icon name="edit" size={15} />
                    </Button>

                    {/* Reset mật khẩu (Admin / Owner only) */}
                    {canManageSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResetPassword(emp)}
                        title="Đặt lại mật khẩu nhân viên"
                        style={{ color: '#f2ca50' }}
                      >
                        <Icon name="lock" size={15} />
                      </Button>
                    )}

                    {/* Khóa / Mở khóa tài khoản (Admin / Owner only) */}
                    {canManageSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(emp)}
                        title={isInactive ? 'Kích hoạt lại tài khoản' : 'Khóa tài khoản'}
                        style={{ color: isInactive ? '#22c55e' : '#ef4444' }}
                      >
                        <Icon name={isInactive ? 'unlock' : 'lock'} size={15} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
