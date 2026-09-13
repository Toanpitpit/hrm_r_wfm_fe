// ProgressBar — thanh tiến độ mảnh. value tính theo %.
// Dùng: <ProgressBar value={68} />

import { useAdminTheme } from '../../context/ThemeContext';

export default function ProgressBar({ value, color, h = 6 }) {
  const { c } = useAdminTheme();
  const fill = color || c.accent;

  return (
    <div style={{ height: h, background: c.track, borderRadius: h, overflow: 'hidden', minWidth: 60 }}>
      <div
        style={{
          height: '100%',
          width: Math.min(100, Math.max(0, value)) + '%',
          background: fill,
          borderRadius: h,
          transition: 'width .4s',
        }}
      />
    </div>
  );
}
