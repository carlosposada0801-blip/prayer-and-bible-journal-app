import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

import { notify } from './live';
import { migrations } from './migrations';
import { openUserDatabase, prepareUserDatabase } from './open';

/**
 * The user's personal data (prayers, highlights, progress…) lives in one
 * SQLite file on the device. Bible text lives in separate read-only files
 * (see src/lib/bible).
 *
 * The helpers below are synchronous: user data is small, and sync reads keep
 * screens simple and instant. Every write calls `notify()` so screens that
 * read those tables refresh automatically.
 *
 * Later (accounts + cloud sync): every table has stable ids and timestamps,
 * so a sync layer can be added in src/db without touching the screens.
 */
const NAME = 'abide.db';
let instance: SQLiteDatabase | undefined;

/** Opens the database (and runs migrations) the first time it's needed. */
export function getDb() {
  if (!instance) {
    const db = openUserDatabase(NAME);
    db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    migrate(db);
    instance = db;
  }
  return instance;
}

/** Awaited once at launch (needed for web previews; instant on iPhone). */
export async function prepareDatabase() {
  await prepareUserDatabase(NAME);
  getDb();
}

function migrate(db: SQLiteDatabase) {
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < migrations.length) {
    const sql = migrations[version];
    db.withTransactionSync(() => {
      db.execSync(sql);
      db.execSync(`PRAGMA user_version = ${version + 1}`);
    });
    version++;
  }
}

export type Params = SQLiteBindValue[];

export function all<T>(sql: string, ...params: Params): T[] {
  return getDb().getAllSync<T>(sql, params);
}

export function first<T>(sql: string, ...params: Params): T | null {
  return getDb().getFirstSync<T>(sql, params);
}

/** Runs a write and tells live queries on `tables` to refresh. */
export function run(tables: string | string[], sql: string, ...params: Params) {
  const result = getDb().runSync(sql, params);
  notify(...(Array.isArray(tables) ? tables : [tables]));
  return result;
}

/** Runs several writes atomically, then notifies once. */
export function transaction(tables: string[], work: () => void) {
  getDb().withTransactionSync(work);
  notify(...tables);
}

/** Like run() but without notifying – use inside transaction(). */
export function exec(sql: string, ...params: Params) {
  return getDb().runSync(sql, params);
}

export function nowISO() {
  return new Date().toISOString();
}
