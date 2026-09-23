import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';
import { useAdminTheme } from '../../context/ThemeContext';
import { useToast } from '@/components/ui/toast/ToastProvider';
import authService from '@/modules/auth/services/auth.service';
import ProfileModal from './ProfileModal';
import ChangePasswordModal from './ChangePasswordModal';

export default function DashboardTopbar({
  page,
  pageTitles = {},
  consoleLabel,
  defaultDisplayName,
  roleLabel,
  avatarLetter,
  fallbackTitle = 'Dashboard',
  breadcrumbs,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { c, fonts, theme, setTheme } = useAdminTheme();

  // Dropdown & Modal States
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Read stored user profile from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const reloadProfile = () => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUserProfile(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  };

  const actualName = userProfile?.fullName || userProfile?.FullName || defaultDisplayName || 'Nhân sự';
  const actualRole = userProfile?.roleName || userProfile?.RoleName || (userProfile?.storeName ? `Quản lý ${userProfile.storeName}` : roleLabel) || 'Nhân viên';
  const actualEmail = userProfile?.email || userProfile?.Email || 'user@rwfm.vn';

  const actualAvatarLetter = actualName
    ? actualName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (avatarLetter || 'NV');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await authService.getNotifications();
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
      setNotifications([
        {
          id: 'sys-welcome',
          title: 'Chào mừng đến hệ thống RWFM',
          message: 'Tất cả thông báo thay đổi lịch phân ca, đổi ca và điều động sẽ hiển thị tại đây.',
          type: 'INFO',
          createdAt: new Date().toISOString(),
          isRead: false,
          link: '/employee/my-calendar',
        },
      ]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    toast.success('Đã đăng xuất khỏi hệ thống thành công.');
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc.');
  };

  const handleNotificationClick = (notif) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <>
      <header
        style={{
          height: 64,
          flexShrink: 0,
          borderBottom: `1px solid ${c.border}`,
          background: c.bgCard,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* Left: Back Button + Breadcrumbs / Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Quay lại trang trước"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : c.bgElev,
              border: `1px solid ${c.border}`,
              color: c.fgSubtle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = c.accent;
              e.currentTarget.style.borderColor = c.accent;
              e.currentTarget.style.background = c.accentDim;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = c.fgSubtle;
              e.currentTarget.style.borderColor = c.border;
              e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : c.bgElev;
            }}
          >
            <Icon name="arrow-left" size={15} />
          </button>

          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: c.fgFaint, fontSize: 11 }}>/</span>}
                  {bc.href ? (
                    <a
                      href={bc.href}
                      onClick={(e) => {
                        if (bc.href.startsWith('/')) {
                          e.preventDefault();
                          navigate(bc.href);
                        }
                      }}
                      style={{
                        color: i === breadcrumbs.length - 1 ? c.fg : c.fgSubtle,
                        textDecoration: 'none',
                        fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                      }}
                    >
                      {bc.label}
                    </a>
                  ) : (
                    <span
                      style={{
                        color: i === breadcrumbs.length - 1 ? c.fg : c.fgSubtle,
                        fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                      }}
                    >
                      {bc.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>
              {pageTitles[page] || fallbackTitle}
            </div>
          )}
        </div>

        {/* Right Section: Theme Toggle + Notification Bell + User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Theme Toggle (Sun/Moon icon) */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Chuyển sang chế độ Sáng (Light)' : 'Chuyển sang chế độ Tối (Dark)'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: c.fgSubtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = c.accent;
              e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : c.bgElev;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = c.fgSubtle;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsUserMenuOpen(false);
                if (!isNotifOpen) fetchNotifications();
              }}
              title="Thông báo hệ thống (Nhấn để xem)"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: isNotifOpen ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : c.bgElev) : 'transparent',
                border: 'none',
                color: isNotifOpen ? c.accent : c.fgSubtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon name="bell" size={18} />
            </button>

            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: `1.5px solid ${theme === 'dark' ? '#0A0D0F' : '#FFFFFF'}`,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Notification Panel Popup */}
            {isNotifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: -10,
                  width: 360,
                  maxHeight: 480,
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: `1px solid ${c.borderSub}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>Thông Báo</span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: 'rgba(239,68,68,0.15)',
                          color: '#EF4444',
                        }}
                      >
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: c.accent,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                {/* List Content */}
                <div style={{ overflowY: 'auto', maxHeight: 380 }}>
                  {loadingNotifs ? (
                    <div style={{ padding: 24, textAlign: 'center', color: c.fgSubtle, fontSize: 12.5 }}>
                      Đang tải thông báo...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: c.fgSubtle, fontSize: 13 }}>
                      Không có thông báo mới nào.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: `1px solid ${c.borderSub}`,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          backgroundColor: notif.isRead ? 'transparent' : 'rgba(16,185,129,0.06)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.bgRaised)}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'rgba(16,185,129,0.06)')
                        }
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: notif.type === 'SHIFT_SWAP' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                            color: notif.type === 'SHIFT_SWAP' ? '#3B82F6' : c.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <Icon name={notif.type === 'SHIFT_SWAP' ? 'swap' : 'bell'} size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: notif.isRead ? 600 : 700, color: c.fg }}>
                            {notif.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: c.fgMuted,
                              marginTop: 2,
                              lineHeight: 1.35,
                            }}
                          >
                            {notif.message}
                          </div>
                          <div style={{ fontSize: 11, color: c.fgSubtle, marginTop: 4 }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
                          </div>
                        </div>
                        {!notif.isRead && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: c.accent,
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Circle & Dropdown Menu */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotifOpen(false);
              }}
              title={`${actualName} (${actualRole}) — Nhấn để mở Menu`}
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
                cursor: 'pointer',
                flexShrink: 0,
                border: isUserMenuOpen ? '2px solid #FFFFFF' : '2px solid transparent',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.35)',
                transition: 'all 0.15s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {actualAvatarLetter}
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 260,
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '6px',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {/* User Info Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: `1px solid ${c.borderSub}`,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>{actualName}</div>
                  <div style={{ fontSize: 12, color: c.fgSubtle, marginTop: 2 }}>{actualEmail}</div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge tone="active">{actualRole}</Badge>
                  </div>
                </div>

                {/* Menu Item 1: Profile */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: c.fg,
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.bgRaised)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Icon name="users" size={16} color={c.accent} />
                  <span>Hồ Sơ Cá Nhân</span>
                </button>

                {/* Menu Item 2: Change Password */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsChangePasswordModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: c.fg,
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.bgRaised)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Icon name="lock" size={16} color="#3B82F6" />
                  <span>Đổi Mật Khẩu</span>
                </button>

                <div style={{ height: 1, backgroundColor: c.borderSub, margin: '4px 0' }} />

                {/* Menu Item 3: Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Icon name="close" size={16} color="#EF4444" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={reloadProfile}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
}
