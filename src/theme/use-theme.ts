import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { textScaleFor, usePreferences } from '@/store/preferences';

import { palette, type ColorScheme, type ThemeColors } from './colors';
import { themeOverrides } from './themes';
import { elevation } from './tokens';

/**
 * The one hook every screen uses for styling.
 *
 * const { colors, scheme, shadow, textScale } = useTheme();
 */
export function useTheme() {
  const system = useColorScheme();
  const { textSize, themeId } = usePreferences();
  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';
  const colors = useMemo<ThemeColors>(
    () => ({ ...palette[scheme], ...themeOverrides(themeId, scheme) }),
    [scheme, themeId],
  );

  return {
    scheme,
    isDark: scheme === 'dark',
    colors,
    shadow: elevation[scheme],
    textScale: textScaleFor[textSize],
  };
}
