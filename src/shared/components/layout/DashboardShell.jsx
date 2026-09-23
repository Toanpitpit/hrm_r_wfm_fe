import { useAdminTheme } from '../../context/ThemeContext';

export default function DashboardShell({ sidebar, topbar, children }) {
  const { c, fonts } = useAdminTheme();

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: c.bg,
        color: c.fg,
        fontFamily: fonts.body,
        transition: 'background 0.25s ease, color 0.25s ease',
      }}
    >
      {sidebar}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {topbar}

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
