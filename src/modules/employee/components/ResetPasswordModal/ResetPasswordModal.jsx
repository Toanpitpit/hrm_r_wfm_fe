import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { Field, TextInput } from '@/shared/components/ui/FormField';

export default function ResetPasswordModal({
  isOpen,
  onClose,
  employee,
  onConfirmReset,
}) {
  const { c, fonts } = useAdminTheme();

  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultPassword, setResultPassword] = useState(null);
  const [emailSent, setEmailSent] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    if (!reason.trim()) {
      setReasonError('Vui lòng nhập lý do cấp lại mật khẩu cho nhân sự.');
      return;
    }
    setReasonError('');
    setSubmitting(true);
    try {
      const pass = useCustomPassword && customPassword.trim() ? customPassword.trim() : null;
      const res = await onConfirmReset(employee.id, pass, reason.trim());
      if (res && res.newPassword) {
        setResultPassword(res.newPassword);
        setEmailSent(res.emailSent !== false);
      }
    } catch (err) {
      console.error('Reset password error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!resultPassword) return;
    navigator.clipboard.writeText(resultPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setResultPassword(null);
    setEmailSent(true);
    setCopied(false);
    setCustomPassword('');
    setReason('');
    setReasonError('');
    setUseCustomPassword(false);
    onClose();
  };

  if (!employee) return null;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Đặt Lại Mật Khẩu Tài Khoản (Admin Reset)"
      sub={`Cấp lại quyền truy cập cho nhân sự: ${employee.fullName} (${employee.employeeCode || `ID #${employee.id}`})`}
      width={520}
      footer={
        resultPassword ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="primary" onClick={handleClose}>
              Hoàn Tất & Đóng
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
            <Button variant="ghost" onClick={handleClose} disabled={submitting}>
              Hủy Bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleReset}
              disabled={submitting || (useCustomPassword && !customPassword.trim())}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="lock" size={14} />
              <span>{submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Lại Mật Khẩu'}</span>
            </Button>
          </div>
        )
      }
    >
      {resultPassword ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Icon name="check" size={28} />
          </div>

          <div>
            <h4 style={{ fontSize: '17px', fontWeight: 700, color: c.fg }}>
              Đặt Lại Mật Khẩu Thành Công!
            </h4>
            <p style={{ fontSize: '13px', color: c.fgSubtle, marginTop: '4px' }}>
              {emailSent
                ? 'Mật khẩu mới đã được cập nhật và email thông báo kèm mật khẩu đã được gửi trực tiếp tới hòm thư của nhân sự.'
                : 'Mật khẩu mới đã được cập nhật vào hệ thống. Vui lòng gửi trực tiếp thông tin mật khẩu dưới đây cho nhân sự.'}
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              background: c.bgCard,
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: c.fgSubtle, textTransform: 'uppercase', fontWeight: 700 }}>
                Mật khẩu mới tạm thời:
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  color: '#f2ca50',
                  marginTop: '4px',
                  letterSpacing: '1px',
                }}
              >
                {resultPassword}
              </div>
            </div>

            <Button
              variant={copied ? 'success' : 'primary'}
              size="sm"
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép'}</span>
            </Button>
          </div>

          {emailSent ? (
            <div
              style={{
                fontSize: '12.5px',
                color: '#22c55e',
                lineHeight: '1.5',
                background: 'rgba(34, 197, 94, 0.08)',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(34, 197, 94, 0.25)',
              }}
            >
              Email thông báo mật khẩu mới đã được gửi thành công tới: <strong style={{ color: c.fg }}>{employee.email}</strong>.
            </div>
          ) : (
            <div
              style={{
                fontSize: '12px',
                color: '#f59e0b',
                lineHeight: '1.5',
                background: 'rgba(245, 158, 11, 0.08)',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                textAlign: 'left',
              }}
            >
              <strong>Lưu ý về gửi Email:</strong> Không thể gửi thư tới <strong>{employee.email}</strong> (do địa chỉ email không tồn tại hoặc tài khoản Gmail SMTP gửi thư của hệ thống đã đạt giới hạn trong ngày). Hãy sao chép mật khẩu ở trên để bàn giao cho nhân sự.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              fontSize: '12.5px',
              color: '#fca5a5',
              lineHeight: '1.5',
            }}
          >
            <strong>Cảnh báo quản trị:</strong> Thao tác này sẽ vô hiệu hóa mật khẩu hiện tại của nhân sự và đặt lại mật khẩu mới. Email thông báo sẽ được tự động gửi tới email của nhân sự.
          </div>

          {/* Ô nhập Lý Do Bắt Buộc */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: c.fg }}>
              Lý do cấp lại mật khẩu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError('');
              }}
              placeholder="Nhập lý do cấp lại mật khẩu (VD: Nhân viên quên mật khẩu, Yêu cầu bảo mật...)"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: c.bgCard,
                border: `1px solid ${reasonError ? '#ef4444' : c.border}`,
                borderRadius: '6px',
                color: c.fg,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {reasonError && (
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{reasonError}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="custom-password-toggle"
              checked={useCustomPassword}
              onChange={(e) => setUseCustomPassword(e.target.checked)}
              style={{ accentColor: c.accent, cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label
              htmlFor="custom-password-toggle"
              style={{ fontSize: '13px', color: c.fg, cursor: 'pointer', fontWeight: 500 }}
            >
              Tôi muốn tự nhập mật khẩu mới (Mặc định: Hệ thống tự sinh an toàn)
            </label>
          </div>

          {useCustomPassword && (
            <Field label="Mật Khẩu Mới Chỉ Định" required>
              <TextInput
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="VD: NewPass@2026"
              />
            </Field>
          )}

          {!useCustomPassword && (
            <div
              style={{
                padding: '12px',
                background: c.bgCard,
                borderRadius: '6px',
                fontSize: '12px',
                color: c.fgSubtle,
              }}
            >
              Hệ thống sẽ tự động sinh mật khẩu mạnh ngẫu nhiên và gửi thông tin tài khoản kèm lý do trực tiếp tới email: <strong style={{ color: '#fff' }}>{employee.email || 'Chưa có email'}</strong>.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
