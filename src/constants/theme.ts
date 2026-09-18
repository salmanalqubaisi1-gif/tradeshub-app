/**
 * Trades Hub Design System
 * Central source of truth for colors, typography, spacing, radii and layout.
 */

import '@/global.css';
import { Platform } from 'react-native';

export const Brand = {
  navy950: '#08111C',
  navy900: '#0B1623',
  navy850: '#0F1C2B',
  navy800: '#152536',
  navy750: '#1B2C3F',

  gold500: '#D2B95B',
  gold600: '#CAAE53',

  white: '#FFFFFF',
  text: '#F5F7FA',
  textSecondary: '#A9B3BF',
  textMuted: '#7C8796',

  border: '#26394C',
  borderStrong: '#34495E',

  success: '#62B77A',
  warning: '#D6A84B',
  danger: '#E56B6B',
  info: '#4D9DE0',
} as const;

export const RoleColors = {
  tradesperson: '#D2B95B',
  contractor: '#4D9DE0',
  supplier: '#E89245',
  homeowner: '#62B77A',
} as const;

export const Colors = {
  light: {
    text: '#0B1623',
    background: '#F5F7FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E9EEF4',
    textSecondary: '#526171',
    border: '#D5DEE7',
    primary: Brand.gold500,
    success: Brand.success,
    warning: Brand.warning,
    danger: Brand.danger,
    info: Brand.info,
  },

  dark: {
    text: Brand.text,
    background: Brand.navy900,
    backgroundElement: Brand.navy800,
    backgroundSelected: Brand.navy750,
    textSecondary: Brand.textSecondary,
    border: Brand.border,
    primary: Brand.gold500,
    success: Brand.success,
    warning: Brand.warning,
    danger: Brand.danger,
    info: Brand.info,
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * FONT SYSTEM
 *
 * Headings / display:
 *   Manrope 700 / 800
 *
 * Body / UI:
 *   Inter 400 / 500 / 600 / 700
 *
 * These names match the @expo-google-fonts packages used in fonts.ts.
 */
export const FontFamily = {
  display: 'Manrope_800ExtraBold',
  heading: 'Manrope_700Bold',

  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',

  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    default: 'monospace',
  })!,
} as const;

/**
 * Backward compatibility for files already importing Fonts.sans / rounded / mono.
 */
export const Fonts = {
  display: FontFamily.display,
  body: FontFamily.body,
  sans: FontFamily.body,
  rounded: FontFamily.body,
  serif: FontFamily.body,
  mono: FontFamily.mono,
} as const;

export const FontSize = {
  caption: 10,
  label: 11,
  sm: 12,
  body: 14,
  bodyLg: 16,
  cardTitle: 18,
  h3: 22,
  h2: 28,
  h1: 36,
  hero: 46,
} as const;

export const LetterSpacing = {
  tight: -0.4,
  normal: 0,
  label: 0.5,
  eyebrow: 1.1,
} as const;

export const LineHeight = {
  caption: 14,
  body: 21,
  bodyLg: 24,
  cardTitle: 23,
  h3: 27,
  h2: 34,
  h1: 42,
  hero: 52,
} as const;

export const Typography = {
  hero: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.hero,
    lineHeight: LineHeight.hero,
    letterSpacing: LetterSpacing.tight,
  },

  h1: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.h1,
    lineHeight: LineHeight.h1,
    letterSpacing: LetterSpacing.tight,
  },

  h2: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.h2,
    lineHeight: LineHeight.h2,
  },

  h3: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.h3,
    lineHeight: LineHeight.h3,
  },

  cardTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.cardTitle,
    lineHeight: LineHeight.cardTitle,
  },

  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
  },

  bodyMedium: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
  },

  bodySemiBold: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
  },

  button: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
  },

  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.label,
    letterSpacing: LetterSpacing.label,
  },

  eyebrow: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    letterSpacing: LetterSpacing.eyebrow,
  },

  caption: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    lineHeight: LineHeight.caption,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 64,
} as const;

export const Radius = {
  xs: 4,
  sm: 7,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const ControlHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

export const Layout = {
  pagePadding: 24,
  mobilePagePadding: 16,
  sectionGap: 24,
  cardGap: 14,
  maxContentWidth: 1100,
  authCardWidth: 440,
  sidebarWidth: 280,
} as const;

export const Surfaces = {
  page: Brand.navy900,
  card: Brand.navy800,
  cardRaised: Brand.navy750,
  input: Brand.navy850,
  border: Brand.border,
  divider: Brand.border,
} as const;

export const BottomTabInset =
  Platform.select({ ios: 50, android: 80 }) ?? 0;

export const MaxContentWidth = Layout.maxContentWidth;
