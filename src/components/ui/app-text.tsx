import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/use-theme';
import type { ThemeColors } from '@/theme/colors';
import { textStyle, type TextVariant } from '@/theme/typography';

type ColorKey = {
  [K in keyof ThemeColors]: ThemeColors[K] extends string ? K : never;
}[keyof ThemeColors];

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  /** A palette key like "textSecondary" or "gold". Defaults to "text". */
  color?: ColorKey;
  align?: 'left' | 'center' | 'right';
  weight?: '400' | '500' | '600' | '700';
};

/**
 * All text in the app goes through this component so it follows the
 * type scale, the text-size setting, and light/dark colors.
 */
export function AppText({
  variant = 'body',
  color = 'text',
  align,
  weight,
  style,
  ...rest
}: AppTextProps) {
  const { colors, textScale } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      style={[
        textStyle(variant, textScale),
        { color: colors[color] },
        align && { textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
      {...rest}
    />
  );
}
