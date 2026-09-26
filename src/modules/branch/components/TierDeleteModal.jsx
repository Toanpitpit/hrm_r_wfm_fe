import React from 'react';

/**
 * Modal xác nhận Xóa Tier
 */
export const TierDeleteModal = ({ isOpen, onClose, onConfirm, tier = null, isLoading = false }) => {
  if (!isOpen || !tier) return null;

  const branchCount = Number(tier.branch_count ?? tier.branchCount ?? 0);
  const canDelete = branchCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Xác nhận xóa Tier</h3>
            <p className="text-xs text-slate-400">Hành động này không thể hoàn tác sau khi thực hiện</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          Bạn có chắc chắn muốn xóa phân cấp <strong className="text-rose-400 font-semibold">{tier.tier_name || tier.tierName}</strong> khỏi hệ thống?
        </p>

        {!canDelete && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 mb-4">
            ⚠️ <strong>Không thể xóa:</strong> Đang có <strong>{branchCount} chi nhánh</strong> được phân bổ vào Tier này. Vui lòng chuyển các chi nhánh sang Tier khác trước khi xóa.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition text-sm"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(tier.id || tier.tier_id)}
            disabled={!canDelete || isLoading}
            className={`px-5 py-2 rounded-xl font-semibold text-white text-sm transition flex items-center gap-2 ${
              canDelete
                ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierDeleteModal;