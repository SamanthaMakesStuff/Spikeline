import { STORAGE_KEY } from '../config';
import { migrate } from './migrate';
import { storedStateSchema, type StoredState } from './schema';

export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; state: StoredState }
  | { status: 'invalid' }
  | { status: 'unavailable' };

function getStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__spikeline_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function loadState(): LoadResult {
  const storage = getStorage();
  if (!storage) return { status: 'unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable' };
  }
  if (!raw) return { status: 'empty' };
  try {
    const parsed = storedStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { status: 'invalid' };
    return { status: 'ok', state: migrate(parsed.data) };
  } catch {
    return { status: 'invalid' };
  }
}

/** Returns true if the write succeeded. */
export function saveState(state: StoredState): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
