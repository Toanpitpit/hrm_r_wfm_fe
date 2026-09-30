import React, { useState, useEffect, useRef } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field as FormField } from '@/shared/components/ui/FormField';
import { useUnlockBranch } from '../hooks/useUnlockBranch';

/**
 * COMPONENT: UnlockModal.jsx
 * Luồng Mở Khóa Chi Nhánh:
 * - Hiển thị thông tin chi nhánh đang bị tạm khóa (lý do khóa cũ, thời gian khóa)
 * - Textarea nhập lý do mở khóa (tùy chọn)
 * - Gửi POST /api/branches/{id}/unlock
 */
export default function UnlockModal({
  open = false,
  branch = null,
  onClose,
  onSuccess,
}) {
  const { c, fonts } = useAdminTheme();
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const { loading: unlocking, unlock, error } = useUnlockBranch();
  const modalContainerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setReason('');
      setErrorMsg(null);
    }
  }, [open, branch]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && modalContainerRef.current) {
        const focusables = modalContainerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!branch) return null;

  const branchCode = branch.branchCode || branch.code || '';

  const handleConfirmUnlock = async () => {
    setErrorMsg(null);
    const res = await unlock(branch.storeId || branch.id, {
      reason: reason.trim() || undefined,
    });

    if (res.success) {
      onSuccess && onSuccess(branch, reason.trim());
      onClose();
    } else {
      setErrorMsg(res.message || 'Không thể mở khóa chi nhánh lúc này.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !unlocking && onClose()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="unlock" size={16} color="#10b981" />
          </div>
          <div>
            <span>Mở Khóa Chi Nhánh: </span>
            <span style={{ color: c.accent }}>{branch.name}</span>
          </div>
        </div>
      }
      sub={`Mã CN: ${branchCode} · Khôi phục hoạt động kinh doanh và chấm công`}
      width="500px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={unlocking}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="primary"
            loading={unlocking}
            onClick={handleConfirmUnlock}
            style={{
              backgroundColor: '#10b981',
              borderColor: '#10b981',
            }}
          >
            <Icon name="unlock" size={14} />
            <span>Xác Nhận Mở Khóa</span>
          </Button>
        </div>
      }
    >
      <div ref={modalContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Lỗi server nếu có */}
        {(errorMsg || error) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Icon name="alert-triangle" size={16} color="#ef4444" />
            <span>{errorMsg || error}</span>
          </div>
        )}

        {/* Thông tin xác nhận */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.10)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#10b981',
          }}
        >
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            <Icon name="info" size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: c.fg }}>
            Bạn đang chuẩn bị mở khóa cho chi nhánh{' '}
            <strong>{branch.name} ({branchCode})</strong>.
            Sau khi mở khóa, hệ thống Kiosk và tính năng chấm công nhân viên tại chi nhánh sẽ hoạt động bình thường trở lại.
          </div>
        </div>

        {/* Ghi chú lý do khóa trước đó nếu có */}
        {branch.lockReason && (
          <div
            style={{
              backgroundColor: c.bgElev,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12.5px',
            }}
          >
            <span style={{ color: c.fgSubtle, display: 'block', marginBottom: '2px', fontWeight: 600 }}>
              Ghi chú khi khóa trước đó:
            </span>
            <span style={{ color: c.fg, fontStyle: 'italic' }}>"{branch.lockReason}"</span>
          </div>
        )}

        {/* Input lý do mở khóa (tùy chọn) */}
        <FormField
          label="Lý do mở khóa"
          hint="Tùy chọn (lưu vào nhật ký kiểm toán)"
        >
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Đã hoàn tất bảo trì hệ thống và kiểm kê định kỳ..."
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${c.border}`,
              backgroundColor: c.bgCard,
              color: c.fg,
              fontSize: '13px',
              fontFamily: fonts.body,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </FormField>
      </div>
    </Modal>
  );
}
