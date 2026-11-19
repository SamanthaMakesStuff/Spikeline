import { MANAGEABLE_BUT_COSTLY, MIN_SPOKES_FOR_RESULTS, RELATIVE_THRESHOLD, VARIES_ON_HARD_DAYS } from '../config';
import { ITEM_BY_ID, ITEMS, type Lens, type SpokeId } from '../content/items';
import { DRIVER_SETS } from '../content/drivers';
import { ADHD_DOMAINS, LOAD_DOMAINS } from '../content/load';
import { SPOKES, spokeItems } from '../content/spokes';
import { M3_ENERGY_MUCH_LOWER, M3_IN_ONE_NOW } from './constants';
import { type CapacityScore, scoreCapacity, scoreFrequency, type ScoredDomain } from './domains';
import { type Answers, easeValue, freqValue, likeValue, mean, round6, sd } from './util';
import { M6_SITUATIONS } from '../content/items/m6-hormones';

export type RelativeLabel = 'strength' | 'middle' | 'stretch';
export type Flag = 'costly' | 'varies';

export interface SpokeResult extends CapacityScore {
  spokeId: SpokeId;
  num: number;
  label: string;
  rel?: number;
  relLabel?: RelativeLabel;
  flags: Flag[];
  contextTags: string[];
  drivers: { label: string; lens: Lens }[];
}

export interface StrengthCard {
  id: string;
  name: string;
  text: string;
  cost?: 'sometimes' | 'often';
  /** Strengths with a cost follow-up, for badge. */
  noScore?: boolean;
}

export interface Chips { label: string }

export interface Profile {
  answeredCount: number;
  spokes: SpokeResult[];
  shownCount: number;
  hasEnough: boolean;
  /** Mean Ease across shown spokes (needs at least 3 shown). */
  middle?: number;
  range?: number;
  unevenness?: number;
  socialMotivation: ScoredDomain;
  load: (ScoredDomain & { label: string; module?: 'M1' | 'M3' })[];
  adhd: (ScoredDomain & { label: string })[];
  waiting?: { ease: number; cost?: number };
  strengths: StrengthCard[];
  insights: string[];
  driverCounts: Record<Lens, number>;
  topLenses: Lens[];
  hardPeriod: boolean;
  energyLeft?: number;
  absorption: boolean;
  modalities: string[];
  drains: string[];
  recharges: string[];
  tensions: string[];
  medication?: { takes: boolean; change?: string };
  masking: { where: string[]; why: string[] };
  interests: { text?: string; topics: string[]; intensity?: number; depth?: number; recharges?: number; cost?: number; pattern?: number };
  burnout: { history?: string; signs: string[]; contributors: string[]; energyNow?: string };
  eating: { patterns: string[]; safety: boolean };
  hormones: { situation: string; rows: string[] }[];
  autonomy?: { pressure?: number; wantsSay?: number; capacity?: SpokeResultLike; factors: string[] };
}

export interface SpokeResultLike { ease?: number; cost?: number; hard?: number }

const labelsFor = (itemId: string, ids?: string[]) => {
  const opts = ITEM_BY_ID[itemId]?.options ?? [];
  return (ids ?? []).map((id) => opts.find((o) => o.id === id)?.label).filter((x): x is string => !!x);
};

const choiceChips = (itemId: string, answers: Answers): string[] => {
  const a = answers[itemId];
  const chips = labelsFor(itemId, a?.choices);
  if (a?.choices?.includes('other') && a.choiceOther) chips.push(a.choiceOther);
  return chips;
};

function strengthCards(answers: Answers): StrengthCard[] {
  const out: StrengthCard[] = [];
  for (const item of ITEMS) {
    const a = answers[item.id];
    if (!a) continue;
    const s = item.scoresInto?.strength;
    if (!s) continue;
    let qualifies = false;
    if (item.scale === 'LIKE+COSTFU' || item.scale === 'LIKE') qualifies = (likeValue(a) ?? -1) >= 3;
    else if (item.scale === 'EASE') qualifies = (easeValue(a) ?? -1) >= 3;
    else if (item.scale === 'FREQ') qualifies = (freqValue(a) ?? -1) >= 3;
    if (!qualifies) continue;
    out.push({
      id: item.id,
      name: typeof s === 'string' ? s : item.id,
      text: item.text,
      cost: a.costFollowUp === 'often' ? 'often' : a.costFollowUp === 'sometimes' ? 'sometimes' : undefined,
      noScore: item.id === 'C13.8',
    });
  }
  return out;
}

