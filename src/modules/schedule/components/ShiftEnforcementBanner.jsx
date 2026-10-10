import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import { SHIFT_POLICY_BANNER_TEXT } from '../constants/shift.constants';

/**
 * ==============================================================================
 * COMPONENT: ShiftEnforcementBanner.jsx
 * Banner chính sách quy định khung ca làm việc
 * ==============================================================================
 */
export default function ShiftEnforcementBanner() {
  const { c } = useAdminTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        backgroundColor: `${c.accent}12`,
        border: `1px solid ${c.accent}30`,
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
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
            fontSize: '13.5px',
            color: c.fg,
            marginBottom: '2px',
          }}
        >
          Quy Định Khung Ca Chuỗi & Chi Nhánh
        </div>
        <div
          style={{
            fontSize: '13px',
            color: c.fgSubtle,
            lineHeight: '1.4',
          }}
        >
          {SHIFT_POLICY_BANNER_TEXT}
        </div>
      </div>
    </div>
  );
}
