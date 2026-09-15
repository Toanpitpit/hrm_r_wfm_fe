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
  const [submitting, setSubmitting] = useState(false);
  const [resultPassword, setResultPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setSubmitting(true);
    try {
      const pass = useCustomPassword && customPassword.trim() ? customPassword.trim() : null;
      const res = await onConfirmReset(employee.id, pass);
      if (res && res.newPassword) {
        setResultPassword(res.newPassword);
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
    setCopied(false);
    setCustomPassword('');
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
              Mật khẩu mới đã được cập nhật và băm BCrypt an toàn vào cơ sở dữ liệu.
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
              <Icon name={copied ? 'check' : 'screen'} size={14} />
              <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép'}</span>
            </Button>
          </div>

          <div style={{ fontSize: '12px', color: c.fgSubtle, lineHeight: '1.5' }}>
            Vui lòng gửi mật khẩu mới này cho nhân viên để đăng nhập vào hệ thống tại màn hình Đăng nhập.
          </div>
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
            <strong>Cảnh báo quản trị:</strong> Thao tác này sẽ vô hiệu hóa mật khẩu hiện tại của nhân sự và đặt lại mật khẩu mới. Thao tác được lưu vết trong `SystemAuditLog`.
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
              Hệ thống sẽ tự động sinh mật khẩu mạnh ngẫu nhiên và hiển thị ngay trên màn hình để bạn sao chép gửi cho nhân sự.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
