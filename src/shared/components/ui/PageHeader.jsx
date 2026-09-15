// PageHeader — tiêu đề trang: breadcrumb nhỏ + tên trang + mô tả + vùng hành động.
// Dùng: <PageHeader index="Hệ thống · 01" title="Quản lý cửa hàng" desc="..." actions={<Button .../>} />

import { useAdminTheme } from '../../context/ThemeContext';

export default function PageHeader({ index, title, desc, actions }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 28,
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <div>
        {index && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: fonts.body,
              fontSize: 11.5,
              letterSpacing: 0.6,
              color: '#2563EB',
              background: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(37, 99, 235, 0.22)',
              padding: '3px 10px',
              borderRadius: 20,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            {index}
          </div>
        )}
        <h1
          style={{
            fontFamily: fonts.body,
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.25,
            color: c.fg,
            letterSpacing: -0.6,
          }}
        >
          {title}
        </h1>
        {desc && (
          <p
            style={{
              fontSize: 14,
              color: c.fgSubtle,
              margin: '8px 0 0',
              maxWidth: 680,
              lineHeight: 1.6,
              fontWeight: 450,
            }}
          >
            {desc}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
