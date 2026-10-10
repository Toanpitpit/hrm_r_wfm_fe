import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';

/**
 * COMPONENT: LockConfigForm.jsx
 * Bước 2 trong luồng Khóa chi nhánh:
 * - Chỉ nhập duy nhất "Lý do khóa chi nhánh" (10 - 500 ký tự)
 * - Hiển thị cảnh báo tác động: Khóa toàn bộ tài khoản từ Store Manager trở xuống
 */
export default function LockConfigForm({
  branch,
  formData,
  onChange,
  errors = {},
}) {
  const { c, fonts } = useAdminTheme();

  const reasonLength = (formData?.reason || '').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Lý do khóa chi nhánh */}
      <FormField
        label="Lý do khóa chi nhánh"
        required
        error={errors.reason}
        hint={
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 600,
              color:
                reasonLength > 500
                  ? '#ef4444'
                  : reasonLength >= 10
                  ? c.accent
                  : c.fgFaint,
            }}
          >
            {reasonLength}/500 ký tự {reasonLength < 10 && '(tối thiểu 10)'}
          </span>
        }
      >
        <textarea
          rows={4}
          value={formData?.reason || ''}
          onChange={(e) => onChange('reason', e.target.value)}
          placeholder="Nhập lý do chi tiết (VD: Sửa chữa nâng cấp mặt bằng, bảo trì hệ thống hạ tầng hoặc tạm dừng kinh doanh theo kế hoạch...)"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1.5px solid ${errors.reason ? '#ef4444' : c.border}`,
            backgroundColor: c.bgCard,
            color: c.fg,
            fontSize: '13px',
            fontFamily: fonts.body,
            outline: 'none',
            resize: 'vertical',
            lineHeight: '1.5',
            boxSizing: 'border-box',
            transition: 'border-color .15s ease',
          }}
          autoFocus
        />
      </FormField>

      {/* 2. Banner thông tin tác động hệ thống khi khóa */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: c.bgElev,
          border: `1px solid ${c.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
          <Icon name="info" size={16} color="#f59e0b" />
          <span>Tác động hệ thống khi xác nhận khóa chi nhánh:</span>
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '12.5px',
            color: c.fgSubtle,
            lineHeight: '1.6',
          }}
        >
          <li>
            Tự động <strong>khóa tất cả tài khoản nhân sự</strong> thuộc chi nhánh từ cấp <strong>Cửa hàng trưởng (Store Manager) trở xuống</strong>.
          </li>
          <li>
            Tất cả các trạm <strong>Kiosk</strong> tại chi nhánh sẽ chuyển sang trạng thái tạm khóa (<strong>BLOCKED</strong>).
          </li>
          <li>
            Hệ thống <strong>yêu cầu không có bất kỳ ca làm việc nào</strong> (đang diễn ra hoặc đã lên lịch) tại chi nhánh trước khi thực hiện khóa.
          </li>
        </ul>
      </div>
    </div>
  );
}
