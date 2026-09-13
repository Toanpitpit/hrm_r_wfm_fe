import { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import { Field, TextInput } from '@/shared/components/ui/FormField';
import { useAdminTheme } from '@/shared/context/ThemeContext';

export default function ResetKioskPinModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  loading = false,
}) {
  const { c } = useAdminTheme();
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [manualPin, setManualPin] = useState('');
  const [error, setError] = useState('');

  if (!employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'manual') {
      if (!manualPin.trim() || manualPin.trim().length < 4) {
        setError('Mã PIN định danh Kiosk phải có từ 4 đến 6 chữ số');
        return;
      }
      onSubmit(employee.id, manualPin.trim());
    } else {
      // Tự động sinh mã PIN ngẫu nhiên từ Backend
      onSubmit(employee.id, null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CẤP MÃ PIN CHẤM CÔNG KIOSK"
      sub={`Sinh mã PIN định danh chấm công trên trạm Kiosk cho ${employee.fullName} (${employee.employeeCode})`}
      width={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="primary" icon="lock" onClick={handleSubmit} loading={loading}>
            {mode === 'auto' ? 'Sinh mã PIN tự động' : 'Cấp mã PIN mới'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: c.tones.badDim,
              border: `1px solid ${c.tones.bad}`,
              color: c.tones.bad,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            padding: '12px 16px',
            background: c.bgElev,
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div><strong>Nhân sự:</strong> {employee.fullName} ({employee.employeeCode})</div>
          <div><strong>Chức danh:</strong> {employee.roleName || employee.roleCode}</div>
          <div><strong>Chi nhánh gốc:</strong> {employee.branchName || 'Chưa gán'}</div>
          <div>
            <strong>Trạng thái PIN hiện tại:</strong>{' '}
            {employee.hasKioskPin ? (
              <span style={{ color: c.tones.ok, fontWeight: 700 }}>Đã có mã PIN</span>
            ) : (
              <span style={{ color: c.tones.warn, fontWeight: 700 }}>Chưa cấp mã PIN</span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: c.fgSubtle, marginBottom: 8 }}>
            PHƯƠNG THỨC CẤP MÃ PIN
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 6,
                background: mode === 'auto' ? c.accentDim : c.bgElev,
                border: `1px solid ${mode === 'auto' ? c.accent : c.border}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="pin_mode"
                checked={mode === 'auto'}
                onChange={() => {
                  setMode('auto');
                  setError('');
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Tự động sinh mã PIN ngẫu nhiên (Khuyên dùng)</div>
                <div style={{ fontSize: 11.5, color: c.fgSubtle }}>Hệ thống tự tạo mã PIN 4 chữ số bảo mật cao</div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 6,
                background: mode === 'manual' ? c.accentDim : c.bgElev,
                border: `1px solid ${mode === 'manual' ? c.accent : c.border}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="pin_mode"
                checked={mode === 'manual'}
                onChange={() => {
                  setMode('manual');
                  setError('');
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Nhập mã PIN theo chỉ định</div>
                <div style={{ fontSize: 11.5, color: c.fgSubtle }}>Chủ động nhập 4 - 6 số định danh cho nhân viên</div>
              </div>
            </label>
          </div>
        </div>

        {mode === 'manual' && (
          <Field label="Mã PIN định danh mới" hint="Nhập 4 đến 6 chữ số">
            <TextInput
              placeholder="VD: 1234, 5678..."
              maxLength={6}
              value={manualPin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setManualPin(val);
                if (error) setError('');
              }}
              disabled={loading}
            />
          </Field>
        )}

        <div
          style={{
            padding: '10px 14px',
            background: c.bgElev,
            borderRadius: 6,
            border: `1px solid ${c.border}`,
            fontSize: 12,
            color: c.fgSubtle,
            lineHeight: 1.5,
          }}
        >
          📌 <strong>Lưu ý:</strong> Nhân viên sẽ dùng mã PIN này kết hợp với việc chọn tên trên màn hình trạm Kiosk điểm danh để check-in / check-out vào ca trực.
        </div>
      </form>
    </Modal>
  );
}
