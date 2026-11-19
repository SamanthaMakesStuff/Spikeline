import { describe, expect, it } from 'vitest';
import { computeProfile, labelRelative } from './profile';
import { scoreCapacity, scoreFrequency } from './domains';
import { meetsThreshold } from './util';
import { A, CAPACITY_SECTIONS, fillCore, fillSections, optionIdByLabel } from './fixtures';
import { ITEM_BY_ID } from '../content/items';
import { spokeItems } from '../content/spokes';
import { itemsWhere } from './domains';

describe('exclusions', () => {
  it('never scores "doesn’t apply", unfinished "it depends", not sure or skipped as 0', () => {
    const items = spokeItems('attention'); // C1.1–C1.3
    const answers = {
      'C1.1': A.ec(4, 0, 4),
      'C1.2': A.na(),
      'C1.3': A.ec(2, 'unsure' as never),
    };
    const s = scoreCapacity('attention', items, answers);
    expect(s.n).toBe(2); // C1.2 excluded from n
    expect(s.answered).toBe(2);
    expect(s.ease).toBe(75); // mean(4,2) × 25, not dragged down by the excluded item
    expect(s.cost).toBe(0); // 'unsure' cost is ignored
  });

  it('skipped items count against the threshold but are not scored as 0', () => {
    const items = spokeItems('planning'); // 5 items
    const three = scoreCapacity('planning', items, { 'C3.1': A.e(4), 'C3.2': A.e(4), 'C3.3': A.e(4) });
    expect(three.shown).toBe(true);
    expect(three.ease).toBe(100);
    const two = scoreCapacity('planning', items, { 'C3.1': A.e(4), 'C3.2': A.e(4) });
    expect(two.shown).toBe(false);
    expect(two.ease).toBeUndefined();
  });

  it('excludes "it depends" with no typical rating, and scores dependsTypical as EASE', () => {
    const items = spokeItems('attention');
    const without = scoreCapacity('attention', items, { 'C1.1': A.depends(), 'C1.2': A.e(2), 'C1.3': A.e(2) });
    expect(without.answered).toBe(2);
    expect(without.shown).toBe(false); // 2 < min(3, 3)
    const withTypical = scoreCapacity('attention', items, { 'C1.1': A.depends(3), 'C1.2': A.e(2), 'C1.3': A.e(1) });
    expect(withTypical.answered).toBe(3);
    expect(withTypical.ease).toBe(50);
  });
});

describe('show threshold', () => {
  it('needs ceil(0.6 n) answers and at least min(3, n)', () => {
    expect(meetsThreshold(0, 0)).toBe(false);
    expect(meetsThreshold(1, 1)).toBe(true); // single-item domain
    expect(meetsThreshold(1, 2)).toBe(false);
    expect(meetsThreshold(2, 2)).toBe(true);
    expect(meetsThreshold(2, 3)).toBe(false);
    expect(meetsThreshold(3, 3)).toBe(true);
    expect(meetsThreshold(2, 4)).toBe(false);
    expect(meetsThreshold(3, 4)).toBe(true);
    expect(meetsThreshold(3, 5)).toBe(true);
    expect(meetsThreshold(2, 5)).toBe(false);
  });

  it('labels domains with 1–2 questions as "based on N"', () => {
    const s = scoreCapacity('busyPlaces', spokeItems('busyPlaces'), { 'C7.8': A.ec(2, 3, 1) });
    expect(s.basedOn).toBe(1);
    const change = scoreCapacity('change', spokeItems('change'), { 'C10.1': A.ec(2), 'C10.2': A.ec(3) });
    expect(change.basedOn).toBe(2);
  });
});

