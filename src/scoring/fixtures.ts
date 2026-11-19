import { DRIVER_SETS } from '../content/drivers';
import { ITEMS, ITEM_BY_ID } from '../content/items';
import type { Answer } from '../storage/schema';
import type { Answers } from './util';

type R = 0 | 1 | 2 | 3 | 4;
const at = '2026-11-01T00:00:00.000Z';

/** Test helpers: build answers from compact descriptions. */
export const A = {
  ec: (ease: R, cost?: R, hard?: R): Answer => ({ ease, cost, hard, answeredAt: at }),
  e: (ease: R): Answer => ({ ease, answeredAt: at }),
  f: (freq: R): Answer => ({ freq, answeredAt: at }),
  l: (like: R, costFollowUp?: 'no' | 'sometimes' | 'often'): Answer => ({ like, costFollowUp, answeredAt: at }),
  na: (): Answer => ({ ease: 'na', freq: 'na', answeredAt: at }),
  depends: (typical?: R): Answer => ({ ease: 'depends', dependsTypical: typical, answeredAt: at }),
  choice: (choice: string): Answer => ({ choice, answeredAt: at }),
  drivers: (set: keyof typeof DRIVER_SETS, labelStarts: string[], base: Answer): Answer => ({
    ...base,
    drivers: DRIVER_SETS[set].options.filter((o) => labelStarts.some((s) => o.label.startsWith(s))).map((o) => o.id),
  }),
};

/** Fill every item in the given sections using a generator. */
export function fillSections(sections: string[], make: (itemId: string) => Answer | undefined): Answers {
  const out: Answers = {};
  for (const item of ITEMS) {
    if (!sections.includes(item.section)) continue;
    const a = make(item.id);
    if (a) out[item.id] = a;
  }
  return out;
}

export const optionIdByLabel = (itemId: string, label: string) =>
  ITEM_BY_ID[itemId].options!.find((o) => o.label === label)!.id;

/** Answer every EASE+COST, EASE, FREQ and LIKE item in a section with the given ratings. */
export function fillCore(sections: string[], easeV: R, costV: R, hardV: R, freqV: R = 2): Answers {
  return fillSections(sections, (id) => {
    const item = ITEM_BY_ID[id];
    switch (item.scale) {
      case 'EASE+COST': return A.ec(easeV, costV, item.hardDay ? hardV : undefined);
      case 'EASE': return A.e(easeV);
      case 'FREQ': return A.f(freqV);
      case 'LIKE': return A.l(2);
      default: return undefined;
    }
  });
}

export const CAPACITY_SECTIONS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12'];
