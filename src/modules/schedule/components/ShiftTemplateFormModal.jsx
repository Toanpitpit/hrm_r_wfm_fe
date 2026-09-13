import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import {
  calculateWorkHours,
  checkIsOvernight,
} from '../services/shiftTemplate.service';

/**
 * ==============================================================================
 * COMPONENT: ShiftTemplateFormModal.jsx
 * UC 1.3: Modal Tạo / Chỉnh sửa Khung ca Mẫu
 * ==============================================================================
 * Các tính năng & validation cốt lõi:
 * 1. TimePicker (định dạng HH:mm) cho Start Time và End Time
 * 2. Logic FE tự động phát hiện & đánh dấu checkbox "Ca qua đêm" (isOvernight) khi End Time < Start Time
 * 3. Number input cho Break Minutes (Thời gian nghỉ phút)
 * 4. Validation chặn không cho Start Time trùng End Time
 * 5. Tính toán số giờ công chuẩn và hiển thị thẻ Preview thời gian ca trực quan
 */
export default function ShiftTemplateFormModal({
  open = false,
  initialData = null,
  onClose,
  onSubmit,
}) {
  const { c } = useAdminTheme();

  const [formData, setFormData] = useState({
    shiftCode: '',
    shiftName: '',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    isOvernight: false,
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Khởi tạo hoặc nạp dữ liệu khi mở modal
  useEffect(() => {
    if (initialData) {
      setFormData({
        shiftCode: initialData.shiftCode || initialData.templateCode || '',
        shiftName: initialData.shiftName || initialData.name || '',
        startTime: initialData.startTime?.slice(0, 5) || '08:00',
        endTime: initialData.endTime?.slice(0, 5) || '16:30',
        breakMinutes: initialData.breakMinutes ?? 30,
        isOvernight: Boolean(initialData.isOvernight),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        shiftCode: '',
        shiftName: '',
        startTime: '08:00',
        endTime: '16:30',
        breakMinutes: 30,
        isOvernight: false,
        description: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  // Logic tự động đánh dấu checkbox "Ca qua đêm" khi End Time < Start Time
  const handleTimeChange = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    const start = field === 'startTime' ? value : formData.startTime;
    const end = field === 'endTime' ? value : formData.endTime;

    if (start && end) {
      const autoOvernight = checkIsOvernight(start, end);
      nextForm.isOvernight = autoOvernight;
    }

    setFormData(nextForm);
    if (errors[field] || errors.time) {
      setErrors((prev) => ({ ...prev, [field]: null, time: null }));
    }
  };

  const workHours = calculateWorkHours(
    formData.startTime,
    formData.endTime,
    formData.breakMinutes
  );

  const validate = () => {
    const errs = {};

    if (!formData.shiftCode.trim()) {
      errs.shiftCode = 'Vui lòng nhập mã khung ca (VD: CA_SANG, SHIFT_01).';
    } else if (formData.shiftCode.trim().length < 3) {
      errs.shiftCode = 'Mã ca tối thiểu 3 ký tự.';
    }

    if (!formData.shiftName.trim()) {
      errs.shiftName = 'Vui lòng nhập tên khung ca.';
    }

    if (!formData.startTime) {
      errs.startTime = 'Vui lòng chọn giờ bắt đầu.';
    }

    if (!formData.endTime) {
      errs.endTime = 'Vui lòng chọn giờ kết thúc.';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime === formData.endTime) {
        errs.time = 'Giờ kết thúc không được trùng với giờ bắt đầu (thời lượng ca phải >= 2h).';
      }
    }

    if (workHours < 2) {
      errs.workHours = 'Thời lượng làm việc thực tế của ca tối thiểu phải là 2.0 giờ.';
    } else if (workHours > 12) {
      errs.workHours = 'Thời lượng ca làm việc không được vượt quá 12.0 giờ theo quy định lao động.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await onSubmit(formData);
      if (res?.success !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Khung Ca Mẫu' : 'Tạo Khung Ca Mẫu Mới'}
      width="540px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. Mã khung ca */}
          <FormField
            label="Mã Khung Ca"
            required
            error={errors.shiftCode}
            hint="Mã định danh quy chuẩn (VD: CA_SANG, CA_CHIEU, SHIFT_PARTTIME)"
          >
            <input
              type="text"
              value={formData.shiftCode}
              disabled={isEditing}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shiftCode: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                })
              }
              placeholder="VD: CA_SANG_01"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.shiftCode ? '#ef4444' : c.border}`,
                backgroundColor: isEditing ? `${c.bgSubtle}` : c.bgCard,
                color: c.fg,
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </FormField>

          {/* 2. Tên khung ca */}
          <FormField
            label="Tên Khung Ca"
            required
            error={errors.shiftName}
            hint="Tên hiển thị để quản lý cửa hàng nhận biết khi xếp lịch"
          >
            <input
              type="text"
              value={formData.shiftName}
              onChange={(e) =>
                setFormData({ ...formData, shiftName: e.target.value })
              }
              placeholder="VD: Ca Sáng Tiêu Chuẩn (08:00 - 16:30)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.shiftName ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 3. TimePicker Start Time & End Time */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <FormField
              label="Giờ Bắt Đầu (Start Time)"
              required
              error={errors.startTime}
            >
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.startTime || errors.time ? '#ef4444' : c.border}`,
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
              label="Giờ Kết Thúc (End Time)"
              required
              error={errors.endTime}
            >
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.endTime || errors.time ? '#ef4444' : c.border}`,
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

          {/* Lỗi trùng giờ nếu có */}
          {errors.time && (
            <div
              style={{
                fontSize: '12px',
                color: '#ef4444',
                marginTop: '-6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Icon
                name="alert"
                size={13}
              />
              <span>{errors.time}</span>
            </div>
          )}

          {/* 4. Thời gian nghỉ & Checkbox Ca qua đêm */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <FormField
              label="Thời Gian Nghỉ (Phút)"
              hint="Số phút nghỉ giữa ca (trừ khỏi giờ công)"
            >
              <input
                type="number"
                min="0"
                max="180"
                step="5"
                value={formData.breakMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    breakMinutes: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fg,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </FormField>

            <div style={{ marginTop: '26px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: c.fg,
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isOvernight}
                  onChange={(e) =>
                    setFormData({ ...formData, isOvernight: e.target.checked })
                  }
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: c.accent,
                    cursor: 'pointer',
                  }}
                />
                <span>Ca làm việc qua đêm</span>
                {formData.isOvernight && (
                  <Badge tone="accent">
                    <span style={{ fontSize: '10px' }}>Tự động nhận diện</span>
                  </Badge>
                )}
              </label>
            </div>
          </div>

          {/* 5. Thẻ Preview Giờ Công & Thông Tin Ca */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: `${c.bgSubtle}90`,
              border: `1px solid ${c.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: c.fgSubtle }}>
                Thời gian làm việc tính công:
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: errors.workHours ? '#ef4444' : c.accent,
                  marginTop: '2px',
                }}
              >
                {workHours} Giờ Công Chuẩn
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: c.fgSubtle }}>Khung giờ:</div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: c.fg,
                  marginTop: '2px',
                }}
              >
                {formData.startTime} $\rightarrow$ {formData.endTime}{' '}
                {formData.isOvernight ? '(Hôm sau)' : ''}
              </div>
            </div>
          </div>

          {errors.workHours && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '-6px' }}>
              {errors.workHours}
            </div>
          )}

          {/* 6. Mô tả khung ca */}
          <FormField
            label="Mô Tả Khung Ca"
            hint="Ghi chú thêm về tính chất công việc hoặc yêu cầu nhân sự"
          >
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="VD: Khung ca sáng phục vụ khách mua hàng giờ cao điểm buổi sáng..."
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
              marginTop: '10px',
            }}
          >
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Lưu Khung Ca'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
