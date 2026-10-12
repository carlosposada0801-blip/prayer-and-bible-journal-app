import { TRIVIA, type TriviaLevel, type TriviaQuestion } from '@/data/trivia';
import { parseReference } from '@/data/bible/references';
import { shuffle } from '@/lib/random';

import { logActivity } from './activity';
import { all, first, nowISO, run } from './database';

/** Trivia answers and round building. */

export function recordTriviaAnswer(questionId: string, correct: boolean) {
  run('trivia_answers', 'INSERT INTO trivia_answers (question_id, correct, answered_at) VALUES (?, ?, ?)', questionId, correct ? 1 : 0, nowISO());
  logActivity('trivia');
}

export function triviaStats() {
  const row = first<{ total: number; correct: number }>('SELECT COUNT(*) AS total, COALESCE(SUM(correct), 0) AS correct FROM trivia_answers');
  return { total: row?.total ?? 0, correct: row?.correct ?? 0 };
}

export function triviaStatsByLevel(level: TriviaLevel) {
  const ids = new Set(TRIVIA.filter((q) => q.level === level).map((q) => q.id));
  const rows = all<{ question_id: string; correct: number }>('SELECT question_id, MAX(correct) AS correct FROM trivia_answers GROUP BY question_id');
  const mastered = rows.filter((r) => ids.has(r.question_id) && r.correct).length;
  return { mastered, total: ids.size };
}

export type RoundFilter = { level?: TriviaLevel; topic?: string; book?: number };

export function bookOf(q: TriviaQuestion) {
  return parseReference(q.reference)?.book ?? 0;
}

/** Up to `size` questions, preferring ones you haven't answered correctly yet. */
export function buildRound(filter: RoundFilter, size = 10): TriviaQuestion[] {
  const pool = TRIVIA.filter(
    (q) => (!filter.level || q.level === filter.level) && (!filter.topic || q.topic === filter.topic) && (!filter.book || bookOf(q) === filter.book),
  );
  const correctIds = new Set(all<{ question_id: string }>('SELECT DISTINCT question_id FROM trivia_answers WHERE correct = 1').map((r) => r.question_id));
  const fresh = shuffle(pool.filter((q) => !correctIds.has(q.id)));
  const seen = shuffle(pool.filter((q) => correctIds.has(q.id)));
  return [...fresh, ...seen].slice(0, size);
}
