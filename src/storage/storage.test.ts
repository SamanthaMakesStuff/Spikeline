import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../config';
import { backupFileName, parseBackup, serialiseBackup } from './backup';
import { emptyState } from './defaults';
import { migrate } from './migrate';
import { clearState, loadState, saveState } from './persistence';

const sample = () => ({ ...emptyState('2026-11-12T09:00:00.000Z'), answers: { 'C1.1': { ease: 3 as const, cost: 1 as const, answeredAt: '2026-11-12T09:00:00.000Z' } } });

beforeEach(() => window.localStorage.clear());

describe('persistence', () => {
  it('starts empty, saves and loads the same state', () => {
    expect(loadState().status).toBe('empty');
    const s = sample();
    expect(saveState(s)).toBe(true);
    const r = loadState();
    expect(r.status).toBe('ok');
    if (r.status === 'ok') expect(r.state.answers['C1.1'].ease).toBe(3);
  });

  it('treats corrupt data as invalid rather than crashing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState().status).toBe('invalid');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1 }));
    expect(loadState().status).toBe('invalid');
  });

  it('clears everything', () => {
    saveState(sample());
    clearState();
    expect(loadState().status).toBe('empty');
  });

  it('reports a failed save when storage is full or blocked', () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); };
    try {
      expect(saveState(sample())).toBe(false);
      expect(loadState().status).toBe('unavailable');
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});

describe('backup and restore', () => {
  it('round-trips the full state and marks the file as a backup', () => {
    const text = serialiseBackup(sample());
    expect(JSON.parse(text).kind).toBe('spikeline-backup');
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.answerCount).toBe(1);
      expect(parsed.state.answers).toEqual(sample().answers);
    }
  });

  it('rejects other files with no technical detail', () => {
    expect(parseBackup('hello')).toEqual({ ok: false });
    expect(parseBackup('{"kind":"other"}')).toEqual({ ok: false });
    expect(parseBackup(JSON.stringify({ kind: 'spikeline-backup', state: { schemaVersion: 1 } }))).toEqual({ ok: false });
  });

  it('names the file with the date', () => {
    expect(backupFileName(new Date('2026-11-12T10:00:00Z'))).toBe('spikeline-backup-2026-11-12.json');
  });
});

describe('migration', () => {
  it('keeps answers whose item IDs still exist when the bank version changes', () => {
    const s = { ...sample(), bankVersion: '0.9.0', answers: { ...sample().answers, 'GONE.1': { ease: 2 as const, answeredAt: '' } } };
    const m = migrate(s);
    expect(Object.keys(m.answers)).toEqual(['C1.1']);
  });
});
