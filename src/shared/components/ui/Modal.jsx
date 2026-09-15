// Modal — hộp thoại trung tâm, có lớp phủ mờ, đóng bằng Esc hoặc click nền.
// Dùng:
//   <Modal open={open} isOpen={isOpen} onClose={() => setOpen(false)} title="..." sub="..."
//          footer={<><Button .../><Button .../></>}>
//     nội dung form
//   </Modal>

import { useEffect } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function Modal({ open, isOpen, onClose, title, sub, children, width = 540, footer, closeOnOutsideClick = true }) {
  const { c, fonts } = useAdminTheme();
  const isModalOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    <div
      className="lx-modal-overlay"
      onClick={closeOnOutsideClick ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,17,23,0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        animation: 'lx-fade-in .15s ease',
      }}
    >
      <div
        className="lx-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: c.bgCard,
          border: `1px solid ${c.border}`,
          borderRadius: 16,
          width,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          animation: 'lx-pop-in .18s cubic-bezier(.2,.9,.3,1.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '16px 20px',
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div style={{ minWidth: 0, paddingRight: 16 }}>
            <div style={{ fontFamily: fonts.body, fontSize: 16, fontWeight: 600, color: c.fg, lineHeight: 1.3 }}>
              {title}
            </div>
            {sub && <div style={{ fontSize: 12.5, color: c.fgSubtle, marginTop: 3 }}>{sub}</div>}
          </div>
          <button type="button" onClick={onClose} title="Đóng" style={{ width: 30, height: 30, flexShrink: 0, display: 'grid', placeItems: 'center', background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, color: c.fgSubtle, cursor: 'pointer' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="lx-modal-body" style={{ position: 'relative', flex: '1 1 auto', minHeight: 0, padding: '18px 20px', overflow: 'auto' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              padding: '12px 20px',
              background: c.bgElev,
              borderTop: `1px solid ${c.border}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
