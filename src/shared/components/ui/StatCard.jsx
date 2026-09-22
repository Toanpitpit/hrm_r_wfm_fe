// StatCard — Thẻ thống kê KPI chuẩn Apex Dashboard
// Bao gồm: Icon container góc phải, số liệu lớn, biến động % (delta) và đường sóng Sparkline mềm mại ở chân thẻ.

import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function StatCard({
  label,
  title,
  value,
  subtext,
  subtitle,
  hint,
  delta,
  deltaDir = 'up',
  icon = 'pulse',
  tone,
  color,
  style = {},
}) {
  const { c, fonts } = useAdminTheme();
  const displayLabel = label || title || '';
  const displaySub = subtext || subtitle || hint || '';

  // Tone color configurations
  const toneConfig = {
    ok: { color: '#0D9488', bg: 'rgba(13, 148, 136, 0.12)', wave: '#0D9488' },
    good: { color: '#0D9488', bg: 'rgba(13, 148, 136, 0.12)', wave: '#0D9488' },
    info: { color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)', wave: '#06B6D4' },
    blue: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', wave: '#3B82F6' },
    warn: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', wave: '#F59E0B' },
    bad: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', wave: '#EF4444' },
    neutral: { color: '#0D9488', bg: 'rgba(13, 148, 136, 0.12)', wave: '#0D9488' },
  }[tone || 'neutral'] || {
    color: color || '#0D9488',
    bg: color ? `${color}18` : 'rgba(13, 148, 136, 0.12)',
    wave: color || '#0D9488',
  };

  const isUp = deltaDir === 'up' || (typeof delta === 'string' && delta.startsWith('+'));
  const isDown = deltaDir === 'down' || (typeof delta === 'string' && delta.startsWith('-'));

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: '20px 22px 14px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 140,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        ...style,
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: c.fgSubtle,
              letterSpacing: -0.1,
              marginBottom: 8,
            }}
          >
            {displayLabel}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: c.fg,
              letterSpacing: -0.5,
              lineHeight: 1.1,
              fontFamily: fonts.display,
            }}
          >
            {value}
          </div>
        </div>

        {/* Top-Right Icon Badge */}
        {icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: toneConfig.bg,
              color: toneConfig.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={icon} size={18} />
          </div>
        )}
      </div>

      {/* Delta Rate & Subtext */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, position: 'relative', zIndex: 2 }}>
        {delta && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              fontWeight: 600,
              color: isDown ? '#EF4444' : '#10B981',
            }}
          >
            <span>{isDown ? '▼' : '▲'}</span>
            <span>{delta}</span>
          </span>
        )}
        {displaySub && (
          <span style={{ fontSize: 12, color: c.fgSubtle }}>
            {displaySub}
          </span>
        )}
      </div>
    </div>
  );
}
