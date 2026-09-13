// FormField — bộ phần tử cho form trong Modal:
//  • Field     — nhãn + ô nhập (gói label, hỗ trợ required, error, hint)
//  • TextInput — ô nhập text/number/email…
//  • Textarea  — vùng nhập nhiều dòng

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';

export function Field({ label, hint, children, full, error, required }) {
  const { c } = useAdminTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: error ? '#ef4444' : c.fgSubtle }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </span>
        {hint && <span style={{ fontSize: 11, color: c.fgFaint }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500, marginTop: 2 }}>
          {error}
        </span>
      )}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled = false, error, ...props }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

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
        border: `1px solid ${error ? '#ef4444' : focus ? c.accent : c.border}`,
        borderRadius: 6,
        color: disabled ? c.fgSubtle : c.fg,
        fontSize: 13.5,
        fontFamily: fonts.body,
        padding: '10px 12px',
        outline: 'none',
        transition: 'border .15s',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.75 : 1,
      }}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 4, disabled = false, error, ...props }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

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
        border: `1px solid ${error ? '#ef4444' : focus ? c.accent : c.border}`,
        borderRadius: 6,
        color: disabled ? c.fgSubtle : c.fg,
        fontSize: 13.5,
        fontFamily: fonts.body,
        padding: '10px 12px',
        outline: 'none',
        resize: 'vertical',
        transition: 'border .15s',
      }}
    />
  );
}