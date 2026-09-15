import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

export default function ToggleStatusModal({
  isOpen,
  onClose,
  employee,
  onConfirmToggle,
}) {
  const { c } = useAdminTheme();
  const [submitting, setSubmitting] = useState(false);

  if (!employee) return null;

  const isCurrentlyInactive = employee.status === 'INACTIVE';
  const targetAction = isCurrentlyInactive ? 'KÍCH HOẠT LẠI' : 'KHÓA TẠM THỜI';
  const targetNewStatus = isCurrentlyInactive ? 'ACTIVE' : 'INACTIVE';

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirmToggle(employee.id, targetNewStatus);
      onClose();
    } catch (err) {
      console.error('Toggle status error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`${isCurrentlyInactive ? 'Kích Hoạt Lại Tài Khoản' : 'Khóa Tài Khoản Nhân Sự'}`}
      sub={`Xác nhận thay đổi trạng thái hoạt động của tài khoản #${employee.id}`}
      width={480}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy Bỏ
          </Button>
          <Button
            variant={isCurrentlyInactive ? 'primary' : 'danger'}
            onClick={handleConfirm}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name={isCurrentlyInactive ? 'unlock' : 'lock'} size={14} />
            <span>
              {submitting
                ? 'Đang xử lý...'
                : isCurrentlyInactive
                ? 'Xác Nhận Kích Hoạt'
                : 'Xác Nhận Khóa Tài Khoản'}
            </span>
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ fontSize: '13.5px', color: c.fg, lineHeight: '1.5' }}>
          Bạn có chắc chắn muốn {targetAction} tài khoản của nhân sự:{' '}
          <strong style={{ color: '#f2ca50' }}>{employee.fullName}</strong> (Mã:{' '}
          <strong>{employee.employeeCode || `NV-${employee.id}`}</strong>)?
        </p>

        {isCurrentlyInactive ? (
          <div
            style={{
              padding: '12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#86efac',
            }}
          >
            Sau khi mở khóa, nhân viên này sẽ có thể đăng nhập vào hệ thống và được phân bổ vào các ca làm việc bình thường.
          </div>
        ) : (
          <div
            style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#fca5a5',
            }}
          >
            Sau khi khóa, tài khoản này sẽ ngay lập tức bị từ chối đăng nhập và không thể thực hiện điểm danh hoặc nhận ca làm việc mới.
          </div>
        )}
      </div>
    </Modal>
  );
}
