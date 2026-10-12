import { Platform, type TextStyle } from 'react-native';

/**
 * Font families.
 * - sans: SF Pro on iPhone (the system font)
 * - serif: "New York", Apple's system serif – used for Scripture
 * - rounded: SF Pro Rounded – used for playful moments in Memorize
 */
export const fonts = Platform.select({
  ios: { sans: undefined, serif: 'ui-serif', rounded: 'ui-rounded' },
  android: { sans: undefined, serif: 'serif', rounded: undefined },
  default: {
    sans: '-apple-system, system-ui, sans-serif',
    serif: 'ui-serif, "New York", Georgia, serif',
    rounded: 'ui-rounded, system-ui, sans-serif',
  },
}) as { sans?: string; serif?: string; rounded?: string };

/**
 * Type scale modeled on Apple's Dynamic Type sizes.
 * `scripture` styles use the serif face with generous line height.
 */
const scale = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.4 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.36 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.35 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: 0.38 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.41 },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400', letterSpacing: -0.41 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: -0.32 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: -0.08 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0 },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 1.2 },
  scripture: { fontSize: 21, lineHeight: 33, fontWeight: '400', letterSpacing: 0 },
  scriptureLarge: { fontSize: 25, lineHeight: 37, fontWeight: '400', letterSpacing: 0 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof scale;

const serifVariants: TextVariant[] = ['scripture', 'scriptureLarge'];

/** Returns the style for a variant, multiplied by the user's text-size setting. */
export function textStyle(variant: TextVariant, textScale = 1): TextStyle {
  const base = scale[variant];
  return {
    ...base,
    fontSize: Math.round(base.fontSize * textScale),
    lineHeight: Math.round(base.lineHeight * textScale),
    fontFamily: serifVariants.includes(variant) ? fonts.serif : fonts.sans,
    textTransform: variant === 'overline' ? 'uppercase' : undefined,
  };
}
