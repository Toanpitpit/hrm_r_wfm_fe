// Button — Nút chuẩn giao diện Apex Dashboard (Emerald Green theme)
// Props: type, kind/variant, icon, children, onClick, size, style, disabled, loading

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
  style = {},
  disabled = false,
  loading = false,
  ...props
}) {
  const { c, fonts } = useAdminTheme();
  const [hover, setHover] = useState(false);

  const effectiveKind = kind || variant || 'ghost';

  const sizeStyles = {
    sm: { padding: '7px 14px', fontSize: 12.5, height: 34 },
    md: { padding: '9px 18px', fontSize: 13.5, height: 40 },
    lg: { padding: '12px 24px', fontSize: 14.5, height: 46 },
  }[size] || { padding: '9px 18px', fontSize: 13.5, height: 40 };

  const getVariantStyles = () => {
    switch (effectiveKind) {
      case 'primary':
        return {
          background: hover && !disabled ? (c.primaryHover || '#0F766E') : (c.primary || '#0D9488'),
          color: '#FFFFFF',
          border: '1px solid transparent',
          boxShadow: hover && !disabled ? '0 4px 14px rgba(13, 148, 136, 0.35)' : '0 2px 8px rgba(13, 148, 136, 0.20)',
          fontWeight: 600,
        };
      case 'danger':
        return {
          background: hover && !disabled ? 'rgba(239, 68, 68, 0.22)' : c.tones.badDim,
          color: c.tones.bad,
          border: `1px solid ${hover ? c.tones.bad : 'transparent'}`,
          fontWeight: 600,
        };
      case 'success':
        return {
          background: hover && !disabled ? 'rgba(13, 148, 136, 0.22)' : c.tones.goodDim,
          color: c.tones.good,
          border: `1px solid ${hover ? c.tones.good : 'transparent'}`,
          fontWeight: 600,
        };
      case 'soft':
        return {
          background: hover && !disabled ? c.bgHover : c.bgElev,
          color: c.fg,
          border: `1px solid ${c.border}`,
          fontWeight: 500,
        };
      case 'ghost':
      default:
        return {
          background: hover && !disabled ? c.bgElev : 'transparent',
          color: hover && !disabled ? c.fg : c.fgSubtle,
          border: `1px solid ${c.border}`,
          fontWeight: 500,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 10,
        fontFamily: fonts.body,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.18s ease',
        outline: 'none',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        transform: hover && !disabled && effectiveKind === 'primary' ? 'translateY(-1px)' : 'none',
        ...sizeStyles,
        ...vStyles,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>
          <Icon name="refresh" size={size === 'sm' ? 14 : 16} />
        </span>
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}