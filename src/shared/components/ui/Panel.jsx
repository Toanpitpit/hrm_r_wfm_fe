// Panel — khung thẻ theo chuẩn thiết kế Apex Dashboard
// Dùng: <Panel title="..." sub="..." action={<Button .../>}>nội dung</Panel>

import { useAdminTheme } from '../../context/ThemeContext';

export default function Panel({ title, sub, action, children, pad = 22, style }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div
      style={{
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
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
            padding: '18px 22px',
            borderBottom: `1px solid ${c.borderSub}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 15,
                  fontWeight: 600,
                  color: c.fg,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
            )}
            {sub && (
              <div style={{ fontSize: 12.5, color: c.fgSubtle, marginTop: 2 }}>
                {sub}
              </div>
            )}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}
