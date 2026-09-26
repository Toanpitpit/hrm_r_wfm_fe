import React from 'react';

/**
 * Component hiển thị thanh tiến độ quy mô nhân sự so với định mức Tier
 */
export const BranchTierProgress = ({ staffCount = 0, tier = null }) => {
  const count = Number(staffCount || 0);
  const min = tier ? Number(tier.min_staff_count || tier.minStaffCount || 0) : 0;
  const max = tier && (tier.max_staff_count !== null && tier.max_staff_count !== undefined) 
    ? Number(tier.max_staff_count || tier.maxStaffCount) 
    : 100;

  const percent = max > min ? Math.min(Math.max(((count - min) / (max - min)) * 100, 5), 100) : 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-slate-400">Nhân sự: <strong className="text-white">{count}</strong></span>
        <span className="text-slate-500 text-[11px]">Định mức: {min} - {max ? `${max} người` : 'Không giới hạn'}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default BranchTierProgress;