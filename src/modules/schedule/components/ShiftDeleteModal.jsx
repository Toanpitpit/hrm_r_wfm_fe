import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: ShiftDeleteModal.jsx
 * UC 1.3: Modal xác nhận xóa khung ca mẫu
 * ==============================================================================
 */
export default function ShiftDeleteModal({
  open = false,
  shift = null,
  onClose,
  onConfirm,
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!shift) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const res = await onConfirm(shift.shiftId);
      if (res?.success !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xác Nhận Xóa Khung Ca"
      width="440px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#991b1b',
          }}
        >
          <div style={{ marginTop: '2px' }}>
            <Icon
              name="alert"
              size={18}
            />
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
            Bạn có chắc chắn muốn xóa khung ca{' '}
            <strong>{shift.shiftName} ({shift.shiftCode})</strong>? Thao tác này
            sẽ gỡ bỏ khung ca khỏi danh mục xếp lịch của toàn bộ chuỗi cửa hàng.
          </div>
        </div>

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
            onClick={onClose}
            disabled={submitting}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={submitting}
            style={{
              backgroundColor: '#dc2626',
              borderColor: '#dc2626',
            }}
          >
            Xóa Khung Ca
          </Button>
        </div>
      </div>
    </Modal>
  );
}
