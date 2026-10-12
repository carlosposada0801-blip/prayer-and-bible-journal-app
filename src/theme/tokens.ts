import type { ViewStyle } from 'react-native';

import type { ColorScheme } from './colors';

/** 4-point spacing grid. Screens use `space.lg` (20) as their side margin. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

/** Corner radii. Cards use `lg` with iOS "continuous" (squircle) curves. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

/**
 * Soft, layered shadows in light mode. In dark mode shadows disappear
 * against the background, so we use a hairline border instead.
 */
export const elevation: Record<ColorScheme, Record<'low' | 'medium', ViewStyle>> = {
  light: {
    low: { boxShadow: '0 1px 2px rgba(28, 35, 51, 0.04), 0 4px 14px rgba(28, 35, 51, 0.05)' },
    medium: { boxShadow: '0 2px 4px rgba(28, 35, 51, 0.05), 0 12px 32px rgba(28, 35, 51, 0.09)' },
  },
  dark: {
    low: { borderWidth: 1, borderColor: 'rgba(243, 238, 227, 0.06)' },
    medium: { borderWidth: 1, borderColor: 'rgba(243, 238, 227, 0.09)' },
  },
};

/** Spring presets for Reanimated, tuned to feel like UIKit. */
export const springs = {
  press: { damping: 18, stiffness: 320, mass: 0.6 },
  gentle: { damping: 20, stiffness: 180, mass: 1 },
  bouncy: { damping: 11, stiffness: 220, mass: 0.8 },
} as const;
