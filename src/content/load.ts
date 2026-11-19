import type { AdhdId, LoadId } from './items/types';

export interface LoadDef { id: LoadId; label: string; module?: 'M1' | 'M3' }
export const LOAD_DOMAINS: LoadDef[] = [
  { id: 'sensoryOver', label: 'Senses feel too strong' },
  { id: 'sensoryUnder', label: 'Senses feel too weak or slow to notice' },
  { id: 'sensorySeeking', label: 'Seeking strong sensations' },
  { id: 'bodySignals', label: 'Noticing body signals and naming feelings' },
  { id: 'overload', label: 'Overload (build-up, shutdown, meltdown, losing words)' },
  { id: 'stuck', label: 'Getting stuck (can’t get going)' },
  { id: 'predictability', label: 'Needing to know what’s coming' },
  { id: 'socialRecovery', label: 'Needing recovery time after people' },
  { id: 'bumps', label: 'Trips, drops and bumps' },
  { id: 'recoveryAfterEvents', label: 'Recovery after big events' },
  { id: 'masking', label: 'Adjusting how I come across', module: 'M1' },
  { id: 'maskingCost', label: 'Cost of adjusting', module: 'M1' },
  { id: 'burnout', label: 'Hard-period signs', module: 'M3' },
];

export interface AdhdDef { id: AdhdId; label: string }
export const ADHD_DOMAINS: AdhdDef[] = [
  { id: 'attentionRegulation', label: 'Attention drifting from uninteresting tasks' },
  { id: 'restlessness', label: 'Restlessness' },
  { id: 'impulsivity', label: 'Acting or speaking quickly' },
  { id: 'interestNovelty', label: 'Needing interest, novelty or urgency' },
  { id: 'time', label: 'Losing track of time' },
  { id: 'hyperfocus', label: 'Getting absorbed and missing things' },
  { id: 'criticism', label: 'Criticism hitting hard' },
  { id: 'sleepTiming', label: 'Late body clock' },
  { id: 'emotionalFlash', label: 'Quick, strong frustration that passes' },
];