describe('fluctuation', () => {
  it('uses only items that have both an ease and a hard-day rating', () => {
    const items = spokeItems('attention');
    const s = scoreCapacity('attention', items, {
      'C1.1': A.ec(4, 0, 2), // drop of 2 steps
      'C1.2': A.ec(0, 0, undefined), // no hard-day rating: must not enter fluctuation
      'C1.3': A.ec(4, 0, 2),
    });
    expect(s.fluctuationN).toBe(2);
    expect(s.fluctuation).toBe(50); // (4 − 2) × 25 on matched items only
  });

  it('ignores "I don’t really have hard days"', () => {
    const items = spokeItems('attention');
    const s = scoreCapacity('attention', items, {
      'C1.1': { ease: 3, hard: 'noHardDays', answeredAt: '' },
      'C1.2': A.e(3),
      'C1.3': A.e(3),
    });
    expect(s.hard).toBeUndefined();
    expect(s.fluctuation).toBeUndefined();
  });
});

describe('relative labels', () => {
  it('uses inclusive thresholds at exactly ±15', () => {
    expect(labelRelative(15)).toBe('strength');
    expect(labelRelative(14.999)).toBe('middle');
    expect(labelRelative(-14.999)).toBe('middle');
    expect(labelRelative(-15)).toBe('stretch');
    expect(labelRelative(0)).toBe('middle');
  });

  it('survives floating-point noise at the edge', () => {
    expect(labelRelative(0.1 * 3 * 50 + 0)).toBe('strength'); // 15.000000000000002
    expect(labelRelative(-(0.3 * 50 - 1e-13))).toBe('stretch');
  });
});

describe('profile', () => {
  it('needs at least three shown spokes before showing a personal middle', () => {
    const two = computeProfile({ 'C7.8': A.ec(3), 'C10.1': A.ec(3), 'C10.2': A.ec(3) });
    expect(two.shownCount).toBe(2);
    expect(two.hasEnough).toBe(false);
    expect(two.middle).toBeUndefined();
    expect(two.spokes.every((s) => s.relLabel === undefined)).toBe(true);
  });

  it('computes middle, relative score, range and unevenness from shown spokes only', () => {
    const answers = {
      'C7.8': A.ec(4), // busyPlaces 100
      'C10.1': A.ec(2), 'C10.2': A.ec(2), // change 50
      'C11.1': A.e(0), 'C11.2': A.ec(0), 'C11.3': A.e(0), // movement 0
    };
    const p = computeProfile(answers);
    expect(p.shownCount).toBe(3);
    expect(p.middle).toBe(50);
    expect(p.range).toBe(100);
    const busy = p.spokes.find((s) => s.spokeId === 'busyPlaces')!;
    expect(busy.rel).toBe(50);
    expect(busy.relLabel).toBe('strength');
    expect(p.spokes.find((s) => s.spokeId === 'movement')!.relLabel).toBe('stretch');
    expect(p.spokes.find((s) => s.spokeId === 'change')!.relLabel).toBe('middle');
    expect(p.unevenness).toBeCloseTo(40.82, 1);
  });

  it('breaks the outline for spokes without enough answers', () => {
    const p = computeProfile({ 'C7.8': A.ec(2), 'C10.1': A.ec(2), 'C10.2': A.ec(2), 'C11.1': A.e(2), 'C11.2': A.ec(2), 'C11.3': A.e(2) });
    const attention = p.spokes.find((s) => s.spokeId === 'attention')!;
    expect(attention.shown).toBe(false);
    expect(attention.ease).toBeUndefined();
  });
});

