import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light-clean' | 'deep-space-blue' | 'cyber-dark';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  borderCard: string;
  borderSubtle: string;
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
  radialGlow: string;
  navBg: string;
  gridLine: string;
}

export const THEME_PALETTES: Record<ThemeMode, ThemeColors> = {
  'light-clean': {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgCard: '#FFFFFF',
    borderCard: '#E2E8F0',
    borderSubtle: '#CBD5E1',
    accentPrimary: '#0284C7',
    accentSecondary: '#7C3AED',
    accentGlow: 'rgba(2, 132, 199, 0.15)',
    scrollbarTrack: '#F8FAFC',
    scrollbarThumb: '#CBD5E1',
    radialGlow: 'rgba(2, 132, 199, 0.08)',
    navBg: 'rgba(255, 255, 255, 0.96)',
    gridLine: 'rgba(15, 23, 42, 0.05)',
  },
  'deep-space-blue': {
    bgPrimary: '#070A1E',
    bgSecondary: '#0B0F2F',
    bgCard: 'rgba(14, 18, 54, 0.85)',
    borderCard: 'rgba(255, 255, 255, 0.12)',
    borderSubtle: 'rgba(71, 85, 105, 0.5)',
    accentPrimary: '#00D4FF',
    accentSecondary: '#A855F7',
    accentGlow: 'rgba(59, 66, 212, 0.35)',
    scrollbarTrack: '#070A1E',
    scrollbarThumb: '#1E2568',
    radialGlow: 'rgba(59, 66, 212, 0.28)',
    navBg: 'rgba(11, 15, 47, 0.92)',
    gridLine: 'rgba(255, 255, 255, 0.04)',
  },
  'cyber-dark': {
    bgPrimary: '#05070B',
    bgSecondary: '#0A0D14',
    bgCard: 'rgba(13, 17, 26, 0.88)',
    borderCard: 'rgba(51, 65, 85, 0.65)',
    borderSubtle: 'rgba(51, 65, 85, 0.5)',
    accentPrimary: '#00F0FF',
    accentSecondary: '#10B981',
    accentGlow: 'rgba(0, 240, 255, 0.28)',
    scrollbarTrack: '#05070B',
    scrollbarThumb: '#1E293B',
    radialGlow: 'rgba(0, 240, 255, 0.14)',
    navBg: 'rgba(10, 13, 20, 0.94)',
    gridLine: 'rgba(0, 240, 255, 0.035)',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSpaceCyberTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'voiceflow_app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light-clean' || stored === 'cyber-dark' || stored === 'deep-space-blue') {
        return stored;
      }
    }
    return 'cyber-dark';
  });

  const applyThemeVariables = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const palette = THEME_PALETTES[mode] || THEME_PALETTES['cyber-dark'];

    root.setAttribute('data-theme', mode);
    root.style.setProperty('--color-bg-primary', palette.bgPrimary);
    root.style.setProperty('--color-bg-secondary', palette.bgSecondary);
    root.style.setProperty('--color-bg-card', palette.bgCard);
    root.style.setProperty('--color-border-card', palette.borderCard);
    root.style.setProperty('--color-border-subtle', palette.borderSubtle);
    root.style.setProperty('--color-accent-primary', palette.accentPrimary);
    root.style.setProperty('--color-accent-secondary', palette.accentSecondary);
    root.style.setProperty('--color-accent-glow', palette.accentGlow);
    root.style.setProperty('--color-scrollbar-track', palette.scrollbarTrack);
    root.style.setProperty('--color-scrollbar-thumb', palette.scrollbarThumb);
    root.style.setProperty('--color-radial-glow', palette.radialGlow);
    root.style.setProperty('--color-nav-bg', palette.navBg);
    root.style.setProperty('--color-grid-line', palette.gridLine);
  };

  useEffect(() => {
    applyThemeVariables(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleSpaceCyberTheme = () => {
    setThemeState((prev) => (prev === 'cyber-dark' ? 'deep-space-blue' : 'cyber-dark'));
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'cyber-dark') return 'deep-space-blue';
      if (prev === 'deep-space-blue') return 'light-clean';
      return 'cyber-dark';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        toggleSpaceCyberTheme,
        colors: THEME_PALETTES[theme] || THEME_PALETTES['cyber-dark'],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
