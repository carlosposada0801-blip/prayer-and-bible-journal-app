import { addDays, toDateKey } from '@/lib/dates';

import { all, first, run } from './database';

/**
 * Daily activity powers the gentle streak. Any meaningful moment counts:
 * reading, a study, a prayer, practice, gratitude or a plan reading.
 */
export type ActivityKind = 'reading' | 'study' | 'prayer' | 'practice' | 'gratitude' | 'plan' | 'trivia' | 'fast';

export function logActivity(kind: ActivityKind, date = toDateKey()) {
  run('activity', 'INSERT OR IGNORE INTO activity (date, kind) VALUES (?, ?)', date, kind);
}

function activeDays(kind?: ActivityKind): Set<string> {
  const rows = kind
    ? all<{ date: string }>('SELECT date FROM activity WHERE kind = ?', kind)
    : all<{ date: string }>('SELECT DISTINCT date FROM activity');
  return new Set(rows.map((r) => r.date));
}

/**
 * Current streak: consecutive days with activity, ending today – or
 * yesterday, so the streak never "breaks" before you've had a chance today.
 * Pass a kind (e.g. 'prayer') for a streak of just that activity.
 */
export function currentStreak(kind?: ActivityKind): number {
  const days = activeDays(kind);
  let cursor = new Date();
  if (!days.has(toDateKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(toDateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(): number {
  const sorted = [...activeDays()].sort();
  let best = 0;
  let run = 0;
  let prev: string | undefined;
  for (const d of sorted) {
    run = prev && toDateKey(addDays(new Date(prev + 'T12:00:00'), 1)) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function didToday(kind?: ActivityKind) {
  const today = toDateKey();
  return kind
    ? Boolean(first('SELECT 1 FROM activity WHERE date = ? AND kind = ?', today, kind))
    : Boolean(first('SELECT 1 FROM activity WHERE date = ?', today));
}

/** Which of the last 7 days (oldest → today) had activity. */
export function lastSevenDays(): { date: Date; active: boolean }[] {
  const days = activeDays();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i - 6);
    return { date, active: days.has(toDateKey(date)) };
  });
}

export function totalActiveDays() {
  return first<{ n: number }>('SELECT COUNT(DISTINCT date) AS n FROM activity')?.n ?? 0;
}