describe('flags', () => {
  it('flags manageable but costly at ease ≥ 60 and cost ≥ 60', () => {
    const items = spokeItems('busyPlaces');
    const hit = scoreCapacity('busyPlaces', items, { 'C7.8': A.ec(3, 3) }); // 75 / 75
    expect(hit.ease).toBe(75);
    const p = computeProfile({ 'C7.8': A.ec(3, 3), 'C10.1': A.ec(1, 0), 'C10.2': A.ec(1, 0), 'C11.1': A.e(2), 'C11.2': A.ec(2, 0), 'C11.3': A.e(2) });
    expect(p.spokes.find((s) => s.spokeId === 'busyPlaces')!.flags).toContain('costly');
    expect(p.spokes.find((s) => s.spokeId === 'change')!.flags).not.toContain('costly');
  });

  it('does not flag at ease 50 even with high cost', () => {
    const p = computeProfile({ 'C7.8': A.ec(2, 4), 'C10.1': A.ec(2), 'C10.2': A.ec(2), 'C11.1': A.e(2), 'C11.2': A.ec(2), 'C11.3': A.e(2) });
    expect(p.spokes.find((s) => s.spokeId === 'busyPlaces')!.flags).not.toContain('costly');
  });

  it('flags varies on hard days at a drop of 25 or more', () => {
    const p = computeProfile({ 'C7.8': A.ec(3, 0, 2), 'C10.1': A.ec(3, 0, 3), 'C10.2': A.ec(3), 'C11.1': A.e(2), 'C11.2': A.ec(2), 'C11.3': A.e(2) });
    expect(p.spokes.find((s) => s.spokeId === 'busyPlaces')!.flags).toContain('varies');
    expect(p.spokes.find((s) => s.spokeId === 'change')!.flags).not.toContain('varies');
  });

  it('adds the getting-started insight when C2.5 is 2+ steps above C2.1', () => {
    expect(computeProfile({ 'C2.1': A.ec(1), 'C2.5': A.e(3) }).insights).toContain('gettingStarted');
    expect(computeProfile({ 'C2.1': A.ec(1), 'C2.5': A.e(2) }).insights).not.toContain('gettingStarted');
  });

  it('shows strengths with a cost badge, and C13.8 carries no score', () => {
    const p = computeProfile({ 'C13.1': A.l(4, 'often'), 'C13.8': A.l(3, 'sometimes'), 'C13.2': A.l(2), 'C4.5': A.e(4), 'C1.4': A.f(3) });
    const names = p.strengths.map((s) => s.name);
    expect(names).toContain('Eye for detail');
    expect(names).not.toContain('Pattern spotting');
    expect(names).toContain('Memory for detail');
    expect(names).toContain('Deep absorption');
    expect(p.strengths.find((s) => s.id === 'C13.1')!.cost).toBe('often');
    expect(p.strengths.find((s) => s.id === 'C13.8')!.noScore).toBe(true);
  });
});

describe('driver pattern', () => {
  it('counts lens tags across every selected option and reports the top groups', () => {
    const p = computeProfile({
      'C1.1': A.drivers('distraction', ['Noise', 'I get absorbed'], A.ec(0)), // A, A
      'C6.3': A.drivers('social', ['I’m unsure'], A.ec(1)), // A
      'C10.1': A.drivers('change', ['I’m already'], A.ec(0)), // W
    });
    expect(p.driverCounts).toEqual({ A: 3, D: 0, S: 0, W: 1 });
    expect(p.topLenses).toEqual(['A']); // W is under half of A
  });

  it('includes a second group when it has at least half the top count', () => {
    const p = computeProfile({
      'C1.1': A.drivers('distraction', ['Noise', 'I’m too tired'], A.ec(0)), // A, W
      'C10.1': A.drivers('change', ['Not knowing'], A.ec(0)), // A
    });
    expect(p.topLenses).toEqual(['A', 'W']);
  });

  it('reports no pattern when no drivers were chosen', () => {
    expect(computeProfile({ 'C1.1': A.ec(0) }).topLenses).toEqual([]);
  });
});

describe('hard-period note', () => {
  it('triggers on M3.1 "in one now" or M3.4 "much lower"', () => {
    expect(computeProfile({ 'M3.1': A.choice(optionIdByLabel('M3.1', 'I’m in one now')) }).hardPeriod).toBe(true);
    expect(computeProfile({ 'M3.4': A.choice(optionIdByLabel('M3.4', 'Much lower')) }).hardPeriod).toBe(true);
    expect(computeProfile({ 'M3.1': A.choice(optionIdByLabel('M3.1', 'Once')), 'M3.4': A.choice(optionIdByLabel('M3.4', 'About usual')) }).hardPeriod).toBe(false);
  });
});

