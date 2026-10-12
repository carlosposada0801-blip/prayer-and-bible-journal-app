import { useMemo, useSyncExternalStore } from 'react';

/**
 * A tiny "live query" system: writes call notify('prayers'), and any screen
 * using useLive(…, ['prayers']) re-runs its query and re-renders.
 */

const versions = new Map<string, number>();
const listeners = new Set<() => void>();
let globalVersion = 0;

export function notify(...tables: string[]) {
  tables.forEach((t) => versions.set(t, (versions.get(t) ?? 0) + 1));
  globalVersion++;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useTablesVersion(tables: string[]) {
  const key = tables.join(',');
  return useSyncExternalStore(
    subscribe,
    () => key.split(',').reduce((sum, t) => sum + (versions.get(t) ?? 0), 0),
    () => 0,
  );
}

/**
 * Runs `query` and re-runs it whenever one of `tables` changes or `deps` change.
 *
 * const prayers = useLive(() => listPrayers(filter), ['prayers'], [filter]);
 */
export function useLive<T>(query: () => T, tables: string[], deps: unknown[] = []): T {
  const version = useTablesVersion(tables);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(query, [version, ...deps]);
}

/** Bumps on any write – handy for screens that summarize everything (stats). */
export function useAnyChange() {
  return useSyncExternalStore(subscribe, () => globalVersion, () => 0);
}
