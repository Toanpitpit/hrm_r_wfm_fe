// Panel — khung thẻ có tiêu đề + mô tả + vùng hành động bên phải.
// Dùng: <Panel title="..." sub="..." action={<Button .../>}>nội dung</Panel>

import { useAdminTheme } from '../../context/ThemeContext';

export default function Panel({ title, sub, action, children, pad = 24, style }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: `18px ${pad}px`,
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: c.fg,
                  letterSpacing: -0.2,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
            )}
            {sub && (
              <div style={{ fontSize: 13, color: c.fgSubtle, marginTop: 3, fontWeight: 400 }}>
                {sub}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}
