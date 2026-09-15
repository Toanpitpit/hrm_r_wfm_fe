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
    ok: c.tones.okDim,
    bad: c.tones.badDim,
    warn: c.tones.warnDim,
    info: c.tones.infoDim,
    neutral: c.track,
  };

  const toneColorMap = {
    ok: c.tones.ok,
    bad: c.tones.bad,
    warn: c.tones.warn,
    info: c.tones.info,
    neutral: c.fgSubtle,
  };

  const iconBg = (tone && toneBgMap[tone]) || c.accentDim;
  const iconColor = (tone && toneColorMap[tone]) || c.accent;

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11.5, color: c.fgSubtle, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          {displayLabel}
        </span>
        {icon && (
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: iconBg,
              color: iconColor,
              display: 'grid',
              placeItems: 'center',
              border: `1px solid ${c.borderSub}`,
            }}
          >
            <Icon name={icon} size={18} color={iconColor} />
          </span>
        )}
      </div>

      <div style={{ fontFamily: fonts.display, fontSize: 36, lineHeight: 1, marginTop: 14, letterSpacing: 0.5, color: c.fg }}>
        {value}
      </div>

      {subtext && (
        <div style={{ fontSize: 11.5, color: c.fgSubtle, marginTop: 10, fontWeight: 500 }}>
          {subtext}
        </div>
      )}

      {delta != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: up ? c.tones.ok : c.tones.bad, fontSize: 12, fontWeight: 700 }}>
            <span style={{ fontSize: 13 }}>{up ? '▲' : '▼'}</span>
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
