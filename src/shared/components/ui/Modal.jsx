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
        background: 'rgba(4,3,2,0.72)',
        backdropFilter: 'blur(3px)',
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
          background: `linear-gradient(155deg, ${c.bgCard}, ${c.bgRaised})`,
          border: `1px solid ${c.border}`,
          borderRadius: 14,
          width,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 34px 100px rgba(0,0,0,0.48)',
          animation: 'lx-pop-in .18s cubic-bezier(.2,.9,.3,1.2)',
        }}
      >
        <span style={{ position: 'absolute', width: 220, height: 220, right: -105, top: -145, borderRadius: '50%', background: c.accentDim, pointerEvents: 'none' }} />
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '14px 22px',
            background: `linear-gradient(90deg, ${c.bgElev}, ${c.bgCard})`,
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div style={{ minWidth: 0, paddingRight: 18 }}>
            <div style={{ marginBottom: 4, color: c.accent, fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Admin Portal</div>
            <div style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1.1 }}>
              {title}
            </div>
            {sub && <div style={{ fontSize: 11.5, color: c.fgSubtle, marginTop: 3 }}>{sub}</div>}
          </div>
          <button type="button" onClick={onClose} title="Đóng" style={{ width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center', background: c.track, border: `1px solid ${c.border}`, borderRadius: 8, color: c.fgSubtle, cursor: 'pointer' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="lx-modal-body" style={{ position: 'relative', flex: '1 1 auto', minHeight: 0, padding: '18px 22px', overflow: 'auto' }}>{children}</div>

        {footer && (
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '12px 22px',
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
