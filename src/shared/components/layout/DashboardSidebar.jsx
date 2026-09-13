import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useAdminTheme } from '../../context/ThemeContext';
import { getNavItemsForRole } from '../../constants/navigation.config';

export default function DashboardSidebar({
  page,
  activePath,
  onNavigate,
  navItems = [],
  consoleLabel,
  defaultDisplayName,
  roleLabel,
  avatarLetter,
  onLogout,
  brandName = 'RWFM OPS',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { c, fonts, sidebarCollapsed: collapsed } = useAdminTheme();
  const width = collapsed ? 84 : 278;

  // Read stored user profile from localStorage
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const roleCode = (user?.role || user?.Role || '').toUpperCase();

  // Derive dynamic user details
  const actualName = user?.fullName || user?.FullName || defaultDisplayName || 'Quản trị viên';
  const actualRole = user?.roleName || user?.RoleName || (user?.storeName ? `Quản lý ${user.storeName}` : roleLabel) || 'Quản trị vận hành';
  
  let actualConsoleLabel = consoleLabel;
  if (!actualConsoleLabel || actualConsoleLabel === 'OPERATIONS CONSOLE' || actualConsoleLabel === 'Operations Console') {
    if (roleCode === 'STORE_MANAGER') actualConsoleLabel = 'STORE MANAGER CONSOLE';
    else if (roleCode === 'BUSINESS_OWNER') actualConsoleLabel = 'EXECUTIVE CONSOLE';
    else if (roleCode === 'OPERATIONS_ADMIN') actualConsoleLabel = 'OPERATIONS CONSOLE';
    else actualConsoleLabel = consoleLabel || 'OPERATIONS CONSOLE';
  }

  const actualAvatarLetter = actualName
    ? actualName.trim().charAt(0).toUpperCase()
    : (avatarLetter || 'O');

  const currentPath = activePath || location.pathname;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleItemClick = (item) => {
    if (typeof item.onClick === 'function') {
      item.onClick();
      return;
    }
    if (item.path) {
      navigate(item.path);
      return;
    }
    if (typeof onNavigate === 'function') {
      onNavigate(item.id || item.key);
      return;
    }

    // Default route mappings based on role permission
    if (item.id === 'dashboard') {
      if (roleCode === 'STORE_MANAGER') navigate('/store-manager/kiosk-codes');
      else navigate('/dashboard');
    } else if (item.id === 'branches') {
      if (roleCode === 'STORE_MANAGER') {
        alert('Tài khoản Quản lý Cửa hàng không có quyền truy cập Danh mục Chi nhánh toàn hệ thống.');
        return;
      }
      navigate('/branches');
    } else if (item.id === 'shift-master') {
      if (roleCode === 'STORE_MANAGER') {
        alert('Tài khoản Quản lý Cửa hàng không có quyền truy cập Bộ Khung Ca Mẫu toàn hệ thống.');
        return;
      }
      navigate('/shifts/templates');
    } else if (item.id === 'shifts') {
      if (roleCode === 'STORE_MANAGER') {
        alert('Chức năng Lập lịch ca chi nhánh cho Store Manager đang được phát triển.');
        return;
      }
      navigate('/shifts/templates');
    }
  };

  const isItemActive = (item) => {
    if (item.active !== undefined) return Boolean(item.active);
    if (page && item.id === page) return true;
    if (item.path && item.path !== '#' && currentPath === item.path && (!page || page === item.id)) return true;
    if (item.id === 'dashboard' && currentPath === '/dashboard' && (!page || page === 'dashboard')) return true;
    if (item.id === 'branches' && currentPath === '/branches' && (!page || page === 'branches')) return true;
    if (item.id === 'shift-master' && currentPath === '/shifts/templates' && (!page || page === 'shift-master')) return true;
    return false;
  };

  // Source navigation items (use prop if provided, else read centralized role config)
  const sourceNavItems = (navItems && navItems.length > 0) ? navItems : getNavItemsForRole(roleCode);

  // Filter navigation items strictly based on logged-in user role
  const effectiveNavItems = sourceNavItems.filter((item) => {
    if (roleCode === 'STORE_MANAGER') {
      // Store Manager must NEVER see Operations Admin features (Master Ca, Branch Directory, Master Data)
      if (item.id === 'shift-master' || item.id === 'branches') return false;
      if (item.type === 'group' && (item.label?.includes('Master Data') || item.label?.includes('Quản trị'))) return false;
    }
    return true;
  });

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: `linear-gradient(180deg, ${c.bgRaised}, ${c.bgCard})`,
        borderRight: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .22s ease',
        boxShadow: '8px 0 30px rgba(0,0,0,0.06)',
        zIndex: 60,
      }}
    >
      {/* Brand Header */}
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
            <div style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: 1.5, color: c.fg, fontWeight: 800 }}>
              {brandName}
            </div>
            <div style={{ marginTop: 2, fontSize: 9, fontWeight: 800, letterSpacing: 1.8, color: c.accent, textTransform: 'uppercase' }}>
              {actualConsoleLabel}
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '16px 10px' : '16px 14px' }}>
        {effectiveNavItems.map((item, index) => {
          if (item.type === 'group') {
            return collapsed ? (
              <div key={`group-${index}`} style={{ height: 1, background: c.borderSub, margin: '12px 8px' }} />
            ) : (
              <div
                key={`group-${index}`}
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: 1.6,
                  color: c.fgFaint,
                  textTransform: 'uppercase',
                  padding: '16px 12px 6px',
                }}
              >
                {item.label}
              </div>
            );
          }

          const active = isItemActive(item);

          return (
            <button
              key={item.id || item.label || index}
              type="button"
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : ''}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = c.bgHover;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: 6,
                background: active ? `linear-gradient(90deg, ${c.accentDim}, ${c.bgElev})` : 'transparent',
                border: `1px solid ${active ? c.accent : 'transparent'}`,
                borderRadius: 8,
                color: active ? c.accent : c.fgSubtle,
                fontSize: 13.5,
                fontWeight: active ? 750 : 550,
                fontFamily: fonts.body,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all .16s ease',
                textAlign: 'left',
                outline: 'none',
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: active ? c.accent : c.fgSubtle,
                  background: active ? `${c.accent}25` : c.track,
                  borderRadius: 7,
                  border: `1px solid ${active ? `${c.accent}40` : 'transparent'}`,
                }}
              >
                <Icon name={item.icon || 'dot'} size={17} />
              </span>
              {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span
                  style={{
                    minWidth: 22,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: c.tones.bad,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    textAlign: 'center',
                  }}
                >
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

      {/* User / Profile Footer */}
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
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              background: c.accentDim,
              color: c.accent,
              display: 'grid',
              placeItems: 'center',
              fontFamily: fonts.display,
              fontSize: 17,
              flexShrink: 0,
              border: `1px solid ${c.accent}`,
            }}
          >
            {actualAvatarLetter}
          </span>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 750, color: c.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {actualName}
              </div>
              <div style={{ marginTop: 2, fontSize: 10.5, color: c.fgFaint }}>
                {actualRole}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              style={{
                width: 30,
                height: 30,
                background: c.track,
                border: `1px solid ${c.border}`,
                borderRadius: 7,
                color: c.fgFaint,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <Icon name="logout" size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}