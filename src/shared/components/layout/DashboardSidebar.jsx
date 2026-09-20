import React, { useState, useEffect } from 'react';
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

  // State quản lý danh mục nào (Mục to) đang được mở
  const [openCategories, setOpenCategories] = useState({});

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
    if (roleCode === 'STORE_MANAGER' || roleCode.includes('MANAGER')) actualConsoleLabel = 'STORE MANAGER CONSOLE';
    else if (roleCode === 'SHIFT_LEADER' || roleCode.includes('LEADER')) actualConsoleLabel = 'SHIFT LEADER PORTAL';
    else if (roleCode === 'CASHIER' || roleCode.includes('CASHIER')) actualConsoleLabel = 'CASHIER PORTAL';
    else if (roleCode === 'SALES_STAFF' || roleCode.includes('SALES')) actualConsoleLabel = 'SALES PORTAL';
    else if (roleCode === 'SECURITY_GUARD' || roleCode === 'SECURITY' || roleCode.includes('SECURITY')) actualConsoleLabel = 'SECURITY PORTAL';
    else if (roleCode === 'EMPLOYEE' || roleCode === 'STAFF') actualConsoleLabel = 'EMPLOYEE PORTAL';
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
      if (roleCode === 'STORE_MANAGER' || roleCode === 'SHIFT_LEADER' || roleCode.includes('MANAGER') || roleCode.includes('LEADER')) {
        navigate('/store-manager/schedules');
      } else if (roleCode === 'CASHIER' || roleCode === 'SALES_STAFF' || roleCode === 'SECURITY_GUARD') {
        navigate('/employee/my-calendar');
      } else {
        navigate('/dashboard');
      }
    } else if (item.id === 'my-calendar') {
      navigate('/employee/my-calendar');
    } else if (item.id === 'weekly-schedules' || item.id === 'store-schedule' || item.id === 'store-schedules' || item.id === 'schedules') {
      navigate('/store-manager/schedules');
    } else if (item.id === 'employee-schedule' || item.id === 'my-schedule') {
      navigate('/employee/my-calendar');
    } else if (item.id === 'kiosk-codes') {
      navigate('/store-manager/kiosk-codes');
    } else if (item.id === 'live-roster') {
      navigate('/store-manager/live-roster');
    } else if (item.id === 'attendance-otp') {
      navigate('/employee/attendance-otp');
    } else if (item.id === 'shift-requests') {
      navigate('/employee/shift-requests');
    } else if (item.id === 'dispatches') {
      navigate('/store-manager/dispatches');
    } else if (item.id === 'dispatch-network') {
      navigate('/admin/dispatch-network');
    } else if (item.id === 'employees') {
      navigate('/employees');
    } else if (item.id === 'branches') {
      if (roleCode === 'STORE_MANAGER' || roleCode === 'SHIFT_LEADER' || roleCode.includes('STAFF') || roleCode.includes('GUARD') || roleCode.includes('CASHIER')) {
        alert('Tài khoản cửa hàng không có quyền truy cập Danh mục Chi nhánh toàn hệ thống.');
        return;
      }
      navigate('/branches');
    } else if (item.id === 'shift-master') {
      if (roleCode === 'STORE_MANAGER' || roleCode === 'SHIFT_LEADER' || roleCode.includes('STAFF') || roleCode.includes('GUARD') || roleCode.includes('CASHIER')) {
        alert('Tài khoản cửa hàng không có quyền truy cập Bộ Khung Ca Mẫu toàn hệ thống.');
        return;
      }
      navigate('/shifts/templates');
    } else if (item.id === 'shifts') {
      if (roleCode === 'STORE_MANAGER' || roleCode === 'SHIFT_LEADER') {
        navigate('/store-manager/schedules');
        return;
      }
      navigate('/shifts/templates');
    }
  };

  const isItemActive = (item) => {
    if (!item) return false;
    if (item.active !== undefined) return Boolean(item.active);
    if (page && item.id === page) return true;
    if (item.path && item.path !== '#' && currentPath === item.path && (!page || page === item.id)) return true;
    if (item.id === 'dashboard' && currentPath === '/dashboard' && (!page || page === 'dashboard')) return true;
    if ((item.id === 'weekly-schedules' || item.id === 'store-schedules') && currentPath === '/store-manager/schedules' && (!page || page === item.id)) return true;
    if (item.id === 'kiosk-codes' && currentPath === '/store-manager/kiosk-codes' && (!page || page === 'kiosk-codes')) return true;
    if (item.id === 'live-roster' && (currentPath === '/store-manager/live-roster' || currentPath === '/live-roster') && (!page || page === 'live-roster')) return true;
    if (item.id === 'my-calendar' && (currentPath === '/employee/my-calendar' || currentPath === '/employee/schedule') && (!page || page === 'my-calendar')) return true;
    if (item.id === 'attendance-otp' && currentPath === '/employee/attendance-otp' && (!page || page === 'attendance-otp')) return true;
    if (item.id === 'shift-requests' && currentPath === '/employee/shift-requests' && (!page || page === 'shift-requests')) return true;
    if (item.id === 'dispatches' && currentPath === '/store-manager/dispatches' && (!page || page === 'dispatches')) return true;
    if (item.id === 'dispatch-network' && currentPath === '/admin/dispatch-network' && (!page || page === 'dispatch-network')) return true;
    if (item.id === 'branches' && currentPath === '/branches' && (!page || page === 'branches')) return true;
    if (item.id === 'employees' && currentPath === '/employees' && (!page || page === 'employees')) return true;
    if (item.id === 'shift-master' && currentPath === '/shifts/templates' && (!page || page === 'shift-master')) return true;
    return false;
  };

  // Source navigation items
  const sourceNavItems = (navItems && navItems.length > 0) ? navItems : getNavItemsForRole(roleCode);

  // Normalize structure: If navItems contains legacy { type: 'group' }, group items into parent categories
  const normalizedNavItems = React.useMemo(() => {
    const result = [];
    let currentGroup = null;

    sourceNavItems.forEach((item, index) => {
      // Role permission filtering
      if (roleCode === 'STORE_MANAGER' || roleCode === 'SHIFT_LEADER' || roleCode.includes('MANAGER') || roleCode.includes('LEADER')) {
        if (item.id === 'shift-master' || item.id === 'branches') return;
      }

      if (item.children && item.children.length > 0) {
        // Multi-level item already has children
        result.push(item);
      } else if (item.type === 'group') {
        currentGroup = {
          id: `group-${index}-${item.label}`,
          label: item.label,
          icon: item.icon || 'building',
          children: [],
        };
        result.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.children.push(item);
      } else {
        result.push(item);
      }
    });

    return result;
  }, [sourceNavItems, roleCode]);

  // Auto-expand category that contains an active child item
  useEffect(() => {
    const nextState = { ...openCategories };
    let stateChanged = false;

    normalizedNavItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some((child) => isItemActive(child));
        if (hasActiveChild && !nextState[item.id]) {
          nextState[item.id] = true;
          stateChanged = true;
        }
      }
    });

    if (stateChanged) {
      setOpenCategories(nextState);
    }
  }, [currentPath, page, normalizedNavItems]);

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: c.bgRaised,
        borderRight: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .22s ease',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        zIndex: 60,
        overflowX: 'hidden',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: collapsed ? '16px 14px' : '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 12,
          borderBottom: `1px solid ${c.border}`,
          height: 72,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            padding: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <img
            src="/logo.png"
            alt={brandName}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: fonts.body, fontSize: 15, letterSpacing: -0.2, color: c.fg, fontWeight: 700 }}>
              {brandName}
            </div>
            <div style={{ marginTop: 2, fontSize: 10.5, fontWeight: 500, letterSpacing: 0.5, color: c.fgSubtle, textTransform: 'uppercase' }}>
              {actualConsoleLabel}
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '12px 8px' : '14px 12px' }}>
        {normalizedNavItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const catId = item.id || `cat-${index}`;
          const isCategoryOpen = Boolean(openCategories[catId]);
          const hasActiveChild = hasChildren && item.children.some((child) => isItemActive(child));

          // 1. Dạng Mục To có danh sách Mục Nhỏ (Category Accordion)
          if (hasChildren) {
            return (
              <div key={catId} style={{ marginBottom: 6 }}>
                {/* Mục To (Parent Category Button) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(catId)}
                  title={collapsed ? item.label : ''}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px 0' : '10px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: hasActiveChild ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    border: hasActiveChild ? `1px solid rgba(37, 99, 235, 0.2)` : '1px solid transparent',
                    borderRadius: 10,
                    color: hasActiveChild ? c.primary || '#2563EB' : c.fg,
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: fonts.body,
                    cursor: 'pointer',
                    transition: 'all .16s ease',
                    textAlign: 'left',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!hasActiveChild) {
                      e.currentTarget.style.background = c.bgHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasActiveChild) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      color: hasActiveChild ? '#2563EB' : c.fgSubtle,
                      background: hasActiveChild ? 'rgba(37, 99, 235, 0.15)' : c.track,
                      borderRadius: 8,
                      transition: 'all .15s',
                    }}
                  >
                    <Icon name={item.icon || 'building'} size={16} />
                  </span>

                  {!collapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}

                  {!collapsed && (
                    <span style={{ color: c.fgFaint, display: 'grid', placeItems: 'center', transition: 'transform 0.2s' }}>
                      <Icon name={isCategoryOpen ? 'chevron-down' : 'chevron-right'} size={14} />
                    </span>
                  )}
                </button>

                {/* Danh sách các Mục Nhỏ (Sub-items) */}
                {(isCategoryOpen || collapsed) && (
                  <div
                    style={{
                      marginTop: 3,
                      paddingLeft: collapsed ? 0 : 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    {item.children.map((sub, subIdx) => {
                      const active = isItemActive(sub);
                      return (
                        <button
                          key={sub.id || sub.label || subIdx}
                          type="button"
                          onClick={() => handleItemClick(sub)}
                          title={collapsed ? sub.label : ''}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = c.bgHover;
                              e.currentTarget.style.color = c.fg;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = c.fgSubtle;
                            }
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: collapsed ? '8px 0' : '8px 10px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            background: active ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'transparent',
                            border: 'none',
                            borderRadius: 8,
                            color: active ? '#ffffff' : c.fgSubtle,
                            fontSize: 13,
                            fontWeight: active ? 600 : 500,
                            fontFamily: fonts.body,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all .16s ease',
                            textAlign: 'left',
                            outline: 'none',
                            boxShadow: active ? '0 3px 10px rgba(37, 99, 235, 0.3)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              flexShrink: 0,
                              display: 'grid',
                              placeItems: 'center',
                              color: active ? '#ffffff' : c.fgSubtle,
                              background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                              borderRadius: 6,
                            }}
                          >
                            <Icon name={sub.icon || 'dot'} size={14} />
                          </span>
                          {!collapsed && (
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sub.label}
                            </span>
                          )}
                          {!collapsed && sub.badge && (
                            <span
                              style={{
                                minWidth: 18,
                                padding: '1px 6px',
                                borderRadius: 10,
                                background: c.tones.bad,
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                                textAlign: 'center',
                              }}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 2. Dạng Mục độc lập (Single Top-level Item)
          const active = isItemActive(item);

          return (
            <button
              key={item.id || item.label || index}
              type="button"
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : ''}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = c.bgHover;
                  e.currentTarget.style.color = c.fg;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = c.fgSubtle;
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: 6,
                background: active ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'transparent',
                border: 'none',
                borderRadius: 10,
                color: active ? '#ffffff' : c.fgSubtle,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                fontFamily: fonts.body,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all .16s ease',
                textAlign: 'left',
                outline: 'none',
                boxShadow: active ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: active ? '#ffffff' : c.fgSubtle,
                  background: active ? 'rgba(255,255,255,0.22)' : c.track,
                  borderRadius: 8,
                  transition: 'all .15s',
                }}
              >
                <Icon name={item.icon || 'dot'} size={16} />
              </span>
              {!collapsed && (
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span
                  style={{
                    minWidth: 20,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: c.tones.bad,
                    color: '#fff',
                    fontSize: 10.5,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Profile Footer */}
      <div style={{ padding: '14px', borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: c.bgElev,
            borderRadius: 12,
            border: `1px solid ${c.border}`,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563EB, #0284C7)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontFamily: fonts.body,
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            {actualAvatarLetter}
          </span>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {actualName}
              </div>
              <div style={{ marginTop: 2, fontSize: 11, color: c.fgSubtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                background: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                color: c.fgSubtle,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = c.tones.badDim;
                e.currentTarget.style.color = c.tones.bad;
                e.currentTarget.style.borderColor = c.tones.bad;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = c.fgSubtle;
                e.currentTarget.style.borderColor = c.border;
              }}
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <Icon name="logout" size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}