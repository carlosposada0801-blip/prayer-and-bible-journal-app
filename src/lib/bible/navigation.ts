import { router } from 'expo-router';

import { setPreference } from '@/store/preferences';

/**
 * The reader always shows `preferences.lastRead`, so "opening" a chapter
 * from anywhere is just: remember the position, then show the reader.
 */

let pendingVerse: number | undefined;

export function openReader(book: number, chapter: number, verse?: number) {
  setPreference('lastRead', { book, chapter });
  pendingVerse = verse;
  router.navigate('/bible/read');
}

/** The verse the reader should scroll to (read once). */
export function takePendingVerse() {
  const v = pendingVerse;
  pendingVerse = undefined;
  return v;
}

export function peekPendingVerse() {
  return pendingVerse;
}
