import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';
import authService from '@/modules/auth/services/auth.service';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { c } = useAdminTheme();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res?.success) {
        toast.success(res.message || 'Đổi mật khẩu thành công!');
        handleClose();
      } else {
        toast.error(res?.message || 'Không thể đổi mật khẩu.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Mật khẩu hiện tại không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi Mật Khẩu Tài Khoản"
      sub="Bảo mật tài khoản của bạn bằng mật khẩu mạnh có tối thiểu 6 ký tự"
      width={460}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Cập Nhật Mật Khẩu
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Mật khẩu hiện tại */}
        <FormField label="Mật khẩu hiện tại (*)">
          <div style={{ position: 'relative' }}>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại của bạn..."
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgRaised,
                color: c.fg,
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: c.fgSubtle,
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <Icon name={showCurrent ? 'lock' : 'lock'} size={16} />
            </button>
          </div>
        </FormField>

        {/* Mật khẩu mới */}
        <FormField label="Mật khẩu mới (*)">
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự..."
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgRaised,
                color: c.fg,
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: c.fgSubtle,
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <Icon name={showNew ? 'lock' : 'lock'} size={16} />
            </button>
          </div>
        </FormField>

        {/* Xác nhận mật khẩu mới */}
        <FormField label="Xác nhận mật khẩu mới (*)">
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                backgroundColor: c.bgRaised,
                color: c.fg,
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: c.fgSubtle,
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <Icon name={showConfirm ? 'lock' : 'lock'} size={16} />
            </button>
          </div>
        </FormField>

        <div style={{ fontSize: 12, color: c.fgSubtle, lineHeight: 1.4, padding: '4px 0' }}>
          💡 Lưu ý: Sau khi đổi mật khẩu, bạn vẫn có thể sử dụng bình thường ở phiên đăng nhập hiện tại.
        </div>
      </form>
    </Modal>
  );
}
