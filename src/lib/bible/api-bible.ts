import { USFM_CODES } from '@/data/bible/references';
import type { ApiTranslationId } from '@/data/bible/translations';

import { splitNumberedVerses } from './parse';
import type { Verse } from './types';

/**
 * NIV, NKJV, CSB and NASB (and ESV/NLT as a fallback) through API.Bible
 * (https://scripture.api.bible). Needs EXPO_PUBLIC_API_BIBLE_KEY in `.env`.
 * Only translations your key has access to will appear.
 * See docs/LICENSED_TRANSLATIONS.md.
 */

const KEY = process.env.EXPO_PUBLIC_API_BIBLE_KEY;
const BASE = 'https://rest.api.bible/v1';

export const apiBibleConfigured = Boolean(KEY);

type ApiBible = { id: string; abbreviation: string; abbreviationLocal: string; name: string };

let biblesPromise: Promise<Partial<Record<ApiTranslationId, string>>> | undefined;

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'api-key': KEY ?? '' } });
  if (!res.ok) throw new Error(`API.Bible error ${res.status}`);
  return (await res.json()).data as T;
}

/** Maps our ids (NIV, ESV…) to the Bible ids your key can access. */
export function availableApiBibles(): Promise<Partial<Record<ApiTranslationId, string>>> {
  if (!KEY) return Promise.resolve({});
  biblesPromise ??= request<ApiBible[]>('/bibles?language=eng').then((bibles) => {
    const wanted: ApiTranslationId[] = ['NIV', 'ESV', 'NLT', 'NKJV', 'CSB', 'NASB'];
    const map: Partial<Record<ApiTranslationId, string>> = {};
    for (const id of wanted) {
      const match = bibles.find((b) =>
        [b.abbreviation, b.abbreviationLocal].some((a) => a?.toUpperCase().replace(/\d+$/, '') === id),
      );
      if (match) map[id] = match.id;
    }
    return map;
  });
  biblesPromise.catch(() => (biblesPromise = undefined));
  return biblesPromise;
}

export async function fetchApiBibleChapter(id: ApiTranslationId, book: number, chapter: number): Promise<Verse[]> {
  const bibles = await availableApiBibles();
  const bibleId = bibles[id];
  if (!bibleId) throw new Error(`${id} is not available with your API.Bible key.`);
  const chapterId = `${USFM_CODES[book - 1]}.${chapter}`;
  const data = await request<{ content: string }>(
    `/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`,
  );
  return splitNumberedVerses(data.content).verses;
}
