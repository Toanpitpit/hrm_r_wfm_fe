import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchLockModal.jsx
 * UC 1.2: Modal Khóa / Mở khóa Chi nhánh có lưu vết lý do (Audit Log)
 * ==============================================================================
 */
export default function BranchLockModal({
  open = false,
  branch = null,
  onClose,
  onConfirm,
}) {
  const { c } = useAdminTheme();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLocking = branch?.status === 'ACTIVE';

  useEffect(() => {
    setReason('');
    setError('');
  }, [open, branch]);

  const handleConfirm = async () => {
    if (isLocking && !reason.trim()) {
      setError('Vui lòng nhập lý do khóa chi nhánh để lưu vết kiểm toán.');
      return;
    }

    try {
      setSubmitting(true);
      const nextStatus = isLocking ? 'LOCKED' : 'ACTIVE';
      const res = await onConfirm(branch.storeId, nextStatus, reason.trim());
      if (res?.success !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!branch) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocking ? 'Xác Nhận Khóa Chi Nhánh' : 'Mở Khóa Chi Nhánh'}
      width="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Banner cảnh báo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: isLocking ? '#fee2e2' : '#dcfce7',
            border: `1px solid ${isLocking ? '#fca5a5' : '#86efac'}`,
            borderRadius: '8px',
            padding: '12px 14px',
            color: isLocking ? '#991b1b' : '#166534',
          }}
        >
          <div style={{ marginTop: '2px' }}>
            <Icon
              name={isLocking ? 'lock' : 'unlock'}
              size={18}
            />
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
            {isLocking ? (
              <>
                Bạn đang thực hiện khóa chi nhánh{' '}
                <strong>{branch.name} ({branch.branchCode})</strong>. Các hoạt động phân ca và điểm danh tại chi nhánh này sẽ tạm ngừng!
              </>
            ) : (
              <>
                Bạn đang mở khóa cho chi nhánh{' '}
                <strong>{branch.name} ({branch.branchCode})</strong> hoạt động
                trở lại bình thường.
              </>
            )}
          </div>
        </div>

        {/* Form nhập lý do */}
        {isLocking && (
          <FormField
            label="Lý do khóa chi nhánh"
            required
            error={error}
            hint="Lý do này sẽ được ghi vào nhật ký kiểm toán hệ thống (Audit Trail)"
          >
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="VD: Cửa hàng đang sửa chữa mặt bằng hoặc bảo trì hệ thống..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${error ? '#ef4444' : c.border}`,
                backgroundColor: c.bgCard,
                color: c.fg,
                fontSize: '13px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </FormField>
        )}

        {/* Nút hành động */}
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
              backgroundColor: isLocking ? '#dc2626' : '#16a34a',
              borderColor: isLocking ? '#dc2626' : '#16a34a',
            }}
          >
            {isLocking ? 'Xác Nhận Khóa' : 'Xác Nhận Mở Khóa'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
