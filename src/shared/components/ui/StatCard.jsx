// StatCard — thẻ KPI: nhãn, giá trị lớn, biến động % và sparkline tùy chọn.
// Dùng: <StatCard label="Doanh thu" value="33,4 tỷ" delta="12,4%" deltaDir="up" icon="money" spark={[...]} />

import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';
import { Sparkline } from '../charts/Charts';

export default function StatCard({ label, title, value, subtext, delta, deltaDir = 'up', icon, spark, tone }) {
  const { c, fonts } = useAdminTheme();
  const up = deltaDir === 'up';
  const displayLabel = label || title;

  const toneBgMap = {
    ok: 'rgba(16, 185, 129, 0.15)',
    bad: 'rgba(239, 68, 68, 0.15)',
    warn: 'rgba(245, 158, 11, 0.15)',
    info: 'rgba(2, 132, 199, 0.15)',
    neutral: c.track,
  };

  const toneColorMap = {
    ok: '#10B981',
    bad: '#EF4444',
    warn: '#F59E0B',
    info: '#0284C7',
    neutral: c.fgSubtle,
  };

  const iconBg = (tone && toneBgMap[tone]) || 'rgba(37, 99, 235, 0.14)';
  const iconColor = (tone && toneColorMap[tone]) || '#2563EB';

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'all .18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = c.border;
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 11.5,
            color: c.fgSubtle,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            fontWeight: 700,
            fontFamily: fonts.body,
          }}
        >
          {displayLabel}
        </span>
        {icon && (
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: iconBg,
              color: iconColor,
              display: 'grid',
              placeItems: 'center',
              border: `1px solid ${c.borderSub}`,
              flexShrink: 0,
              boxShadow: `0 2px 8px ${iconBg}`,
            }}
          >
            <Icon name={icon} size={20} color={iconColor} />
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 32,
          fontWeight: 800,
          lineHeight: 1.1,
          marginTop: 14,
          letterSpacing: -1,
          color: c.fg,
        }}
      >
        {value}
      </div>

      {subtext && (
        <div style={{ fontSize: 12.5, color: c.fgSubtle, marginTop: 8, fontWeight: 500 }}>
          {subtext}
        </div>
      )}

      {delta != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: up ? '#10B981' : '#EF4444',
              fontSize: 12,
              fontWeight: 700,
              background: up ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
              padding: '3px 9px',
              borderRadius: 20,
            }}
          >
            <span style={{ fontSize: 9 }}>{up ? '▲' : '▼'}</span>
            {delta}
          </span>
          <span style={{ fontSize: 11.5, color: c.fgFaint }}>so với kỳ trước</span>
        </div>
      )}

      {spark && (
        <div style={{ marginTop: 14 }}>
          <Sparkline data={spark} color={c.accent} />
        </div>
      )}
    </div>
  );
}
