import { useColorScheme } from 'react-native';

import { textScaleFor, usePreferences } from '@/store/preferences';

import { palette, type ColorScheme } from './colors';
import { elevation } from './tokens';

/**
 * The one hook every screen uses for styling.
 *
 * const { colors, scheme, shadow, textScale } = useTheme();
 */
export function useTheme() {
  const system = useColorScheme();
  const { textSize } = usePreferences();
  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';

  return {
    scheme,
    isDark: scheme === 'dark',
    colors: palette[scheme],
    shadow: elevation[scheme],
    textScale: textScaleFor[textSize],
  };
}
