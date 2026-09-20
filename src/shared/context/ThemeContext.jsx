// AdminThemeContext — quản lý token màu (Dark/Light), màu nhấn và mật độ bảng
// cho toàn bộ khu vực Admin. Mọi component con dùng hook useAdminTheme().

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { hexA } from '../utils/colorUtils';

export const fonts = {
  display: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

// --- Bảng màu nền tối Horizon (Horizon Dark Theme) + Chữ TRẮNG ---
export const darkTokens = {
  bg: '#0b0e14',        // Deep Horizon Space Midnight
  bgRaised: '#121721',  // Horizon Raised surface
  bgCard: '#161c27',    // Horizon Card surface
  bgElev: '#1d2433',    // Horizon Elevated Panel
  bgHover: '#252f42',   // Horizon Hover Highlight
  fg: '#ffffff',        // Màu chữ TRẮNG (Crisp White)
  fgMuted: 'rgba(255, 255, 255, 0.88)',
  fgSubtle: 'rgba(255, 255, 255, 0.60)',
  fgFaint: 'rgba(255, 255, 255, 0.38)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderSub: 'rgba(255, 255, 255, 0.07)',
  track: 'rgba(255, 255, 255, 0.08)',
};

// --- Bảng màu nền sáng Sorbet (Sorbet Palette) + Chữ ĐEN ---
export const lightTokens = {
  bg: '#fffaf6',        // Fresh Cream Sorbet Background
  bgRaised: '#ffffff',  // Pure White Sorbet Raised Container
  bgCard: '#ffffff',    // Sorbet Card surface
  bgElev: '#fff0eb',    // Peach Sorbet Elevated Surface
  bgHover: '#ffe4dc',   // Warm Sorbet Hover
  fg: '#000000',        // Màu chữ ĐEN (Pure Crisp Black)
  fgMuted: 'rgba(0, 0, 0, 0.88)',  // Chữ đen đậm rõ nét
  fgSubtle: 'rgba(0, 0, 0, 0.65)', // Chữ đen vừa
  fgFaint: 'rgba(0, 0, 0, 0.45)',  // Chữ đen nhạt
  border: 'rgba(0, 0, 0, 0.12)',
  borderSub: 'rgba(0, 0, 0, 0.06)',
  track: 'rgba(0, 0, 0, 0.07)',
};

// Màu trạng thái (ok / cảnh báo / lỗi / thông tin) + biến thể nền mờ.
export function buildTones(accent) {
  return {
    ok: 'oklch(0.74 0.13 152)',
    okDim: 'oklch(0.74 0.13 152 / 0.16)',
    good: 'oklch(0.74 0.13 152)',
    goodDim: 'oklch(0.74 0.13 152 / 0.16)',
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

export function AdminThemeProvider({ children, defaultTheme = 'light', defaultAccent = '#f97316' }) {
  const [theme, setTheme] = useState(defaultTheme);   // 'light' | 'dark'
  const [accent, setAccent] = useState(defaultAccent);
  const [density, setDensity] = useState('regular');  // 'compact' | 'regular' | 'comfy'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo(() => {
    const isLight = theme === 'light';
    const base = isLight ? lightTokens : darkTokens;
    // Dynamic default accent for Sorbet (Sorbet Coral Orange #f97316) and Horizon (Horizon Cyan #38bdf8)
    const effectiveAccent = (accent === '#f5b14a' || accent === '#f97316')
      ? (isLight ? '#f97316' : '#38bdf8')
      : accent;

    const c = {
      ...base,
      accent: effectiveAccent,
      accentDim: hexA(effectiveAccent, 0.16),
      ink: isLight ? '#ffffff' : '#0b0e14', // contrast text inside primary accent buttons
      tones: buildTones(effectiveAccent),
    };
    return {
      c, fonts,
      theme, setTheme,
      accent, setAccent: setAccent,
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
