/**
 * Abide color palette.
 *
 * Warm, peaceful tones: soft cream, warm gold, deep navy and sage.
 * Every screen reads colors through `useTheme()` so light and dark mode
 * stay in sync automatically. Add new colors to BOTH palettes.
 */

type Gradient = readonly [string, string];

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textOnDark: string;
  primary: string;
  onPrimary: string;
  gold: string;
  goldSoft: string;
  sage: string;
  sageSoft: string;
  rose: string;
  roseSoft: string;
  sky: string;
  skySoft: string;
  separator: string;
  border: string;
  gradientVerse: Gradient;
  gradientDawn: Gradient;
  gradientSage: Gradient;
};

export type ColorScheme = 'light' | 'dark';

export const palette: Record<ColorScheme, ThemeColors> = {
  light: {
    // Surfaces
    background: '#FAF7F0', // soft cream page background
    surface: '#FFFFFF', // cards
    surfaceMuted: '#F3EEE3', // inputs, chips, quiet fills
    surfaceRaised: '#FFFFFF',

    // Text
    text: '#1C2333', // deep navy ink
    textSecondary: '#5F6675',
    textTertiary: '#9A9EA8',
    textOnDark: '#FBF6EA',

    // Brand
    primary: '#24324F', // deep navy – main buttons, tab tint
    onPrimary: '#FBF6EA',
    gold: '#C49A3C',
    goldSoft: '#F5EAD0',
    sage: '#6F8F75',
    sageSoft: '#E3ECDF',
    rose: '#D46F62', // hearts / lives
    roseSoft: '#F8E3DF',
    sky: '#5B7FB0',
    skySoft: '#E2EAF4',

    // Lines
    separator: 'rgba(28, 35, 51, 0.08)',
    border: 'rgba(28, 35, 51, 0.06)',

    // Feature gradients (top-left → bottom-right)
    gradientVerse: ['#2B3B5E', '#1C2742'],
    gradientDawn: ['#FFF7E6', '#F7E6C4'],
    gradientSage: ['#EEF3EA', '#DCE7D8'],
  },
  dark: {
    background: '#0E131D',
    surface: '#171E2B',
    surfaceMuted: '#1F2736',
    surfaceRaised: '#222B3B',

    text: '#F3EEE3',
    textSecondary: '#A9AEBA',
    textTertiary: '#6E7584',
    textOnDark: '#FBF6EA',

    primary: '#E2BE6A', // gold reads better than navy on dark
    onPrimary: '#1A1406',
    gold: '#E2BE6A',
    goldSoft: 'rgba(226, 190, 106, 0.14)',
    sage: '#9DBAA1',
    sageSoft: 'rgba(157, 186, 161, 0.14)',
    rose: '#E89186',
    roseSoft: 'rgba(232, 145, 134, 0.14)',
    sky: '#8FB0DB',
    skySoft: 'rgba(143, 176, 219, 0.14)',

    separator: 'rgba(243, 238, 227, 0.08)',
    border: 'rgba(243, 238, 227, 0.07)',

    gradientVerse: ['#232E4A', '#121827'],
    gradientDawn: ['#2A2516', '#1B1910'],
    gradientSage: ['#1B241E', '#141B16'],
  },
};
