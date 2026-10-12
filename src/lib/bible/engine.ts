import type { SQLiteDatabase } from 'expo-sqlite';

import {
  BIBLE_DATA_VERSION,
  isBundled,
  TRANSLATION_ASSETS,
  XREFS_ASSET,
  type BundledTranslationId,
  type TranslationId,
} from '@/data/bible/translations';
import type { Reference } from '@/data/bible/references';

import { fetchApiChapter } from './api-bible';
import { openAssetDatabase } from './open-asset';
import type { SearchResult, Verse } from './types';

/**
 * Reads Scripture from the bundled, read-only translation databases.
 * The first time a translation is used, its file is copied from the app
 * bundle into the app's documents folder (takes a second or two once).
 */

const opened = new Map<string, Promise<SQLiteDatabase>>();

function openAsset(name: string, assetId: number) {
  const fileName = `bible-${name}-v${BIBLE_DATA_VERSION}.db`;
  let promise = opened.get(fileName);
  if (!promise) {
    promise = openAssetDatabase(fileName, assetId);
    promise.catch(() => opened.delete(fileName));
    opened.set(fileName, promise);
  }
  return promise;
}

function translationDb(id: BundledTranslationId) {
  return openAsset(id.toLowerCase(), TRANSLATION_ASSETS[id]);
}

/** Opens a translation ahead of time so the first chapter appears instantly. */
export async function warmUp(id: TranslationId) {
  if (isBundled(id)) await translationDb(id).catch(() => {});
}

const chapterCache = new Map<string, Verse[]>();

export async function getChapter(id: TranslationId, book: number, chapter: number): Promise<Verse[]> {
  const key = `${id}.${book}.${chapter}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;

  let verses: Verse[];
  if (isBundled(id)) {
    const database = await translationDb(id);
    verses = await database.getAllAsync<Verse>(
      'SELECT verse, text FROM verses WHERE book = ? AND chapter = ? ORDER BY verse',
      [book, chapter],
    );
  } else {
    verses = await fetchApiChapter(id, book, chapter);
  }
  if (chapterCache.size > 60) chapterCache.delete(chapterCache.keys().next().value!);
  chapterCache.set(key, verses);
  return verses;
}

/** A psalm's superscription (e.g. "A Psalm of David."), if the translation has one. */
export async function getChapterTitle(id: TranslationId, book: number, chapter: number): Promise<string | null> {
  if (book !== 19 || !isBundled(id)) return null;
  const database = await translationDb(id);
  const row = await database.getFirstAsync<{ title: string }>('SELECT title FROM titles WHERE book = ? AND chapter = ?', [book, chapter]);
  return row?.title ?? null;
}

/** All verses in a reference, in order, with their chapter numbers. */
export async function getPassage(id: TranslationId, r: Reference) {
  const lastChapter = r.chapterEnd ?? r.chapter;
  const out: (Verse & { chapter: number })[] = [];
  for (let c = r.chapter; c <= lastChapter; c++) {
    const verses = await getChapter(id, r.book, c);
    for (const v of verses) {
      if (c === r.chapter && r.verseStart && v.verse < r.verseStart) continue;
      if (c === lastChapter && r.verseEnd && v.verse > r.verseEnd) continue;
      out.push({ ...v, chapter: c });
    }
  }
  return out;
}

/** The passage as one string – for verse cards, quizzes and sharing. */
export async function getPassageText(id: TranslationId, r: Reference) {
  const verses = await getPassage(id, r);
  return verses.map((v) => v.text).join(' ');
}

/**
 * Word or phrase search (case-insensitive). Bundled translations only.
 * `scope` can limit to a testament or a single book.
 */
export async function searchBible(
  id: TranslationId,
  query: string,
  scope: { testament?: 'OT' | 'NT'; book?: number } = {},
  limit = 300,
): Promise<{ results: SearchResult[]; total: number }> {
  const q = query.trim();
  if (q.length < 2) return { results: [], total: 0 };
  const searchId: BundledTranslationId = isBundled(id) ? id : 'BSB';
  const database = await translationDb(searchId);
  const where = ['text LIKE ? ESCAPE \'\\\''];
  const params: (string | number)[] = [`%${q.replace(/[%_\\]/g, (c) => '\\' + c)}%`];
  if (scope.book) {
    where.push('book = ?');
    params.push(scope.book);
  } else if (scope.testament) {
    where.push(scope.testament === 'OT' ? 'book <= 39' : 'book >= 40');
  }
  const clause = where.join(' AND ');
  const total =
    (await database.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM verses WHERE ${clause}`, params))?.n ?? 0;
  const results = await database.getAllAsync<SearchResult>(
    `SELECT book, chapter, verse, text FROM verses WHERE ${clause} ORDER BY book, chapter, verse LIMIT ${limit}`,
    params,
  );
  return { results, total };
}

/** Related verses for one verse, strongest first (OpenBible.info data). */
export async function getCrossReferences(book: number, chapter: number, verse: number): Promise<Reference[]> {
  const database = await openAsset('xrefs', XREFS_ASSET);
  const rows = await database.getAllAsync<{ to_book: number; to_chapter: number; to_verse: number; to_verse_end: number }>(
    'SELECT to_book, to_chapter, to_verse, to_verse_end FROM xrefs WHERE book = ? AND chapter = ? AND verse = ? ORDER BY votes DESC',
    [book, chapter, verse],
  );
  return rows.map((r) => ({
    book: r.to_book,
    chapter: r.to_chapter,
    verseStart: r.to_verse,
    verseEnd: Math.max(r.to_verse, r.to_verse_end),
  }));
}
