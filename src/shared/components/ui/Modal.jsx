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
        background: 'rgba(10,10,20,0.65)',
        backdropFilter: 'blur(6px)',
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
          borderRadius: 20,
          width,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(79,70,229,0.06)',
          animation: 'lx-pop-in .18s cubic-bezier(.2,.9,.3,1.2)',
        }}
      >
        {/* Indigo accent bar at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
          borderRadius: '20px 20px 0 0',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Header */}
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '20px 24px 16px',
            borderBottom: `1px solid ${c.border}`,
            zIndex: 1,
          }}
        >
          <div style={{ minWidth: 0, paddingRight: 18 }}>
            <div style={{
              fontFamily: fonts.display,
              fontSize: 17,
              fontWeight: 700,
              lineHeight: 1.2,
              color: c.fg,
            }}>
              {title}
            </div>
            {sub && <div style={{ fontSize: 12.5, color: c.fgSubtle, marginTop: 4 }}>{sub}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Đóng"
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              background: c.track,
              border: `1px solid ${c.border}`,
              borderRadius: 9,
              color: c.fgSubtle,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.30)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = c.track;
              e.currentTarget.style.color = c.fgSubtle;
              e.currentTarget.style.borderColor = c.border;
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          className="lx-modal-body"
          style={{
            position: 'relative',
            flex: '1 1 auto',
            minHeight: 0,
            padding: '20px 24px',
            overflow: 'auto',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '14px 24px',
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
