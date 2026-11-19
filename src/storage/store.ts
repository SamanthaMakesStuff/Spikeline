import { create } from 'zustand';
import { AUTOSAVE_DEBOUNCE_MS } from '../config';
import { announce } from '../a11y/announce';
import { DEFAULT_SETTINGS, emptyState } from './defaults';
import { clearState, loadState, saveState } from './persistence';
import type { AboutYou, Answer, PresetId, Settings, ShareSelection, StoredState } from './schema';
import type { ModuleId } from '../content/items/types';

export type SaveStatus = 'saved' | 'unsaved' | 'failed';

interface Store {
  data: StoredState;
  /** False when localStorage isn't available; we keep going in memory. */
  persistent: boolean;
  hasSavedData: boolean;
  saveStatus: SaveStatus;
  setAnswer: (itemId: string, patch: Partial<Answer>) => void;
  clearAnswer: (itemId: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setAbout: (patch: Partial<AboutYou>) => void;
  setReflection: (patch: Partial<StoredState['reflection']>) => void;
  setFlag: (patch: Partial<StoredState['flags']>) => void;
  optIn: (module: ModuleId) => void;
  setShareDraft: (preset: PresetId, selection: ShareSelection) => void;
  replaceAll: (state: StoredState) => void;
  deleteEverything: () => void;
}

const initial = loadState();
const initialData: StoredState = initial.status === 'ok' ? initial.state : emptyState();

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let announcedFirstSave = false;

export const useStore = create<Store>((set, get) => {
  const touch = (patch: Partial<StoredState>) => {
    const data = { ...get().data, ...patch, updatedAt: new Date().toISOString() };
    set({ data, hasSavedData: true, saveStatus: 'unsaved' });
    scheduleSave();
  };

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, AUTOSAVE_DEBOUNCE_MS);
  };

  const flushSave = () => {
    const ok = saveState(get().data);
    if (ok) {
      set({ saveStatus: 'saved', persistent: true });
      if (!announcedFirstSave) {
        announcedFirstSave = true;
        announce('Saved on this device');
      }
    } else {
      const wasFailed = get().saveStatus === 'failed';
      set({ saveStatus: 'failed', persistent: false });
      if (!wasFailed) announce('We can’t save on this device. Save a backup before you close this page.');
    }
  };

  return {
    data: initialData,
    persistent: initial.status !== 'unavailable',
    hasSavedData: initial.status === 'ok',
    saveStatus: initial.status === 'unavailable' ? 'failed' : 'saved',
    setAnswer: (itemId, patch) => {
      const prev = get().data.answers[itemId];
      touch({ answers: { ...get().data.answers, [itemId]: { ...prev, ...patch, answeredAt: new Date().toISOString() } } });
    },
    clearAnswer: (itemId) => {
      const { [itemId]: _removed, ...rest } = get().data.answers;
      touch({ answers: rest });
    },
    setSettings: (patch) => touch({ settings: { ...get().data.settings, ...patch } }),
    setAbout: (patch) => touch({ aboutYou: { ...get().data.aboutYou, ...patch } }),
    setReflection: (patch) => touch({ reflection: { ...get().data.reflection, ...patch } }),
    setFlag: (patch) => touch({ flags: { ...get().data.flags, ...patch } }),
    optIn: (module) => {
      const cur = get().data.optedInModules;
      if (!cur.includes(module)) touch({ optedInModules: [...cur, module] });
    },
    setShareDraft: (preset, selection) => touch({ shareDrafts: { ...get().data.shareDrafts, [preset]: selection } }),
    replaceAll: (state) => {
      set({ data: state, hasSavedData: true, saveStatus: 'unsaved' });
      flushSave();
    },
    deleteEverything: () => {
      if (saveTimer) clearTimeout(saveTimer);
      clearState();
      set({ data: { ...emptyState(), settings: { ...DEFAULT_SETTINGS } }, hasSavedData: false, saveStatus: get().persistent ? 'saved' : 'failed' });
    },
  };
});

/** Settings-only helper: touch() adds hasSavedData, so colour changes on Welcome are saved straight away. */
export const selectSettings = (s: Store) => s.data.settings;
