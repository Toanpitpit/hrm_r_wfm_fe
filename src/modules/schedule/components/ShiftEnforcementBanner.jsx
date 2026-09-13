import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: ShiftEnforcementBanner.jsx
 * UC 1.3: Banner chính sách khóa ca chuẩn của Operations Admin
 * ==============================================================================
 */
export default function ShiftEnforcementBanner() {
  const { c } = useAdminTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        backgroundColor: `${c.accent}12`,
        border: `1px solid ${c.accent}30`,
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          backgroundColor: `${c.accent}20`,
          color: c.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon
          name="shield"
          size={18}
        />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '14px',
            color: c.fg,
            marginBottom: '4px',
          }}
        >
          Chính Sách Khung Ca Chuẩn Hóa Toàn Hệ Thống (Strict Shift Policy)
        </div>
        <div
          style={{
            fontSize: '13px',
            color: c.fgSubtle,
            lineHeight: '1.5',
          }}
        >
          Các khung ca tại đây được áp dụng đồng bộ cho toàn bộ chuỗi cửa hàng.
          Quản lý cửa hàng (Store Manager) chỉ được phép xếp lịch làm việc cho
          nhân viên dựa trên các khung ca đang có trạng thái{' '}
          <strong style={{ color: '#10b981' }}>Áp dụng</strong> và không thể tự ý
          tạo ca lệch giờ ngoài danh mục này.
        </div>
      </div>
    </div>
  );
}
