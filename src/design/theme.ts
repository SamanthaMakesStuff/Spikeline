import type { Settings } from '../storage/schema';

/** Keep in step with public/theme-boot.js (which runs before first paint). */
export function resolveMode(background: Settings['background']): 'light' | 'dark' {
  if (background !== 'system') return background;
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const themeId = (s: Pick<Settings, 'colours' | 'background'>) => `${s.colours}-${resolveMode(s.background)}`;

export function applySettings(s: Settings, root: HTMLElement = document.documentElement) {
  root.setAttribute('data-theme', themeId(s));
  root.setAttribute('data-font', s.font);
  root.setAttribute('data-lines', s.lineSpacing);
  root.setAttribute('data-letters', s.letterSpacing);
  root.setAttribute('data-motion', s.motion);
  root.style.setProperty('--text-scale', String(s.textSize / 100));
}

/** The six theme IDs, for contrast checks and screenshots. */
export const THEME_IDS = ['bright-light', 'bright-dark', 'calm-light', 'calm-dark', 'lowstim-light', 'lowstim-dark'] as const;
