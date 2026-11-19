import { ITEMS } from '../content/items';
import type { Item } from '../content/items/types';
import type { Answers } from './util';
import { costValue, easeValue, freqValue, hardValue, markedNotApplicable, mean, meetsThreshold } from './util';

export interface ScoredDomain {
  id: string;
  /** 0–100, only when the domain meets the show threshold. */
  value?: number;
  shown: boolean;
  /** Scorable items in the domain (items marked "doesn't apply" don't count). */
  n: number;
  answered: number;
  /** Set when the score rests on only 1–2 questions, for the "Based on N question(s)" label. */
  basedOn?: number;
}

export interface CapacityScore extends ScoredDomain {
  ease?: number;
  cost?: number;
  costN: number;
  hard?: number;
  hardN: number;
  /** Ease minus hard-day ease over the same items that have both ratings. */
  fluctuation?: number;
  fluctuationN: number;
}

const scaleBy = (x: number | undefined) => (x === undefined ? undefined : x * 25);

export function scoreCapacity(id: string, items: Item[], answers: Answers): CapacityScore {
  const scorable = items.filter((i) => !markedNotApplicable(answers[i.id]));
  const withEase = scorable.filter((i) => easeValue(answers[i.id]) !== undefined);
  const n = scorable.length;
  const answered = withEase.length;
  const shown = meetsThreshold(answered, n);

  const eases = withEase.map((i) => easeValue(answers[i.id])!);
  const costs = withEase.map((i) => costValue(answers[i.id])).filter((v): v is NonNullable<typeof v> => v !== undefined);

  const hdItems = scorable.filter((i) => i.hardDay);
  const hards = hdItems.map((i) => hardValue(answers[i.id])).filter((v): v is NonNullable<typeof v> => v !== undefined);
  const matched = hdItems.filter((i) => hardValue(answers[i.id]) !== undefined && easeValue(answers[i.id]) !== undefined);
  const matchedEase = mean(matched.map((i) => easeValue(answers[i.id])!));
  const matchedHard = mean(matched.map((i) => hardValue(answers[i.id])!));

  const ease = shown ? scaleBy(mean(eases)) : undefined;
  return {
    id,
    shown,
    n,
    answered,
    basedOn: shown && answered < 3 ? answered : undefined,
    value: ease,
    ease,
    cost: shown ? scaleBy(mean(costs)) : undefined,
    costN: costs.length,
    hard: shown ? scaleBy(mean(hards)) : undefined,
    hardN: hards.length,
    fluctuation: shown && matchedEase !== undefined && matchedHard !== undefined ? (matchedEase - matchedHard) * 25 : undefined,
    fluctuationN: matched.length,
  };
}

/** Frequency-based domain (load, ADHD lens): mean(FREQ) × 25. */
export function scoreFrequency(id: string, items: Item[], answers: Answers): ScoredDomain {
  const scorable = items.filter((i) => !markedNotApplicable(answers[i.id]));
  const vals = scorable.map((i) => freqValue(answers[i.id])).filter((v): v is NonNullable<typeof v> => v !== undefined);
  const n = scorable.length;
  const shown = meetsThreshold(vals.length, n);
  return {
    id,
    shown,
    n,
    answered: vals.length,
    basedOn: shown && vals.length < 3 ? vals.length : undefined,
    value: shown ? scaleBy(mean(vals)) : undefined,
  };
}

export const itemsWhere = (pred: (i: Item) => boolean) => ITEMS.filter(pred);
