import { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function ResetPasswordModal({ isOpen, onClose, onSubmit, user = null, loading = false }) {
  const { c } = useAdminTheme();
  const [newPassword, setNewPassword] = useState('');
  const [useDefault, setUseDefault] = useState(true);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const pass = useDefault ? 'Password@123' : newPassword.trim();
    onSubmit(user.id, pass);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ĐẶT LẠI MẬT KHẨU TÀI KHOẢN"
      sub={`Cấp lại mật khẩu đăng nhập cho Cửa hàng trưởng ${user.fullName} (${user.employeeCode})`}
      width={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="primary" icon="lock" onClick={handleSubmit} loading={loading}>
            Xác nhận đổi mật khẩu
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            padding: '12px 14px',
            background: c.bgElev,
            borderRadius: 6,
            border: `1px solid ${c.border}`,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div><strong>Nhân viên:</strong> {user.fullName} ({user.employeeCode})</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Cơ sở:</strong> {user.branchName || 'Toàn chuỗi'}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="radio"
              name="pwd_option"
              checked={useDefault}
              onChange={() => setUseDefault(true)}
            />
            Dùng mật khẩu mặc định (<code>Password@123</code>)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="radio"
              name="pwd_option"
              checked={!useDefault}
              onChange={() => setUseDefault(false)}
            />
            Nhập mật khẩu mới
          </label>
        </div>

        {!useDefault && (
          <Field label="Mật khẩu mới" hint="Tối thiểu 6 ký tự">
            <TextInput
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </Field>
        )}
      </form>
    </Modal>
  );
}
