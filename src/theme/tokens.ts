import type { CategorySlug } from '@/src/types';

export const colors = {
  primary: '#14306B',
  primaryDark: '#0E2252',
  accent: '#F5A623',
  background: '#F6F8FC',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#4B5563',
  border: '#E5E7EB',
  danger: '#B42318',
  success: '#177245',
  warning: '#C2410C',
  info: '#1D4ED8',
  purple: '#6D28D9',
  teal: '#0F766E',
  gray: '#4B5563',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const typography = {
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 27 },
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
};

export const categoryColors: Record<CategorySlug, string> = {
  'product-safety': colors.danger,
  'food-health': colors.success,
  'scams-fraud': colors.warning,
  services: colors.info,
  'travel-transport': colors.purple,
  'consumer-rights': colors.teal,
  other: colors.gray,
};

export const cardShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

export function tint(color: string, alpha = 0.12) {
  const value = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${value}`;
}
