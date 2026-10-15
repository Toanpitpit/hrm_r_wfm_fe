import { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function CreateCodeModal({ isOpen, open, onClose, onSubmit, loading }) {
  const { c } = useAdminTheme();
  const [kioskName, setKioskName] = useState('');
  const isModalOpen = open !== undefined ? open : isOpen;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(kioskName);
    setKioskName('');
  };

  const handleClose = () => {
    setKioskName('');
    onClose();
  };

  return (
    <Modal
      open={isModalOpen}
      isOpen={isModalOpen}
      onClose={handleClose}
      title="TẠO MÃ KÍCH HOẠT KIOSK MỚI"
      width={520}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} icon="plus">
            Tạo Mã Xác Thực
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: c.bgElev,
            border: `1px solid ${c.border}`,
            fontSize: 13,
            color: c.fgMuted,
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.accent, fontWeight: 700, marginBottom: 6 }}>
            <Icon name="lock" size={16} color={c.accent} />
            <span>Mã OTP Kích Hoạt 15 Phút</span>
          </div>
          Hệ thống sẽ tạo ra một mã kích hoạt dùng một lần dạng <strong>POS-XXXX</strong>. Sử dụng mã này trên ứng dụng máy Kiosk điểm danh để liên kết thiết bị với cửa hàng của bạn.
        </div>

        <Field label="Tên gợi nhớ cho trạm Kiosk" hint="Ví dụ: Kiosk Quầy Chính, Kiosk Thu Ngân 1, Kiosk Cổng Vào">
          <TextInput
            placeholder="Nhập tên trạm Kiosk..."
            value={kioskName}
            onChange={(e) => setKioskName(typeof e === 'string' ? e : e?.target?.value || '')}
            autoFocus
          />

        </Field>
      </form>
    </Modal>
  );
}
