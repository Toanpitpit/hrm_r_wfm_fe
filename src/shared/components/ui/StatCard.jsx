// StatCard — thẻ KPI: nhãn, giá trị lớn, biến động % và sparkline tùy chọn.
// Dùng: <StatCard label="Doanh thu" value="33,4 tỷ" delta="12,4%" deltaDir="up" icon="money" spark={[...]} />

import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';
import { Sparkline } from '../charts/Charts';

export default function StatCard({ label, value, delta, deltaDir = 'up', icon, spark }) {
  const { c, fonts } = useAdminTheme();
  const up = deltaDir === 'up';

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 3,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11.5, color: c.fgSubtle, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </span>
        {icon && (
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: c.accentDim,
              color: c.accent,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name={icon} size={17} />
          </span>
        )}
      </div>

      <div style={{ fontFamily: fonts.display, fontSize: 38, lineHeight: 1, marginTop: 14, letterSpacing: 0.5 }}>
        {value}
      </div>

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
