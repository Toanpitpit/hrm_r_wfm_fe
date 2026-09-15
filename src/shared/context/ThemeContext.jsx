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
  display: '"Inter", "DM Sans", system-ui, -apple-system, sans-serif',
  body: '"Inter", "DM Sans", system-ui, -apple-system, sans-serif',
};

// --- Bộ token nền tối (Modern Deep Navy Pro) ---
export const darkTokens = {
  bg: '#0B132B',
  bgRaised: '#111C44',
  bgCard: '#111C44',
  bgElev: '#1B2559',
  bgHover: '#1F2E6F',
  fg: '#FFFFFF',
  fgMuted: 'rgba(255,255,255,0.88)',
  fgSubtle: 'rgba(255,255,255,0.60)',
  fgFaint: 'rgba(255,255,255,0.40)',
  border: 'rgba(255,255,255,0.09)',
  borderSub: 'rgba(255,255,255,0.05)',
  track: 'rgba(255,255,255,0.08)',
};

// --- Bộ token nền sáng (Clean Tech SaaS) ---
export const lightTokens = {
  bg: '#F4F7FE',
  bgRaised: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgElev: '#F8FAFC',
  bgHover: '#EDF2F7',
  fg: '#1B2559',
  fgMuted: '#2B3674',
  fgSubtle: '#707EAE',
  fgFaint: '#A3AED0',
  border: 'rgba(15, 23, 42, 0.08)',
  borderSub: 'rgba(15, 23, 42, 0.04)',
  track: 'rgba(15, 23, 42, 0.06)',
};

// Màu trạng thái (ok / cảnh báo / lỗi / thông tin) + biến thể nền mờ.
export function buildTones(accent) {
  return {
    ok: '#10B981',
    okDim: 'rgba(16, 185, 129, 0.15)',
    good: '#10B981',
    goodDim: 'rgba(16, 185, 129, 0.15)',
    bad: '#EF4444',
    badDim: 'rgba(239, 68, 68, 0.15)',
    warn: '#F59E0B',
    warnDim: 'rgba(245, 158, 11, 0.15)',
    info: '#0284C7',
    infoDim: 'rgba(2, 132, 199, 0.15)',
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

export function AdminThemeProvider({ children, defaultTheme = 'dark', defaultAccent = '#2563EB' }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [accent, setAccent] = useState(defaultAccent);
  const [density, setDensity] = useState('regular');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo(() => {
    const base = theme === 'light' ? lightTokens : darkTokens;
    const c = {
      ...base,
      accent,
      accentDim: hexA(accent, 0.10),
      ink: '#ffffff',
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
