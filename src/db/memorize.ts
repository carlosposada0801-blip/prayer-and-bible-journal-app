import { toDateKey } from '@/lib/dates';
import { kv } from '@/store/kv';

import { logActivity } from './activity';
import { all, first, nowISO, run } from './database';

/**
 * Verse memorization: stages, spaced repetition, XP and hearts.
 *
 * Stages (each unlocks a harder quiz type):
 *   0 new → 1 fill-in-the-blank done → 2 word order → 3 reference →
 *   4 first letters → 5 full recall = memorized ✓
 *
 * Spaced repetition is a gentle SM-2: each successful review pushes the
 * next one further out (1 → 3 → 7 → 16 days…), a miss brings it back soon.
 */

export const MEMORIZED_STAGE = 5;

export type MemoryVerse = {
  id: string;
  reference: string;
  custom: number;
  added_at: string;
  stage: number;
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due_at: string | null;
  last_reviewed_at: string | null;
};

const idFor = (reference: string) => `ref:${reference}`;

export function getMemoryVerse(reference: string) {
  return first<MemoryVerse>('SELECT * FROM memory_verses WHERE id = ?', idFor(reference));
}

/** Adds a verse to "My Verses" (or returns the existing one). */
export function addMemoryVerse(reference: string, custom = true) {
  run(
    'memory_verses',
    'INSERT OR IGNORE INTO memory_verses (id, reference, custom, added_at) VALUES (?, ?, ?, ?)',
    idFor(reference), reference, custom ? 1 : 0, nowISO(),
  );
  return getMemoryVerse(reference)!;
}

export function removeMemoryVerse(reference: string) {
  run('memory_verses', 'DELETE FROM memory_verses WHERE id = ?', idFor(reference));
}

export function myVerses() {
  return all<MemoryVerse>('SELECT * FROM memory_verses WHERE custom = 1 ORDER BY added_at DESC');
}

export function allMemoryVerses() {
  return all<MemoryVerse>('SELECT * FROM memory_verses ORDER BY added_at');
}

export function memorizedCount() {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM memory_verses WHERE stage >= ?', MEMORIZED_STAGE)?.n ?? 0;
}

/** Verses whose review is due now (most overdue first). */
export function dueVerses(limit = 10) {
  return all<MemoryVerse>(
    'SELECT * FROM memory_verses WHERE due_at IS NOT NULL AND due_at <= ? ORDER BY due_at LIMIT ?',
    nowISO(), limit,
  );
}

function schedule(v: MemoryVerse, quality: 1 | 3 | 5) {
  let { ease, interval_days: interval, reps, lapses } = v;
  if (quality === 1) {
    lapses++;
    reps = 0;
    interval = 0.007; // ~10 minutes: see it again soon
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps++;
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease);
    ease = Math.max(1.3, ease + (quality === 5 ? 0.1 : -0.08));
  }
  const due = new Date(Date.now() + interval * 86_400_000).toISOString();
  return { ease, interval, reps, lapses, due };
}

/** Records a finished lesson or review for a verse. */
export function recordPractice(reference: string, quality: 1 | 3 | 5, advanceStage: boolean) {
  const v = getMemoryVerse(reference) ?? addMemoryVerse(reference, false);
  const s = schedule(v, quality);
  const stage = advanceStage && quality > 1 ? Math.min(MEMORIZED_STAGE, v.stage + 1) : v.stage;
  run(
    'memory_verses',
    `UPDATE memory_verses SET stage = ?, ease = ?, interval_days = ?, reps = ?, lapses = ?, due_at = ?, last_reviewed_at = ? WHERE id = ?`,
    stage, s.ease, s.interval, s.reps, s.lapses, s.due, nowISO(), v.id,
  );
  logActivity('practice');
  return stage;
}

// XP ---------------------------------------------------------------------------

export function addXp(amount: number, source: string) {
  run('xp_log', 'INSERT INTO xp_log (date, amount, source, created_at) VALUES (?, ?, ?, ?)', toDateKey(), amount, source, nowISO());
}

export function xpToday() {
  return first<{ n: number }>('SELECT COALESCE(SUM(amount), 0) AS n FROM xp_log WHERE date = ?', toDateKey())?.n ?? 0;
}

export function totalXp() {
  return first<{ n: number }>('SELECT COALESCE(SUM(amount), 0) AS n FROM xp_log')?.n ?? 0;
}

/** Level from total XP – each level needs a little more than the last. */
export function levelFor(xp: number) {
  let level = 1;
  let needed = 100;
  let remaining = xp;
  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = Math.round(needed * 1.25);
  }
  return { level, into: remaining, needed };
}

// Hearts -------------------------------------------------------------------------

export const MAX_HEARTS = 5;
const HEART_REFILL_MS = 30 * 60 * 1000;
const HEARTS_KEY = 'hearts.v1';

type HeartState = { hearts: number; updatedAt: number };

function readHearts(): HeartState {
  try {
    const raw = kv.get(HEARTS_KEY);
    const s: HeartState = raw ? JSON.parse(raw) : { hearts: MAX_HEARTS, updatedAt: Date.now() };
    // Refill one heart every 30 minutes.
    const gained = Math.floor((Date.now() - s.updatedAt) / HEART_REFILL_MS);
    if (gained > 0 && s.hearts < MAX_HEARTS) {
      return { hearts: Math.min(MAX_HEARTS, s.hearts + gained), updatedAt: s.updatedAt + gained * HEART_REFILL_MS };
    }
    return s.hearts >= MAX_HEARTS ? { hearts: MAX_HEARTS, updatedAt: Date.now() } : s;
  } catch {
    return { hearts: MAX_HEARTS, updatedAt: Date.now() };
  }
}

function writeHearts(s: HeartState) {
  try {
    kv.set(HEARTS_KEY, JSON.stringify(s));
  } catch {}
}

export function getHearts() {
  const s = readHearts();
  const nextInMs = s.hearts >= MAX_HEARTS ? 0 : HEART_REFILL_MS - (Date.now() - s.updatedAt);
  return { hearts: s.hearts, nextInMs };
}

export function loseHeart() {
  const s = readHearts();
  const next = { hearts: Math.max(0, s.hearts - 1), updatedAt: s.hearts >= MAX_HEARTS ? Date.now() : s.updatedAt };
  writeHearts(next);
  return next.hearts;
}

export function gainHeart() {
  const s = readHearts();
  writeHearts({ hearts: Math.min(MAX_HEARTS, s.hearts + 1), updatedAt: s.updatedAt });
}
