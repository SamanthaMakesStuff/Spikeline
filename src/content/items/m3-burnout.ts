import { categorical, checklist, freq, opts } from './helpers';
import type { Item } from './types';

// M3 Burnout and hard periods. Describes, never diagnoses.
const PAST_12 = 'Thinking about the past 12 months';
export const m3Items: Item[] = [
  categorical('M3.1', 'I’ve had a stretch of three months or longer of exhaustion that rest didn’t fix', {
    timeframe: 'Thinking about ever',
    options: opts('Never', 'Once', 'More than once', 'I’m in one now'),
    signpost: true,
    scoresInto: { descriptive: 'hardPeriodHistory' },
  }),
  freq('M3.2', 'In hard periods, I lose skills I usually have, such as speaking, cooking, self-care or organising', { timeframe: PAST_12, scoresInto: { load: 'burnout' } }),
  freq('M3.3', 'In hard periods, I can cope with much less noise, light or contact with people than usual', { timeframe: PAST_12, scoresInto: { load: 'burnout' } }),
  categorical('M3.4', 'Right now, compared with my usual self, my energy is…', {
    timeframe: 'Thinking about right now',
    options: opts('Much lower', 'Lower', 'About usual', 'Higher'),
    scoresInto: { descriptive: 'energyNow' },
  }),
  checklist('M3.5', 'Early signs I notice', {
    example: 'Choose all that apply.',
    timeframe: PAST_12,
    options: opts('Sleeping badly', 'More shutdowns or meltdowns', 'Dropping routines', 'More sensory sensitivity', 'Avoiding messages', 'Losing words'),
    allowOther: true,
    scoresInto: { descriptive: 'burnoutSigns' },
  }),
  checklist('M3.6', 'What contributed', {
    example: 'Choose all that apply.',
    timeframe: PAST_12,
    options: opts('Masking', 'Life changes', 'Work or study demands', 'Caring responsibilities', 'Health problems', 'Lack of support', 'Not sure'),
    scoresInto: { descriptive: 'burnoutContributors' },
  }),
];
