import React, { useState, useEffect } from 'react';

/**
 * Modal Thêm mới / Cập nhật Tier Phân cấp Chi nhánh
 */
export const TierFormModal = ({ isOpen, onClose, onSubmit, tier = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    tier_name: '',
    min_staff_count: 0,
    max_staff_count: '',
    description: '',
    other_conditions: '',
    benefits: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tier) {
      setFormData({
        tier_name: tier.tier_name || tier.tierName || '',
        min_staff_count: tier.min_staff_count ?? tier.minStaffCount ?? 0,
        max_staff_count: tier.max_staff_count !== null && tier.max_staff_count !== undefined ? tier.max_staff_count : (tier.maxStaffCount !== null && tier.maxStaffCount !== undefined ? tier.maxStaffCount : ''),
        description: tier.description || '',
        other_conditions: tier.other_conditions || tier.otherConditions || '',
        benefits: tier.benefits || '',
      });
    } else {
      setFormData({
        tier_name: '',
        min_staff_count: 0,
        max_staff_count: '',
        description: '',
        other_conditions: '',
        benefits: '',
      });
    }
    setErrors({});
  }, [tier, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const err = {};
    if (!formData.tier_name.trim()) err.tier_name = 'Tên Tier không được để trống';
    if (formData.min_staff_count === '' || Number(formData.min_staff_count) < 0) {
      err.min_staff_count = 'Số nhân sự tối thiểu phải từ 0 trở lên';
    }
    if (formData.max_staff_count !== '' && Number(formData.max_staff_count) < Number(formData.min_staff_count)) {
      err.max_staff_count = 'Số nhân sự tối đa không được nhỏ hơn tối thiểu';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      tier_name: formData.tier_name.trim(),
      min_staff_count: Number(formData.min_staff_count),
      max_staff_count: formData.max_staff_count !== '' ? Number(formData.max_staff_count) : null,
      description: formData.description.trim(),
      other_conditions: formData.other_conditions.trim(),
      benefits: formData.benefits.trim(),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-[#162032]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {tier ? 'Cập Nhật Phân Cấp Tier' : 'Tạo Mới Phân Cấp Tier'}
              </h2>
              <p className="text-xs text-slate-400">
                {tier ? `Chỉnh sửa thông số cho Tier ID #${tier.id || tier.tier_id}` : 'Định nghĩa tiêu chí quy mô và quyền lợi cho Tier mới'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-200">
          {/* Tên Tier */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Tên Phân Cấp (Tier Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tier 1 - Flagship, Tier 2 - Tiêu chuẩn..."
              value={formData.tier_name}
              onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-[#0f172a] border ${errors.tier_name ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition`}
            />
            {errors.tier_name && <p className="text-xs text-rose-400 mt-1">{errors.tier_name}</p>}
          </div>

          {/* Khoảng nhân sự */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Số nhân sự tối thiểu (Min) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.min_staff_count}
                onChange={(e) => setFormData({ ...formData, min_staff_count: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-[#0f172a] border ${errors.min_staff_count ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-emerald-500 transition`}
              />
              {errors.min_staff_count && <p className="text-xs text-rose-400 mt-1">{errors.min_staff_count}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Số nhân sự tối đa (Max)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Để trống nếu không giới hạn"
                value={formData.max_staff_count}
                onChange={(e) => setFormData({ ...formData, max_staff_count: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-[#0f172a] border ${errors.max_staff_count ? 'border-rose-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-emerald-500 transition`}
              />
              {errors.max_staff_count && <p className="text-xs text-rose-400 mt-1">{errors.max_staff_count}</p>}
            </div>
          </div>

          {/* Mô tả tổng quan */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Mô tả tổng quan</label>
            <textarea
              rows="2"
              placeholder="VD: Chi nhánh quy mô lớn tại các trục đường trung tâm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Tiêu chí mở rộng */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Tiêu chí khác (Doanh thu, Diện tích, KPI...)
            </label>
            <textarea
              rows="2"
              placeholder="• Doanh thu ≥ 1 tỷ/tháng&#10;• Diện tích ≥ 350m²"
              value={formData.other_conditions}
              onChange={(e) => setFormData({ ...formData, other_conditions: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none font-mono text-xs"
            />
          </div>

          {/* Quyền lợi / Chính sách đi kèm */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Quyền lợi & Chính sách phân bổ đi kèm
            </label>
            <textarea
              rows="3"
              placeholder="• Cấp phát tối đa 6 máy Kiosk&#10;• Ưu tiên điều động nhân sự cấp cao&#10;• Ngân sách đào tạo & marketing riêng"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none font-mono text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {tier ? 'Lưu Thay Đổi' : 'Tạo Mới Tier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TierFormModal;