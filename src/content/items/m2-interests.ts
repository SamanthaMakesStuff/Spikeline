import { checklist, freq, opts, textItem } from './helpers';
import type { Item } from './types';

// M2 Interests: content-neutral. No topic is ever scored.
export const m2Items: Item[] = [
  textItem('M2.0', 'What are you most into at the moment?', {
    example: 'Anything counts: a series, a band, a person, animals, a fictional world, psychology, history, a game, machines, collecting, a craft.',
    scoresInto: { descriptive: 'interestText' },
  }),
  checklist('M2.7', 'Which kinds of interest are these?', {
    example: 'Choose all that apply. This isn’t scored.',
    options: opts('People and relationships', 'Animals and nature', 'Fiction and fictional worlds', 'Science, tech or maths', 'Arts and crafts', 'Music', 'History', 'Collecting', 'Games'),
    allowOther: true,
    scoresInto: { descriptive: 'interestTopics' },
  }),
  freq('M2.1', 'Given the chance, I spend many hours at a time on my main interest', { scoresInto: { descriptive: 'interestIntensity' } }),
  freq('M2.2', 'I gather lots of information, items or lists about my interest', { scoresInto: { descriptive: 'interestDepth' } }),
  freq('M2.3', 'Time on my interest calms me down or recharges me', { scoresInto: { strength: 'Your interests recharge you', descriptive: 'interestDoesForMe' } }),
  freq('M2.4', 'Being interrupted while I’m doing my interest is distressing', { scoresInto: { descriptive: 'interestCost' } }),
  freq('M2.5', 'My interest has got in the way of sleep, eating, work or other things I needed to do', { scoresInto: { descriptive: 'interestCost' } }),
  freq('M2.6', 'My interests change: very intense for weeks or months, then they fade', { scoresInto: { descriptive: 'interestPattern' } }),
];
