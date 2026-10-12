import { importDatabaseFromAssetAsync, openDatabaseAsync } from 'expo-sqlite';

/** Copies a bundled .db file into the documents folder (once) and opens it. */
export async function openAssetDatabase(fileName: string, assetId: number) {
  await importDatabaseFromAssetAsync(fileName, { assetId });
  return openDatabaseAsync(fileName, { useNewConnection: true });
}
