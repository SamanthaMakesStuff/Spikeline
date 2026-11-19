import { ideaGroups, type SpikeprintData } from './spikeprint';
import { SECTION_DEFS, type SectionKey } from './sections';

const FIELD: Partial<Record<SectionKey, keyof SpikeprintData>> = {
  wheel: 'sp', summary: 'sm', strengths: 'st', load: 'ld', drivers: 'dr', energy: 'en', adhd: 'ad', masking: 'mk', burnout: 'bo',
  interests: 'it', eating: 'ea', hormones: 'ho', autonomy: 'au', medication: 'me', diagnoses: 'dx', whatHelps: 'nh', wantPeopleToKnow: 'nk',
};

/** Rough size of each included section, used to suggest what to untick when a PDF won’t fit on one page. */
export function sectionWeights(d: SpikeprintData): { key: SectionKey; label: string; weight: number }[] {
  return d.sec
    .map((key) => {
      const k = key as SectionKey;
      const field = FIELD[k];
      let weight = 0;
      if (k === 'adjustments') weight = JSON.stringify(ideaGroups(d)).length;
      else if (k === 'stretch') weight = 200;
      else if (field) weight = JSON.stringify(d[field] ?? '').length;
      return { key: k, label: SECTION_DEFS.find((s) => s.key === k)?.label ?? key, weight };
    })
    .filter((x) => x.key !== 'wheel')
    .sort((a, b) => b.weight - a.weight);
}

export const suggestToRemove = (d: SpikeprintData, n = 3) => sectionWeights(d).slice(0, n).map((x) => x.label);

/** Count pages in a generated PDF without a PDF parser. Page dictionaries are written as plain text. */
export function countPdfPages(bytes: Uint8Array): number {
  let text = '';
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
}
