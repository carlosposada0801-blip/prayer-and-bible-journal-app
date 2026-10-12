import { useSyncExternalStore } from 'react';

import { achievementInfo, type Achievement } from '@/data/achievements';
import { BOOKS } from '@/data/bible/books';
import { isPublished, STUDY_SERIES } from '@/data/studies';

import { currentStreak } from './activity';
import { all, first, nowISO, run } from './database';
import { MEMORIZED_STAGE } from './memorize';

/**
 * Checks every badge's rule and unlocks new ones. Call after meaningful
 * actions (saving a prayer, finishing a lesson…). New unlocks pop up as a
 * celebratory toast (see components/achievement-toast.tsx).
 */

function count(sql: string, ...params: (string | number)[]) {
  return first<{ n: number }>(sql, ...params)?.n ?? 0;
}

function bookComplete(book: number) {
  return count('SELECT COUNT(*) AS n FROM chapters_read WHERE book = ?', book) >= BOOKS[book - 1].verses.length;
}

const rules: Record<string, () => boolean> = {
  'streak-3': () => currentStreak() >= 3,
  'streak-7': () => currentStreak() >= 7,
  'streak-30': () => currentStreak() >= 30,
  'streak-100': () => currentStreak() >= 100,
  'first-prayer': () => count('SELECT COUNT(*) AS n FROM prayers') >= 1,
  'prayer-answered-1': () => count('SELECT COUNT(*) AS n FROM prayers WHERE answered_at IS NOT NULL') >= 1,
  'prayer-answered-10': () => count('SELECT COUNT(*) AS n FROM prayers WHERE answered_at IS NOT NULL') >= 10,
  'prayer-streak-30': () => currentStreak('prayer') >= 30,
  'guided-first': () => count('SELECT COUNT(*) AS n FROM guided_sessions') >= 1,
  'gratitude-7': () => count('SELECT COUNT(DISTINCT date) AS n FROM gratitude') >= 7,
  'prayer-list-5': () => count('SELECT COUNT(*) AS n FROM people WHERE archived = 0') >= 5,
  'fast-complete': () => count('SELECT COUNT(*) AS n FROM fasts WHERE completed = 1') >= 1,
  'first-chapter': () => count('SELECT COUNT(*) AS n FROM chapters_read') >= 1,
  'finished-book': () => BOOKS.some((b) => bookComplete(b.id)),
  'finished-john': () => bookComplete(43),
  'finished-psalms': () => bookComplete(19),
  'finished-nt': () => count('SELECT COUNT(*) AS n FROM chapters_read WHERE book >= 40') >= 260,
  'finished-bible': () => count('SELECT COUNT(*) AS n FROM chapters_read') >= 1189,
  'first-highlight': () => count('SELECT COUNT(*) AS n FROM highlights') >= 1,
  'plan-complete': () => count('SELECT COUNT(*) AS n FROM plans WHERE completed_at IS NOT NULL') >= 1,
  'memorize-1': () => count('SELECT COUNT(*) AS n FROM memory_verses WHERE stage >= ?', MEMORIZED_STAGE) >= 1,
  'memorize-10': () => count('SELECT COUNT(*) AS n FROM memory_verses WHERE stage >= ?', MEMORIZED_STAGE) >= 10,
  'memorize-psalm-23': () =>
    count("SELECT COUNT(*) AS n FROM memory_verses WHERE stage >= ? AND reference IN ('Psalm 23:1-3', 'Psalm 23:4-6')", MEMORIZED_STAGE) >= 2,
  'trivia-100': () => count('SELECT COUNT(*) AS n FROM trivia_answers') >= 100,
  'study-first': () => count('SELECT COUNT(*) AS n FROM study_progress WHERE completed_at IS NOT NULL') >= 1,
  'study-series': () =>
    STUDY_SERIES.filter(isPublished).some(
      (s) =>
        s.lessons.length > 0 &&
        count(
          `SELECT COUNT(*) AS n FROM study_progress WHERE completed_at IS NOT NULL AND lesson_id IN (${s.lessons.map(() => '?').join(',')})`,
          ...s.lessons.map((l) => l.id),
        ) >= s.lessons.length,
    ),
};

// Toast queue ------------------------------------------------------------------

let queue: Achievement[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useAchievementQueue() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => queue,
    () => queue,
  );
}

export function dismissAchievement() {
  queue = queue.slice(1);
  emit();
}

// Unlocking ----------------------------------------------------------------------

export function unlockedIds(): Set<string> {
  return new Set(all<{ id: string }>('SELECT id FROM achievements').map((r) => r.id));
}

export function unlockedAchievements() {
  return all<{ id: string; unlocked_at: string }>('SELECT * FROM achievements ORDER BY unlocked_at DESC');
}

/** Unlocks one badge directly (for event-based ones like a perfect round). */
export function unlock(id: string) {
  const result = run('achievements', 'INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)', id, nowISO());
  if (result.changes > 0) {
    const info = achievementInfo(id);
    if (info) {
      queue = [...queue, info];
      emit();
    }
  }
}

export function checkAchievements() {
  const have = unlockedIds();
  for (const [id, rule] of Object.entries(rules)) {
    if (have.has(id)) continue;
    try {
      if (rule()) unlock(id);
    } catch {
      // A rule failing should never break the action that triggered it.
    }
  }
}
