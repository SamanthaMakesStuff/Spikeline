import { describe, expect, it } from 'vitest';
import { computeProfile } from '../scoring/profile';
import { A } from '../scoring/fixtures';
import { buildSummary, summaryText } from './summary';

const spread = {
  'C7.8': A.ec(4, 3), // busyPlaces 100
  'C10.1': A.ec(2), 'C10.2': A.ec(2), // change 50
  'C11.1': A.e(0), 'C11.2': A.ec(0), 'C11.3': A.e(0), // movement 0
  'C12.1': A.ec(4), 'C12.2': A.e(4), 'C12.3': A.e(4), 'C12.4': A.e(4), 'C12.5': A.ec(4), // literacy 100
};

describe('text summary', () => {
  it('names strengths and stretch areas in plain words, comparing only with the person’s own middle', () => {
    const text = summaryText(computeProfile(spread));
    expect(text).toMatch(/^Compared with your own middle, things are easier for you in /);
    expect(text).toContain('Busy places');
    expect(text).toContain('Your biggest stretch areas are Movement and hand skills.');
  });

  it('lists at most two areas per sentence', () => {
    const sentences = buildSummary(computeProfile(spread));
    for (const s of sentences) expect(s.filter((x) => x.bold).length).toBeLessThanOrEqual(3); // 2 areas, or area + lens
    const easier = sentences[0].filter((x) => x.bold);
    expect(easier.length).toBeLessThanOrEqual(2);
  });

  it('skips sentences with no data', () => {
    const text = summaryText(computeProfile(spread));
    expect(text).not.toContain('hard days');
    expect(text).not.toContain('Most of the reasons');
  });

  it('adds the manageable-but-costly and hard-day sentences when flags apply', () => {
    const answers = { ...spread, 'C7.8': A.ec(3, 4, 0) };
    const text = summaryText(computeProfile(answers));
    expect(text).toContain('Busy places is manageable but costs you a lot of energy.');
    expect(text).toContain('On hard days the biggest drops are in Busy places.');
  });

  it('reports driver patterns without diagnoses', () => {
    const answers = {
      ...spread,
      'C1.1': A.drivers('distraction', ['Noise', 'I’m too tired'], A.ec(0)),
      'C10.1': A.drivers('change', ['Not knowing'], A.ec(0)),
    };
    const text = summaryText(computeProfile(answers));
    expect(text).toContain('Most of the reasons you chose relate to sensory load and uncertainty, and to energy.');
  });

  it('shows a gentle prompt when there is not enough data, and never uses ruled-out words', () => {
    const text = summaryText(computeProfile({}));
    expect(text).toBe('Answer a few more sections to see your profile.');
    expect(summaryText(computeProfile(spread))).not.toMatch(/deficit|impairment|symptom|disorder/i);
  });
});