describe('load and lens domains', () => {
  it('scores mean(FREQ) × 25 and applies the show threshold', () => {
    const items = itemsWhere((i) => i.scoresInto?.load === 'sensoryOver'); // C7.1–C7.4
    const shown = scoreFrequency('sensoryOver', items, { 'C7.1': A.f(4), 'C7.2': A.f(2), 'C7.3': A.f(3) });
    expect(shown.shown).toBe(true);
    expect(shown.value).toBe(75);
    const notShown = scoreFrequency('sensoryOver', items, { 'C7.1': A.f(4), 'C7.2': A.f(2) });
    expect(notShown.shown).toBe(false);
  });

  it('keeps social motivation separate from social ease', () => {
    const p = computeProfile({ 'C6.1': A.l(4), 'C6.2': A.l(4), 'C6.3': A.ec(0), 'C6.4': A.ec(0), 'C6.5': A.ec(0), 'C6.6': A.e(0) });
    expect(p.socialMotivation.value).toBe(100);
    expect(p.spokes.find((s) => s.spokeId === 'socialEase')!.ease).toBe(0);
  });
});

describe('persona fixtures', () => {
  it('high masker: easy-looking profile that costs a lot', () => {
    const answers = { ...fillCore(CAPACITY_SECTIONS, 3, 4, 3, 2), ...fillSections(['M1'], (id) => (ITEM_BY_ID[id].scale === 'FREQ' ? A.f(4) : undefined)) };
    const p = computeProfile(answers);
    expect(p.hasEnough).toBe(true);
    expect(p.spokes.filter((s) => s.shown).every((s) => s.flags.includes('costly'))).toBe(true);
    expect(p.load.find((l) => l.id === 'masking')!.value).toBe(100);
    expect(p.load.find((l) => l.id === 'maskingCost')!.value).toBe(100);
  });

  it('burnout now: hard-period note on, hard days lower than typical', () => {
    const answers = {
      ...fillCore(CAPACITY_SECTIONS, 2, 3, 0),
      'M3.1': A.choice(optionIdByLabel('M3.1', 'I’m in one now')),
    };
    const p = computeProfile(answers);
    expect(p.hardPeriod).toBe(true);
    expect(p.spokes.find((s) => s.spokeId === 'attention')!.flags).toContain('varies');
  });

  it('AuDHD with heavy D-lens drivers: top lens is D', () => {
    const p = computeProfile({
      'C1.1': A.drivers('distraction', ['My mind wanders'], A.ec(0)),
      'C2.1': A.drivers('unfinished', ['I lose interest', 'I can’t judge'], A.ec(1)),
      'C10.1': A.drivers('change', ['I like change', 'Routines bore'], A.ec(1)),
    });
    expect(p.topLenses[0]).toBe('D');
    expect(p.driverCounts.D).toBe(5);
  });

  it('mostly skipped: no profile, no middle, no labels', () => {
    const p = computeProfile({ 'C1.1': A.ec(2), 'C7.8': A.ec(2) });
    expect(p.hasEnough).toBe(false);
    expect(p.middle).toBeUndefined();
    expect(p.range).toBeUndefined();
    expect(p.spokes.every((s) => s.rel === undefined)).toBe(true);
  });

  it('everything doesn’t-apply: nothing is scored as 0 and nothing is shown', () => {
    const answers = fillSections(CAPACITY_SECTIONS, () => A.na());
    const p = computeProfile(answers);
    expect(p.shownCount).toBe(0);
    expect(p.hasEnough).toBe(false);
    expect(p.load.every((l) => !l.shown)).toBe(true);
  });

  it('empty state', () => {
    const p = computeProfile({});
    expect(p.answeredCount).toBe(0);
    expect(p.hasEnough).toBe(false);
    expect(p.strengths).toEqual([]);
    expect(p.topLenses).toEqual([]);
    expect(p.hardPeriod).toBe(false);
  });

  it('never produces a total, a likelihood or an AuDHD score', () => {
    const p = computeProfile(fillCore(CAPACITY_SECTIONS, 2, 2, 2));
    const keys = JSON.stringify(Object.keys(p)).toLowerCase();
    expect(keys).not.toMatch(/total|likelihood|audhd|cutoff|norm/);
  });
});
