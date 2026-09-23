// Select — dropdown gọn, thống nhất giao diện với các input khác.
// options: mảng string hoặc { value, label }.
// Dùng: <Select value={v} onChange={setV} options={[{value:'a',label:'A'}]} />

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function Select({ value, onChange, options = [], width = 'auto', disabled = false }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', width }}>
      <select
        value={value}
        onChange={(e) => !disabled && onChange && onChange(e.target.value)}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          appearance: 'none',
          background: disabled ? c.track : c.bgRaised,
          border: `1.5px solid ${focus ? '#4F46E5' : c.border}`,
          borderRadius: 10,
          color: disabled ? c.fgSubtle : c.fg,
          fontSize: 13.5,
          fontFamily: fonts.body,
          padding: '9px 34px 9px 13px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          outline: 'none',
          opacity: disabled ? 0.75 : 1,
          boxShadow: focus ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
          transition: 'border .15s ease, box-shadow .15s ease',
          boxSizing: 'border-box',
        }}
      >
        {options.map((o, idx) => {
          const val = o.value ?? o;
          const label = o.label ?? o;
          return (
            <option key={idx} value={val} style={{ background: c.bgCard, color: c.fg }}>
              {label}
            </option>
          );
        })}
      </select>
      <span
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: focus ? '#4F46E5' : c.fgFaint,
          display: 'grid',
          placeItems: 'center',
          transition: 'color .15s ease',
        }}
      >
        <Icon name="chevron-down" size={13} />
      </span>
    </div>
  );
}
