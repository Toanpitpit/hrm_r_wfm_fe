import React from 'react';
import BranchTierBadge from './BranchTierBadge';

/**
 * Bảng hiển thị danh sách Tier
 */
export const TierTable = ({ tiers = [], onEdit, onDelete, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400">
        <svg className="animate-spin h-8 w-8 text-emerald-400 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm">Đang tải danh mục Tier...</p>
      </div>
    );
  }

  if (!tiers || tiers.length === 0) {
    return (
      <div className="w-full py-16 text-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-300">Chưa có Tier phân cấp nào</p>
        <p className="text-xs text-slate-500 mt-1">Bấm nút "Thêm Tier Mới" để bắt đầu thiết lập</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-[#162032] text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
          <tr>
            <th className="px-5 py-3.5 w-12 text-center">#</th>
            <th className="px-5 py-3.5 min-w-[180px]">Tên Tier</th>
            <th className="px-5 py-3.5 min-w-[160px]">Khoảng Nhân Sự (Min - Max)</th>
            <th className="px-5 py-3.5 min-w-[280px]">Mô Tả & Quyền Lợi</th>
            <th className="px-5 py-3.5 text-center min-w-[120px]">Số Chi Nhánh</th>
            <th className="px-5 py-3.5 text-center min-w-[120px]">Trạng Thái</th>
            <th className="px-5 py-3.5 text-center min-w-[140px]">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-[#0f172a]/50">
          {tiers.map((t, idx) => {
            const min = Number(t.min_staff_count ?? t.minStaffCount ?? 0);
            const max = t.max_staff_count !== null && t.max_staff_count !== undefined 
              ? Number(t.max_staff_count) 
              : (t.maxStaffCount !== null && t.maxStaffCount !== undefined ? Number(t.maxStaffCount) : null);
            const branchCount = Number(t.branch_count ?? t.branchCount ?? 0);

            return (
              <tr
                key={t.id || t.tier_id || idx}
                className="hover:bg-slate-800/40 transition group"
              >
                <td className="px-5 py-4 text-center font-mono text-xs text-slate-500">
                  {t.id || t.tier_id || idx + 1}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <BranchTierBadge tier={t} />
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 font-mono text-xs text-emerald-400">
                    <span className="font-semibold text-white">{min}</span>
                    <span className="text-slate-500">—</span>
                    <span className="font-semibold text-white">{max !== null ? `${max}` : '∞'}</span>
                    <span className="text-slate-400 font-sans text-[11px]">nhân sự</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="space-y-1">
                    {t.description && (
                      <p className="text-xs text-slate-300 line-clamp-1">{t.description}</p>
                    )}
                    {t.benefits && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300">
                        <span>🎁 Có quyền lợi riêng</span>
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 font-semibold text-xs text-white">
                    <strong className="text-emerald-400 font-bold">{branchCount}</strong> chi nhánh
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Hoạt động
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1 text-xs px-2.5"
                      title="Chỉnh sửa Tier"
                    >
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(t)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition flex items-center gap-1 text-xs px-2.5"
                      title="Xóa Tier"
                    >
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TierTable;