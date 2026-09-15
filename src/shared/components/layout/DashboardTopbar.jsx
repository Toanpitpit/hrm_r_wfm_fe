import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useAdminTheme } from '../../context/ThemeContext';
import { hexA } from '../../utils/colorUtils';

export default function DashboardTopbar({
  page,
  pageTitles = {},
  consoleLabel,
  defaultDisplayName,
  roleLabel,
  avatarLetter,
  fallbackTitle = 'Dashboard',
  homePath = '/',
}) {
  const navigate = useNavigate();
  const { c, fonts, theme, setTheme, sidebarCollapsed, setSidebarCollapsed } = useAdminTheme();

  // Read stored user profile from localStorage
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  // Derive dynamic user details
  const actualName = user?.fullName || user?.FullName || defaultDisplayName || 'Quản trị viên';
  const actualRole = user?.roleName || user?.RoleName || (user?.storeName ? `Quản lý ${user.storeName}` : roleLabel) || 'Hệ thống';
  
  // Calculate console label based on role if generic console label provided
  let actualConsoleLabel = consoleLabel;
  if (!actualConsoleLabel || actualConsoleLabel === 'Admin Console' || actualConsoleLabel === 'Operations Admin') {
    const roleCode = (user?.role || user?.Role || '').toUpperCase();
    if (roleCode === 'STORE_MANAGER' || roleCode.includes('MANAGER')) actualConsoleLabel = 'Store Manager Console';
    else if (roleCode === 'SHIFT_LEADER' || roleCode.includes('LEADER')) actualConsoleLabel = 'Shift Leader Console';
    else if (roleCode === 'BUSINESS_OWNER' || roleCode.includes('OWNER')) actualConsoleLabel = 'Executive Console';
    else if (roleCode === 'OPERATIONS_ADMIN' || roleCode.includes('ADMIN')) actualConsoleLabel = 'Operations Console';
    else if (roleCode.includes('STAFF') || roleCode.includes('CASHIER') || roleCode.includes('SECURITY')) actualConsoleLabel = 'Employee Portal';
    else actualConsoleLabel = consoleLabel || 'Admin Console';
  }

  // Avatar letter: first letter of full name
  const actualAvatarLetter = actualName
    ? actualName.trim().charAt(0).toUpperCase()
    : (avatarLetter || 'A');

  const pageTitle = pageTitles[page] || fallbackTitle;

  return (
    <header
      style={{
        height: 68,
        flexShrink: 0,
        borderBottom: `1px solid ${c.border}`,
        background: c.bgRaised,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 28px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          width: 38,
          height: 38,
          flexShrink: 0,
          background: c.bgElev,
          border: `1px solid ${c.border}`,
          borderRadius: 10,
          color: c.fgSubtle,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = c.bgHover;
          e.currentTarget.style.color = c.fg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = c.bgElev;
          e.currentTarget.style.color = c.fgSubtle;
        }}
        aria-label="Thu gọn menu"
      >
        <Icon name="menu" size={17} />
      </button>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.fgFaint, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.3 }}>
          <span>{actualConsoleLabel}</span>
          <Icon name="chevron" size={9} />
          <span style={{ color: '#2563EB', fontWeight: 700 }}>{pageTitle}</span>
        </div>
        <div style={{ marginTop: 2, color: c.fg, fontFamily: fonts.body, fontSize: 17, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.3 }}>
          {pageTitle}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => navigate(homePath)}
          style={{
            width: 38,
            height: 38,
            background: c.bgElev,
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            color: c.fgSubtle,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = c.bgHover;
            e.currentTarget.style.color = c.fg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = c.bgElev;
            e.currentTarget.style.color = c.fgSubtle;
          }}
          aria-label="Về trang chủ"
          title="Về trang chủ"
        >
          <Icon name="home" size={17} />
        </button>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            width: 38,
            height: 38,
            background: c.bgElev,
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            color: c.fgSubtle,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = c.bgHover;
            e.currentTarget.style.color = c.fg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = c.bgElev;
            e.currentTarget.style.color = c.fgSubtle;
          }}
          aria-label="Đổi giao diện"
          title={theme === 'light' ? 'Chuyển nền tối' : 'Chuyển nền sáng'}
        >
          <Icon name={theme === 'light' ? 'eye' : 'pulse'} size={17} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 10px 6px 14px',
            background: c.bgElev,
            border: `1px solid ${c.border}`,
            borderRadius: 12,
          }}
        >
          <div style={{ textAlign: 'right', minWidth: 0 }}>
            <div style={{ color: c.fg, fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              {actualName}
            </div>
            <div style={{ marginTop: 1, color: c.fgSubtle, fontSize: 11 }}>
              {actualRole}
            </div>
          </div>
          <span
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563EB, #0284C7)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontFamily: fonts.body,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            {actualAvatarLetter}
          </span>
        </div>
      </div>
    </header>
  );
}
