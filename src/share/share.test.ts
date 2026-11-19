import { describe, expect, it } from 'vitest';
import { buildExampleAnswers } from '../content/exampleData';
import { ITEMS } from '../content/items';
import { computeProfile } from '../scoring/profile';
import { SHARE_LINK_SOFT_LIMIT } from '../config';
import { PRESETS, SENSITIVE_KEYS, defaultSelection, spikeprintFileName, type PresetId } from './sections';
import { buildSpikeprint, ideaGroups, strengthText, decodeLinkPayload, encodeLink, has, spikeprintSchema, wheelProfile } from './spikeprint';
import { compressToEncodedURIComponent } from 'lz-string';
import { A, optionIdByLabel } from '../scoring/fixtures';

const answers = buildExampleAnswers();
const profile = computeProfile(answers);
const about = { preferredName: 'Alex', diagnoses: { adhd: 'self' as const } };
const reflection = { whatHelps: 'Quiet mornings.', wantPeopleToKnow: 'I need things in writing.' };

const build = (preset: PresetId, extra = {}) =>
  buildSpikeprint({ profile, about, reflection, preset, sections: defaultSelection(preset), name: 'Alex', date: '2026-11-19', ...extra });

describe('presets', () => {
  it('turns sensitive sections off by default in Work and Friends and family', () => {
    for (const id of ['work', 'friends'] as const) {
      const sel = defaultSelection(id);
      for (const k of SENSITIVE_KEYS) expect(sel[k], `${id}:${k}`).toBe(false);
    }
  });

  it('keeps eating, hormones, medication and autonomy off in Health, but includes What you carry, ADHD, masking and burnout', () => {
    const sel = defaultSelection('health');
    for (const k of ['eating', 'hormones', 'medication', 'autonomy'] as const) expect(sel[k]).toBe(false);
    for (const k of ['load', 'adhd', 'masking', 'burnout'] as const) expect(sel[k]).toBe(true);
  });

  it('includes everything for Just me', () => {
    expect(Object.values(defaultSelection('me')).every(Boolean)).toBe(true);
  });

  it('uses the titles from the brief', () => {
    expect(PRESETS.map((p) => p.title)).toEqual(['My working profile and what helps', 'My profile: notes for my appointment', 'How I work best', 'My profile']);
  });
});

describe('Spikeprint content', () => {
  it('includes only the selected sections', () => {
    const d = build('work');
    expect(has(d, 'wheel')).toBe(true);
    for (const k of ['diagnoses', 'eating', 'hormones', 'medication', 'masking', 'adhd', 'burnout', 'load'] as const) expect(has(d, k)).toBe(false);
    expect(d.dx).toBeUndefined();
    expect(d.ad).toBeUndefined();
    expect(d.mk).toBeUndefined();
  });

  it('uses workplace phrasing for Work and everyday phrasing for the others', () => {
    const work = JSON.stringify(ideaGroups(build('work')));
    const friends = JSON.stringify(ideaGroups(build('friends')));
    expect(work).toContain('manager');
    expect(friends).not.toContain('manager');
  });

  it('never contains raw answers: no item IDs, ratings maps or answer fields', () => {
    const json = JSON.stringify(build('me'));
    for (const item of ITEMS) expect(json, item.id).not.toContain(`"${item.id}"`);
    expect(json).not.toMatch(/answeredAt|dependsTags|dependsTypical|costFollowUp/);
  });

  it('opens with the hard-period note flag when triggered, whatever sections are chosen', () => {
    const hard = computeProfile({ ...answers, 'M3.1': A.choice(optionIdByLabel('M3.1', 'I’m in one now')) });
    const d = buildSpikeprint({ profile: hard, about, reflection, preset: 'friends', sections: defaultSelection('friends') });
    expect(d.hp).toBe(true);
  });

  it('marks example data', () => {
    expect(build('work', { example: true }).ex).toBe(true);
  });

  it('leaves out sections with no data instead of printing empty headings', () => {
    const d = buildSpikeprint({ profile: computeProfile({}), about: {}, reflection: {}, preset: 'me', sections: defaultSelection('me') });
    expect(d.sec).toEqual(expect.not.arrayContaining(['strengths', 'load', 'adhd', 'masking', 'eating', 'diagnoses', 'adjustments', 'whatHelps']));
    expect(d.st).toBeUndefined();
  });

  it('only includes medication when ticked', () => {
    const a = { ...answers, 'M5.MED1': A.choice('yes') };
    const p = computeProfile(a);
    const sel = defaultSelection('health');
    expect(buildSpikeprint({ profile: p, about, reflection, preset: 'health', sections: sel }).me).toBeUndefined();
    expect(buildSpikeprint({ profile: p, about, reflection, preset: 'health', sections: { ...sel, medication: true } }).me).toContain('ADHD medication');
  });
});

describe('private link', () => {
  it('round-trips and validates', () => {
    const d = build('health');
    const url = encodeLink(d, 'https://example.org/app/');
    expect(url.startsWith('https://example.org/app/#/view?d=')).toBe(true);
    const back = decodeLinkPayload(url.split('d=')[1]);
    expect(back.ok).toBe(true);
    if (back.ok) expect(back.data).toEqual(d);
  });

  it('keeps the default Work link under about 2,000 characters', () => {
    const url = encodeLink(build('work'), 'https://spikeline.example/');
    expect(url.length).toBeLessThan(SHARE_LINK_SOFT_LIMIT);
  });

  it('rejects corrupted, empty and tampered links with no detail', () => {
    expect(decodeLinkPayload(null).ok).toBe(false);
    expect(decodeLinkPayload('not-a-payload').ok).toBe(false);
    expect(decodeLinkPayload(compressToEncodedURIComponent('{"v":2}')).ok).toBe(false);
    expect(decodeLinkPayload(compressToEncodedURIComponent('{"v":1,"p":"work","d":"nope","sec":[]}')).ok).toBe(false);
    expect(spikeprintSchema.safeParse({ v: 1, p: 'work', d: '2026-11-19', sec: [], sp: [{ i: 99, e: 5 }] }).success).toBe(false);
  });

  it('rebuilds the wheel from the payload with the same numbers', () => {
    const d = build('work');
    const w = wheelProfile(d);
    const original = profile.spokes.find((s) => s.spokeId === 'planning')!;
    expect(w.spokes.find((s) => s.spokeId === 'planning')!.ease).toBe(Math.round(original.ease!));
    expect(w.middle).toBe(Math.round(profile.middle!));
  });
});

describe('strength text', () => {
  it('is looked up from content so it never needs to travel in a link', () => {
    expect(strengthText('Eye for detail')).toBe('I notice small details, errors or changes that others miss');
    expect(strengthText('Deep absorption')).toContain('absorbed');
  });
});

describe('file names', () => {
  it('uses the name and date, and strips anything unsafe', () => {
    expect(spikeprintFileName('Alex', 'pdf', '2026-11-19')).toBe('Spikeprint-Alex-2026-11-19.pdf');
    expect(spikeprintFileName(undefined, 'png', '2026-11-19')).toBe('Spikeprint-2026-11-19.png');
    expect(spikeprintFileName('../Al/ex?:*', 'pdf', '2026-11-19')).toBe('Spikeprint-Al-ex-2026-11-19.pdf');
    expect(spikeprintFileName('Alex', 'png', '2026-11-19', '-portrait')).toBe('Spikeprint-Alex-2026-11-19-portrait.png');
  });
});
