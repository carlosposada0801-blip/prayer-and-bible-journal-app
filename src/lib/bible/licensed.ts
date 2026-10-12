import { BOOKS } from '@/data/bible/books';
import type { ApiTranslationId } from '@/data/bible/translations';
import { first, nowISO, run } from '@/db/database';

import { availableApiBibles, fetchApiBibleChapter } from './api-bible';
import { parseNltHtml, splitNumberedVerses, type ParsedChapter } from './parse';

/**
 * NIV, ESV, NLT, NKJV, CSB and NASB, each fetched from its official source
 * with your own free keys (set in `.env`, see docs/LICENSED_TRANSLATIONS.md):
 *
 *   ESV  → Crossway's ESV API          EXPO_PUBLIC_ESV_API_KEY
 *   NLT  → Tyndale's NLT API           EXPO_PUBLIC_NLT_API_KEY
 *   rest → API.Bible                   EXPO_PUBLIC_API_BIBLE_KEY
 *
 * Chapters you've opened are saved on the device, so they load instantly
 * and work offline afterward. Personal use only.
 */

const ESV_KEY = process.env.EXPO_PUBLIC_ESV_API_KEY;
// Tyndale's documented test key works for light use; a free personal key is better.
const NLT_KEY = process.env.EXPO_PUBLIC_NLT_API_KEY || 'TEST';

type Chapter = ParsedChapter;

/** A full-chapter query like "John 3:1-36" (explicit, so "Jude 1" isn't read as a single verse). */
function chapterQuery(book: number, chapter: number) {
  const info = BOOKS[book - 1];
  return `${info.name} ${chapter}:1-${info.verses[chapter - 1]}`;
}

async function fetchEsv(book: number, chapter: number): Promise<Chapter> {
  const params = new URLSearchParams({
    q: chapterQuery(book, chapter),
    'include-passage-references': 'false',
    'include-verse-numbers': 'true',
    'include-first-verse-numbers': 'true',
    'include-footnotes': 'false',
    'include-headings': 'false',
    'include-short-copyright': 'false',
    'include-passage-horizontal-lines': 'false',
    'include-heading-horizontal-lines': 'false',
    'indent-poetry': 'false',
    'indent-paragraphs': '0',
  });
  const res = await fetch(`https://api.esv.org/v3/passage/text/?${params}`, {
    headers: { Authorization: `Token ${ESV_KEY}` },
  });
  if (!res.ok) throw new Error(`Couldn't load the ESV (error ${res.status}). Check your ESV key and connection.`);
  const data: { passages: string[] } = await res.json();
  return splitNumberedVerses(data.passages.join(' '));
}

async function fetchNlt(book: number, chapter: number): Promise<Chapter> {
  const params = new URLSearchParams({ ref: chapterQuery(book, chapter), version: 'NLT', key: NLT_KEY });
  const res = await fetch(`https://api.nlt.to/api/passages?${params}`);
  if (!res.ok) throw new Error(`Couldn't load the NLT (error ${res.status}). Check your NLT key and connection.`);
  return parseNltHtml(await res.text(), book);
}

async function fetchChapter(id: ApiTranslationId, book: number, chapter: number): Promise<Chapter> {
  if (id === 'ESV' && ESV_KEY) return fetchEsv(book, chapter);
  if (id === 'NLT') {
    try {
      return await fetchNlt(book, chapter);
    } catch (e) {
      // Fall back to API.Bible if your key includes the NLT.
      if (!(await availableApiBibles())[id]) throw e;
    }
  }
  return { verses: await fetchApiBibleChapter(id, book, chapter), title: null };
}

/** Which licensed translations can be read with the keys you've set up. */
export async function availableLicensed(): Promise<ApiTranslationId[]> {
  const viaApiBible = await availableApiBibles().catch(() => ({}));
  const ids = new Set(Object.keys(viaApiBible) as ApiTranslationId[]);
  if (ESV_KEY) ids.add('ESV');
  ids.add('NLT');
  return (['NIV', 'ESV', 'NLT', 'NKJV', 'CSB', 'NASB'] as const).filter((id) => ids.has(id));
}

type CachedRow = { verses: string; title: string | null };

/** A licensed chapter: from the device if you've read it before, otherwise from the web. */
export async function getLicensedChapter(id: ApiTranslationId, book: number, chapter: number): Promise<Chapter> {
  const cached = first<CachedRow>(
    'SELECT verses, title FROM licensed_chapters WHERE translation = ? AND book = ? AND chapter = ?',
    id,
    book,
    chapter,
  );
  if (cached) return { verses: JSON.parse(cached.verses), title: cached.title };

  const fresh = await fetchChapter(id, book, chapter);
  if (fresh.verses.length) {
    run(
      'licensed_chapters',
      'INSERT OR REPLACE INTO licensed_chapters (translation, book, chapter, verses, title, fetched_at) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      book,
      chapter,
      JSON.stringify(fresh.verses),
      fresh.title,
      nowISO(),
    );
  }
  return fresh;
}
