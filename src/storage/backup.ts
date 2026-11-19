import { backupSchema, type StoredState } from './schema';
import { migrate } from './migrate';
import { ITEM_BY_ID } from '../content/items';

export function backupFileName(date = new Date()): string {
  return `spikeline-backup-${date.toISOString().slice(0, 10)}.json`;
}

export function serialiseBackup(state: StoredState): string {
  return JSON.stringify({ kind: 'spikeline-backup', state }, null, 2);
}

export type ParsedBackup =
  | { ok: true; state: StoredState; answerCount: number; updatedAt: string }
  | { ok: false };

/** Plain failure only. Never expose technical detail to the person. */
export function parseBackup(text: string): ParsedBackup {
  try {
    const result = backupSchema.safeParse(JSON.parse(text));
    if (!result.success) return { ok: false };
    const state = migrate(result.data.state);
    const answerCount = Object.keys(state.answers).filter((id) => id in ITEM_BY_ID).length;
    return { ok: true, state, answerCount, updatedAt: state.updatedAt };
  } catch {
    return { ok: false };
  }
}

export function downloadTextFile(name: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
