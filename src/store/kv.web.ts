/** Web fallback (used only for browser previews) backed by localStorage. */
export const kv = {
  get: (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  set: (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
};
