// Badge — nhãn trạng thái (pill). tone quyết định màu; dot bật chấm tròn.
// Dùng: <Badge tone="active" dot>Hoạt động</Badge>

import { useAdminTheme, badgeToneMap } from '../../context/ThemeContext';

export default function Badge({ tone = 'neutral', children, dot = false }) {
  const { c } = useAdminTheme();
  const map = badgeToneMap(c);
  const [color, bg] = map[tone] || map.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 11px',
        borderRadius: 20,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        whiteSpace: 'nowrap',
        border: `1px solid ${color}33`,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 6, background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />}
      {children}
    </span>
  );
}
