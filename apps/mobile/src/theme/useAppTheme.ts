import { useColorScheme } from 'react-native';
import { useSettingsStore, type ThemeMode } from './settingsStore';

type GradientPair = readonly [string, string];
type GradientTriple = readonly [string, string, string];

export type Palette = {
  background: string;
  surface: string;
  selectedSurface: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  border: string;
  hairline: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  onPrimary: string;
  success: string;
  warning: string;
  error: string;
  glassSurface: string;
  glassSurfaceStrong: string;
  glassBorder: string;
  glassHighlight: string;
  glow: string;
  auroraBase: GradientTriple;
  auroraOverlay: GradientPair;
  auroraA: string;
  auroraB: string;
  auroraC: string;
  heroGlow: GradientPair;
  buttonGradient: GradientPair;
  sheen: GradientPair;
  cardSheen: GradientPair;
  terminalGradient: GradientTriple;
  terminalLine: string;
};

const palettes: { light: Palette; dark: Palette } = {
  light: {
    background: '#EFF7F3',
    surface: '#FFFFFF',
    selectedSurface: '#DCF3EC',
    text: '#04211B',
    secondaryText: '#4C6B62',
    mutedText: '#6E8C83',
    border: 'rgba(13,148,136,0.16)',
    hairline: 'rgba(4,33,27,0.08)',
    primary: '#0D9488',
    primarySoft: 'rgba(13,148,136,0.10)',
    accent: '#059669',
    accentSoft: 'rgba(5,150,105,0.10)',
    onPrimary: '#FFFFFF',
    success: '#059669',
    warning: '#B45309',
    error: '#E11D48',
    glassSurface: 'rgba(255,255,255,0.62)',
    glassSurfaceStrong: 'rgba(255,255,255,0.82)',
    glassBorder: 'rgba(13,148,136,0.18)',
    glassHighlight: 'rgba(255,255,255,0.85)',
    glow: 'rgba(13,148,136,0.28)',
    auroraBase: ['#EAF6F0', '#E4F3F6', '#F2F8F5'],
    auroraOverlay: ['rgba(239,247,243,0.0)', 'rgba(239,247,243,0.55)'],
    auroraA: 'rgba(52,211,153,0.45)',
    auroraB: 'rgba(45,212,191,0.40)',
    auroraC: 'rgba(34,211,238,0.25)',
    heroGlow: ['rgba(13,148,136,0.16)', 'rgba(13,148,136,0.0)'],
    buttonGradient: ['#059669', '#0D9488'],
    sheen: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.0)'],
    cardSheen: ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.0)'],
    terminalGradient: [
      'rgba(255,255,255,0.88)',
      'rgba(240,250,246,0.9)',
      'rgba(255,255,255,0.88)',
    ],
    terminalLine: 'rgba(4,33,27,0.08)',
  },
  dark: {
    background: '#04110E',
    surface: '#0A1C18',
    selectedSurface: '#0E2A24',
    text: '#ECFDF5',
    secondaryText: '#8FB8AC',
    mutedText: '#5F8A7E',
    border: 'rgba(45,212,191,0.14)',
    hairline: 'rgba(255,255,255,0.08)',
    primary: '#2DD4BF',
    primarySoft: 'rgba(45,212,191,0.14)',
    accent: '#34D399',
    accentSoft: 'rgba(52,211,153,0.14)',
    onPrimary: '#03130F',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#FB7185',
    glassSurface: 'rgba(8,26,22,0.55)',
    glassSurfaceStrong: 'rgba(8,26,22,0.78)',
    glassBorder: 'rgba(110,231,183,0.22)',
    glassHighlight: 'rgba(255,255,255,0.10)',
    glow: 'rgba(45,212,191,0.45)',
    auroraBase: ['#04120F', '#041A16', '#03110E'],
    auroraOverlay: ['rgba(3,17,14,0.0)', 'rgba(3,17,14,0.55)'],
    auroraA: 'rgba(16,185,129,0.55)',
    auroraB: 'rgba(13,148,136,0.55)',
    auroraC: 'rgba(34,211,238,0.30)',
    heroGlow: ['rgba(45,212,191,0.28)', 'rgba(45,212,191,0.0)'],
    buttonGradient: ['#34D399', '#0D9488'],
    sheen: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.0)'],
    cardSheen: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.0)'],
    terminalGradient: [
      'rgba(6,24,20,0.92)',
      'rgba(4,17,14,0.92)',
      'rgba(6,30,25,0.92)',
    ],
    terminalLine: 'rgba(255,255,255,0.08)',
  },
};

export type AppColors = Palette;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
} as const;

export function resolveTheme(
  mode: ThemeMode,
  systemScheme: 'light' | 'dark' | null,
) {
  return mode === 'system' ? (systemScheme ?? 'light') : mode;
}

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const mode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const resolvedTheme = resolveTheme(
    mode,
    systemScheme === 'dark'
      ? 'dark'
      : systemScheme === 'light'
        ? 'light'
        : null,
  );

  return {
    colors: palettes[resolvedTheme],
    mode: resolvedTheme,
    themeMode: mode,
    setThemeMode,
  };
}

export const fonts = {
  primary:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  command:
    "'Menlo', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
} as const;

export type FontKey = keyof typeof fonts;
