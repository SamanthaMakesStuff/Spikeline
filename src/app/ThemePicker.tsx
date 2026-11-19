import { Check } from 'lucide-react';
import { useStore } from '../storage/store';
import type { Settings } from '../storage/schema';

interface Option<T extends string> { value: T; label: string }

function Group<T extends string>({ name, legend, options, value, onChange }: {
  name: string; legend: string; options: Option<T>[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="plain">
      <legend>{legend}</legend>
      <div className="seg-group">
        {options.map((o) => (
          <label key={o.value} className="pill-option">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>
              {o.label}
              <Check className="tick" size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export const COLOUR_OPTIONS: Option<Settings['colours']>[] = [
  { value: 'bright', label: 'Bright' },
  { value: 'calm', label: 'Calm' },
  { value: 'lowstim', label: 'Low stimulation' },
];
export const BACKGROUND_OPTIONS: Option<Settings['background']>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match my device' },
];

/** Applies instantly and is saved straight away. Never moves focus. */
export function ThemePicker({ idPrefix = 'theme' }: { idPrefix?: string }) {
  const settings = useStore((s) => s.data.settings);
  const setSettings = useStore((s) => s.setSettings);
  return (
    <div className="stack">
      <Group name={`${idPrefix}-colours`} legend="Colours" options={COLOUR_OPTIONS} value={settings.colours} onChange={(colours) => setSettings({ colours })} />
      <Group name={`${idPrefix}-background`} legend="Background" options={BACKGROUND_OPTIONS} value={settings.background} onChange={(background) => setSettings({ background })} />
    </div>
  );
}

export { Group as OptionGroup };
export type { Option };
