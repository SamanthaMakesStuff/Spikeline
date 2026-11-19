import type { DriverSetId, Lens, Option } from './items/types';

export interface DriverOption extends Option { lens: Lens }
export interface DriverSet { id: DriverSetId; prompt: string; options: DriverOption[] }

const o = (label: string, lens: Lens): DriverOption => ({
  id: label.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48),
  label, lens,
});

// Lens tags (A, D, S, W) are internal only and are never displayed.
export const DRIVER_SETS: Record<DriverSetId, DriverSet> = {
  distraction: {
    id: 'distraction',
    prompt: 'What gets in the way most? Choose all that apply.',
    options: [
      o('Noise, light, textures or smells pull my attention', 'A'),
      o('My mind wanders when the task isn’t interesting', 'D'),
      o('My own thoughts pull me away', 'S'),
      o('I get absorbed in one detail and lose the main thread', 'A'),
      o('I’m too tired or overloaded to focus', 'W'),
    ],
  },
  unfinished: {
    id: 'unfinished',
    prompt: 'What gets in the way most? Choose all that apply.',
    options: [
      o('I can’t start without clear steps or knowing exactly what’s expected', 'A'),
      o('I lose interest once it stops being new', 'D'),
      o('I can’t judge how long it will take, so I put it off', 'D'),
      // REVIEW: idiom. Kept because the research bank uses it; needs co-design.
      o('Switching into it feels like hitting a wall', 'S'),
      o('I’m too drained', 'W'),
    ],
  },
  change: {
    id: 'change',
    prompt: 'What gets in the way most? Choose all that apply.',
    options: [
      o('Not knowing what will happen makes me anxious', 'A'),
      o('It’s hard to pull away from what I was doing', 'S'),
      o('I like change but struggle to re-plan', 'D'),
      o('Routines bore me so I drop them anyway', 'D'),
      o('I’m already at my limit', 'W'),
    ],
  },
  social: {
    id: 'social',
    prompt: 'What gets in the way most? Choose all that apply.',
    options: [
      o('I’m unsure what people mean or expect', 'A'),
      o('I know the “rules” but blurt, interrupt or lose track', 'D'),
      o('It’s exhausting because I’m watching myself the whole time', 'S'),
      o('Sensory parts (noise, crowd, eye contact) are the problem', 'A'),
      o('I’m worried about being judged or rejected', 'S'),
    ],
  },
  overwhelm: {
    id: 'overwhelm',
    prompt: 'What does this feel like most? Choose all that apply.',
    options: [
      o('Sensory or social load builds up until I shut down or melt down', 'A'),
      o('A quick, intense flash of frustration or hurt that passes', 'D'),
      o('A strong reaction to feeling criticised or rejected', 'S'),
      o('Too many demands at once', 'S'),
      o('Long-running exhaustion', 'W'),
    ],
  },
};

export const DRIVER_NOT_SURE = { id: 'not-sure', label: 'Not sure' };
export const DRIVER_OTHER = { id: 'other', label: 'Something else' };

export const driverLens = (setId: DriverSetId, optionId: string): Lens | undefined =>
  DRIVER_SETS[setId].options.find((x) => x.id === optionId)?.lens;

/** Plain words for each lens, used in summaries. Never framed as diagnoses. */
export const LENS_WORDS: Record<Lens, string> = {
  A: 'sensory load, uncertainty and needing things to be clear',
  D: 'interest, novelty and timing',
  S: 'switching, demands and being judged',
  W: 'energy and being run down',
};
