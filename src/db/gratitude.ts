import { toDateKey } from '@/lib/dates';

import { logActivity } from './activity';
import { all, first, run } from './database';

/** Gratitude log: three things each day. */

export function gratitudeFor(date = toDateKey()): string[] {
  const rows = all<{ position: number; text: string }>('SELECT position, text FROM gratitude WHERE date = ? ORDER BY position', date);
  const out = ['', '', ''];
  rows.forEach((r) => (out[r.position] = r.text));
  return out;
}

export function setGratitude(date: string, position: number, text: string) {
  if (text.trim()) {
    run('gratitude', 'INSERT INTO gratitude (date, position, text) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET text = excluded.text', date, position, text.trim());
    logActivity('gratitude', date);
  } else {
    run('gratitude', 'DELETE FROM gratitude WHERE date = ? AND position = ?', date, position);
  }
}

export function gratitudeHistory(limit = 60) {
  const rows = all<{ date: string; position: number; text: string }>(
    'SELECT date, position, text FROM gratitude WHERE date < ? ORDER BY date DESC, position LIMIT ?',
    toDateKey(), limit * 3,
  );
  const byDate = new Map<string, string[]>();
  rows.forEach((r) => {
    const list = byDate.get(r.date) ?? [];
    list.push(r.text);
    byDate.set(r.date, list);
  });
  return [...byDate.entries()].map(([date, items]) => ({ date, items }));
}

export function gratitudeCount() {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM gratitude')?.n ?? 0;
}

export function saveGuidedSession(durationSec: number, entries: Record<string, string>) {
  run('guided_sessions', 'INSERT INTO guided_sessions (started_at, duration_sec, entries) VALUES (?, ?, ?)',
    new Date(Date.now() - durationSec * 1000).toISOString(), durationSec, JSON.stringify(entries));
  logActivity('prayer');
}

export function guidedSessionCount() {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM guided_sessions')?.n ?? 0;
}
