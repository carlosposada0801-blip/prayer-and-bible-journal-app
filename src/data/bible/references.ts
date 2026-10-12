import { BOOKS, type BookInfo } from './books';

/**
 * A passage of Scripture. `verseStart`/`verseEnd` are optional: without them
 * the reference means the whole chapter (or chapters through `chapterEnd`).
 */
export type Reference = {
  book: number;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  chapterEnd?: number;
};

export const USFM_CODES = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH',
  'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS',
  'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK',
  'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT',
  'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

export function getBook(id: number): BookInfo {
  return BOOKS[id - 1];
}

export function chapterCount(book: number) {
  return getBook(book).verses.length;
}

export function verseCount(book: number, chapter: number) {
  return getBook(book).verses[chapter - 1] ?? 0;
}

const aliases: Record<string, number> = {};
BOOKS.forEach((b) => {
  const add = (s: string) => (aliases[s.toLowerCase().replace(/[\s.]/g, '')] = b.id);
  add(b.name);
  add(b.abbr);
});
Object.entries({
  psalm: 19, pss: 19, song: 22, songofsongs: 22, canticles: 22, revelations: 66, philem: 57, jn: 43,
  mt: 40, mk: 41, lk: 42, jhn: 43, rm: 45, ro: 45, gn: 1, ex: 2, dt: 5, prv: 20, pr: 20, qoh: 21,
}).forEach(([k, v]) => (aliases[k] = v));

export function findBook(name: string): number | undefined {
  return aliases[name.toLowerCase().replace(/[\s.]/g, '')];
}

/**
 * Parses references like "John 3:16", "Ps 23", "Romans 8:28-39",
 * "1 Cor 13:4–7", "Genesis 1-3". Returns undefined if it can't parse.
 */
export function parseReference(input: string): Reference | undefined {
  const m = input
    .trim()
    .replace(/[–—]/g, '-')
    .match(/^((?:[1-3]\s*)?[A-Za-z][A-Za-z.\s]*?)\s*(\d+)(?::(\d+))?(?:\s*-\s*(\d+)(?::(\d+))?)?$/);
  if (!m) return undefined;
  const book = findBook(m[1]);
  if (!book) return undefined;
  const chapter = Number(m[2]);
  if (chapter < 1 || chapter > chapterCount(book)) return undefined;
  const ref: Reference = { book, chapter };
  if (m[3]) {
    ref.verseStart = Number(m[3]);
    if (m[5]) {
      ref.chapterEnd = Number(m[4]);
      ref.verseEnd = Number(m[5]);
    } else {
      ref.verseEnd = m[4] ? Number(m[4]) : ref.verseStart;
    }
  } else if (m[4]) {
    ref.chapterEnd = Number(m[4]);
  }
  return ref;
}

/** Parses or throws – for references written in our own data files. */
export function ref(input: string): Reference {
  const parsed = parseReference(input);
  if (!parsed) throw new Error(`Bad reference: ${input}`);
  return parsed;
}

export function formatReference(r: Reference, opts: { abbreviate?: boolean } = {}) {
  const b = getBook(r.book);
  // A single psalm is "Psalm 23", the book is "Psalms".
  const name = opts.abbreviate ? b.abbr : r.book === 19 && !(r.chapterEnd && r.chapterEnd !== r.chapter) ? 'Psalm' : b.name;
  let out = `${name} ${r.chapter}`;
  if (r.verseStart) {
    out += `:${r.verseStart}`;
    if (r.chapterEnd && r.chapterEnd !== r.chapter) out += `–${r.chapterEnd}:${r.verseEnd}`;
    else if (r.verseEnd && r.verseEnd !== r.verseStart) out += `–${r.verseEnd}`;
  } else if (r.chapterEnd && r.chapterEnd !== r.chapter) {
    out += `–${r.chapterEnd}`;
  }
  return out;
}

/** A stable string key like "43.3.16" for storing verse-level data. */
export function verseKey(book: number, chapter: number, verse: number) {
  return `${book}.${chapter}.${verse}`;
}

/** Converts a book+chapter to a single sequential number (1…1189). */
export function absoluteChapter(book: number, chapter: number) {
  let n = 0;
  for (let i = 1; i < book; i++) n += chapterCount(i);
  return n + chapter;
}

export function nextChapter(book: number, chapter: number): { book: number; chapter: number } | undefined {
  if (chapter < chapterCount(book)) return { book, chapter: chapter + 1 };
  if (book < 66) return { book: book + 1, chapter: 1 };
  return undefined;
}

export function previousChapter(book: number, chapter: number): { book: number; chapter: number } | undefined {
  if (chapter > 1) return { book, chapter: chapter - 1 };
  if (book > 1) return { book: book - 1, chapter: chapterCount(book - 1) };
  return undefined;
}
