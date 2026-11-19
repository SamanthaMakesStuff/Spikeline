import { create } from 'zustand';

interface UI {
  supportOpen: boolean;
  coloursOpen: boolean;
  openSupport: () => void;
  closeSupport: () => void;
  openColours: () => void;
  closeColours: () => void;
}

export const useUI = create<UI>((set) => ({
  supportOpen: false,
  coloursOpen: false,
  openSupport: () => set({ supportOpen: true }),
  closeSupport: () => set({ supportOpen: false }),
  openColours: () => set({ coloursOpen: true }),
  closeColours: () => set({ coloursOpen: false }),
}));
