import { openDatabaseSync } from 'expo-sqlite';

export function openUserDatabase(name: string) {
  return openDatabaseSync(name);
}

/** Native: the database can be opened synchronously right away. */
export async function prepareUserDatabase(_name: string) {}
