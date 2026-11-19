import { describe, expect, it } from 'vitest';
import { ITEMS, ITEM_BY_ID } from './items';
import { SECTIONS } from './sections';
import { SPOKES, spokeItems } from './spokes';
import { ADHD_DOMAINS, LOAD_DOMAINS } from './load';
import { DRIVER_SETS } from './drivers';
import * as copy from './copy';

// Every ID in Appendix A, written out from the brief's tables.
const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}.${i + 1}`);
const APPENDIX_A_IDS = [
  ...range('C1', 5), ...range('C2', 5), ...range('C3', 5), ...range('C4', 5), ...range('C5', 6), ...range('C6', 7),
  ...range('C7', 9), ...range('C8', 5), ...range('C9', 5), ...range('C10', 5), ...range('C11', 4), ...range('C12', 5),
  ...range('C13', 9), ...range('C14', 4),
  ...range('M1', 11), ...range('M2', 6), ...range('M3', 6), ...range('M4', 6), ...range('M5', 14), ...range('M7', 5),
];
// Items the brief describes without IDs get IDs here (see DECISIONS.md).
const EXTRA_IDS = ['M2.0', 'M2.7', 'M5.T1', 'M5.T2', 'M5.T3', 'M5.T4', 'M5.T5', 'M5.MED1', 'M5.MED2', 'M6.0', 'M6.1', 'M6.2', 'M6.3', 'M6.4', 'M6.5'];

describe('item bank integrity', () => {
  it('has every Appendix A ID exactly once, and nothing else', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...APPENDIX_A_IDS, ...EXTRA_IDS].sort());
  });

  it('puts every item in a defined section', () => {
    const sections = new Set(SECTIONS.map((s) => s.id));
    for (const item of ITEMS) expect(sections.has(item.section), item.id).toBe(true);
  });

  it('points every scoresInto key at a defined spoke, load or ADHD domain', () => {
    const spokes = new Set(SPOKES.map((s) => s.id));
    const loads = new Set(LOAD_DOMAINS.map((l) => l.id));
    const adhd = new Set(ADHD_DOMAINS.map((a) => a.id));
    for (const item of ITEMS) {
      const s = item.scoresInto;
      if (s?.spoke) expect(spokes.has(s.spoke), item.id).toBe(true);
      if (s?.load) expect(loads.has(s.load), item.id).toBe(true);
      if (s?.adhd) expect(adhd.has(s.adhd), item.id).toBe(true);
    }
  });

  it('references only defined driver sets', () => {
    for (const item of ITEMS) if (item.driverSet) expect(DRIVER_SETS[item.driverSet], item.id).toBeDefined();
  });

  it('matches the spoke table in the brief', () => {
    const expected: Record<string, string[]> = {
      attention: ['C1.1', 'C1.2', 'C1.3'],
      starting: ['C2.1', 'C2.2', 'C2.3'],
      planning: ['C3.1', 'C3.2', 'C3.3', 'C3.4', 'C3.5'],
      memory: ['C4.1', 'C4.2', 'C4.3', 'C4.4'],
      language: ['C5.1', 'C5.2', 'C5.3', 'C5.4', 'C5.5'],
      socialEase: ['C6.3', 'C6.4', 'C6.5', 'C6.6'],
      feelings: ['C8.3', 'C8.4', 'C9.5'],
      busyPlaces: ['C7.8'],
      change: ['C10.1', 'C10.2'],
      movement: ['C11.1', 'C11.2', 'C11.3'],
      literacy: ['C12.1', 'C12.2', 'C12.3', 'C12.4', 'C12.5'],
    };
    for (const spoke of SPOKES) {
      expect(spokeItems(spoke.id).map((i) => i.id).sort(), spoke.id).toEqual([...expected[spoke.id]].sort());
    }
  });

  it('has no hard-day ratings on Movement or Reading items', () => {
    for (const id of [...range('C11', 3), ...range('C12', 5)]) expect(ITEM_BY_ID[id].hardDay, id).toBeFalsy();
  });

  it('uses typographic quotes, never straight ones, in user-facing text', () => {
    const strings: string[] = [];
    for (const i of ITEMS) {
      strings.push(i.text, i.example ?? '', ...(i.options ?? []).map((o) => o.label));
    }
    for (const v of Object.values(copy)) if (typeof v === 'string') strings.push(v);
    for (const s of strings) expect(s, s).not.toMatch(/['"]/);
  });

  it('avoids words the brief rules out in UI copy', () => {
    const banned = /\b(screen|screening|assess|assessment|diagnose|likelihood|deficit|impairment|symptom|disorder)\b/i;
    const allowedContexts = /not a diagnosis|can’t tell you whether|workplace needs assessment/i;
    const strings: string[] = [];
    for (const i of ITEMS) strings.push(i.text, i.example ?? '');
    for (const s of SECTIONS) strings.push(s.intro ?? '', s.optInBlurb ?? '', s.title);
    for (const [k, v] of Object.entries(copy)) if (typeof v === 'string' && k !== 'NOT_DIAGNOSTIC') strings.push(v);
    for (const s of strings) if (!allowedContexts.test(s)) expect(s, s).not.toMatch(banned);
  });

  it('never calls a person spiky or flat, and never uses the label RSD or PDA', () => {
    const all = JSON.stringify([ITEMS, SECTIONS, Object.values(copy)]);
    expect(all).not.toMatch(/\bRSD\b|\bPDA\b/);
    expect(all).not.toMatch(/you are spiky|you’re spiky|how spiky/i);
  });
});
