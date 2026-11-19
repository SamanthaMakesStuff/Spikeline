import { categorical, easeCost, freq, like, opts } from './helpers';
import type { Item } from './types';

// M5 ADHD-linked patterns: offered to everyone, whatever diagnosis they report.
export const m5Items: Item[] = [
  freq('M5.1', 'My mind drifts off tasks that don’t interest me, even when I’m trying hard to concentrate', { scoresInto: { adhd: 'attentionRegulation' } }),
  freq('M5.2', 'I make mistakes in dull tasks because I rush or skip details', { scoresInto: { adhd: 'attentionRegulation' } }),
  freq('M5.3', 'I feel restless inside, as if I need to be doing something, even when I’m sitting still', { scoresInto: { adhd: 'restlessness' } }),
  freq('M5.4', 'I need to fidget or move during long periods of sitting', { scoresInto: { adhd: 'restlessness' } }),
  freq('M5.5', 'I talk over people or say things before I’ve thought them through', { scoresInto: { adhd: 'impulsivity' } }),
  freq('M5.6', 'I make quick decisions about money, plans or commitments that I later regret', { scoresInto: { adhd: 'impulsivity' } }),
  easeCost('M5.7', 'Waiting, for example in queues, slow conversations or for replies', { scoresInto: { descriptive: 'waiting' } }),
  freq('M5.8', 'I can only get going when there’s urgency, something new, a challenge or strong interest', { scoresInto: { adhd: 'interestNovelty' } }),
  freq('M5.9', 'I lose interest in projects or routines once they’re no longer new', { scoresInto: { adhd: 'interestNovelty' } }),
  freq('M5.10', 'I’m surprised by how much, or how little, time has passed', { scoresInto: { adhd: 'time' } }),
  freq('M5.11', 'I get so absorbed that I miss meals, messages or appointments', { scoresInto: { adhd: 'hyperfocus' } }),
  // Never labelled "RSD" anywhere in the UI.
  freq('M5.12', 'Criticism, or thinking someone is disappointed in me, hits me very hard and stays with me', { scoresInto: { adhd: 'criticism' } }),
  freq('M5.13', 'My body’s natural bedtime is much later than my life allows', { scoresInto: { adhd: 'sleepTiming' } }),
  freq('M5.14', 'I get bored quickly and look for something new to do', { scoresInto: { adhd: 'interestNovelty' } }),

  // AuDHD tensions: LIKE, unscored, shown as chips when rated 3 or more.
  like('M5.T1', 'I need routine, and I also get bored by it', { scoresInto: { descriptive: 'tension' } }),
  like('M5.T2', 'I need quiet, and I also seek out stimulation', { scoresInto: { descriptive: 'tension' } }),
  like('M5.T3', 'I can focus for hours on my interests but can’t start tasks I need to do', { scoresInto: { descriptive: 'tension' } }),
  like('M5.T4', 'I want plans fixed in advance, but struggle to make and keep them', { scoresInto: { descriptive: 'tension' } }),
  like('M5.T5', 'I want people around me, and being around people drains me', { scoresInto: { descriptive: 'tension' } }),

  // Medication context: unscored, private by default.
  categorical('M5.MED1', 'Do you take ADHD medication?', {
    options: opts('Yes', 'No', 'Prefer not to say'),
    scoresInto: { descriptive: 'medication' },
  }),
  categorical('M5.MED2', 'Has it changed your sensory experience, anxiety or social energy?', {
    options: opts('Better', 'Worse', 'Mixed', 'No change'),
    showIf: { item: 'M5.MED1', includes: 'yes' },
    scoresInto: { descriptive: 'medication' },
  }),
];
