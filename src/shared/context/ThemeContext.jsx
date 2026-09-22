// AdminThemeContext — RWFM Modern Tech Mint/Teal Design System Tokens (Dark & Light)
// Cung cấp token màu, typography, sidebar và dark/light theme chuẩn theo tông màu RWFM Mint/Teal SaaS hiện đại.

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { hexA } from '../utils/colorUtils';

export const fonts = {
  display: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

// ─── Sidebar Tokens cho Light Mode (Trắng sáng tinh tế, thanh điều hướng nổi bật) ───
export const lightSidebarTokens = {
  bg: '#FFFFFF',
  bgHover: 'rgba(13, 148, 136, 0.08)',
  bgActive: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
  activeBorder: '1px solid transparent',
  activeText: '#FFFFFF',
  activeIcon: '#FFFFFF',
  activeBadgeBg: 'rgba(255, 255, 255, 0.25)',
  activeBadgeText: '#FFFFFF',
  fg: '#0F172A',
  fgSubtle: '#475569',
  fgFaint: '#94A3B8',
  border: '#E8EFEA',
  borderHeader: '#EEF4F1',
  track: 'rgba(13, 148, 136, 0.06)',
  categoryLabel: '#0D9488',
  brandBadgeBg: '#FFFFFF',
  brandBadgeBorder: '1px solid #CCFBF1',
  brandBadgeShadow: '0 3px 12px rgba(13, 148, 136, 0.15)',
  brandText: '#0F172A',
  footerBg: '#F4FAF8',
  footerBorder: '#E8EFEA',
  hamburgerColor: '#64748B',
  hamburgerHoverColor: '#0D9488',
  hamburgerHoverBg: 'rgba(13, 148, 136, 0.08)',
};

// ─── Sidebar Tokens cho Dark Mode (Tối đồng bộ toàn diện) ───
export const darkSidebarTokens = {
  bg: '#080D10',
  bgHover: 'rgba(255, 255, 255, 0.06)',
  bgActive: 'rgba(20, 184, 166, 0.20)',
  activeBorder: '1px solid rgba(20, 184, 166, 0.40)',
  activeText: '#2DD4BF',
  activeIcon: '#2DD4BF',
  activeBadgeBg: 'rgba(20, 184, 166, 0.25)',
  activeBadgeText: '#2DD4BF',
  fg: '#FFFFFF',
  fgSubtle: '#8A99AD',
  fgFaint: 'rgba(255, 255, 255, 0.28)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHeader: 'rgba(255, 255, 255, 0.06)',
  track: 'rgba(255, 255, 255, 0.08)',
  categoryLabel: 'rgba(255, 255, 255, 0.40)',
  brandBadgeBg: '#111C22',
  brandBadgeBorder: '1px solid rgba(255, 255, 255, 0.10)',
  brandBadgeShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
  brandText: '#FFFFFF',
  footerBg: '#0B1217',
  footerBorder: 'rgba(255, 255, 255, 0.08)',
  hamburgerColor: '#8A99AD',
  hamburgerHoverColor: '#2DD4BF',
  hamburgerHoverBg: 'rgba(255, 255, 255, 0.08)',
};

// ─── Light Mode — RWFM Clean Mint Slate White ──────────────────────────────
export const lightTokens = {
  bg: '#F4FAF8',           // Nền xám ngọc sáng tươi mát
  bgRaised: '#FFFFFF',     // Nền container
  bgCard: '#FFFFFF',       // Thẻ card trắng tinh
  bgElev: '#EBF7F4',       // Bề mặt nâng cao
  bgHover: '#E2F3EE',      // Hover
  fg: '#0F172A',           // Màu chữ đậm nét
  fgMuted: 'rgba(15, 23, 42, 0.88)',
  fgSubtle: '#475569',     // Màu chữ phụ
  fgFaint: '#94A3B8',      // Chữ mờ
  border: '#E2E8F0',       // Viền thẻ
  borderSub: '#EEF5F2',
  track: 'rgba(13, 148, 136, 0.06)',
};

// ─── Dark Mode — Deep Midnight Slate Black (Tối toàn diện) ─────────────────
export const darkTokens = {
  bg: '#000000ff',           // Nền đen sâu thẳm
  bgRaised: '#080808ff',     // Bề mặt raised
  bgCard: '#080808ff',       // Thẻ card đen nhạt
  bgElev: '#080808ff',       // Panel elevated
  bgHover: '#101010ff',      // Hover highlight
  fg: '#F8FAFC',           // Chữ trắng tinh
  fgMuted: 'rgba(255, 255, 255, 0.90)',
  fgSubtle: '#94A3B8',     // Chữ phụ sáng rõ
  fgFaint: 'rgba(255, 255, 255, 0.28)',
  border: '#1D2B35',       // Viền thẻ tối
  borderSub: 'rgba(255, 255, 255, 0.07)',
  track: 'rgba(255, 255, 255, 0.06)',
};

// ─── Status Tones (RWFM Mint & Teal Palette) ────────────────────────────────
export function buildTones() {
  return {
    ok: '#0D9488',
    okDim: 'rgba(13, 148, 136, 0.14)',
    good: '#0D9488',
    goodDim: 'rgba(13, 148, 136, 0.14)',
    bad: '#EF4444',
    badDim: 'rgba(239, 68, 68, 0.14)',
    warn: '#F59E0B',
    warnDim: 'rgba(245, 158, 11, 0.14)',
    info: '#06B6D4',
    infoDim: 'rgba(6, 182, 212, 0.14)',
    blue: '#3B82F6',
    blueDim: 'rgba(59, 130, 246, 0.14)',
    purple: '#8B5CF6',
    purpleDim: 'rgba(139, 92, 246, 0.14)',
  };
}

// ─── Badge Tone Mapping ────────────────────────────────────────────────────
export function badgeToneMap(c) {
  const t = c.tones;
  return {
    ok: [t.ok, t.okDim], active: [t.ok, t.okDim], paid: [t.ok, t.okDim], approved: [t.ok, t.okDim],
    bad: [t.bad, t.badDim], banned: [t.bad, t.badDim], closed: [t.bad, t.badDim], rejected: [t.bad, t.badDim],
    warn: [t.warn, t.warnDim], pending: [t.warn, t.warnDim], maintenance: [t.warn, t.warnDim], paused: [t.warn, t.warnDim],
    info: [t.info, t.infoDim], refunded: [t.info, t.infoDim],
    blue: [t.blue, t.blueDim],
    purple: [t.purple, t.purpleDim],
    neutral: [c.fgSubtle, c.track], inactive: [c.fgSubtle, c.track], expired: [c.fgSubtle, c.track],
  };
}

const AdminThemeContext = createContext(null);

export function AdminThemeProvider({ children, defaultTheme = 'light', defaultAccent = '#0D9488' }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('app_theme') || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('app_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const [accent, setAccent] = useState(defaultAccent);
  const [density, setDensity] = useState('regular');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo(() => {
    const isLight = theme === 'light';
    const base = isLight ? lightTokens : darkTokens;
    const effectiveAccent = '#0D9488'; // RWFM Modern Teal
    const currentSidebar = isLight ? lightSidebarTokens : darkSidebarTokens;

    const c = {
      ...base,
      accent: effectiveAccent,
      accentHover: '#0F766E',
      accentDim: hexA(effectiveAccent, 0.14),
      accentGrad: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
      primary: '#0D9488',
      primaryHover: '#0F766E',
      primaryDark: '#115E59',
      primaryLight: '#2DD4BF',
      ink: '#FFFFFF',
      sidebar: currentSidebar,
      tones: buildTones(effectiveAccent),
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
