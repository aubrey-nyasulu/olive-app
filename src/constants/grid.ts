/**
 * Standard 4-Grid System for Layout (Spacing, Margin, Padding, Gap, Sizing, Radii)
 * Standard 2-Grid System for Delicate Entities (Typography, Line Heights, Small Icons)
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  giant: 64,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 32,
  full: 9999,
} as const;

export const fontSize = {
  micro: 10,
  caption: 12,
  bodySmall: 14,
  body: 16,
  titleSmall: 18,
  title: 20,
  titleLarge: 22,
  headingSmall: 24,
  heading: 28,
  display: 32,
} as const;

export const lineHeight = {
  micro: 14,
  caption: 16,
  bodySmall: 20,
  body: 24,
  titleSmall: 24,
  title: 26,
  titleLarge: 28,
  headingSmall: 30,
  heading: 34,
  display: 38,
} as const;
