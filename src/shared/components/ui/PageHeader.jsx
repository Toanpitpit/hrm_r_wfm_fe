// PageHeader — tiêu đề trang chuẩn Apex Dashboard
// Dùng: <PageHeader index="01" title="Dashboard" desc="..." actions={<Button .../>} />

import { useAdminTheme } from '../../context/ThemeContext';

export default function PageHeader({ index, title, desc, subtitle, actions }) {
  const { c, fonts } = useAdminTheme();
  const displayDesc = desc || subtitle || '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <div>
        {index && (
          <div
            style={{
              fontSize: 11.5,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: '#10B981',
              marginBottom: 4,
              fontWeight: 700,
            }}
          >
            {index}
          </div>
        )}
        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
            color: c.fg,
            letterSpacing: -0.4,
          }}
        >
          {title}
        </h1>
        {displayDesc && (
          <p
            style={{
              fontSize: 13.5,
              color: c.fgSubtle,
              margin: '6px 0 0',
              maxWidth: 640,
              lineHeight: 1.5,
            }}
          >
            {displayDesc}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
