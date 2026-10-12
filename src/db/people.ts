import { daysBetween, toDateKey } from '@/lib/dates';

import { logActivity } from './activity';
import { all, first, nowISO, run } from './database';

/** Prayer list: the people you're praying for. */

export type Person = {
  id: number;
  name: string;
  relationship: string | null;
  notes: string | null;
  created_at: string;
  last_prayed_at: string | null;
  archived: number;
};

export function listPeople() {
  return all<Person>('SELECT * FROM people WHERE archived = 0 ORDER BY name COLLATE NOCASE');
}

export function getPerson(id: number) {
  return first<Person>('SELECT * FROM people WHERE id = ?', id);
}

export function savePerson(input: { name: string; relationship?: string; notes?: string }, id?: number) {
  if (id) {
    run('people', 'UPDATE people SET name = ?, relationship = ?, notes = ? WHERE id = ?',
      input.name.trim(), input.relationship?.trim() || null, input.notes?.trim() || null, id);
    return id;
  }
  return Number(
    run('people', 'INSERT INTO people (name, relationship, notes, created_at) VALUES (?, ?, ?, ?)',
      input.name.trim(), input.relationship?.trim() || null, input.notes?.trim() || null, nowISO()).lastInsertRowId,
  );
}

export function archivePerson(id: number) {
  run('people', 'UPDATE people SET archived = 1 WHERE id = ?', id);
}

export function markPrayedFor(id: number) {
  run('people', 'UPDATE people SET last_prayed_at = ? WHERE id = ?', nowISO(), id);
  logActivity('prayer');
}

export function prayedToday(p: Person) {
  return p.last_prayed_at ? toDateKey(new Date(p.last_prayed_at)) === toDateKey() : false;
}

/**
 * Today's person: rotates through your list, choosing whoever you prayed
 * for longest ago. Stable for the whole day.
 */
export function personOfTheDay(): Person | null {
  const people = listPeople();
  if (people.length === 0) return null;
  const today = toDateKey();
  const prayedTodayPerson = people.find((p) => p.last_prayed_at && toDateKey(new Date(p.last_prayed_at)) === today);
  if (prayedTodayPerson) return prayedTodayPerson;
  const sorted = [...people].sort((a, b) => (a.last_prayed_at ?? '').localeCompare(b.last_prayed_at ?? ''));
  const oldest = sorted.filter((p) => p.last_prayed_at === sorted[0].last_prayed_at);
  // Among equally-overdue people, pick by day so it doesn't change on every render.
  return oldest[daysBetween(new Date(2024, 0, 1), new Date()) % oldest.length];
}
