import { BOOKS } from '../bible/books';
import type { Reference } from '../bible/references';

/**
 * Builds daily readings by splitting a list of chapters evenly across a
 * number of days. Days are balanced by verse count (so a day of short
 * chapters and a day with Psalm 119 come out roughly equal), and chapters
 * are kept whole whenever there are at least as many chapters as days.
 */

export type ChapterUnit = { book: number; chapter: number; verses: number };

export function chaptersOf(books: number[]): ChapterUnit[] {
  return books.flatMap((book) => BOOKS[book - 1].verses.map((verses, i) => ({ book, chapter: i + 1, verses })));
}

/** Chapters for an inclusive book range, e.g. range(40, 66) = the New Testament. */
export function bookRange(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Turns consecutive chapters into compact references like "Genesis 1–3". */
function chaptersToReferences(units: ChapterUnit[]): Reference[] {
  const refs: Reference[] = [];
  for (const u of units) {
    const last = refs[refs.length - 1];
    if (last && last.book === u.book && !last.verseStart && (last.chapterEnd ?? last.chapter) === u.chapter - 1) {
      last.chapterEnd = u.chapter;
    } else {
      refs.push({ book: u.book, chapter: u.chapter });
    }
  }
  return refs;
}

type VerseUnit = { book: number; chapter: number; verse: number };

/** Turns a run of verses into references, splitting at book boundaries. */
function versesToReferences(verses: VerseUnit[]): Reference[] {
  const refs: Reference[] = [];
  let start = 0;
  for (let i = 1; i <= verses.length; i++) {
    if (i === verses.length || verses[i].book !== verses[start].book) {
      const a = verses[start];
      const b = verses[i - 1];
      const wholeChapters = a.verse === 1 && b.verse === BOOKS[b.book - 1].verses[b.chapter - 1];
      refs.push(
        wholeChapters
          ? { book: a.book, chapter: a.chapter, chapterEnd: b.chapter !== a.chapter ? b.chapter : undefined }
          : { book: a.book, chapter: a.chapter, verseStart: a.verse, chapterEnd: b.chapter !== a.chapter ? b.chapter : undefined, verseEnd: b.verse },
      );
      start = i;
    }
  }
  return refs;
}

export function splitEvenly(units: ChapterUnit[], days: number): Reference[][] {
  if (days <= 0 || units.length === 0) return [];
  const total = units.reduce((s, u) => s + u.verses, 0);

  if (units.length >= days) {
    const out: ChapterUnit[][] = [[]];
    let cumulative = 0;
    units.forEach((u, i) => {
      out[out.length - 1].push(u);
      cumulative += u.verses;
      const remainingChapters = units.length - i - 1;
      const remainingDays = days - out.length;
      if (remainingDays <= 0) return;
      const target = (total * out.length) / days;
      // Close the day once we pass the target (or must, to leave a chapter for each remaining day).
      const next = units[i + 1];
      const overshootIfAdded = next ? Math.abs(cumulative + next.verses - target) : Infinity;
      if (remainingChapters <= remainingDays || (cumulative >= target || Math.abs(cumulative - target) < overshootIfAdded)) {
        out.push([]);
      }
    });
    while (out.length < days) out.push([]);
    return out.map(chaptersToReferences);
  }

  // Fewer chapters than days: split by verses instead.
  const verses: VerseUnit[] = units.flatMap((u) => Array.from({ length: u.verses }, (_, i) => ({ book: u.book, chapter: u.chapter, verse: i + 1 })));
  const out: Reference[][] = [];
  for (let d = 0; d < days; d++) {
    const from = Math.round((verses.length * d) / days);
    const to = Math.round((verses.length * (d + 1)) / days);
    out.push(versesToReferences(verses.slice(from, to)));
  }
  return out;
}

/** Combines two schedules day by day (e.g. Old + New Testament each day). */
export function zipDays(...schedules: Reference[][][]): Reference[][] {
  const days = Math.max(...schedules.map((s) => s.length));
  return Array.from({ length: days }, (_, d) => schedules.flatMap((s) => s[d] ?? []));
}

export type Pace = 'slow' | 'normal' | 'fast';

export function daysForPace(chapters: number, pace: Pace) {
  if (pace === 'slow') return chapters * 2;
  if (pace === 'fast') return Math.max(1, Math.ceil(chapters / 2));
  return chapters;
}
