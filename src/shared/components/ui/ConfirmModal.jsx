import { useAdminTheme } from '../../context/ThemeContext';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

export default function ConfirmModal({
  isOpen,
  open,
  onClose,
  onConfirm,
  title = 'Xác Nhận Thao Tác',
  message,
  children,
  confirmText = 'Xác Nhận',
  cancelText = 'Hủy Bỏ',
  confirmVariant = 'danger',
  loading = false,
  icon = 'alertTriangle',
}) {
  const { c } = useAdminTheme();
  const isModalOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);

  if (!isModalOpen) return null;

  const isDanger = confirmVariant === 'danger';
  const iconColor = isDanger ? '#EF4444' : '#4F46E5';
  const iconBg = isDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(79, 70, 229, 0.12)';
  const iconBorder = isDanger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(79, 70, 229, 0.25)';

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      width={460}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={22} color={iconColor} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {message && (
            <div
              style={{
                fontSize: 14,
                color: c.fg,
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              {message}
            </div>
          )}
          {children}
        </div>
      </div>
    </Modal>
  );
}
