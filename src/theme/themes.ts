import type { ColorScheme, ThemeColors } from './colors';

/**
 * App color themes. Each one swaps the accent color and feature gradient;
 * everything else (cream/navy surfaces) stays calm and consistent.
 * Themes unlock through achievements (see src/data/achievements.ts).
 */
export type AppTheme = {
  id: string;
  name: string;
  description: string;
  /** Achievement id that unlocks it, or undefined if always available. */
  unlockedBy?: string;
  light: Partial<ThemeColors>;
  dark: Partial<ThemeColors>;
};

export const THEMES: AppTheme[] = [
  {
    id: 'classic',
    name: 'Gold & Navy',
    description: 'Warm gold on deep navy. Timeless.',
    light: {},
    dark: {},
  },
  {
    id: 'still-waters',
    name: 'Still Waters',
    description: 'Calm blues, like a quiet stream at dawn.',
    unlockedBy: 'streak-3',
    light: { gold: '#3E7FA8', goldSoft: '#DDEBF4', primary: '#1F4E6B', gradientVerse: ['#2C6A8C', '#173E57'] },
    dark: { gold: '#7DB8DC', goldSoft: 'rgba(125, 184, 220, 0.15)', primary: '#7DB8DC', onPrimary: '#0B1A24', gradientVerse: ['#1D3F55', '#0F2231'] },
  },
  {
    id: 'olive-grove',
    name: 'Olive Grove',
    description: 'Peaceful greens from the Mount of Olives.',
    unlockedBy: 'streak-7',
    light: { gold: '#6B8E4E', goldSoft: '#E5EEDC', primary: '#34492A', gradientVerse: ['#4C6B3A', '#2C3F22'] },
    dark: { gold: '#A7C58B', goldSoft: 'rgba(167, 197, 139, 0.15)', primary: '#A7C58B', onPrimary: '#121A0D', gradientVerse: ['#2F4225', '#182314'] },
  },
  {
    id: 'dawn',
    name: 'New Mercies',
    description: 'Soft rose of a new morning.',
    unlockedBy: 'prayer-answered-1',
    light: { gold: '#C0716A', goldSoft: '#F6E2DE', primary: '#5E2F3A', gradientVerse: ['#8A4B57', '#4F2733'] },
    dark: { gold: '#E8A49B', goldSoft: 'rgba(232, 164, 155, 0.15)', primary: '#E8A49B', onPrimary: '#24110F', gradientVerse: ['#4E2A33', '#2A161C'] },
  },
  {
    id: 'evening',
    name: 'Evening Prayer',
    description: 'Lavender dusk for quiet reflection.',
    unlockedBy: 'streak-30',
    light: { gold: '#7D6AAE', goldSoft: '#E9E4F4', primary: '#3B2F5C', gradientVerse: ['#5A4A86', '#2F2650'] },
    dark: { gold: '#B4A6E0', goldSoft: 'rgba(180, 166, 224, 0.15)', primary: '#B4A6E0', onPrimary: '#16121F', gradientVerse: ['#3A3060', '#1E1935'] },
  },
  {
    id: 'pentecost',
    name: 'Tongues of Fire',
    description: 'Warm amber flame. Acts 2.',
    unlockedBy: 'memorize-10',
    light: { gold: '#D07A2C', goldSoft: '#F8E7D4', primary: '#5A2E12', gradientVerse: ['#9A4A1C', '#5A2A10'] },
    dark: { gold: '#F0A85E', goldSoft: 'rgba(240, 168, 94, 0.15)', primary: '#F0A85E', onPrimary: '#221207', gradientVerse: ['#55301A', '#2C180C'] },
  },
];

export function themeOverrides(themeId: string, scheme: ColorScheme): Partial<ThemeColors> {
  return THEMES.find((t) => t.id === themeId)?.[scheme] ?? {};
}
