// Button — nút bấm dùng chung. kind: primary | ghost | danger | soft.
// Dùng: <Button kind="primary" icon="plus" onClick={...}>Thêm</Button>

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function Button({ kind = 'ghost', icon, children, onClick, size = 'md', style, disabled = false }) {
  const { c, fonts } = useAdminTheme();
  const [hover, setHover] = useState(false);

  const sizes = { sm: '7px 12px', md: '10px 16px', lg: '13px 22px' };
  const kinds = {
    primary: { background: c.accent, color: c.ink, border: `1px solid ${c.accent}` },
    ghost: { background: 'transparent', color: c.fgMuted, border: `1px solid ${c.border}` },
    danger: { background: c.tones.badDim, color: c.tones.bad, border: `1px solid ${c.tones.bad}` },
    soft: { background: c.bgElev, color: c.fgMuted, border: `1px solid ${c.borderSub}` },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: sizes[size],
        borderRadius: 2,
        whiteSpace: 'nowrap',
        fontSize: 12.5,
        fontWeight: kind === 'primary' ? 800 : 600,
        letterSpacing: kind === 'primary' ? 0.5 : 0.2,
        textTransform: kind === 'primary' ? 'uppercase' : 'none',
        fontFamily: fonts.body,
        transition: 'all .15s',
        filter: hover && !disabled ? 'brightness(1.12)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...kinds[kind],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
