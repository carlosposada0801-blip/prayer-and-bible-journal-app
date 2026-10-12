import { logActivity } from './activity';
import { all, first, nowISO, run } from './database';

/** Fasting tracker: fasts, live progress and daily reflections. */

export type FastType = 'food' | 'water' | 'daniel' | 'social' | 'custom';

export type Fast = {
  id: number;
  type: FastType;
  title: string;
  focus: string;
  started_at: string;
  planned_hours: number;
  ended_at: string | null;
  completed: number;
};

export type Reflection = { id: number; fast_id: number; body: string; created_at: string };

const TABLES = ['fasts', 'fast_reflections'];

export function activeFast() {
  return first<Fast>('SELECT * FROM fasts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1');
}

export function getFast(id: number) {
  return first<Fast>('SELECT * FROM fasts WHERE id = ?', id);
}

export function pastFasts() {
  return all<Fast>('SELECT * FROM fasts WHERE ended_at IS NOT NULL ORDER BY started_at DESC');
}

export function startFast(input: { type: FastType; title: string; focus: string; plannedHours: number; startedAt?: string }) {
  const id = Number(
    run(TABLES, 'INSERT INTO fasts (type, title, focus, started_at, planned_hours) VALUES (?, ?, ?, ?, ?)',
      input.type, input.title, input.focus, input.startedAt ?? nowISO(), input.plannedHours).lastInsertRowId,
  );
  logActivity('fast');
  return id;
}

/** Ends a fast. It counts as completed if it reached its planned length. */
export function endFast(id: number) {
  const fast = getFast(id);
  if (!fast) return;
  const hours = (Date.now() - new Date(fast.started_at).getTime()) / 3_600_000;
  const completed = hours >= fast.planned_hours * 0.98 ? 1 : 0;
  run(TABLES, 'UPDATE fasts SET ended_at = ?, completed = ? WHERE id = ?', nowISO(), completed, id);
  return completed === 1;
}

export function deleteFast(id: number) {
  run(TABLES, 'DELETE FROM fasts WHERE id = ?', id);
}

export function addReflection(fastId: number, body: string) {
  if (!body.trim()) return;
  run(TABLES, 'INSERT INTO fast_reflections (fast_id, body, created_at) VALUES (?, ?, ?)', fastId, body.trim(), nowISO());
  logActivity('fast');
}

export function reflectionsFor(fastId: number) {
  return all<Reflection>('SELECT * FROM fast_reflections WHERE fast_id = ? ORDER BY created_at DESC', fastId);
}

export function completedFastCount() {
  return first<{ n: number }>('SELECT COUNT(*) AS n FROM fasts WHERE completed = 1')?.n ?? 0;
}
