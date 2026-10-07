import { Ionicons } from '@expo/vector-icons';
import { TextStyle, ViewStyle } from 'react-native';
import { ExpenseCategory } from './types';

type IoniconName = keyof typeof Ionicons.glyphMap;

export const palette = {
  bgTop: '#07131f',
  bgMid: '#0d1f31',
  bgBase: '#060b14',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  glassFallback: 'rgba(12,17,29,0.48)',
  glassContent: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.15)',
  borderSoft: 'rgba(255,255,255,0.08)',
  text: '#edf7ff',
  textMuted: '#9bb0ce',
  textFaint: '#7b8ca7',
  emerald: '#34d399',
  emeraldSoft: 'rgba(52,211,153,0.14)',
  cyan: '#67e8f9',
  cyanSoft: 'rgba(103,232,249,0.14)',
  crimson: '#fb7185',
  crimsonSoft: 'rgba(251,113,133,0.14)',
  amber: '#f59e0b',
  amberSoft: 'rgba(245,158,11,0.14)',
  violet: '#c084fc',
  blue: '#60a5fa',
  danger: '#f87171',
  dangerSoft: 'rgba(248,113,113,0.14)',
  overlay: 'rgba(6,10,17,0.62)',
  sheet: 'rgba(16,22,35,0.96)',
} as const;

export const gradient = ['#07131f', '#0d1f31', '#060b14'] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: '800', color: palette.text, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '800', color: palette.text },
  h3: { fontSize: 18, fontWeight: '700', color: palette.text },
  body: { fontSize: 15, color: palette.text },
  bodyStrong: { fontSize: 15, fontWeight: '700', color: palette.text },
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: palette.textMuted,
  },
  caption: { fontSize: 12, color: palette.textFaint },
  money: { fontSize: 30, fontWeight: '800', color: palette.text, letterSpacing: -0.5 },
} as const;

export const shadow = (
  color: string,
  opacity = 0.45,
  blurRadius = 16,
  offsetY = 8,
): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: blurRadius,
  shadowOffset: { width: 0, height: offsetY },
  elevation: 8,
});

export const glow = (color: string, blurRadius = 12): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: 0.85,
  shadowRadius: blurRadius,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6,
});

export const categoryMeta: Record<
  ExpenseCategory,
  { color: string; soft: string; icon: IoniconName }
> = {
  Food: { color: palette.amber, soft: palette.amberSoft, icon: 'fast-food-outline' },
  Utilities: { color: palette.emerald, soft: palette.emeraldSoft, icon: 'flash-outline' },
  Transport: { color: palette.blue, soft: 'rgba(96,165,250,0.14)', icon: 'car-outline' },
  Leisure: { color: palette.violet, soft: 'rgba(192,132,252,0.14)', icon: 'game-controller-outline' },
  Other: { color: palette.crimson, soft: palette.crimsonSoft, icon: 'pricetag-outline' },
};

export const typeScale: Record<string, TextStyle> = typography;
