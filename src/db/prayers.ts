import { logActivity } from './activity';
import { all, exec, first, nowISO, run, transaction } from './database';

/** Prayer journal: prayers, tags and answered prayers. */

export type Tag = { id: number; name: string; builtin: number };

export type Prayer = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  answered_at: string | null;
  answer_note: string | null;
  person_id: number | null;
  tags: Tag[];
};

export type PrayerFilter = {
  search?: string;
  tagId?: number;
  status?: 'all' | 'open' | 'answered';
  /** Inclusive ISO date bounds. */
  from?: string;
  to?: string;
};

const TABLES = ['prayers', 'prayer_tags', 'tags'];

function withTags(rows: Omit<Prayer, 'tags'>[]): Prayer[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const tagRows = all<Tag & { prayer_id: number }>(
    `SELECT t.*, pt.prayer_id FROM prayer_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.prayer_id IN (${ids.map(() => '?').join(',')}) ORDER BY t.name`,
    ...ids,
  );
  return rows.map((r) => ({ ...r, tags: tagRows.filter((t) => t.prayer_id === r.id) }));
}

export function listPrayers(filter: PrayerFilter = {}): Prayer[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filter.search?.trim()) {
    where.push('(p.title LIKE ? OR p.body LIKE ? OR p.answer_note LIKE ?)');
    const q = `%${filter.search.trim()}%`;
    params.push(q, q, q);
  }
  if (filter.tagId) {
    where.push('p.id IN (SELECT prayer_id FROM prayer_tags WHERE tag_id = ?)');
    params.push(filter.tagId);
  }
  if (filter.status === 'open') where.push('p.answered_at IS NULL');
  if (filter.status === 'answered') where.push('p.answered_at IS NOT NULL');
  if (filter.from) {
    where.push('p.created_at >= ?');
    params.push(filter.from);
  }
  if (filter.to) {
    where.push('p.created_at <= ?');
    params.push(filter.to);
  }
  const sql = `SELECT p.* FROM prayers p ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.created_at DESC`;
  return withTags(all(sql, ...params));
}

export function getPrayer(id: number): Prayer | null {
  const row = first<Omit<Prayer, 'tags'>>('SELECT * FROM prayers WHERE id = ?', id);
  return row ? withTags([row])[0] : null;
}

export type PrayerInput = { title: string; body: string; createdAt: string; tagIds: number[]; personId?: number | null };

export function savePrayer(input: PrayerInput, id?: number): number {
  let prayerId = id ?? 0;
  transaction(TABLES, () => {
    if (id) {
      exec(
        'UPDATE prayers SET title = ?, body = ?, created_at = ?, updated_at = ?, person_id = ? WHERE id = ?',
        input.title, input.body, input.createdAt, nowISO(), input.personId ?? null, id,
      );
      exec('DELETE FROM prayer_tags WHERE prayer_id = ?', id);
    } else {
      const result = exec(
        'INSERT INTO prayers (title, body, created_at, updated_at, person_id) VALUES (?, ?, ?, ?, ?)',
        input.title, input.body, input.createdAt, nowISO(), input.personId ?? null,
      );
      prayerId = Number(result.lastInsertRowId);
    }
    for (const tagId of input.tagIds) {
      exec('INSERT OR IGNORE INTO prayer_tags (prayer_id, tag_id) VALUES (?, ?)', prayerId, tagId);
    }
  });
  if (!id) logActivity('prayer');
  return prayerId;
}

export function deletePrayer(id: number) {
  run(TABLES, 'DELETE FROM prayers WHERE id = ?', id);
}

export function markAnswered(id: number, note: string, answeredAt: string) {
  run('prayers', 'UPDATE prayers SET answered_at = ?, answer_note = ?, updated_at = ? WHERE id = ?', answeredAt, note.trim(), nowISO(), id);
}

export function unmarkAnswered(id: number) {
  run('prayers', 'UPDATE prayers SET answered_at = NULL, answer_note = NULL, updated_at = ? WHERE id = ?', nowISO(), id);
}

export function answeredPrayers() {
  return withTags(all('SELECT * FROM prayers WHERE answered_at IS NOT NULL ORDER BY answered_at DESC'));
}

export function prayerCounts() {
  return (
    first<{ total: number; answered: number }>(
      'SELECT COUNT(*) AS total, COALESCE(SUM(answered_at IS NOT NULL), 0) AS answered FROM prayers',
    ) ?? { total: 0, answered: 0 }
  );
}

// Tags -----------------------------------------------------------------------

export function listTags() {
  return all<Tag>('SELECT * FROM tags ORDER BY builtin DESC, id');
}

export function createTag(name: string): number {
  const clean = name.trim();
  const existing = first<Tag>('SELECT * FROM tags WHERE name = ?', clean);
  if (existing) return existing.id;
  return Number(run('tags', 'INSERT INTO tags (name) VALUES (?)', clean).lastInsertRowId);
}

export function deleteTag(id: number) {
  run(TABLES, 'DELETE FROM tags WHERE id = ? AND builtin = 0', id);
}
