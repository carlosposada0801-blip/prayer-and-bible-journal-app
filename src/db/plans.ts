import { resolvePlan, type Plan, type PlanOptions } from '@/data/plans';
import { addDays, daysBetween, fromDateKey, toDateKey } from '@/lib/dates';

import { logActivity } from './activity';
import { all, exec, first, nowISO, run, transaction } from './database';

/** Reading plan progress: start, complete days, catch up. */

type PlanRow = {
  id: string;
  start_date: string;
  started_at: string;
  completed_at: string | null;
  custom: string | null;
  active: number;
};

const TABLES = ['plans', 'plan_days'];

export type PlanState = {
  plan: Plan;
  options: PlanOptions;
  row: PlanRow;
  totalDays: number;
  completed: Set<number>;
  /** The day number the calendar says you're on (1-based, capped to the plan length). */
  scheduledDay: number;
  /** The first day you haven't finished. */
  nextDay: number;
  /** How many scheduled days are unfinished. */
  behind: number;
  done: boolean;
};

function stateFor(row: PlanRow): PlanState | null {
  const options: PlanOptions = row.custom ? JSON.parse(row.custom) : {};
  const plan = resolvePlan(row.id, options);
  if (!plan) return null;
  const totalDays = plan.days(options.pace);
  const completed = new Set(all<{ day: number }>('SELECT day FROM plan_days WHERE plan_id = ?', row.id).map((r) => r.day));
  const scheduledDay = Math.min(totalDays, Math.max(1, daysBetween(fromDateKey(row.start_date), new Date()) + 1));
  let nextDay = 1;
  while (completed.has(nextDay) && nextDay <= totalDays) nextDay++;
  let behind = 0;
  for (let d = 1; d <= scheduledDay; d++) if (!completed.has(d)) behind++;
  // Today's reading itself isn't "behind".
  if (!completed.has(scheduledDay)) behind = Math.max(0, behind - 1);
  return { plan, options, row, totalDays, completed, scheduledDay, nextDay, behind, done: completed.size >= totalDays };
}

export function getPlanState(id: string) {
  const row = first<PlanRow>('SELECT * FROM plans WHERE id = ?', id);
  return row ? stateFor(row) : null;
}

export function activePlans(): PlanState[] {
  return all<PlanRow>('SELECT * FROM plans WHERE active = 1 AND completed_at IS NULL ORDER BY started_at DESC')
    .map(stateFor)
    .filter((s): s is PlanState => Boolean(s));
}

export function completedPlans(): PlanState[] {
  return all<PlanRow>('SELECT * FROM plans WHERE completed_at IS NOT NULL ORDER BY completed_at DESC')
    .map(stateFor)
    .filter((s): s is PlanState => Boolean(s));
}

export function startPlan(id: string, options: PlanOptions = {}, startDate = toDateKey()) {
  transaction(TABLES, () => {
    exec('DELETE FROM plan_days WHERE plan_id = ?', id);
    exec(
      'INSERT OR REPLACE INTO plans (id, start_date, started_at, completed_at, custom, active) VALUES (?, ?, ?, NULL, ?, 1)',
      id, startDate, nowISO(), JSON.stringify(options),
    );
  });
}

export function createCustomPlan(options: PlanOptions) {
  const id = `custom-${Date.now()}`;
  startPlan(id, options);
  return id;
}

export function setDayComplete(id: string, day: number, complete: boolean) {
  if (complete) {
    run(TABLES, 'INSERT OR IGNORE INTO plan_days (plan_id, day, completed_at) VALUES (?, ?, ?)', id, day, nowISO());
    logActivity('plan');
  } else {
    run(TABLES, 'DELETE FROM plan_days WHERE plan_id = ? AND day = ?', id, day);
  }
  const state = getPlanState(id);
  if (state) {
    run('plans', 'UPDATE plans SET completed_at = ? WHERE id = ?', state.done ? state.row.completed_at ?? nowISO() : null, id);
  }
  return state;
}

/** Catch up option 1: move the schedule so your next unread day is today. */
export function shiftSchedule(id: string) {
  const state = getPlanState(id);
  if (!state) return;
  run('plans', 'UPDATE plans SET start_date = ? WHERE id = ?', toDateKey(addDays(new Date(), -(state.nextDay - 1))), id);
}

/** Catch up option 2: count the missed days as read and keep going. */
export function markMissedAsRead(id: string) {
  const state = getPlanState(id);
  if (!state) return;
  transaction(TABLES, () => {
    for (let d = 1; d < state.scheduledDay; d++) {
      if (!state.completed.has(d)) exec('INSERT OR IGNORE INTO plan_days (plan_id, day, completed_at) VALUES (?, ?, ?)', id, d, nowISO());
    }
  });
}

export function stopPlan(id: string) {
  run(TABLES, 'UPDATE plans SET active = 0 WHERE id = ?', id);
}

export function deletePlan(id: string) {
  run(TABLES, 'DELETE FROM plans WHERE id = ?', id);
}

export function isPlanActive(id: string) {
  return Boolean(first('SELECT 1 FROM plans WHERE id = ? AND active = 1 AND completed_at IS NULL', id));
}
