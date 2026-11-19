import { ITEMS, ITEM_BY_ID, type Item, type SectionId } from '../content/items';
import { SECTION_BY_ID } from '../content/sections';
import type { Answer } from '../storage/schema';
import { easeValue, freqValue, type Answers } from '../scoring/util';

export type StepKind =
  | 'ease' | 'depends' | 'cost' | 'hard' | 'driver'
  | 'freq' | 'like' | 'costfu' | 'checklist' | 'categorical' | 'text' | 'grid';

/** Items visible in a section, after applying showIf rules (M6 grids, medication follow-up). */
export function visibleItems(section: SectionId, answers: Answers): Item[] {
  return ITEMS.filter((i) => {
    if (i.section !== section) return false;
    if (!i.showIf) return true;
    const a = answers[i.showIf.item];
    return !!(a?.choices?.includes(i.showIf.includes) || a?.choice === i.showIf.includes);
  });
}

/** A page weight keeps "a few at a time" sensible: long items take more room. */
export function itemWeight(item: Item): number {
  switch (item.scale) {
    case 'EASE': case 'FREQ': case 'LIKE': return 1;
    case 'EASE+COST': case 'LIKE+COSTFU': return 1.5;
    default: return 3;
  }
}

export function paginate(items: Item[], layout: 'one' | 'few'): Item[][] {
  if (layout === 'one') return items.map((i) => [i]);
  const pages: Item[][] = [];
  let cur: Item[] = [];
  let w = 0;
  for (const item of items) {
    const iw = itemWeight(item);
    if (cur.length && w + iw > 3) {
      pages.push(cur);
      cur = [];
      w = 0;
    }
    cur.push(item);
    w += iw;
  }
  if (cur.length) pages.push(cur);
  return pages;
}

/** The steps currently showing for an item. Each step appears after the previous one is answered. */
export function stepsFor(item: Item, a: Answer | undefined): StepKind[] {
  switch (item.scale) {
    case 'EASE+COST':
    case 'EASE': {
      const steps: StepKind[] = ['ease'];
      if (a?.ease === undefined || a.ease === 'na') return steps;
      if (a.ease === 'depends') {
        steps.push('depends');
        if (a.dependsTypical === undefined) return steps;
      }
      if (item.scale === 'EASE+COST') {
        steps.push('cost');
        if (a.cost === undefined) return steps;
        if (item.hardDay) {
          steps.push('hard');
          if (a.hard === undefined) return steps;
        }
      }
      const e = easeValue(a);
      if (item.driverSet && e !== undefined && e <= 1) steps.push('driver');
      return steps;
    }
    case 'FREQ': {
      const steps: StepKind[] = ['freq'];
      const f = freqValue(a);
      if (item.driverSet && item.driverTrigger === 'freq' && f !== undefined && f >= 3) steps.push('driver');
      return steps;
    }
    case 'LIKE': return ['like'];
    case 'LIKE+COSTFU': return a?.like === undefined ? ['like'] : ['like', 'costfu'];
    case 'CHECKLIST': return ['checklist'];
    case 'CATEGORICAL': return ['categorical'];
    case 'TEXT': return ['text'];
    case 'GRID': return ['grid'];
  }
}

/** Remove anything that belongs to a step that isn't showing, so hidden answers never get scored. */
export function sanitiseAnswer(item: Item, a: Answer): Answer {
  const steps = stepsFor(item, a);
  const out: Answer = { ...a };
  if (!steps.includes('depends')) { delete out.dependsTags; delete out.dependsTypical; }
  if (!steps.includes('cost')) delete out.cost;
  if (!steps.includes('hard')) delete out.hard;
  if (!steps.includes('driver')) { delete out.drivers; delete out.driverOther; }
  if (!steps.includes('costfu')) delete out.costFollowUp;
  return out;
}

export function isAnswered(item: Item, a: Answer | undefined): boolean {
  if (!a) return false;
  switch (item.scale) {
    case 'EASE+COST': case 'EASE': return a.ease === 'na' || (a.ease === 'depends' ? a.dependsTypical !== undefined : typeof a.ease === 'number');
    case 'FREQ': return a.freq !== undefined;
    case 'LIKE': case 'LIKE+COSTFU': return a.like !== undefined;
    case 'CHECKLIST': return (a.choices?.length ?? 0) > 0;
    case 'CATEGORICAL': return !!a.choice;
    case 'TEXT': return !!a.text?.trim();
    case 'GRID': return Object.keys(a.grid ?? {}).length > 0;
  }
}

export interface SectionProgress {
  total: number;
  answered: number;
  done: boolean;
  started: boolean;
  minutesLeft: number;
}

export function sectionProgress(section: SectionId, answers: Answers, finished: string[] = []): SectionProgress {
  const items = visibleItems(section, answers);
  const answered = items.filter((i) => isAnswered(i, answers[i.id])).length;
  const total = items.length;
  const done = total > 0 && (answered === total || finished.includes(section));
  const left = total === 0 ? 0 : 1 - answered / total;
  const minutes = SECTION_BY_ID[section].minutes;
  return { total, answered, done, started: answered > 0, minutesLeft: Math.max(1, Math.ceil(minutes * left)) };
}

/** Item numbers in URLs are 1-based and refer to the first item on the page, so layout changes never break links. */
export function pageForIndex(pages: Item[][], oneBasedIndex: number): { page: Item[]; pageNumber: number; firstIndex: number } {
  let start = 0;
  const idx = Math.min(Math.max(oneBasedIndex, 1), pages.reduce((n, p) => n + p.length, 0) || 1);
  for (let p = 0; p < pages.length; p++) {
    if (idx <= start + pages[p].length) return { page: pages[p], pageNumber: p + 1, firstIndex: start + 1 };
    start += pages[p].length;
  }
  return { page: pages[0] ?? [], pageNumber: 1, firstIndex: 1 };
}

export const getItem = (id: string) => ITEM_BY_ID[id];
