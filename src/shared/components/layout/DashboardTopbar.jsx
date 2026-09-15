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
    if (roleCode === 'STORE_MANAGER') actualConsoleLabel = 'Store Manager Console';
    else if (roleCode === 'BUSINESS_OWNER') actualConsoleLabel = 'Executive Console';
    else if (roleCode === 'OPERATIONS_ADMIN') actualConsoleLabel = 'Operations Console';
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
        height: 84,
        flexShrink: 0,
        borderBottom: `1px solid ${c.border}`,
        background: hexA(c.bgRaised, 0.86),
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      }}
    >
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{ width: 42, height: 42, flexShrink: 0, background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 9, color: c.fgSubtle, display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', cursor: 'pointer' }}
        aria-label="Thu gọn menu"
      >
        <Icon name="menu" size={17} />
      </button>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: c.fgFaint, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          <span>{actualConsoleLabel}</span>
          <Icon name="chevron" size={10} />
          <span style={{ color: c.accent }}>{pageTitle}</span>
        </div>
        <div style={{ marginTop: 4, color: c.fg, fontFamily: fonts.display, fontSize: 23, lineHeight: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {pageTitle}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => navigate(homePath)}
          style={{ width: 40, height: 40, background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, color: c.fgSubtle, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          aria-label="Về trang chủ"
          title="Về trang chủ"
        >
          <Icon name="home" size={17} />
        </button>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{ width: 40, height: 40, background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, color: c.fgSubtle, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          aria-label="Đổi giao diện"
          title={theme === 'light' ? 'Chuyển nền tối' : 'Chuyển nền sáng'}
        >
          <Icon name={theme === 'light' ? 'eye' : 'pulse'} size={17} />
        </button>

        <div style={{ minWidth: 140, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 10px', background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 9 }}>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <div style={{ color: c.fg, fontSize: 10, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{actualName}</div>
            <div style={{ marginTop: 0.5, color: c.fgFaint, fontSize: 8.5 }}>{actualRole}</div>
          </div>
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 6, background: c.accentDim, border: `1px solid ${c.accent}`, color: c.accent, display: 'grid', placeItems: 'center', fontFamily: fonts.display, fontSize: 12 }}>
            {actualAvatarLetter}
          </span>
        </div>
      </div>
    </header>
  );
}
