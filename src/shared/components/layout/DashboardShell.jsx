import { useAdminTheme } from '../../context/ThemeContext';

export default function DashboardShell({ sidebar, topbar, children }) {
  const { c } = useAdminTheme();

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: c.bg,
        color: c.fg,
        transition: 'background .25s ease, color .25s ease',
      }}
    >
      {sidebar}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {topbar}

        <main style={{ flex: 1, overflowY: 'auto', padding: '30px 36px 48px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