/** Provisional readability rule at exactly ±RELATIVE_THRESHOLD (inclusive), not a statistical cut-off. */
export function labelRelative(rel: number): RelativeLabel {
  const r = round6(rel);
  return r >= RELATIVE_THRESHOLD ? 'strength' : r <= -RELATIVE_THRESHOLD ? 'stretch' : 'middle';
}

export function computeProfile(answers: Answers): Profile {
  const answeredCount = Object.values(answers).filter((a) => a && Object.keys(a).length > 1).length;

  // Capacity spokes
  const base = SPOKES.map((def) => ({ def, score: scoreCapacity(def.id, spokeItems(def.id), answers) }));
  const shownEases = base.filter((b) => b.score.ease !== undefined).map((b) => b.score.ease!);
  const hasEnough = shownEases.length >= MIN_SPOKES_FOR_RESULTS;
  const middle = hasEnough ? mean(shownEases) : undefined;

  const spokes: SpokeResult[] = base.map(({ def, score }) => {
    const rel = middle !== undefined && score.ease !== undefined ? score.ease - middle : undefined;
    const relR = rel === undefined ? undefined : round6(rel);
    const relLabel = relR === undefined ? undefined : labelRelative(relR);
    const flags: Flag[] = [];
    if (score.ease !== undefined && score.cost !== undefined &&
      round6(score.ease) >= MANAGEABLE_BUT_COSTLY.ease && round6(score.cost) >= MANAGEABLE_BUT_COSTLY.cost) flags.push('costly');
    if (score.fluctuation !== undefined && round6(score.fluctuation) >= VARIES_ON_HARD_DAYS) flags.push('varies');

    const items = spokeItems(def.id);
    const tags = new Set<string>();
    const drivers: SpokeResult['drivers'] = [];
    for (const it of items) {
      const a = answers[it.id];
      a?.dependsTags?.forEach((t) => tags.add(t));
      if (it.driverSet) {
        for (const id of a?.drivers ?? []) {
          const o = DRIVER_SETS[it.driverSet].options.find((x) => x.id === id);
          if (o) drivers.push({ label: o.label, lens: o.lens });
        }
      }
    }
    return {
      ...score,
      spokeId: def.id,
      num: def.n,
      label: def.label,
      rel: relR,
      relLabel,
      flags,
      contextTags: [...tags],
      drivers,
    };
  });

  const shownSpokes = spokes.filter((s) => s.ease !== undefined);
  const easeList = shownSpokes.map((s) => s.ease!);
  const range = hasEnough ? Math.max(...easeList) - Math.min(...easeList) : undefined;
  const unevenness = hasEnough ? sd(easeList) : undefined;

  // Social motivation (reported separately from social ease)
  const socialMotivationItems = ['C6.1', 'C6.2'].map((id) => ITEM_BY_ID[id]);
  const motivationVals = socialMotivationItems.map((i) => likeValue(answers[i.id])).filter((v): v is NonNullable<typeof v> => v !== undefined);
  const socialMotivation: ScoredDomain = {
    id: 'socialMotivation',
    n: 2,
    answered: motivationVals.length,
    shown: motivationVals.length === 2,
    value: motivationVals.length === 2 ? mean(motivationVals)! * 25 : undefined,
    basedOn: motivationVals.length === 2 ? 2 : undefined,
  };

  // Load and ADHD lens
  const load = LOAD_DOMAINS.map((d) => ({
    ...scoreFrequency(d.id, ITEMS.filter((i) => i.scoresInto?.load === d.id), answers),
    label: d.label,
    module: d.module,
  }));
  const adhd = ADHD_DOMAINS.map((d) => ({
    ...scoreFrequency(d.id, ITEMS.filter((i) => i.scoresInto?.adhd === d.id), answers),
    label: d.label,
  }));

  // Waiting (M5.7) is a small capacity row
  const waitingScore = scoreCapacity('waiting', [ITEM_BY_ID['M5.7']], answers);
  const waiting = waitingScore.ease !== undefined ? { ease: waitingScore.ease, cost: waitingScore.cost } : undefined;

  // Insights
  const insights: string[] = [];
  const e25 = easeValue(answers['C2.5']);
  const e21 = easeValue(answers['C2.1']);
  if (e25 !== undefined && e21 !== undefined && e25 - e21 >= 2) insights.push('gettingStarted');

  // Driver lenses
  const driverCounts: Record<Lens, number> = { A: 0, D: 0, S: 0, W: 0 };
  for (const it of ITEMS) {
    if (!it.driverSet) continue;
    for (const id of answers[it.id]?.drivers ?? []) {
      const o = DRIVER_SETS[it.driverSet].options.find((x) => x.id === id);
      if (o) driverCounts[o.lens] += 1;
    }
  }
  const order: Lens[] = ['A', 'D', 'S', 'W'];
  const ranked = order.filter((l) => driverCounts[l] > 0).sort((a, b) => driverCounts[b] - driverCounts[a]);
  const topLenses: Lens[] = [];
  if (ranked.length) {
    topLenses.push(ranked[0]);
    if (ranked[1] && driverCounts[ranked[1]] * 2 >= driverCounts[ranked[0]]) topLenses.push(ranked[1]);
  }

  // Hard-period note
  const hardPeriod =
    answers['M3.1']?.choice === M3_IN_ONE_NOW || answers['M3.4']?.choice === M3_ENERGY_MUCH_LOWER;

  const energyFreq = freqValue(answers['C14.1']);
  const tensions = ITEMS.filter((i) => i.id.startsWith('M5.T') && (likeValue(answers[i.id]) ?? -1) >= 3).map((i) => i.text);

  const med1 = answers['M5.MED1']?.choice;
  const med2 = answers['M5.MED2']?.choice;
  const medication = med1 ? { takes: med1 === 'yes', change: med2 ? labelsFor('M5.MED2', [med2])[0] : undefined } : undefined;

  const freq100 = (id: string) => {
    const v = freqValue(answers[id]);
    return v === undefined ? undefined : v * 25;
  };

  const eatingPatterns: [string, string][] = [
    ['M4.1', 'Eating the same foods'], ['M4.2', 'Sensory side of food'], ['M4.3', 'Body signals around eating'],
    ['M4.4', 'Rules about eating'], ['M4.5', 'Eating to cope'], ['M4.6', 'Worry about body shape or weight'],
  ];
  const eating = {
    patterns: eatingPatterns.filter(([id]) => (freqValue(answers[id]) ?? 0) >= 2).map(([, l]) => l),
    safety: ['M4.4', 'M4.6'].some((id) => (freqValue(answers[id]) ?? 0) >= (ITEM_BY_ID[id].safetyAt ?? 3)),
  };

  const hormones = M6_SITUATIONS.map((s, i) => {
    const g = answers[`M6.${i + 1}`]?.grid ?? {};
    const rows = Object.entries(g).filter(([, v]) => v !== 'no-change' && v !== 'not-sure').map(([r]) => r);
    return { situation: s.during, rows };
  }).filter((h) => h.rows.length > 0);

  const pressureVals = ['M7.1', 'M7.2'].map((id) => freqValue(answers[id])).filter((v): v is NonNullable<typeof v> => v !== undefined);
  const m7cap = scoreCapacity('m7', [ITEM_BY_ID['M7.3']], answers);
  const wantsSay = likeValue(answers['M7.4']);
  const autonomy = pressureVals.length || wantsSay !== undefined || m7cap.ease !== undefined
    ? {
        pressure: pressureVals.length ? mean(pressureVals)! * 25 : undefined,
        wantsSay: wantsSay === undefined ? undefined : wantsSay * 25,
        capacity: m7cap.ease !== undefined ? { ease: m7cap.ease, cost: m7cap.cost, hard: m7cap.hard } : undefined,
        factors: choiceChips('M7.5', answers),
      }
    : undefined;

  return {
    answeredCount,
    spokes,
    shownCount: shownSpokes.length,
    hasEnough,
    middle,
    range,
    unevenness,
    socialMotivation,
    load,
    adhd,
    waiting,
    strengths: strengthCards(answers),
    insights,
    driverCounts,
    topLenses,
    hardPeriod,
    energyLeft: energyFreq === undefined ? undefined : energyFreq * 25,
    absorption: (freqValue(answers['C1.4']) ?? 0) >= 3,
    modalities: choiceChips('C7.9', answers),
    drains: choiceChips('C14.3', answers),
    recharges: choiceChips('C14.4', answers),
    tensions,
    medication,
    masking: { where: choiceChips('M1.8', answers), why: choiceChips('M1.9', answers) },
    interests: {
      text: answers['M2.0']?.text?.trim() || undefined,
      topics: choiceChips('M2.7', answers),
      intensity: freq100('M2.1'),
      depth: freq100('M2.2'),
      recharges: freq100('M2.3'),
      cost: mean(['M2.4', 'M2.5'].map(freq100).filter((v): v is number => v !== undefined)),
      pattern: freq100('M2.6'),
    },
    burnout: {
      history: answers['M3.1']?.choice ? labelsFor('M3.1', [answers['M3.1'].choice!])[0] : undefined,
      signs: choiceChips('M3.5', answers),
      contributors: choiceChips('M3.6', answers),
      energyNow: answers['M3.4']?.choice ? labelsFor('M3.4', [answers['M3.4'].choice!])[0] : undefined,
    },
    eating,
    hormones,
    autonomy,
  };
}

