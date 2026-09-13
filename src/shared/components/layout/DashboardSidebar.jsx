import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useAdminTheme } from '../../context/ThemeContext';

export default function DashboardSidebar({
  page,
  onNavigate,
  navItems = [],
  consoleLabel = 'Admin Console',
  defaultDisplayName = 'Admin',
  roleLabel = 'Quản trị hệ thống',
  avatarLetter = 'A',
  onLogout,
  brandName = 'RWFM ADMIN',
}) {
  const navigate = useNavigate();
  const { c, fonts, sidebarCollapsed: collapsed } = useAdminTheme();
  const width = collapsed ? 84 : 278;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: `linear-gradient(180deg, ${c.bgRaised}, ${c.bgCard})`,
        borderRight: `1px solid ${c.border}`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .22s ease',
        boxShadow: '8px 0 30px rgba(0,0,0,0.06)',
        zIndex: 60,
      }}
    >
      <div
        style={{
          padding: collapsed ? '18px 14px' : '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 12,
          borderBottom: `1px solid ${c.border}`,
          height: 84,
        }}
      >
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: `linear-gradient(145deg, ${c.accent}, ${c.accentDim})`,
            color: c.ink,
            display: 'grid',
            placeItems: 'center',
            fontFamily: fonts.display,
            fontSize: 23,
            flexShrink: 0,
            border: `1px solid ${c.accent}`,
            boxShadow: `0 10px 24px ${c.accentDim}`,
          }}
        >
          {brandName.charAt(0)}
        </span>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 21, letterSpacing: 2, color: c.fg }}>{brandName}</div>
            <div style={{ marginTop: 3, fontSize: 9, fontWeight: 800, letterSpacing: 1.8, color: c.accent, textTransform: 'uppercase' }}>
              {consoleLabel}
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '16px 10px' : '16px 14px' }}>
        {navItems.map((item, index) => {
          if (item.type === 'group') {
            return collapsed ? (
              <div key={`group-${index}`} style={{ height: 1, background: c.borderSub, margin: '12px 8px' }} />
            ) : (
              <div key={`group-${index}`} style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.6, color: c.fgFaint, textTransform: 'uppercase', padding: '20px 12px 9px' }}>
                {item.label}
              </div>
            );
          }

          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              title={collapsed ? item.label : ''}
              onMouseEnter={(event) => {
                if (!active) event.currentTarget.style.background = c.bgHover;
              }}
              onMouseLeave={(event) => {
                if (!active) event.currentTarget.style.background = 'transparent';
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: 5,
                background: active ? `linear-gradient(90deg, ${c.accentDim}, ${c.bgElev})` : 'transparent',
                border: `1px solid ${active ? c.accent : 'transparent'}`,
                borderRadius: 8,
                color: active ? c.accent : c.fgSubtle,
                fontSize: 13,
                fontWeight: active ? 750 : 550,
                fontFamily: fonts.body,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all .16s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', color: active ? c.accent : c.fgSubtle, background: active ? c.accentDim : c.track, borderRadius: 7 }}>
                <Icon name={item.icon || 'dot'} size={17} />
              </span>
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{ minWidth: 22, padding: '2px 7px', borderRadius: 10, background: c.tones.bad, color: '#fff', fontSize: 10, fontWeight: 800, textAlign: 'center' }}>
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span style={{ position: 'absolute', top: 6, right: 9, width: 7, height: 7, borderRadius: 7, background: c.tones.bad }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: `1px solid ${c.border}` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: collapsed ? '6px 0' : '11px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: collapsed ? 'transparent' : c.bgElev,
            border: collapsed ? 'none' : `1px solid ${c.border}`,
            borderRadius: 9,
          }}
        >
          <span style={{ width: 40, height: 40, borderRadius: 9, background: c.accentDim, color: c.accent, display: 'grid', placeItems: 'center', fontFamily: fonts.display, fontSize: 17, flexShrink: 0, border: `1px solid ${c.accent}` }}>
            {avatarLetter}
          </span>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 750, color: c.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{defaultDisplayName}</div>
              <div style={{ marginTop: 2, fontSize: 10.5, color: c.fgFaint }}>{roleLabel}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} style={{ width: 30, height: 30, background: c.track, border: `1px solid ${c.border}`, borderRadius: 7, color: c.fgFaint, display: 'grid', placeItems: 'center', cursor: 'pointer' }} aria-label="Đăng xuất">
              <Icon name="logout" size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
