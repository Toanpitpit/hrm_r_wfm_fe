import React from 'react';

/**
 * Component hiển thị Badge Phân cấp Chi nhánh (Tier 1 Flagship, Tier 2 Tiêu chuẩn, Tier 3 Nhỏ...)
 */
export const BranchTierBadge = ({ tier, tierName, className = '' }) => {
  let name = tierName || '';
  let id = null;

  if (typeof tier === 'object' && tier !== null) {
    name = tier.tier_name || tier.tierName || name;
    id = tier.id || tier.tier_id;
  } else if (typeof tier === 'number' || typeof tier === 'string') {
    id = Number(tier);
  }

  if (!name) {
    if (id === 1) name = 'Tier 1 - Flagship';
    else if (id === 2) name = 'Tier 2 - Tiêu chuẩn';
    else if (id === 3) name = 'Tier 3';
    else name = `Tier ${id || 'Chưa phân cấp'}`;
  }

  const isTier1 = name.toLowerCase().includes('tier 1') || name.toLowerCase().includes('flagship') || id === 1;
  const isTier2 = name.toLowerCase().includes('tier 2') || name.toLowerCase().includes('tiêu chuẩn') || id === 2;
  const isTier3 = name.toLowerCase().includes('tier 3') || id === 3;
  const isTier4 = name.toLowerCase().includes('tier 4') || id === 4;

  let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (isTier1) {
    badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
  } else if (isTier2) {
    badgeStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]';
  } else if (isTier3) {
    badgeStyle = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  } else if (isTier4) {
    badgeStyle = 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {name}
    </span>
  );
};

export default BranchTierBadge;