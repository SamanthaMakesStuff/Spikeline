export type CoreSectionId =
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11' | 'C12' | 'C13' | 'C14';
export type ModuleId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7';
export type SectionId = CoreSectionId | ModuleId;

export type SpokeId =
  | 'attention' | 'starting' | 'planning' | 'memory' | 'language' | 'socialEase'
  | 'feelings' | 'busyPlaces' | 'change' | 'movement' | 'literacy';

export type LoadId =
  | 'sensoryOver' | 'sensoryUnder' | 'sensorySeeking' | 'bodySignals' | 'overload' | 'stuck'
  | 'predictability' | 'socialRecovery' | 'bumps' | 'recoveryAfterEvents'
  | 'masking' | 'maskingCost' | 'burnout';

export type AdhdId =
  | 'attentionRegulation' | 'restlessness' | 'impulsivity' | 'interestNovelty' | 'time'
  | 'hyperfocus' | 'criticism' | 'sleepTiming' | 'emotionalFlash';

export type DriverSetId = 'distraction' | 'unfinished' | 'change' | 'social' | 'overwhelm';
export type Lens = 'A' | 'D' | 'S' | 'W';

export type ScaleCode =
  | 'EASE+COST' | 'EASE' | 'FREQ' | 'LIKE' | 'LIKE+COSTFU'
  | 'CHECKLIST' | 'CATEGORICAL' | 'TEXT' | 'GRID';

export interface Option { id: string; label: string }

export interface ScoresInto {
  spoke?: SpokeId;
  load?: LoadId;
  adhd?: AdhdId;
  /** Strength card name, or true when the card name comes from elsewhere. */
  strength?: string | true;
  insight?: string;
  /** Descriptive only (never scored): e.g. 'energyLeft', 'drains', 'modality'. */
  descriptive?: string;
}

export interface Item {
  id: string;
  section: SectionId;
  text: string;
  example?: string;
  scale: ScaleCode;
  hardDay?: boolean;
  driverSet?: DriverSetId;
  /** Which answer opens the driver follow-up. Default 'ease' (EASE is 0 or 1); 'freq' means FREQ is 3 or 4. */
  driverTrigger?: 'ease' | 'freq';
  scoresInto?: ScoresInto;
  why?: string;
  signpost?: boolean;
  options?: Option[];
  /** Checklists: let people add their own text. */
  allowOther?: boolean;
  gridRows?: Option[];
  gridCols?: Option[];
  /** Only show when another checklist item includes this option id. */
  showIf?: { item: string; includes: string };
  /** Overrides the section timeframe chip for this item. */
  timeframe?: string;
  /** Name shown on the strength card (Appendix A). */
  strengthName?: string;
  /** Safety trigger: show the prominent Beat card when FREQ is this high or higher. */
  safetyAt?: number;
  /** Text shown to the person in the results (first person), if different from `text`. */
  review?: string;
}

export interface Section {
  id: SectionId;
  title: string;
  group: SectionGroupId;
  minutes: number;
  intro?: string;
  timeframe: string;
  signpost?: boolean;
  /** Sensitive: gets the generic "Why are we asking this?" on each item. */
  sensitive?: boolean;
  /** Needs the person to choose to add it first. */
  optIn?: boolean;
  optInBlurb?: string;
}

export type SectionGroupId =
  | 'focusDoing' | 'communicating' | 'body' | 'practical' | 'strengthsEnergy'
  | 'recommended' | 'optional';

export type Hue = 'teal' | 'plum' | 'tomato' | 'butter';
