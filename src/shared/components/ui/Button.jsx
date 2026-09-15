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
      : variant === 'primary'
      ? 'primary'
      : 'ghost');

  const sizes = { sm: '7px 14px', md: '10px 18px', lg: '12px 24px' };
  const fontSizes = { sm: 12.5, md: 13.5, lg: 14.5 };

  const kinds = {
    primary: {
      background: hover && !disabled ? 'linear-gradient(135deg, #1D4ED8, #1E40AF)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: hover && !disabled ? '0 6px 18px rgba(37, 99, 235, 0.45)' : '0 2px 10px rgba(37, 99, 235, 0.28)',
    },
    ghost: {
      background: hover && !disabled ? c.bgHover : 'transparent',
      color: c.fgMuted,
      border: `1px solid ${c.border}`,
    },
    danger: {
      background: hover && !disabled ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: '#ffffff',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      boxShadow: hover && !disabled ? '0 6px 18px rgba(239, 68, 68, 0.35)' : '0 2px 10px rgba(239, 68, 68, 0.2)',
    },
    soft: {
      background: hover && !disabled ? c.bgHover : c.bgElev,
      color: c.fgMuted,
      border: `1px solid ${c.border}`,
    },
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
        borderRadius: 10,
        whiteSpace: 'nowrap',
        fontSize: fontSizes[size] || fontSizes.md,
        fontWeight: 600,
        letterSpacing: 0.1,
        fontFamily: fonts.body,
        transition: 'all .16s ease',
        cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
        opacity: isBtnDisabled ? 0.55 : 1,
        outline: 'none',
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