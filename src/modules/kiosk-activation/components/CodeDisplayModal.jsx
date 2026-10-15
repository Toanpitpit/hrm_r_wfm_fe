import { useState, useEffect } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import ProgressBar from '@/shared/components/ui/ProgressBar';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function CodeDisplayModal({ isOpen, open, onClose, codeData }) {
  const { c, fonts } = useAdminTheme();
  const [copied, setCopied] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);
  const isModalOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    if (!codeData?.expiresAt) return;

    const expiresAtMs = new Date(codeData.expiresAt).getTime();

    const updateTimer = () => {
      const diffSec = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
      setTimeLeftSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [codeData]);

  if (!codeData) return null;

  const handleCopy = () => {
    if (codeData.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round((timeLeftSeconds / (15 * 60)) * 100);

  return (
    <Modal
      open={isModalOpen}
      isOpen={isModalOpen}
      onClose={onClose}
      title="MÃ KÍCH HOẠT KIOSK TẠO THÀNH CÔNG"
      width={540}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: 12, color: c.fgSubtle }}>
            Trạm: <strong>{codeData.kioskName}</strong>
          </div>
          <Button variant="primary" onClick={onClose}>
            Đã Hiểu & Đóng
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '10px 0' }}>
        {/* OTP Code display block */}
        <div
          style={{
            width: '100%',
            padding: '24px 16px',
            borderRadius: 14,
            background: `linear-gradient(135deg, ${c.bgElev}, ${c.bgCard})`,
            border: `2px stroke ${c.accent}`,
            outline: `1px dashed ${c.accent}`,
            boxShadow: `0 8px 30px ${c.accentDim}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: c.accent, textTransform: 'uppercase' }}>
            Mã Kích Hoạt OTP 6 Ký Tự
          </div>

          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 48,
              letterSpacing: 8,
              color: c.fg,
              lineHeight: 1,
              textShadow: `0 0 20px ${c.accentDim}`,
              userSelect: 'all',
            }}
          >
            {codeData.code}
          </div>

          <Button
            variant={copied ? 'secondary' : 'outline'}
            onClick={handleCopy}
            icon={copied ? 'check' : 'copy'}
            style={{ marginTop: 4, minWidth: 160 }}
          >
            {copied ? 'Đã sao chép!' : 'Sao chép mã'}
          </Button>
        </div>

        {/* Expiry Progress Bar */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
            <span style={{ color: c.fgSubtle }}>Thời gian hiệu lực mã:</span>
            <Badge tone={timeLeftSeconds > 180 ? 'warn' : 'bad'}>
              <Icon name="clock" size={12} /> {formattedTime} còn lại
            </Badge>
          </div>
          <ProgressBar value={progressPercent} tone={timeLeftSeconds > 180 ? 'warn' : 'bad'} />
        </div>

        {/* Step-by-step Guide */}
        <div
          style={{
            width: '100%',
            textAlign: 'left',
            background: c.bgRaised,
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${c.border}`,
            fontSize: 12.5,
            color: c.fgMuted,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 700, color: c.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="screen" size={15} color={c.accent} /> Hướng dẫn kích hoạt trên máy Kiosk:
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Mở ứng dụng Kiosk Điểm Danh trên màn hình máy trạm.</li>
            <li>Tại màn hình <strong>Kích Hoạt Kiosk (`KioskLoginPage`)</strong>, chọn Mã Cửa Hàng.</li>
            <li>Nhập chính xác mã kích hoạt <strong>{codeData.code}</strong> ở trên.</li>
            <li>Sau khi xác nhận, máy Kiosk sẽ tự động lưu token và bắt đầu vận hành điểm danh.</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
}
