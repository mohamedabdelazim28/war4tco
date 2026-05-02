import { Platform } from 'react-native';

export const colors = {
  // Premium dark luxury palette – powerful contrast
  primary: '#C41E3A',
  secondary: '#8B0000',
  background: '#0D1117',
  surface: '#161B22',
  card: '#161B22',
  text: '#FFFFFF',
  textSecondary: '#8B949E',
  muted: '#6E7681',
  border: '#30363D',
  success: '#2EA043',
  danger: '#C41E3A',
  error: '#C41E3A',
  lightAccent: '#FFE4E6',
  // Black & white – card border rule: dark cards = red, light cards = black
  white: '#FFFFFF',
  black: '#000000',
  textOnLight: '#0D1117',
  textOnDark: '#FFFFFF',
  borderCardDark: '#C41E3A',
  borderCardLight: '#000000',
  // Aliases for existing component references
  backgroundDark: '#0D1117',
  surfaceDark: '#161B22',
  surfaceDarkLight: '#21262D',
  gray: '#8B949E',
  green: '#2EA043',
  red: '#C41E3A',
  emerald: '#2EA043',
  orange: '#C41E3A',
  indigo: '#8B0000',
  purple: '#8B0000',

  // ─── Cartoon Store palette ───
  cartoon: {
    red: '#FF4D5A',
    redLight: '#FF7A83',
    cream: '#FFF4F4',
    creamDark: '#FFE8E8',
    mint: '#7EEAB3',
    mintBg: '#E8FFF3',
    blue: '#6EC6FF',
    blueBg: '#E8F4FF',
    yellow: '#FFD66B',
    yellowBg: '#FFF8E8',
    purple: '#C4A1FF',
    purpleBg: '#F3ECFF',
    orange: '#FFB067',
    orangeBg: '#FFF2E8',
    charcoal: '#1E1E1E',
    gray: '#8E8E8E',
    lightGray: '#F7F0F0',
  },
  RecentActivityColors : {
    red: '#3fc5fc ',
    WarmPeach: '#fa4186',
    SoftRoseBeige: '#b942fc',
    // purple: '#C4A1FF',
    // orange: '#FFB067',
    // charcoal: '#1E1E1E',
    // gray: '#8E8E8E',
  } ,
} as const;



export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
} as const;

export const typography = {
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  // Backward compatibility for existing typography.fontSize / lineHeight usage
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
} as const;

const shadowCard = Platform.select({
  android: { elevation: 6 },
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  default: { elevation: 6 },
}) as { elevation?: number; shadowColor?: string; shadowOffset?: { width: number; height: number }; shadowOpacity?: number; shadowRadius?: number };

export const shadow = {
  card: shadowCard,
} as const;

export const layout = {
  tabBarHeight: 80,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
  layout,
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Typography = typeof typography;
export type Shadow = typeof shadow;
export type Layout = typeof layout;
export type Theme = typeof theme;
