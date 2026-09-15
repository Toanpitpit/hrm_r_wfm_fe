// Select — dropdown gọn, thống nhất giao diện với các input khác.
// options: mảng string hoặc { value, label }.
// Dùng: <Select value={v} onChange={setV} options={[{value:'a',label:'A'}]} />

import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function Select({ value, onChange, options = [], width = 'auto', disabled = false }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div style={{ position: 'relative', display: 'inline-block', width }}>
      <select
        value={value}
        onChange={(e) => !disabled && onChange && onChange(e.target.value)}
        disabled={disabled}
        style={{
          appearance: 'none',
          background: disabled ? c.track : c.bgRaised,
          border: `1px solid ${c.border}`,
          borderRadius: 2,
          color: disabled ? c.fgSubtle : c.fgMuted,
          fontSize: 13,
          fontFamily: fonts.body,
          padding: '9px 34px 9px 13px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          outline: 'none',
          opacity: disabled ? 0.75 : 1,
        }}
      >
        {options.map((o, idx) => {
          const val = o.value ?? o;
          const label = o.label ?? o;
          return (
            <option key={idx} value={val} style={{ background: c.bgElev }}>
              {label}
            </option>
          );
        })}
      </select>
      <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: c.fgFaint }}>
        <Icon name="chevron" size={13} />
      </span>
    </div>
  );
}
