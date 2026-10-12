import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';

/**
 * Web is only used for quick design previews, so the database lives in
 * memory there (nothing is saved between page loads). The iPhone app uses a
 * real file – see open.ts.
 */
export function openUserDatabase(_name: string) {
  return openDatabaseSync(':memory:');
}

/** SQLite's web worker loads asynchronously; wake it before any sync call. */
export async function prepareUserDatabase(_name: string) {
  const warm = await openDatabaseAsync(':memory:');
  await warm.closeAsync();
}
