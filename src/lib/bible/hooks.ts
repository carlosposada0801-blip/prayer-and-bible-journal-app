import { useEffect, useState } from 'react';

import type { Reference } from '@/data/bible/references';
import type { TranslationId } from '@/data/bible/translations';
import { usePreferences } from '@/store/preferences';

import { getChapter, getPassage, getPassageTextSafe } from './engine';
import type { Verse } from './types';

type AsyncState<T> = { data: T | undefined; loading: boolean; error: Error | undefined };

/** Runs an async loader and tracks loading/error state; reruns when `key` changes. */
export function useAsync<T>(loader: () => Promise<T>, key: string): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T> & { key?: string }>({ data: undefined, loading: true, error: undefined });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    loader().then(
      (data) => !cancelled && setState({ data, loading: false, error: undefined, key }),
      (error: Error) => !cancelled && setState({ data: undefined, loading: false, error, key }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

export function useChapter(translation: TranslationId, book: number, chapter: number) {
  return useAsync<Verse[]>(() => getChapter(translation, book, chapter), `${translation}.${book}.${chapter}`);
}

function refKey(r: Reference) {
  return `${r.book}.${r.chapter}.${r.verseStart ?? ''}.${r.verseEnd ?? ''}.${r.chapterEnd ?? ''}`;
}

/** Passage text in the user's chosen translation (or a specific one). */
export function usePassageText(reference: Reference | undefined, translation?: TranslationId) {
  const prefs = usePreferences();
  const tid = translation ?? prefs.translation;
  return useAsync<string>(
    () => (reference ? getPassageTextSafe(tid, reference) : Promise.resolve('')),
    reference ? `${tid}:${refKey(reference)}` : 'none',
  );
}

export function usePassage(reference: Reference | undefined, translation?: TranslationId) {
  const prefs = usePreferences();
  const tid = translation ?? prefs.translation;
  return useAsync(
    () => (reference ? getPassage(tid, reference).catch(() => getPassage('BSB', reference)) : Promise.resolve([])),
    reference ? `${tid}:${refKey(reference)}` : 'none',
  );
}
