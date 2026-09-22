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
        gap: 5,
        padding: '3px 10px',
        borderRadius: 20,
        background: bg,
        color,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: 0.2,
        whiteSpace: 'nowrap',
        lineHeight: 1.6,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
      {children}
    </span>
  );
}
