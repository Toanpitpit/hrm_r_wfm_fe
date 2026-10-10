import React from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: ShiftImpactModal.jsx
 * Modal xác nhận khi gặp xung đột 409 (FUTURE_SCHEDULES_EXIST hoặc IMPACT_CONFIRM_REQUIRED)
 * ==============================================================================
 */
export default function ShiftImpactModal({
  open = false,
  title = 'Xác Nhận Thay Đổi',
  message = '',
  confirmLabel = 'Đồng Ý Tiếp Tục',
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '14px',
          }}
        >
          <div style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>
            <Icon name="warning" size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '13.5px', color: '#e2e8f0', lineHeight: '1.5' }}>
            {message}
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
