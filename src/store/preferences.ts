import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import type { TranslationId } from '@/data/bible/translations';

import { kv } from './kv';

/**
 * User preferences (appearance, reader, translation, reminders…).
 *
 * Saved on-device with SQLite's key-value store and read synchronously
 * at launch, so the app opens in the right theme with no flicker.
 * Use `usePreferences()` in components and `getPreferences()` elsewhere.
 */

export type AppearanceMode = 'system' | 'light' | 'dark';
export type TextSize = 'small' | 'default' | 'large' | 'xlarge';
export type ReminderKind = 'study' | 'prayer' | 'practice' | 'person' | 'plan';
export type Reminder = { enabled: boolean; hour: number; minute: number };

export type Preferences = {
  name: string;
  appearance: AppearanceMode;
  textSize: TextSize;
  haptics: boolean;
  translation: TranslationId;
  compareTranslation: TranslationId;
  themeId: string;
  readerFont: 'serif' | 'sans';
  readerSpacing: 'compact' | 'normal' | 'relaxed';
  showVerseNumbers: boolean;
  speechRate: number;
  lastRead: { book: number; chapter: number };
  dailyXpGoal: number;
  quietMode: boolean;
  appLock: boolean;
  reminders: Record<ReminderKind, Reminder>;
};

export const textScaleFor: Record<TextSize, number> = {
  small: 0.92,
  default: 1,
  large: 1.1,
  xlarge: 1.22,
};

const STORAGE_KEY = 'preferences.v1';

const defaults: Preferences = {
  name: '',
  appearance: 'system',
  textSize: 'default',
  haptics: true,
  translation: 'BSB',
  compareTranslation: 'KJV',
  themeId: 'classic',
  readerFont: 'serif',
  readerSpacing: 'normal',
  showVerseNumbers: true,
  speechRate: 1,
  lastRead: { book: 43, chapter: 1 },
  dailyXpGoal: 30,
  quietMode: false,
  appLock: false,
  reminders: {
    study: { enabled: false, hour: 7, minute: 0 },
    prayer: { enabled: false, hour: 21, minute: 0 },
    practice: { enabled: false, hour: 12, minute: 30 },
    person: { enabled: false, hour: 8, minute: 0 },
    plan: { enabled: false, hour: 7, minute: 30 },
  },
};

function load(): Preferences {
  try {
    const raw = kv.get(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);
    return { ...defaults, ...saved, reminders: { ...defaults.reminders, ...saved.reminders } };
  } catch {
    return defaults;
  }
}

let current = load();
const listeners = new Set<() => void>();

function applyAppearance(mode: AppearanceMode) {
  // Not available in web previews.
  if (typeof Appearance.setColorScheme !== 'function') return;
  Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
}
applyAppearance(current.appearance);

export function getPreferences() {
  return current;
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  current = { ...current, [key]: value };
  if (key === 'appearance') applyAppearance(value as AppearanceMode);
  try {
    kv.set(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage is best-effort; the in-memory value still applies this session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePreferences() {
  return useSyncExternalStore(subscribe, getPreferences, getPreferences);
}
