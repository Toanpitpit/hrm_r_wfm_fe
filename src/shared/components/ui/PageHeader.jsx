// PageHeader — tiêu đề trang: số mục (—— 01) + tên lớn + mô tả + vùng hành động.
// Dùng: <PageHeader index="Hệ thống · 01" title="Quản lý cửa hàng" desc="..." actions={<Button .../>} />

import { useAdminTheme } from '../../context/ThemeContext';

export default function PageHeader({ index, title, desc, actions }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 26,
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <div>
        {index && (
          <div style={{ fontFamily: fonts.display, fontSize: 12.5, letterSpacing: 3, color: c.accent, textTransform: 'uppercase', marginBottom: 9 }}>
            —— {index}
          </div>
        )}
        <h1 style={{ fontFamily: fonts.display, fontSize: 46, fontWeight: 400, margin: 0, lineHeight: 0.95, textTransform: 'uppercase' }}>
          {title}
        </h1>
        {desc && <p style={{ fontSize: 13.5, color: c.fgSubtle, margin: '12px 0 0', maxWidth: 560, textWrap: 'pretty' }}>{desc}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
