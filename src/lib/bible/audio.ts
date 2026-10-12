import * as Speech from 'expo-speech';
import { useSyncExternalStore } from 'react';

import { formatReference, nextChapter } from '@/data/bible/references';
import { markChapterRead } from '@/db/bible-notes';
import { getPreferences, setPreference } from '@/store/preferences';

import { getChapter } from './engine';
import type { Verse } from './types';

/**
 * Audio Bible using the iPhone's built-in text-to-speech voices.
 * Reads verse by verse (so the reader can highlight along), and keeps going
 * into the next chapter automatically.
 *
 * Tip: for the most natural voice, download an "Enhanced" or "Premium"
 * English voice in iPhone Settings → Accessibility → Spoken Content → Voices.
 */

type AudioState = {
  status: 'idle' | 'loading' | 'playing' | 'paused';
  book: number;
  chapter: number;
  /** Verse number currently being read. */
  verse: number;
  rate: number;
};

let state: AudioState = { status: 'idle', book: 43, chapter: 1, verse: 1, rate: getPreferences().speechRate };
let verses: Verse[] = [];
let session = 0;
let voiceId: string | undefined;
const listeners = new Set<() => void>();

function set(patch: Partial<AudioState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

async function pickVoice() {
  if (voiceId !== undefined) return voiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const english = voices.filter((v) => v.language?.startsWith('en'));
    const best =
      english.find((v) => /premium/i.test(v.quality ?? '') && v.language === 'en-US') ??
      english.find((v) => /enhanced/i.test(v.quality ?? '') && v.language === 'en-US') ??
      english.find((v) => v.language === 'en-US');
    voiceId = best?.identifier ?? '';
  } catch {
    voiceId = '';
  }
  return voiceId;
}

function speakVerse(index: number, token: number) {
  if (token !== session) return;
  const v = verses[index];
  if (!v) {
    finishChapter(token);
    return;
  }
  set({ verse: v.verse, status: 'playing' });
  Speech.speak(v.text, {
    rate: state.rate,
    voice: voiceId || undefined,
    language: 'en-US',
    onDone: () => speakVerse(index + 1, token),
  });
}

async function finishChapter(token: number) {
  markChapterRead(state.book, state.chapter);
  const next = nextChapter(state.book, state.chapter);
  if (!next) return stop();
  // Follow along in the reader.
  setPreference('lastRead', next);
  await loadAndPlay(next.book, next.chapter, 1, token, true);
}

async function loadAndPlay(book: number, chapter: number, fromVerse: number, token: number, announce = false) {
  set({ status: 'loading', book, chapter, verse: fromVerse });
  await pickVoice();
  verses = await getChapter(getPreferences().translation, book, chapter);
  if (token !== session) return;
  const start = Math.max(0, verses.findIndex((v) => v.verse >= fromVerse));
  if (announce || fromVerse === 1) {
    const title = formatReference({ book, chapter });
    Speech.speak(title, { rate: state.rate, voice: voiceId || undefined, language: 'en-US', onDone: () => speakVerse(start, token) });
    set({ status: 'playing' });
  } else {
    speakVerse(start, token);
  }
}

export const audio = {
  play(book: number, chapter: number, fromVerse = 1) {
    Speech.stop();
    session++;
    loadAndPlay(book, chapter, fromVerse, session).catch(() => set({ status: 'idle' }));
  },
  pause() {
    // Stopping and resuming at the current verse is more reliable than
    // pausing an utterance mid-sentence.
    session++;
    Speech.stop();
    set({ status: 'paused' });
  },
  resume() {
    audio.play(state.book, state.chapter, state.verse);
  },
  toggle() {
    if (state.status === 'playing' || state.status === 'loading') audio.pause();
    else audio.resume();
  },
  stop,
  setRate(rate: number) {
    setPreference('speechRate', rate);
    const wasPlaying = state.status === 'playing';
    set({ rate });
    if (wasPlaying) audio.resume();
  },
};

function stop() {
  session++;
  Speech.stop();
  set({ status: 'idle' });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAudio() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
