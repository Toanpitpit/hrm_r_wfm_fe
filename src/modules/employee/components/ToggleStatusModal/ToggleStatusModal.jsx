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
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!employee) return null;

  const isCurrentlyInactive = employee.status === 'INACTIVE';
  const targetAction = isCurrentlyInactive ? 'KÍCH HOẠT LẠI' : 'KHÓA TẠM THỜI';
  const targetNewStatus = isCurrentlyInactive ? 'ACTIVE' : 'INACTIVE';

  const handleClose = () => {
    setReason('');
    setReasonError('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setReasonError('Vui lòng nhập lý do thực hiện thay đổi trạng thái tài khoản.');
      return;
    }
    setReasonError('');
    setSubmitting(true);
    try {
      await onConfirmToggle(employee.id, targetNewStatus, reason.trim());
      handleClose();
    } catch (err) {
      console.error('Toggle status error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={`${isCurrentlyInactive ? 'Kích Hoạt Lại Tài Khoản' : 'Khóa Tài Khoản Nhân Sự'}`}
      sub={`Xác nhận thay đổi trạng thái hoạt động của tài khoản #${employee.id}`}
      width={520}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
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
                ? 'Đang kiểm tra & xử lý...'
                : isCurrentlyInactive
                ? 'Xác Nhận Kích Hoạt'
                : 'Xác Nhận Khóa Tài Khoản'}
            </span>
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ fontSize: '13.5px', color: c.fg, lineHeight: '1.5', margin: 0 }}>
          Bạn đang yêu cầu {targetAction} tài khoản của nhân sự:{' '}
          <strong style={{ color: '#f2ca50' }}>{employee.fullName}</strong> (Mã:{' '}
          <strong>{employee.employeeCode || `NV-${employee.id}`}</strong>).
        </p>

        {/* Cảnh báo ràng buộc dịch vụ */}
        {!isCurrentlyInactive ? (
          <div
            style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fca5a5',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <Icon name="alert-triangle" size={15} color="#ef4444" />
              <span>RÀNG BUỘC KIỂM TRA DỊCH VỤ HOẠT ĐỘNG:</span>
            </div>
            <div>
              • Hệ thống sẽ tự động kiểm tra xem nhân viên có đang trong ca trực làm việc (đã Check-in), có ca làm việc sắp tới hoặc đang tham gia điều động hay không.
            </div>
            <div>
              • Nếu nhân sự còn lịch làm việc đang hoạt động, hệ thống sẽ <strong>từ chối khóa tài khoản</strong> để tránh gián đoạn vận hành cửa hàng.
            </div>
          </div>
        ) : (
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
        )}

        {/* Ô nhập Lý Do Bắt Buộc */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: c.fg }}>
            Lý do thực hiện <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError('');
            }}
            placeholder={
              isCurrentlyInactive
                ? 'Nhập lý do kích hoạt lại tài khoản (VD: Nhân sự quay lại làm việc, Kết thúc thời gian tạm hoãn...)'
                : 'Nhập lý do khóa tài khoản (VD: Nhân sự nghỉ việc, Tạm hoãn hợp đồng lao động, Vi phạm quy định...)'
            }
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: c.bgCard,
              border: `1px solid ${reasonError ? '#ef4444' : c.border}`,
              borderRadius: '6px',
              color: c.fg,
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          {reasonError && (
            <span style={{ fontSize: '12px', color: '#ef4444' }}>{reasonError}</span>
          )}
        </div>

        {/* Thông báo gửi email */}
        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#93c5fd',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="mail" size={16} color="#60a5fa" />
          <span>
            Email thông báo thay đổi trạng thái kèm lý do trên sẽ được gửi tự động tới email hồ sơ:{' '}
            <strong style={{ color: '#fff' }}>{employee.email || 'Chưa cập nhật email'}</strong>.
          </span>
        </div>
      </div>
    </Modal>
  );
}
