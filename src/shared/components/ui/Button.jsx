// Button — nút bấm dùng chung. kind | variant: primary | ghost | danger | soft | secondary | outline.
// Dùng: <Button kind="primary" icon="plus" onClick={...}>Thêm</Button>

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function Button({
  type = 'button',
  kind,
  variant,
  icon,
  children,
  onClick,
  size = 'md',
  style,
  disabled = false,
  loading = false,
  ...props
}) {
  const { c, fonts } = useAdminTheme();
  const [hover, setHover] = useState(false);

  const buttonKind =
    kind ||
    (variant === 'secondary' || variant === 'outline'
      ? 'soft'
      : variant === 'danger'
      ? 'danger'
      : variant === 'success'
      ? 'success'
      : variant === 'primary'
      ? 'primary'
      : 'ghost');

  const sizes = { sm: '7px 12px', md: '10px 16px', lg: '13px 22px' };
  const kinds = {
    primary: { background: c.accent, color: c.ink, border: `1px solid ${c.accent}` },
    ghost: { background: 'transparent', color: c.fgMuted, border: `1px solid ${c.border}` },
    danger: { background: c.tones.badDim, color: c.tones.bad, border: `1px solid ${c.tones.bad}` },
    success: { background: c.tones.goodDim, color: c.tones.good, border: `1px solid ${c.tones.good}` },
    soft: { background: c.bgElev, color: c.fgMuted, border: `1px solid ${c.borderSub}` },
  };

  const currentKindStyle = kinds[buttonKind] || kinds.ghost;
  const isBtnDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isBtnDisabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: sizes[size] || sizes.md,
        borderRadius: 4,
        whiteSpace: 'nowrap',
        fontSize: 12.5,
        fontWeight: buttonKind === 'primary' ? 800 : 600,
        letterSpacing: buttonKind === 'primary' ? 0.5 : 0.2,
        textTransform: buttonKind === 'primary' ? 'uppercase' : 'none',
        fontFamily: fonts.body,
        transition: 'all .15s',
        filter: hover && !isBtnDisabled ? 'brightness(1.12)' : 'none',
        cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
        opacity: isBtnDisabled ? 0.6 : 1,
        ...currentKindStyle,
        ...style,
      }}
    >
      {loading ? (
        <Icon name="refresh" size={size === 'sm' ? 14 : 16} />
      ) : (
        icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      )}
      {children}
    </button>
  );
}