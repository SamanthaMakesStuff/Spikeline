import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from '../content/items';
import { A } from '../scoring/fixtures';
import { isAnswered, itemWeight, pageForIndex, paginate, sanitiseAnswer, sectionProgress, stepsFor, visibleItems } from './flow';

const c11 = ITEM_BY_ID['C1.1']; // EASE+COST, hard day, driver set
const c91 = ITEM_BY_ID['C9.1']; // FREQ with driver at 3–4

describe('step flow', () => {
  it('reveals ease → cost → hard day → driver, each after the last is answered', () => {
    expect(stepsFor(c11, undefined)).toEqual(['ease']);
    expect(stepsFor(c11, { ease: 1, answeredAt: '' })).toEqual(['ease', 'cost']);
    expect(stepsFor(c11, { ease: 1, cost: 2, answeredAt: '' })).toEqual(['ease', 'cost', 'hard']);
    expect(stepsFor(c11, { ease: 1, cost: 2, hard: 0, answeredAt: '' })).toEqual(['ease', 'cost', 'hard', 'driver']);
  });

  it('only offers the driver follow-up when ease is 0 or 1', () => {
    expect(stepsFor(c11, { ease: 3, cost: 2, hard: 2, answeredAt: '' })).not.toContain('driver');
  });

  it('skips everything after “doesn’t apply”', () => {
    expect(stepsFor(c11, { ease: 'na', answeredAt: '' })).toEqual(['ease']);
  });

  it('asks for context tags and a typical rating after “it depends”, then carries on', () => {
    expect(stepsFor(c11, { ease: 'depends', answeredAt: '' })).toEqual(['ease', 'depends']);
    expect(stepsFor(c11, { ease: 'depends', dependsTypical: 0, answeredAt: '' })).toEqual(['ease', 'depends', 'cost']);
  });

  it('opens the overwhelm drivers for C9.1 only when frequency is 3 or 4', () => {
    expect(stepsFor(c91, { freq: 2, answeredAt: '' })).toEqual(['freq']);
    expect(stepsFor(c91, { freq: 3, answeredAt: '' })).toEqual(['freq', 'driver']);
  });

  it('always asks the cost follow-up for strengths once rated', () => {
    expect(stepsFor(ITEM_BY_ID['C13.1'], { like: 0, answeredAt: '' })).toEqual(['like', 'costfu']);
  });

  it('removes answers from steps that are no longer showing, so hidden answers are never scored', () => {
    const cleaned = sanitiseAnswer(c11, { ease: 3, cost: 1, hard: 1, drivers: ['x'], dependsTypical: 2, dependsTags: ['home'], answeredAt: '' });
    expect(cleaned.drivers).toBeUndefined();
    expect(cleaned.dependsTypical).toBeUndefined();
    expect(cleaned.dependsTags).toBeUndefined();
    expect(cleaned.cost).toBe(1);
  });
});

describe('answered state and progress', () => {
  it('counts an item as answered by its main answer', () => {
    expect(isAnswered(c11, A.ec(2))).toBe(true);
    expect(isAnswered(c11, A.na())).toBe(true);
    expect(isAnswered(c11, A.depends())).toBe(false);
    expect(isAnswered(c11, A.depends(2))).toBe(true);
    expect(isAnswered(c11, undefined)).toBe(false);
  });

  it('reports section progress and marks done only when all are answered or finished', () => {
    const half = sectionProgress('C1', { 'C1.1': A.ec(2), 'C1.2': A.ec(2) });
    expect(half).toMatchObject({ total: 5, answered: 2, done: false, started: true });
    expect(sectionProgress('C1', {}, ['C1']).done).toBe(true);
  });
});

describe('pages', () => {
  it('shows one item at a time when asked', () => {
    const items = visibleItems('C1', {});
    expect(paginate(items, 'one')).toHaveLength(items.length);
  });

  it('groups up to three items’ worth, weighting long items more', () => {
    const items = visibleItems('C1', {});
    for (const page of paginate(items, 'few')) expect(page.reduce((n, i) => n + itemWeight(i), 0)).toBeLessThanOrEqual(3);
  });

  it('finds the page for an item number whatever the layout', () => {
    const items = visibleItems('C5', {});
    const few = paginate(items, 'few');
    const { page, firstIndex } = pageForIndex(few, 2);
    expect(page.some((i) => i.id === 'C5.2')).toBe(true);
    expect(firstIndex).toBeLessThanOrEqual(2);
  });

  it('only shows hormone grids for situations the person chose, and the medication follow-up only after “yes”', () => {
    expect(visibleItems('M6', {}).map((i) => i.id)).toEqual(['M6.0']);
    const withCycles = visibleItems('M6', { 'M6.0': { choices: ['cycles'], answeredAt: '' } });
    expect(withCycles.map((i) => i.id)).toEqual(['M6.0', 'M6.1']);
    expect(visibleItems('M5', {}).some((i) => i.id === 'M5.MED2')).toBe(false);
    expect(visibleItems('M5', { 'M5.MED1': { choice: 'yes', answeredAt: '' } }).some((i) => i.id === 'M5.MED2')).toBe(true);
  });
});
