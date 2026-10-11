import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import Select from '@/shared/components/ui/Select';
import {
  calculatePaidHours,
  calculateNightHours,
  checkIsOvernight,
} from '../services/shiftTemplate.service';

/**
 * Tự động xác định loại ca theo giờ bắt đầu và tính chất qua đêm
 */
const getAutoShiftType = (startTime, isOvernight) => {
  if (isOvernight) return 'Night';
  if (!startTime) return 'Morning';
  const [sh] = startTime.split(':').map(Number);
  if (sh >= 21 || sh < 5) return 'Night';
  if (sh >= 12) return 'Afternoon';
  return 'Morning';
};

/**
 * ==============================================================================
 * COMPONENT: ShiftTemplateFormModal.jsx
 * Modal Thêm / Chỉnh sửa Khung ca mẫu (Chung toàn chuỗi hoặc Riêng chi nhánh)
 * ==============================================================================
 */
export default function ShiftTemplateFormModal({
  open = false,
  initialData = null,
  defaultScope = 'GLOBAL',
  defaultBranchId = null,
  branches = [],
  onClose,
  onSubmit,
}) {
  const { c } = useAdminTheme();

  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    scope: 'GLOBAL',
    branchId: '',
    templateCode: '',
    name: '',
    shiftType: 'Morning',
    startTime: '06:00',
    endTime: '14:00',
    breakDuration: 30,
    isActive: true,
    description: '',
  });

  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Nạp dữ liệu khi mở Modal
  useEffect(() => {
    if (open) {
      setServerError('');
      setClientErrors({});

      if (initialData) {
        setFormData({
          scope: initialData.scope || 'GLOBAL',
          branchId: initialData.branchId ? String(initialData.branchId) : '',
          templateCode: initialData.templateCode || initialData.shiftCode || '',
          name: initialData.name || initialData.shiftName || '',
          shiftType: initialData.shiftType || 'Morning',
          startTime: initialData.startTime?.slice(0, 5) || '06:00',
          endTime: initialData.endTime?.slice(0, 5) || '14:00',
          breakDuration: initialData.breakDuration ?? initialData.breakMinutes ?? 30,
          isActive: initialData.isActive !== undefined ? Boolean(initialData.isActive) : true,
          description: initialData.description || '',
        });
      } else {
        const initScope = defaultScope || 'GLOBAL';
        const initBranchId =
          defaultBranchId
            ? String(defaultBranchId)
            : branches.length > 0
            ? String(branches[0].id ?? branches[0].storeId ?? '')
            : '';

        setFormData({
          scope: initScope,
          branchId: initScope === 'BRANCH' ? initBranchId : '',
          templateCode: '',
          name: '',
          shiftType: 'Morning',
          startTime: '06:00',
          endTime: '14:00',
          breakDuration: 30,
          isActive: true,
          description: '',
        });
      }
    }
  }, [open, initialData, defaultScope, defaultBranchId, branches]);

  // Tính toán thời gian Live Preview
  const previewIsOvernight = checkIsOvernight(formData.startTime, formData.endTime);
  const previewPaidHours = calculatePaidHours(
    formData.startTime,
    formData.endTime,
    formData.breakDuration
  );
  const previewNightHours = calculateNightHours(formData.startTime, formData.endTime);

  const handleTimeChange = (field, value) => {
    const next = { ...formData, [field]: value };
    const start = field === 'startTime' ? value : formData.startTime;
    const end = field === 'endTime' ? value : formData.endTime;

    if (start && end) {
      const isNight = checkIsOvernight(start, end);
      next.shiftType = getAutoShiftType(start, isNight);
    }

    setFormData(next);
    if (clientErrors[field] || clientErrors.time) {
      setClientErrors((prev) => ({ ...prev, [field]: null, time: null }));
    }
  };

  // Client Validation
  const validate = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Vui lòng nhập tên khung ca làm việc.';
    }

    if (formData.scope === 'BRANCH' && !formData.branchId) {
      errors.branchId = 'Vui lòng chọn chi nhánh áp dụng khung ca riêng.';
    }

    if (!formData.startTime) {
      errors.startTime = 'Vui lòng chọn giờ bắt đầu.';
    }

    if (!formData.endTime) {
      errors.endTime = 'Vui lòng chọn giờ kết thúc.';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime === formData.endTime) {
        errors.time = 'Giờ kết thúc không được trùng với giờ bắt đầu (ca phải >= 1 giờ).';
      }
    }

    const [startH, startM] = (formData.startTime || '00:00').split(':').map(Number);
    const [endH, endM] = (formData.endTime || '00:00').split(':').map(Number);
    let durationMin = endH * 60 + endM - (startH * 60 + startM);
    if (durationMin <= 0) durationMin += 24 * 60;

    const breakMin = Number(formData.breakDuration || 0);
    if (breakMin < 0) {
      errors.breakDuration = 'Thời gian nghỉ không được nhỏ hơn 0 phút.';
    } else if (breakMin >= durationMin) {
      errors.breakDuration = `Thời gian nghỉ (${breakMin}p) phải nhỏ hơn tổng thời lượng ca (${durationMin}p).`;
    }

    if (previewPaidHours <= 0) {
      errors.paidHours = 'Số giờ công sau khi trừ thời gian nghỉ phải lớn hơn 0.';
    } else if (previewPaidHours > 16) {
      errors.paidHours = 'Thời lượng ca làm việc không được vượt quá 16 giờ.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setServerError('');

    if (!validate()) return;

    // Tự động suy ra loại ca và sinh mã ca nếu để trống
    const autoShiftType =
      formData.shiftType || getAutoShiftType(formData.startTime, previewIsOvernight);

    const submissionData = {
      ...formData,
      shiftType: autoShiftType,
      templateCode:
        formData.templateCode?.trim() ||
        (formData.scope === 'BRANCH'
          ? `CR_${formData.branchId || '01'}_${formData.startTime?.replace(':', '') || Date.now().toString().slice(-4)}`
          : `CA_${formData.startTime?.replace(':', '') || Date.now().toString().slice(-4)}`),
    };

    try {
      setSubmitting(true);
      const res = await onSubmit(submissionData);
      if (res?.success === false) {
        setServerError(res.error || 'Có lỗi xảy ra khi lưu khung ca.');
      } else {
        onClose();
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || err.message || 'Không thể lưu khung ca'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const branchOptions = branches.map((b) => {
    const bId = b.id ?? b.storeId;
    return {
      value: String(bId),
      label: `${b.name} (${b.shiftMode === 'CUSTOM' ? 'Dùng ca riêng' : 'Dùng ca chung'})`,
    };
  });

  const modalTitle = isEditing
    ? formData.scope === 'BRANCH'
      ? 'Chỉnh Sửa Ca Riêng Chi Nhánh'
      : 'Chỉnh Sửa Khung Ca Chung'
    : formData.scope === 'BRANCH'
    ? 'Thêm Ca Riêng Chi Nhánh'
    : 'Tạo Khung Ca Chung Toàn Chuỗi';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      width="560px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Thông báo lỗi từ server nếu có */}
          {serverError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon name="alert" size={16} color="#f87171" />
              <span>{serverError}</span>
            </div>
          )}

          {/* 1. Phạm vi & Chi nhánh */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: formData.scope === 'BRANCH' ? '1fr 1.3fr' : '1fr',
              gap: '12px',
            }}
          >
            <FormField
              label="Phạm Vi Áp Dụng"
              required
              hint={isEditing ? 'Không thể đổi phạm vi sau khi tạo' : 'Áp dụng toàn chuỗi hoặc một chi nhánh cụ thể'}
            >
              <div
                style={{
                  display: 'flex',
                  borderRadius: '8px',
                  backgroundColor: c.bgElev,
                  padding: '3px',
                  border: `1px solid ${c.border}`,
                }}
              >
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => setFormData({ ...formData, scope: 'GLOBAL', branchId: '' })}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isEditing ? 'not-allowed' : 'pointer',
                    backgroundColor: formData.scope === 'GLOBAL' ? c.accent : 'transparent',
                    color: formData.scope === 'GLOBAL' ? '#000000' : c.fgSubtle,
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Chung toàn chuỗi
                </button>
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => {
                    const fallbackBranch =
                      formData.branchId ||
                      (defaultBranchId
                        ? String(defaultBranchId)
                        : branches.length > 0
                        ? String(branches[0].id ?? branches[0].storeId ?? '')
                        : '');
                    setFormData({ ...formData, scope: 'BRANCH', branchId: fallbackBranch });
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isEditing ? 'not-allowed' : 'pointer',
                    backgroundColor: formData.scope === 'BRANCH' ? '#a855f7' : 'transparent',
                    color: formData.scope === 'BRANCH' ? '#ffffff' : c.fgSubtle,
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Riêng chi nhánh
                </button>
              </div>
            </FormField>

            {formData.scope === 'BRANCH' && (
              <FormField
                label="Chi Nhánh Áp Dụng"
                required
                error={clientErrors.branchId}
                hint={isEditing ? 'Cố định chi nhánh đã chọn' : 'Chi nhánh sở hữu bộ ca riêng này'}
              >
                <Select
                  value={String(formData.branchId || '')}
                  onChange={(val) => setFormData({ ...formData, branchId: val })}
                  options={branchOptions}
                  disabled={isEditing}
                />
              </FormField>
            )}
          </div>

          {/* 2. Tên ca */}
          <FormField
            label="Tên Khung Ca"
            required
            error={clientErrors.name}
            hint="Tên hiển thị khi xếp lịch (VD: Ca Sáng Tiêu Chuẩn, Ca Tối Sân Bay...)"
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.scope === 'BRANCH' ? 'VD: Ca Sáng Phú Mỹ Hưng (07:00 - 15:00)' : 'VD: Ca Sáng Tiêu Chuẩn (06:00 - 14:00)'}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${clientErrors.name ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </FormField>

          {/* 3. Giờ bắt đầu & Giờ kết thúc */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <FormField
              label="Giờ Bắt Đầu"
              required
              error={clientErrors.startTime}
            >
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${clientErrors.startTime || clientErrors.time ? '#ef4444' : c.border}`,
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
              label="Giờ Kết Thúc"
              required
              error={clientErrors.endTime}
            >
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${clientErrors.endTime || clientErrors.time ? '#ef4444' : c.border}`,
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

          {clientErrors.time && (
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
              <Icon name="alert" size={13} color="#ef4444" />
              <span>{clientErrors.time}</span>
            </div>
          )}

          {/* 4. Thời gian nghỉ & Trạng thái hoạt động */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <FormField
              label="Thời Gian Nghỉ (Phút)"
              error={clientErrors.breakDuration}
              hint="Nghỉ giữa ca được trừ khỏi giờ công"
            >
              <input
                type="number"
                min="0"
                max="180"
                step="5"
                value={formData.breakDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    breakDuration: Math.max(0, parseInt(e.target.value) || 0),
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

            <div style={{ marginTop: '16px' }}>
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
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: c.accent,
                    cursor: 'pointer',
                  }}
                />
                <span>Kích hoạt áp dụng khung ca</span>
              </label>
            </div>
          </div>

          {/* 5. Thẻ Live Preview Thông Số Ca (Tự động cập nhật, chỉ đọc) */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${c.border}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '11.5px', color: c.fgSubtle }}>Ca qua đêm:</div>
              <div style={{ marginTop: '4px' }}>
                <Badge tone={previewIsOvernight ? 'accent' : 'neutral'}>
                  <span>{previewIsOvernight ? 'Có (Qua đêm)' : 'Không'}</span>
                </Badge>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11.5px', color: c.fgSubtle }}>Số giờ công chuẩn:</div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: clientErrors.paidHours ? '#ef4444' : c.accent,
                  marginTop: '2px',
                }}
              >
                {previewPaidHours} giờ
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11.5px', color: c.fgSubtle }}>Giờ đêm (22h - 06h):</div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: previewNightHours > 0 ? '#c084fc' : c.fgSubtle,
                  marginTop: '2px',
                }}
              >
                {previewNightHours} giờ
              </div>
            </div>
          </div>

          {clientErrors.paidHours && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '-6px' }}>
              {clientErrors.paidHours}
            </div>
          )}

          {/* 6. Mã khung ca (Tùy chọn) */}
          <FormField
            label="Mã Khung Ca (Tùy chọn)"
            hint="Hệ thống tự động sinh mã nếu để trống"
          >
            <input
              type="text"
              disabled={isEditing}
              value={formData.templateCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  templateCode: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                })
              }
              placeholder="VD: CA_SANG, PMH_01"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                backgroundColor: isEditing ? c.bgSubtle : c.bgCard,
                color: c.fg,
                fontSize: '13.5px',
                fontFamily: 'monospace',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </FormField>

          {/* 7. Mô tả / Ghi chú */}
          <FormField
            label="Ghi Chú / Mô Tả"
            hint="Ghi chú thêm về yêu cầu công việc hoặc phân công nhân sự"
          >
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="VD: Ca phục vụ chính tại cửa hàng..."
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
              marginTop: '6px',
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
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Khung Ca'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
