import { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function PinSuccessModal({ isOpen, onClose, pinData = null }) {
  const { c } = useAdminTheme();
  const [copied, setCopied] = useState(false);

  if (!pinData) return null;

  const handleCopy = () => {
    if (pinData.newPin) {
      navigator.clipboard.writeText(pinData.newPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CẤP MÃ PIN THÀNH CÔNG"
      sub="Mã PIN Kiosk đã được sinh và cập nhật vào hồ sơ nhân viên"
      width={480}
      footer={
        <Button variant="primary" onClick={onClose}>
          Đã ghi nhớ & Đóng
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: c.tones.okDim,
            color: c.tones.ok,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="check" size={28} />
        </div>

        <div>
          <div style={{ fontSize: 13, color: c.fgSubtle }}>
            Mã PIN định danh Kiosk cho nhân sự:
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4, color: c.fg }}>
            {pinData.fullName} ({pinData.employeeCode})
          </div>
        </div>

        {/* Big PIN display box */}
        <div
          style={{
            width: '100%',
            padding: '24px 16px',
            background: `linear-gradient(145deg, ${c.bgElev}, ${c.bgCard})`,
            borderRadius: 12,
            border: `2px solid ${c.accent}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            boxShadow: `0 8px 30px ${c.accentDim}`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: c.accent }}>
            MÃ PIN CHẤM CÔNG KIOSK
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: 10,
              color: c.accent,
            }}
          >
            {pinData.newPin}
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={copied ? 'check' : 'copy'}
            onClick={handleCopy}
            style={{ borderColor: c.accent, color: c.accent }}
          >
            {copied ? 'Đã sao chép mã PIN' : 'Sao chép mã PIN'}
          </Button>
        </div>

        <div
          style={{
            background: c.bgElev,
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 12,
            color: c.fgSubtle,
            lineHeight: 1.6,
            textAlign: 'left',
            width: '100%',
          }}
        >
          ⚠️ <strong>Lưu ý bảo mật:</strong> Hãy bàn giao mã PIN này trực tiếp cho nhân viên hoặc gửi qua kênh bảo mật nội bộ. Nhân viên sẽ dùng mã PIN này để điểm danh tại màn hình Kiosk chi nhánh.
        </div>
      </div>
    </Modal>
  );
}
