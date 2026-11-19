// Names live here and are never hard-coded in components (brief §1.1).
export const APP_NAME = 'Spikeline';
export const SHARE_NAME = 'Spikeprint';
export const TAGLINE = 'Spikeline: map your spiky profile, and share your Spikeprint.';

export const STORAGE_KEY = 'spikeline:v1';
export const SCHEMA_VERSION = 1 as const;
// Bump when item IDs are added, removed or reworded in a way that changes meaning.
export const BANK_VERSION = '1.0.0';

// Provisional readability rule, not a statistical cut-off (brief §7 step 3).
export const RELATIVE_THRESHOLD = 15;
export const MANAGEABLE_BUT_COSTLY = { ease: 60, cost: 60 } as const;
export const VARIES_ON_HARD_DAYS = 25;
export const MIN_SPOKES_FOR_RESULTS = 3;
export const AUTOSAVE_DEBOUNCE_MS = 300;
export const SHARE_LINK_SOFT_LIMIT = 2000;
