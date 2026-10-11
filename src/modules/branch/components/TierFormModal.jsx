import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';

/**
 * ==============================================================================
 * COMPONENT: TierFormModal.jsx
 * Modal Thêm mới / Cập nhật Tier Phân cấp Chi nhánh
 * ==============================================================================
 */
export default function TierFormModal({
  isOpen = false,
  onClose,
  onSubmit,
  tier = null,
  isLoading = false,
}) {
  const { c } = useAdminTheme();

  const [formData, setFormData] = useState({
    tierName: '',
    minStaffCount: 0,
    maxStaffCount: '',
    description: '',
    conditions: '',
    benefits: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tier) {
      setFormData({
        tierName: tier.tier_name || tier.tierName || '',
        minStaffCount: tier.min_staff_count ?? tier.minStaffCount ?? 0,
        maxStaffCount:
          tier.max_staff_count !== null && tier.max_staff_count !== undefined
            ? tier.max_staff_count
            : tier.maxStaffCount !== null && tier.maxStaffCount !== undefined
            ? tier.maxStaffCount
            : '',
        description: tier.description || '',
        conditions: tier.conditions || tier.other_conditions || tier.otherConditions || '',
        benefits: tier.benefits || '',
      });
    } else {
      setFormData({
        tierName: '',
        minStaffCount: 0,
        maxStaffCount: '',
        description: '',
        conditions: '',
        benefits: '',
      });
    }
    setErrors({});
  }, [tier, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const err = {};
    if (!formData.tierName.trim()) {
      err.tierName = 'Tên phân cấp không được để trống';
    }
    if (formData.minStaffCount === '' || Number(formData.minStaffCount) < 0) {
      err.minStaffCount = 'Số nhân sự tối thiểu phải từ 0 trở lên';
    }
    if (
      formData.maxStaffCount !== '' &&
      formData.maxStaffCount !== null &&
      Number(formData.maxStaffCount) < Number(formData.minStaffCount)
    ) {
      err.maxStaffCount = 'Số nhân sự tối đa không được nhỏ hơn số tối thiểu';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const payload = {
      tierName: formData.tierName.trim(),
      tier_name: formData.tierName.trim(),
      minStaffCount: Number(formData.minStaffCount),
      min_staff_count: Number(formData.minStaffCount),
      maxStaffCount:
        formData.maxStaffCount !== '' && formData.maxStaffCount !== null
          ? Number(formData.maxStaffCount)
          : null,
      max_staff_count:
        formData.maxStaffCount !== '' && formData.maxStaffCount !== null
          ? Number(formData.maxStaffCount)
          : null,
      description: formData.description.trim() || null,
      conditions: formData.conditions.trim() || null,
      otherConditions: formData.conditions.trim() || null,
      other_conditions: formData.conditions.trim() || null,
      benefits: formData.benefits.trim() || null,
    };

    onSubmit(payload);
  };

  const isEditing = Boolean(tier);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isEditing ? 'Cập Nhật Phân Cấp (Tier)' : 'Tạo Mới Phân Cấp (Tier)'}
      width="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Tên Tier */}
        <FormField
          label="Tên Phân Cấp (Tier Name)"
          required
          error={errors.tierName}
          hint="Ví dụ: Tier 1 - Flagship, Tier 2 - Tiêu chuẩn, Tier 4 - Hub Kiosk"
        >
          <input
            type="text"
            placeholder="Nhập tên phân cấp..."
            value={formData.tierName}
            onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.tierName ? '#ef4444' : c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </FormField>

        {/* Khoảng nhân sự Min - Max */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FormField
            label="Nhân Sự Tối Thiểu (Min)"
            required
            error={errors.minStaffCount}
            hint="Quy mô nhân sự tối thiểu"
          >
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.minStaffCount}
              onChange={(e) => setFormData({ ...formData, minStaffCount: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.minStaffCount ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </FormField>

          <FormField
            label="Nhân Sự Tối Đa (Max)"
            error={errors.maxStaffCount}
            hint="Để trống nếu không giới hạn"
          >
            <input
              type="number"
              min="0"
              placeholder="Không giới hạn"
              value={formData.maxStaffCount}
              onChange={(e) => setFormData({ ...formData, maxStaffCount: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.maxStaffCount ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </FormField>
        </div>

        {/* Mô tả tổng quan */}
        <FormField
          label="Mô Tả Tổng Quan"
          hint="Mô tả vị trí, lưu lượng khách hoặc đặc thù mô hình"
        >
          <textarea
            rows={2}
            placeholder="VD: Cửa hàng quy mô lớn tại các trục đường trung tâm hoặc TTTM..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </FormField>

        {/* Điều kiện & Tiêu chí */}
        <FormField
          label="Tiêu Chuẩn & Điều Kiện"
          hint="Doanh thu mục tiêu, diện tích mặt sàn, tiêu chuẩn mặt bằng..."
        >
          <textarea
            rows={2}
            placeholder="VD: Diện tích sàn > 250m², doanh thu > 500tr/tháng..."
            value={formData.conditions}
            onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </FormField>

        {/* Quyền lợi & Chính sách */}
        <FormField
          label="Quyền Lợi & Đặc Quyền Vận Hành"
          hint="Hạn mức trạm Kiosk, ưu tiên điều động, ngân sách OT..."
        >
          <textarea
            rows={2}
            placeholder="VD: Cấp 2-4 máy Kiosk iPad, ưu tiên điều động nhân sự cao điểm..."
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </FormField>

        {/* Footer nút bấm */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            {isEditing ? 'Lưu Thay Đổi' : 'Tạo Mới Phân Cấp'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export { TierFormModal };
