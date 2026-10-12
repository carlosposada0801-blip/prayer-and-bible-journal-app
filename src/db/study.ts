import { STUDY_SERIES, isPublished, type StudyLesson, type StudySeries } from '@/data/studies';
import { toDateKey } from '@/lib/dates';

import { logActivity } from './activity';
import { all, first, nowISO, run } from './database';

/** Bible study progress and journaled answers. */

type Row = { lesson_id: string; completed_at: string | null; answers: string };

export function lessonProgress(lessonId: string) {
  const row = first<Row>('SELECT * FROM study_progress WHERE lesson_id = ?', lessonId);
  return {
    completedAt: row?.completed_at ?? null,
    answers: (row ? JSON.parse(row.answers) : {}) as Record<string, string>,
  };
}

export function saveAnswer(lessonId: string, questionIndex: number, text: string) {
  const { answers } = lessonProgress(lessonId);
  answers[questionIndex] = text;
  run('study_progress', 'INSERT INTO study_progress (lesson_id, answers) VALUES (?, ?) ON CONFLICT DO UPDATE SET answers = excluded.answers',
    lessonId, JSON.stringify(answers));
}

export function completeLesson(lessonId: string) {
  run('study_progress', `INSERT INTO study_progress (lesson_id, completed_at) VALUES (?, ?)
    ON CONFLICT DO UPDATE SET completed_at = COALESCE(study_progress.completed_at, excluded.completed_at)`, lessonId, nowISO());
  logActivity('study');
}

export function completedLessonIds(): Set<string> {
  return new Set(all<{ lesson_id: string }>('SELECT lesson_id FROM study_progress WHERE completed_at IS NOT NULL').map((r) => r.lesson_id));
}

export function completedLessonCount() {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM study_progress WHERE completed_at IS NOT NULL')?.n ?? 0;
}

/** The lesson finished today, if any (so we can say "come back tomorrow"). */
export function completedToday() {
  const last = first<{ lesson_id: string; completed_at: string }>(
    'SELECT lesson_id, completed_at FROM study_progress WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1',
  );
  return last && toDateKey(new Date(last.completed_at)) === toDateKey() ? last.lesson_id : null;
}

/**
 * Today's lesson: the next unfinished lesson in the first published series
 * you haven't completed.
 */
export function todaysLesson(): { series: StudySeries; lesson: StudyLesson; index: number } | null {
  const done = completedLessonIds();
  for (const series of STUDY_SERIES.filter(isPublished)) {
    const index = series.lessons.findIndex((l) => !done.has(l.id));
    if (index >= 0) return { series, lesson: series.lessons[index], index };
  }
  return null;
}
