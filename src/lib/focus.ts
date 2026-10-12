import { useEffect, useSyncExternalStore } from 'react';

import { getPreferences } from '@/store/preferences';

/**
 * Quiet focus: while you're praying, studying or reading, in-app banners
 * (reminders and badge celebrations) wait until you're done – if "Quiet
 * Mode" is on in Profile.
 *
 * Screens call useFocusSession() while they're open.
 */

let active = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function isQuiet() {
  return getPreferences().quietMode && active > 0;
}

export function useFocusSession() {
  useEffect(() => {
    active++;
    emit();
    return () => {
      active--;
      emit();
    };
  }, []);
}

/** True while a focus session is open and Quiet Mode is on. */
export function useIsQuiet() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    isQuiet,
    isQuiet,
  );
}
