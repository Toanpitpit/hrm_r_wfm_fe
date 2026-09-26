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
  brandName = 'RWFM Enterprise',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { c, fonts, sidebarCollapsed: collapsed, setSidebarCollapsed } = useAdminTheme();
  const sb = c.sidebar;
  const width = collapsed ? 72 : 252;

  // Read stored user profile from localStorage
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const roleCode = (user?.role || user?.Role || '').toUpperCase();
  const actualName = user?.fullName || user?.FullName || defaultDisplayName || 'Aigars S.';
  const actualRole = user?.roleName || user?.RoleName || (user?.storeName ? `Quản lý ${user.storeName}` : roleLabel) || 'Admin';

  const actualAvatarLetter = actualName
    ? actualName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (avatarLetter || 'RW');

  const currentPath = activePath || location.pathname;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
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

    if (item.id === 'dashboard') {
      navigate('/dashboard');
    } else if (item.id === 'my-calendar') {
      navigate('/employee/my-calendar');
    } else if (item.id === 'weekly-schedules' || item.id === 'store-schedules' || item.id === 'schedules') {
      navigate('/store-manager/schedules');
    } else if (item.id === 'employees') {
      navigate('/employees');
    } else if (item.id === 'branches') {
      navigate('/branches');
    } else if (item.id === 'branch-tiers' || item.id === 'tiers') {
      navigate('/branch-tiers');
    } else if (item.id === 'shift-master') {
      navigate('/shifts/templates');
    } else if (item.id === 'kiosk-codes') {
      navigate('/store-manager/kiosk-codes');
    } else {
      navigate(`/${item.id}`);
    }
  };

  // Check active item strictly based on route
  const isItemActive = (item) => {
    if (item.path) {
      if (currentPath === item.path) return true;
      if (item.path !== '/' && item.path !== '/dashboard' && currentPath.startsWith(item.path)) {
        return true;
      }
      return false;
    }
    if (page && (item.id === page || item.key === page)) {
      return true;
    }
    return false;
  };

  // Nav items from role configuration
  const effectiveNavItems = (navItems && navItems.length > 0)
    ? navItems
    : getNavItemsForRole(roleCode);

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: '100vh',
        background: sb.bg,
        borderRight: `1px solid ${sb.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 60,
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.25s ease, border-color 0.25s ease',
        userSelect: 'none',
      }}
    >
      {/* Brand Header — Logo Badge + RWFM Enterprise + 3-Line Menu Button */}
      <div
        style={{
          height: 70,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 16px',
          borderBottom: `1px solid ${sb.borderHeader}`,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'border-color 0.25s ease',
        }}
      >
        {/* Rounded Square Logo Badge */}
        <div
          onClick={() => setSidebarCollapsed(!collapsed)}
          title={collapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: sb.brandBadgeBg,
            border: sb.brandBadgeBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
            flexShrink: 0,
            boxShadow: sb.brandBadgeShadow,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <img
            src="/logo.png"
            alt="RWFM Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Brand Name with Smooth CSS Transition */}
        <div
          style={{
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 140,
            transition: 'opacity 0.18s ease, max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: collapsed ? 'none' : 'auto',
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: sb.brandText,
              letterSpacing: -0.3,
              lineHeight: 1.2,
              fontFamily: fonts.display,
            }}
          >
            {brandName}
          </div>
        </div>

        {/* 3-Bar Hamburger Menu Button Inside Sidebar Header */}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            title="Thu gọn Sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: sb.hamburgerColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: 'auto',
              transition: 'color 0.15s ease, background-color 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = sb.hamburgerHoverColor;
              e.currentTarget.style.background = sb.hamburgerHoverBg;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = sb.hamburgerColor;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon name="menu" size={18} />
          </button>
        )}
      </div>

      {/* Navigation List — Grouped Structure */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {effectiveNavItems.map((item, idx) => {
          // Group Section Label
          if (item.type === 'group' || item.isGroup) {
            return (
              <div
                key={idx}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: sb.categoryLabel,
                  padding: collapsed ? '8px 4px 4px' : '16px 12px 6px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  opacity: collapsed ? 0 : 1,
                  maxHeight: collapsed ? 8 : 36,
                  transition: 'opacity 0.18s ease, max-height 0.22s ease, padding 0.22s ease',
                }}
              >
                {item.label}
              </div>
            );
          }

          const active = isItemActive(item);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '10px 12px',
                borderRadius: 10,
                background: active ? sb.bgActive : 'transparent',
                border: active ? sb.activeBorder : '1px solid transparent',
                color: active ? sb.activeText : sb.fgSubtle,
                boxShadow: active && sb.activeText === '#FFFFFF' ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 0.18s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.18s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = sb.bgHover;
                  e.currentTarget.style.color = sb.fg;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = sb.fgSubtle;
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0 }}>
                  <Icon
                    name={item.icon || 'dot'}
                    size={18}
                    color={active ? sb.activeIcon : undefined}
                  />
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    opacity: collapsed ? 0 : 1,
                    maxWidth: collapsed ? 0 : 160,
                    transition: 'opacity 0.18s ease, max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: active ? sb.activeBadgeBg : 'rgba(13, 148, 136, 0.15)',
                    color: active ? sb.activeBadgeText : '#0D9488',
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    opacity: collapsed ? 0 : 1,
                    maxWidth: collapsed ? 0 : 40,
                    transition: 'opacity 0.18s ease, max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
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

      {/* Footer User Profile */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: `1px solid ${sb.footerBorder}`,
          backgroundColor: sb.footerBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Teal Circular Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.35)',
            }}
          >
            {actualAvatarLetter}
          </div>

          <div
            style={{
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : 120,
              transition: 'opacity 0.18s ease, max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: sb.fg,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {actualName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: sb.fgSubtle,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {actualRole}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất khỏi hệ thống"
            style={{
              background: 'transparent',
              border: 'none',
              color: sb.fgSubtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'color 0.15s ease, background-color 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = sb.fgSubtle;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon name="logout" size={17} />
          </button>
        )}
      </div>
    </aside>
  );
}