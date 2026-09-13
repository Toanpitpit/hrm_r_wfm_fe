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
        padding: '3px 9px',
        borderRadius: 2,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && <span style={{ width: 5, height: 5, borderRadius: 5, background: color }} />}
      {children}
    </span>
  );
}
