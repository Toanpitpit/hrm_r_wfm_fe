import React, { useState } from 'react';
import useTier from '../../hooks/useTier';
import TierTable from '../../components/TierTable';
import TierFormModal from '../../components/TierFormModal';
import TierDeleteModal from '../../components/TierDeleteModal';

/**
 * Trang Quản Trị Phân Cấp Chi Nhánh (Branch Tier Master Data Management)
 */
export const TierManagementPage = () => {
  const {
    tiers,
    loading,
    isFormOpen,
    isDeleteOpen,
    selectedTier,
    submitting,
    notification,
    totalTiers,
    totalBranchesInTiers,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleFormSubmit,
    handleDeleteConfirm,
    setIsFormOpen,
    setIsDeleteOpen,
  } = useTier();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTiers = tiers.filter(t => {
    const name = (t.tier_name || t.tierName || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    return name.includes(s) || desc.includes(s);
  });

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 p-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-medium flex items-center gap-3 animate-fade-in ${
            notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <span>Operations Admin</span>
            <span>•</span>
            <span>Cấu Hình Hệ Thống</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Quản Lý Tier Chi Nhánh
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Định nghĩa các cấp phân loại chi nhánh (Tier) với điều kiện đạt chuẩn và quyền lợi tương ứng — áp dụng cho toàn bộ chuỗi cửa hàng.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 text-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm Tier Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số Tier */}
        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tổng Số Tier</p>
              <h3 className="text-3xl font-black text-white mt-1">{totalTiers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Cấp phân loại chi nhánh</p>
        </div>

        {/* Card 2: Tier Hoạt Động */}
        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tier Hoạt Động</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">{totalTiers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Đang được áp dụng</p>
        </div>

        {/* Card 3: Chi Nhánh Được Gán */}
        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tổng Chi Nhánh</p>
              <h3 className="text-3xl font-black text-cyan-400 mt-1">{totalBranchesInTiers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Đã được phân cấp Tier</p>
        </div>

        {/* Card 4: Tỷ lệ phân bổ Tier */}
        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phân Bổ Tier</p>
          <div className="space-y-1.5 mt-2">
            {tiers.slice(0, 3).map((t, idx) => {
              const count = Number(t.branch_count ?? t.branchCount ?? 0);
              const pct = totalBranchesInTiers > 0 ? (count / totalBranchesInTiers) * 100 : 0;
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 truncate max-w-[120px]">{t.tier_name || t.tierName}</span>
                    <span className="font-semibold text-emerald-400">{count}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Search Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#162032]/40">
          <div>
            <h2 className="text-base font-bold text-white">Danh Sách Tier</h2>
            <p className="text-xs text-slate-400">
              {filteredTiers.length} tier đã được cấu hình • Click ô mô tả để xem điều kiện & quyền lợi
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tier, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f172a] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <TierTable
          tiers={filteredTiers}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          isLoading={loading}
        />
      </div>

      {/* Modals */}
      <TierFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        tier={selectedTier}
        isLoading={submitting}
      />

      <TierDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        tier={selectedTier}
        isLoading={submitting}
      />
    </div>
  );
};

export default TierManagementPage;