import { checklist, easeCost, freq, like, opts } from './helpers';
import type { Item } from './types';

// M7 Autonomy and demands: opt-in. Never mentions PDA.
export const m7Items: Item[] = [
  freq('M7.1', 'When something becomes a requirement instead of a choice, it gets much harder to do, even things I like', { scoresInto: { descriptive: 'autonomy' } }),
  freq('M7.2', 'Requests or instructions from others set off a strong feeling of pressure or losing control', { scoresInto: { descriptive: 'autonomy' } }),
  easeCost('M7.3', 'Doing tasks set by someone else, on their timetable', { hardDay: true, scoresInto: { descriptive: 'autonomyCapacity' } }),
  like('M7.4', 'Having a say in how and when I do things helps me get them done', { scoresInto: { descriptive: 'autonomy' } }),
  checklist('M7.5', 'What makes demands harder?', {
    example: 'Choose all that apply.',
    options: opts('Not knowing what will happen', 'Feeling my independence is threatened', 'Not enough energy', 'Sensory or social load of the task', 'Not sure'),
    scoresInto: { descriptive: 'demandFactors' },
  }),
];
