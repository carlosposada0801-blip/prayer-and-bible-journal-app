import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import { kv } from './kv';

/**
 * User preferences (appearance, text size, haptics, translation).
 *
 * Saved on-device with SQLite's key-value store and read synchronously
 * at launch, so the app opens in the right theme with no flicker.
 * Use `usePreferences()` in components and `getPreferences()` elsewhere.
 */

export type AppearanceMode = 'system' | 'light' | 'dark';
export type TextSize = 'small' | 'default' | 'large' | 'xlarge';
export type TranslationId = 'BSB' | 'WEB' | 'KJV';

export type Preferences = {
  appearance: AppearanceMode;
  textSize: TextSize;
  haptics: boolean;
  translation: TranslationId;
};

export const textScaleFor: Record<TextSize, number> = {
  small: 0.92,
  default: 1,
  large: 1.1,
  xlarge: 1.22,
};

const STORAGE_KEY = 'preferences.v1';

const defaults: Preferences = {
  appearance: 'system',
  textSize: 'default',
  haptics: true,
  translation: 'BSB',
};

function load(): Preferences {
  try {
    const raw = kv.get(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
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
