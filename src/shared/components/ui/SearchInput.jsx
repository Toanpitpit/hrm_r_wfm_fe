// SearchInput — ô tìm kiếm có icon, viền sáng khi focus.
// Dùng: <SearchInput placeholder="Tìm..." value={q} onChange={setQ} />

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function SearchInput({ placeholder, value, onChange, width = 260 }) {
  const { c, fonts } = useAdminTheme();
  const [focus, setFocus] = useState(false);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 14px',
        background: c.bgRaised,
        border: `1.5px solid ${focus ? '#2563EB' : c.border}`,
        borderRadius: 10,
        width,
        transition: 'all .16s ease',
        boxShadow: focus ? '0 0 0 3px rgba(37, 99, 235, 0.22)' : 'none',
      }}
    >
      <Icon name="search" size={15} color={c.fgFaint} />
      <input
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: c.fg,
          fontSize: 13,
          fontFamily: fonts.body,
          width: '100%',
        }}
      />
    </div>
  );
}
