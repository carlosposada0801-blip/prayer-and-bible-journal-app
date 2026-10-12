import Storage from 'expo-sqlite/kv-store';

/** Small synchronous key-value store backed by SQLite on the device. */
export const kv = {
  get: (key: string) => Storage.getItemSync(key),
  set: (key: string, value: string) => Storage.setItemSync(key, value),
};
