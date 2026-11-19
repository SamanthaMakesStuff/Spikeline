import { freq } from './helpers';
import type { Item } from './types';

// M4 Eating and food: opt-in only, no score. Beat signposting on every screen.
export const m4Items: Item[] = [
  freq('M4.1', 'I eat the same small range of foods most days, and new foods are hard', { scoresInto: { descriptive: 'eatingSameness' }, signpost: true }),
  freq('M4.2', 'The texture, smell, taste or look of food stops me eating it', { scoresInto: { descriptive: 'eatingSensory' }, signpost: true }),
  freq('M4.3', 'I forget to eat, or don’t feel hungry until I feel unwell', { scoresInto: { descriptive: 'eatingBodySignals' }, signpost: true }),
  freq('M4.4', 'I have strict rules about what, when or how I eat, and get distressed if I can’t follow them', { scoresInto: { descriptive: 'eatingRules' }, signpost: true, safetyAt: 3 }),
  freq('M4.5', 'I eat to calm down or cope when overloaded', { scoresInto: { descriptive: 'eatingCoping' }, signpost: true }),
  freq('M4.6', 'Worry about my weight or body shape affects what I eat', { scoresInto: { descriptive: 'eatingBodyImage' }, signpost: true, safetyAt: 3 }),
];
