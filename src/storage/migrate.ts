import { BANK_VERSION } from '../config';
import { ITEM_BY_ID } from '../content/items';
import type { StoredState } from './schema';

/**
 * Upgrade stored data to the current schema. Keyed on schemaVersion; a no-op for v1 but in place.
 * If bankVersion changed, keep only the answers whose item IDs still exist.
 */
export function migrate(stored: StoredState): StoredState {
  let s = stored;
  // switch (s.schemaVersion) { case 1: s = v1ToV2(s); }
  if (s.bankVersion !== BANK_VERSION) {
    const answers = Object.fromEntries(Object.entries(s.answers).filter(([id]) => id in ITEM_BY_ID));
    s = { ...s, answers, bankVersion: BANK_VERSION };
  }
  return s;
}
