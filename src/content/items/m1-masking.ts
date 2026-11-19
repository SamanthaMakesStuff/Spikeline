import { checklist, freq, opts } from './helpers';
import type { Item } from './types';

// M1 Masking and camouflaging. Wording needs co-design review for stigma. // REVIEW
export const m1Items: Item[] = [
  freq('M1.1', 'I plan or rehearse what I’ll say before conversations or calls', { scoresInto: { load: 'masking' }, signpost: true }),
  freq('M1.2', 'I’ve studied how people behave, from life, TV, books or online, so I know what to do in social situations', { scoresInto: { load: 'masking' } }),
  freq('M1.3', 'I copy other people’s phrases, tone or gestures so I fit in', { scoresInto: { load: 'masking' } }),
  freq('M1.4', 'I make myself do eye contact, facial expressions or gestures that don’t come naturally', { scoresInto: { load: 'masking' } }),
  freq('M1.5', 'I hold back movements, interests or reactions I think others would find odd', { scoresInto: { load: 'masking' } }),
  freq('M1.6', 'Being with others feels like playing a part', { scoresInto: { load: 'masking' } }),
  freq('M1.7', 'I tell people I’m fine when I’m not, so I don’t stand out', { scoresInto: { load: 'masking' } }),
  checklist('M1.8', 'Where do you do this?', {
    example: 'Choose all that apply.',
    options: opts('Work or study', 'With strangers', 'With friends', 'With family', 'With a partner', 'Nowhere'),
    scoresInto: { descriptive: 'maskingWhere' },
  }),
  checklist('M1.9', 'Why?', {
    example: 'Choose all that apply.',
    options: opts('To get by at work or study', 'To make or keep relationships', 'To stay safe or avoid trouble', 'Habit, I don’t notice I’m doing it', 'Not sure'),
    scoresInto: { descriptive: 'maskingWhy' },
  }),
  freq('M1.10', 'After adjusting how I come across, I need time to recover', { scoresInto: { load: 'maskingCost' } }),
  freq('M1.11', 'I’ve lost track of what I’m really like underneath', { scoresInto: { load: 'maskingCost' } }),
];
