import { LENS_SUMMARY_WORDS } from '../content/drivers';
import { SUMMARY } from '../content/copy';
import type { Profile, SpokeResult } from '../scoring/profile';

export interface Seg { text: string; bold?: boolean }

/** Fill the {areas} slot of a template with bold names, so screen readers and the page read the same sentence. */
function fill(template: string, names: string[]): Seg[] {
  const [before, after] = template.split('{areas}');
  const segs: Seg[] = [];
  if (before) segs.push({ text: before });
  names.forEach((n, i) => {
    if (i > 0) segs.push({ text: ' and ' });
    segs.push({ text: n, bold: true });
  });
  if (after) segs.push({ text: after });
  return segs;
}

const top = (list: SpokeResult[], key: (s: SpokeResult) => number, dir: 1 | -1, n = 2) =>
  [...list].sort((a, b) => dir * (key(a) - key(b))).slice(0, n);

/** Plain-language summary (§8.7). At most two areas per sentence. Sentences with no data are skipped. */
export function buildSummary(p: Profile): Seg[][] {
  if (!p.hasEnough) return [[{ text: SUMMARY.empty }]];
  const shown = p.spokes.filter((s) => s.ease !== undefined);
  const out: Seg[][] = [];

  const easier = top(shown.filter((s) => s.relLabel === 'strength'), (s) => s.rel ?? 0, -1);
  if (easier.length) out.push(fill(SUMMARY.easier, easier.map((s) => s.label)));

  const stretch = top(shown.filter((s) => s.relLabel === 'stretch'), (s) => s.rel ?? 0, 1);
  if (stretch.length) out.push(fill(SUMMARY.stretch, stretch.map((s) => s.label)));

  const drops = top(shown.filter((s) => s.flags.includes('varies')), (s) => s.fluctuation ?? 0, -1);
  if (drops.length) out.push(fill(SUMMARY.drops, drops.map((s) => s.label)));

  const costly = top(shown.filter((s) => s.flags.includes('costly')), (s) => s.cost ?? 0, -1);
  if (costly.length) out.push(fill(costly.length > 1 ? SUMMARY.costlyMany : SUMMARY.costlyOne, costly.map((s) => s.label)));

  if (p.topLenses.length) {
    const words = p.topLenses.map((l) => LENS_SUMMARY_WORDS[l]);
    const segs = fill(SUMMARY.drivers, [words[0]]);
    if (words[1]) {
      // "…relate to sensory load and uncertainty, and to energy."
      const idx = segs.findIndex((s) => s.text === '.');
      segs.splice(idx < 0 ? segs.length : idx, 0, { text: ', and to ' }, { text: words[1], bold: true });
    }
    out.push(segs);
  }
  return out;
}

export const segsToText = (segs: Seg[]) => segs.map((s) => s.text).join('');
export const summaryText = (p: Profile) => buildSummary(p).map(segsToText).join(' ');
