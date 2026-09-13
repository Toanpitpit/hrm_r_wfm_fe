// AdminThemeContext — quản lý token màu (Dark/Light), màu nhấn và mật độ bảng
// cho toàn bộ khu vực Admin. Mọi component con dùng hook useAdminTheme().
//
// Cách dùng:
//   <AdminThemeProvider>
//     <AdminApp />
//   </AdminThemeProvider>
//
//   const { c, fonts } = useAdminTheme();  // c = bộ token màu đang áp dụng

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { hexA } from '../utils/colorUtils';

export const fonts = {
  display: '"Anton", "Bebas Neue", "Montserrat", system-ui, -apple-system, sans-serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
};

// --- Bộ token nền tối (Cinematic Dark) ---
export const darkTokens = {
  bg: '#0a0908',
  bgRaised: '#14110d',
  bgCard: '#16130e',
  bgElev: '#1c1812',
  bgHover: '#221d15',
  fg: '#ffffff',
  fgMuted: 'rgba(255,255,255,0.82)',
  fgSubtle: 'rgba(255,255,255,0.52)',
  fgFaint: 'rgba(255,255,255,0.34)',
  border: 'rgba(255,255,255,0.10)',
  borderSub: 'rgba(255,255,255,0.06)',
  track: 'rgba(255,255,255,0.07)',
};

// --- Bộ token nền sáng (Warm paper) ---
export const lightTokens = {
  bg: '#f3f0ea',
  bgRaised: '#ffffff',
  bgCard: '#ffffff',
  bgElev: '#efeae1',
  bgHover: '#f4f0e8',
  fg: '#1b1813',
  fgMuted: 'rgba(27,24,19,0.80)',
  fgSubtle: 'rgba(27,24,19,0.55)',
  fgFaint: 'rgba(27,24,19,0.40)',
  border: 'rgba(27,24,19,0.13)',
  borderSub: 'rgba(27,24,19,0.07)',
  track: 'rgba(27,24,19,0.09)',
};

// Màu trạng thái (ok / cảnh báo / lỗi / thông tin) + biến thể nền mờ.
export function buildTones(accent) {
  return {
    ok: 'oklch(0.74 0.13 152)',
    okDim: 'oklch(0.74 0.13 152 / 0.16)',
    bad: 'oklch(0.66 0.17 27)',
    badDim: 'oklch(0.66 0.17 27 / 0.16)',
    warn: accent,
    warnDim: hexA(accent, 0.16),
    info: 'oklch(0.72 0.12 240)',
    infoDim: 'oklch(0.72 0.12 240 / 0.16)',
  };
}

// Bảng phối tone cho Badge: tên tone -> [màu chữ, màu nền].
export function badgeToneMap(c) {
  const t = c.tones;
  return {
    ok: [t.ok, t.okDim], active: [t.ok, t.okDim], paid: [t.ok, t.okDim], approved: [t.ok, t.okDim],
    bad: [t.bad, t.badDim], banned: [t.bad, t.badDim], closed: [t.bad, t.badDim], rejected: [t.bad, t.badDim],
    warn: [t.warn, t.warnDim], pending: [t.warn, t.warnDim], maintenance: [t.warn, t.warnDim], paused: [t.warn, t.warnDim],
    info: [t.info, t.infoDim], refunded: [t.info, t.infoDim],
    neutral: [c.fgSubtle, c.track], inactive: [c.fgSubtle, c.track], expired: [c.fgSubtle, c.track],
  };
}

const AdminThemeContext = createContext(null);

export function AdminThemeProvider({ children, defaultTheme = 'light', defaultAccent = '#f5b14a' }) {
  const [theme, setTheme] = useState(defaultTheme);   // 'light' | 'dark'
  const [accent, setAccent] = useState(defaultAccent);
  const [density, setDensity] = useState('regular');  // 'compact' | 'regular' | 'comfy'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo(() => {
    const base = theme === 'light' ? lightTokens : darkTokens;
    const c = {
      ...base,
      accent,
      accentDim: hexA(accent, 0.16),
      ink: '#0a0908', // màu chữ cố định trên nền màu nhấn
      tones: buildTones(accent),
    };
    return {
      c, fonts,
      theme, setTheme,
      accent, setAccent,
      density, setDensity,
      sidebarCollapsed, setSidebarCollapsed,
    };
  }, [theme, accent, density, sidebarCollapsed]);

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme phải được dùng bên trong <AdminThemeProvider>.');
  return ctx;
}
