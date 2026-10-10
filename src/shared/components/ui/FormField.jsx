// FormField — bộ phần tử cho form trong Modal:
//  • Field     — nhãn + ô nhập (gói label, hỗ trợ required, error, hint)
//  • TextInput — ô nhập text/number/email…
//  • Textarea  — vùng nhập nhiều dòng

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';

export function Field({ label, hint, helper, children, full, error, required, style }) {
  const { c } = useAdminTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: full ? '1 / -1' : 'auto', ...style }}>
      {(label || hint) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <span style={{ fontSize: 13, fontWeight: 500, color: error ? '#EF4444' : c.fg }}>
              {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
            </span>
          )}
          {hint && <span style={{ fontSize: 11.5, color: c.fgFaint }}>{hint}</span>}
        </div>
      )}
      {children}
      {helper && !error && (
        <span style={{ fontSize: '11.5px', color: c.fgFaint, marginTop: 2 }}>
          {helper}
        </span>
      )}
      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500, marginTop: 2 }}>
          {error}
        </span>
      )}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled = false, error, ...props }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

  const borderColor = error ? '#EF4444' : focus ? '#4F46E5' : c.border;
  const boxShadow = focus
    ? error
      ? '0 0 0 3px rgba(239,68,68,0.14)'
      : '0 0 0 3px rgba(79,70,229,0.14)'
    : 'none';

  const handleChange = (e) => {
    if (!onChange) return;
    onChange(e);
  };

  return (
    <input
      type={type}
      value={value || ''}
      disabled={disabled}
      {...props}
      onChange={handleChange}
      placeholder={placeholder}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        background: disabled ? c.track : c.bgRaised,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        color: disabled ? c.fgSubtle : c.fg,
        fontSize: 13.5,
        fontFamily: fonts.body,
        padding: '10px 13px',
        outline: 'none',
        height: 42,
        transition: 'border 0.15s, box-shadow 0.15s',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.75 : 1,
        width: '100%',
        boxSizing: 'border-box',
        boxShadow,
      }}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 4, disabled = false, error, ...props }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

  const borderColor = error ? '#EF4444' : focus ? '#4F46E5' : c.border;
  const boxShadow = focus
    ? error
      ? '0 0 0 3px rgba(239,68,68,0.14)'
      : '0 0 0 3px rgba(79,70,229,0.14)'
    : 'none';

  const handleChange = (e) => {
    if (!onChange) return;
    onChange(e);
  };

  return (
    <textarea
      value={value || ''}
      disabled={disabled}
      {...props}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        background: disabled ? c.track : c.bgRaised,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        color: disabled ? c.fgSubtle : c.fg,
        fontSize: 13.5,
        fontFamily: fonts.body,
        padding: '10px 13px',
        outline: 'none',
        resize: 'vertical',
        transition: 'border 0.15s, box-shadow 0.15s',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow,
      }}
    />
  );
}

export default Field;
