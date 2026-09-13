// Panel — khung thẻ có tiêu đề + mô tả + vùng hành động bên phải.
// Dùng: <Panel title="..." sub="..." action={<Button .../>}>nội dung</Panel>

import { useAdminTheme } from '../../context/ThemeContext';

export default function Panel({ title, sub, action, children, pad = 24, style }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 3, ...style }}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: `18px ${pad}px`,
            borderBottom: `1px solid ${c.borderSub}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 19,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  lineHeight: 1.12,
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </div>
            )}
            {sub && <div style={{ fontSize: 12, color: c.fgSubtle, marginTop: 3 }}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}
