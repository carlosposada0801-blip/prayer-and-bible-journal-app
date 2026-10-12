import { logActivity } from './activity';
import { all, first, nowISO, run } from './database';

/** Highlights, notes, bookmarks and reading history for the Bible reader. */

export const HIGHLIGHT_COLORS = {
  gold: { light: 'rgba(226, 190, 106, 0.38)', dark: 'rgba(226, 190, 106, 0.30)', swatch: '#E2BE6A', name: 'Gold' },
  sage: { light: 'rgba(143, 178, 140, 0.38)', dark: 'rgba(143, 178, 140, 0.30)', swatch: '#8FB28C', name: 'Sage' },
  sky: { light: 'rgba(120, 160, 214, 0.32)', dark: 'rgba(120, 160, 214, 0.30)', swatch: '#78A0D6', name: 'Sky' },
  rose: { light: 'rgba(226, 140, 128, 0.32)', dark: 'rgba(226, 140, 128, 0.30)', swatch: '#E28C80', name: 'Rose' },
  lavender: { light: 'rgba(170, 150, 220, 0.32)', dark: 'rgba(170, 150, 220, 0.30)', swatch: '#AA96DC', name: 'Lavender' },
} as const;
export type HighlightColor = keyof typeof HIGHLIGHT_COLORS;

export type VerseMark = { book: number; chapter: number; verse: number; created_at: string };
export type Highlight = VerseMark & { color: HighlightColor };
export type Note = VerseMark & { id: number; body: string; updated_at: string };

// Highlights ---------------------------------------------------------------

export function chapterHighlights(book: number, chapter: number) {
  return all<Highlight>('SELECT * FROM highlights WHERE book = ? AND chapter = ?', book, chapter);
}

export function setHighlight(book: number, chapter: number, verses: number[], color: HighlightColor | null) {
  for (const verse of verses) {
    if (color) {
      run(
        'highlights',
        'INSERT INTO highlights (book, chapter, verse, color, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO UPDATE SET color = excluded.color',
        book, chapter, verse, color, nowISO(),
      );
    } else {
      run('highlights', 'DELETE FROM highlights WHERE book = ? AND chapter = ? AND verse = ?', book, chapter, verse);
    }
  }
}

export function allHighlights() {
  return all<Highlight>('SELECT * FROM highlights ORDER BY created_at DESC');
}

// Notes --------------------------------------------------------------------

export function chapterNotes(book: number, chapter: number) {
  return all<Note>('SELECT * FROM notes WHERE book = ? AND chapter = ?', book, chapter);
}

export function verseNote(book: number, chapter: number, verse: number) {
  return first<Note>('SELECT * FROM notes WHERE book = ? AND chapter = ? AND verse = ? ORDER BY id LIMIT 1', book, chapter, verse);
}

export function saveNote(book: number, chapter: number, verse: number, body: string) {
  const existing = verseNote(book, chapter, verse);
  const text = body.trim();
  if (existing && !text) return run('notes', 'DELETE FROM notes WHERE id = ?', existing.id);
  if (existing) return run('notes', 'UPDATE notes SET body = ?, updated_at = ? WHERE id = ?', text, nowISO(), existing.id);
  if (text) {
    run('notes', 'INSERT INTO notes (book, chapter, verse, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      book, chapter, verse, text, nowISO(), nowISO());
  }
}

export function allNotes() {
  return all<Note>('SELECT * FROM notes ORDER BY updated_at DESC');
}

// Bookmarks ----------------------------------------------------------------

export function chapterBookmarks(book: number, chapter: number) {
  return all<VerseMark>('SELECT * FROM bookmarks WHERE book = ? AND chapter = ?', book, chapter);
}

export function toggleBookmark(book: number, chapter: number, verse: number) {
  const exists = first('SELECT 1 FROM bookmarks WHERE book = ? AND chapter = ? AND verse = ?', book, chapter, verse);
  if (exists) run('bookmarks', 'DELETE FROM bookmarks WHERE book = ? AND chapter = ? AND verse = ?', book, chapter, verse);
  else run('bookmarks', 'INSERT INTO bookmarks (book, chapter, verse, created_at) VALUES (?, ?, ?, ?)', book, chapter, verse, nowISO());
  return !exists;
}

export function allBookmarks() {
  return all<VerseMark>('SELECT * FROM bookmarks ORDER BY created_at DESC');
}

// Reading history ----------------------------------------------------------

export function markChapterRead(book: number, chapter: number) {
  run('chapters_read', 'INSERT OR IGNORE INTO chapters_read (book, chapter, read_at) VALUES (?, ?, ?)', book, chapter, nowISO());
  logActivity('reading');
}

export function isChapterRead(book: number, chapter: number) {
  return Boolean(first('SELECT 1 FROM chapters_read WHERE book = ? AND chapter = ?', book, chapter));
}

export function chaptersReadInBook(book: number) {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM chapters_read WHERE book = ?', book)?.n ?? 0;
}

export function totalChaptersRead() {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM chapters_read')?.n ?? 0;
}
