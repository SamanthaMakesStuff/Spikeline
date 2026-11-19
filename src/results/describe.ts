import { LABELS } from '../content/copy';
import { costWord, easeWord } from '../content/scales';
import type { RelativeLabel, SpokeResult } from '../scoring/profile';

export const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

export const relWords = (l?: RelativeLabel) =>
  l === 'strength' ? LABELS.strength : l === 'stretch' ? LABELS.stretch : l === 'middle' ? LABELS.middle : LABELS.notEnough;

/** Ease word for a 0–100 score. */
export const easeText = (ease: number) => easeWord(ease / 25);
export const costText = (cost: number) => costWord(cost / 25);

const costPhrase = (cost: number) => {
  const level = Math.round(cost / 25);
  return ['takes no energy', 'takes a little energy', 'takes a moderate amount of energy', 'costs a lot of energy', 'wipes you out'][level];
};

const dropPhrase = (fluct: number | undefined) =>
  fluct === undefined ? undefined : fluct >= 25 ? 'drops a lot on hard days' : fluct >= 10 ? 'drops a little on hard days' : 'changes little on hard days';

/** One sentence for the wedge's accessible name and the popover. */
export function describeSpoke(s: SpokeResult): string {
  if (s.ease === undefined) return `${s.label}: ${LABELS.notEnough.toLowerCase()}.`;
  const parts = [`${easeText(s.ease)} on a typical day`];
  const drop = dropPhrase(s.fluctuation);
  if (drop) parts.push(drop);
  if (s.cost !== undefined) parts.push(costPhrase(s.cost));
  const rel = s.relLabel ? `${relWords(s.relLabel).toLowerCase()}. ` : '';
  return `${s.label}: ${rel}${lowerFirst(parts.join(', '))}.`.replace(/\. \./g, '.');
}

export const basedOnText = (n?: number) => (n ? `Based on ${n} ${n === 1 ? 'question' : 'questions'}` : '');

export const wordBand = (value: number) => (value < 25 ? 'A little' : value < 50 ? 'Some' : value < 75 ? 'A lot' : 'Very much');

export const round = (n: number) => Math.round(n);
