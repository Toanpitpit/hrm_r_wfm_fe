// FormField — bộ phần tử cho form trong Modal:
//  • Field     — nhãn + ô nhập (gói label)
//  • TextInput — ô nhập text/number/email…
//  • Textarea  — vùng nhập nhiều dòng

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';

export function Field({ label, hint, children, full }) {
  const { c } = useAdminTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: c.fgSubtle }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: 11, color: c.fgFaint }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled = false, ...props }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

  const handleChange = (e) => {
    if (!onChange) return;
    // Cho phép gọi cả với chuẩn React SyntheticEvent e hoặc trực tiếp chuỗi string value
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
        border: `1px solid ${focus ? c.accent : c.border}`,
        borderRadius: 4,
        color: disabled ? c.fgSubtle : c.fg,
        fontSize: 13.5,
        fontFamily: fonts.body,
        padding: '11px 13px',
        outline: 'none',
        transition: 'border .15s',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.75 : 1,
      }}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 4, disabled = false, ...props }) {
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
        border: `1px solid ${focus ? c.accent : c.border}`,
        borderRadius: 4,
        color: disabled ? c.fgSubtle : c.fg,
        fontSize: 13.5,
        fontFamily: fonts.body,
        padding: '11px 13px',
        outline: 'none',
        resize: 'vertical',
        transition: 'border .15s',
      }}
    />
  );
}
