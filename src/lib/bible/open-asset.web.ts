import { Asset } from 'expo-asset';
import { deserializeDatabaseAsync } from 'expo-sqlite';

/** Web previews: download the bundled .db file and open it in memory. */
export async function openAssetDatabase(_fileName: string, assetId: number) {
  const asset = Asset.fromModule(assetId);
  const bytes = new Uint8Array(await (await fetch(asset.uri)).arrayBuffer());
  return deserializeDatabaseAsync(bytes);
}
