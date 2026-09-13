import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * ==============================================================================
 * COMPONENT: BranchDeleteModal.jsx
 * UC 1.2: Modal Xác nhận Xóa Chi nhánh
 * ==============================================================================
 * Cảnh báo nguy hiểm khi xóa chi nhánh:
 * - Hiển thị mã & tên chi nhánh sẽ bị xóa vĩnh viễn
 * - Cảnh báo toàn bộ máy trạm Kiosk thuộc chi nhánh sẽ bị hủy liên kết/xóa
 */
export default function BranchDeleteModal({
  open = false,
  branch = null,
  onClose,
  onConfirm,
}) {
  const { c } = useAdminTheme();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!branch) return null;

  const branchCode = branch.branchCode || branch.code || branch.storeCode || `CH0${branch.storeId || branch.id}`;
  const branchName = branch.name || branch.storeName || branch.branchName || 'Chi nhánh';

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await onConfirm(branch.storeId || branch.id);
      if (res?.success === false) {
        setError(res.error || 'Có lỗi xảy ra khi xóa chi nhánh.');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối khi xóa.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xác Nhận Xóa Chi Nhánh"
      width="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Banner cảnh báo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#ef444415',
            border: '1px solid #ef444440',
            color: '#ef4444',
          }}
        >
          <Icon name="alert-triangle" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              Hành động này không thể hoàn tác!
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.9 }}>
              Bạn có chắc chắn muốn xóa chi nhánh{' '}
              <strong>
                [{branchCode}] {branchName}
              </strong>{' '}
              khỏi hệ thống? Toàn bộ các trạm Kiosk tại chi nhánh này cũng sẽ bị xóa.
            </div>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: '#ef444420',
              border: '1px solid #ef444460',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

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
            disabled={submitting}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={handleConfirm}
            loading={submitting}
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              border: '1px solid #dc2626',
              fontWeight: 700,
            }}
          >
            Xác Nhận Xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
}