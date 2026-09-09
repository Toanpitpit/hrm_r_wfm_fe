import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';
import './toast.css';

const ToastContext = createContext(null);

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconSuccess() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconError() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const ICONS = {
  success: <IconSuccess />,
  error:   <IconError />,
  warning: <IconWarning />,
  info:    <IconInfo />,
};

const LABELS = {
  success: 'Thành công',
  error:   'Lỗi',
  warning: 'Cảnh báo',
  info:    'Thông tin',
};

// ─── Toast item ───────────────────────────────────────────────────────────────

function ToastItem({ id, type, message, duration, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const dismissed = useRef(false);

  function dismiss() {
    if (dismissed.current) return;
    dismissed.current = true;
    setExiting(true);
    setTimeout(() => onRemove(id), 320);
  }

  // Tự động đóng sau `duration` ms
  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`toast toast--${type}${exiting ? ' toast--exit' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">{ICONS[type] ?? ICONS.info}</div>

      <div className="toast-body">
        <div className="toast-label">{LABELS[type] ?? type}</div>
        <span className="toast-message">{message}</span>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={dismiss}
        aria-label="Đóng thông báo"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
        </svg>
      </button>

      {duration > 0 && (
        <div
          className="toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addRaw = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      if (prev.some((toast) => toast.type === type && toast.message === message)) {
        return prev;
      }
      const next = [...prev, { id, type, message, duration }];
      // Giới hạn tối đa 5 toast cùng lúc
      return next.length > 5 ? next.slice(next.length - 5) : next;
    });
    return id;
  }, []);

  // toast('msg') hoặc toast.success('msg') / toast.error('msg') ...
  const toast = useMemo(() => {
    function notify(msg, type, dur) {
      return addRaw(msg, type, dur);
    }

    return Object.assign(notify, {
      success: (msg, dur) => addRaw(msg, 'success', dur),
      error: (msg, dur) => addRaw(msg, 'error', dur),
      warning: (msg, dur) => addRaw(msg, 'warning', dur),
      info: (msg, dur) => addRaw(msg, 'info', dur),
    });
  }, [addRaw]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-label="Thông báo">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            duration={t.duration}
            onRemove={remove}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
  return ctx;
}
