import React from 'react';

/**
 * Component hiển thị Badge Phân cấp Chi nhánh chuẩn hóa
 * - Cố định chiều rộng (min-width: 130px) và căn giữa để không thụt thò
 * - Không viết tắt "CN" (ghi rõ Cấp chi nhánh)
 * - Màu trung tính đồng nhất, sang trọng
 */
export const BranchTierBadge = ({ tier, tierName, className = '', style = {} }) => {
  let name = tierName || '';
  let id = null;

  if (typeof tier === 'object' && tier !== null) {
    name = tier.tier_name || tier.tierName || name;
    id = tier.id || tier.tier_id;
  } else if (typeof tier === 'number' || typeof tier === 'string') {
    id = Number(tier);
  }

  if (!name) {
    if (id === 1) name = 'Cấp 1 - Flagship';
    else if (id === 2) name = 'Cấp 2 - Tiêu chuẩn';
    else if (id === 3) name = 'Cấp 3';
    else name = `Cấp ${id || 'Chưa phân cấp'}`;
  }

  // Chuẩn hóa tên: không viết tắt CN -> Cấp chi nhánh
  if (name.includes('CN')) {
    name = name.replace(/\bCN\b/g, 'Chi nhánh');
  }

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${className}`}
      style={{
        minWidth: '130px',
        backgroundColor: 'rgba(148, 163, 184, 0.08)',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        color: 'var(--color-fg, #e2e8f0)',
        letterSpacing: '0.2px',
        textAlign: 'center',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#38bdf8',
          flexShrink: 0,
        }}
      />
      <span>{name}</span>
    </span>
  );
};

export default BranchTierBadge;
