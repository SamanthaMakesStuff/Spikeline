import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Anchor } from '../charts/svg/Anchors';
import type { Option } from '../content/items/types';
import type { ScaleDef } from '../content/scales';

type Val = number | string | undefined;

export interface PillOption { value: number | string; label: string; level?: number }

interface RadioProps {
  name: string;
  legend: ReactNode;
  legendClassName?: string;
  options: PillOption[];
  extras?: PillOption[];
  value: Val;
  onChange: (v: number | string) => void;
  anchor?: ScaleDef['anchor'];
  className?: string;
  describedBy?: string;
}

const same = (a: Val, b: Val) => a !== undefined && b !== undefined && String(a) === String(b);

/** Native radio inputs styled as large pills. Extras (doesn't apply, it depends, not sure) sit below a divider. */
export function PillRadioGroup({ name, legend, legendClassName, options, extras, value, onChange, anchor, className, describedBy }: RadioProps) {
  const render = (o: PillOption, secondary: boolean) => (
    <label key={String(o.value)} className={`pill-option${secondary ? ' secondary' : ''}`}>
      <input type="radio" name={name} value={String(o.value)} checked={same(value, o.value)} onChange={() => onChange(o.value)} />
      <span>
        {anchor && !secondary && o.level !== undefined && <Anchor kind={anchor} level={o.level} />}
        {o.label}
        <Check className="tick" size={18} strokeWidth={2} aria-hidden="true" />
      </span>
    </label>
  );
  return (
    <fieldset className={`step ${className ?? ''}`} aria-describedby={describedBy}>
      <legend className={legendClassName} tabIndex={-1}>{legend}</legend>
      <div className="pill-options">{options.map((o) => render(o, false))}</div>
      {extras && extras.length > 0 && <div className="pill-options extras">{extras.map((o) => render(o, true))}</div>}
    </fieldset>
  );
}

interface CheckProps {
  name: string;
  legend: ReactNode;
  legendClassName?: string;
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  allowOther?: boolean;
  otherLabel?: string;
  otherText?: string;
  onOtherText?: (t: string) => void;
  extras?: Option[];
}

export function CheckGroup({ name, legend, legendClassName, options, selected, onChange, allowOther, otherLabel = 'Something else', otherText, onOtherText, extras }: CheckProps) {
  const toggle = (id: string, exclusive = false) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange(exclusive ? [id] : [...selected.filter((x) => !extras?.some((e) => e.id === x)), id]);
  };
  const row = (o: Option, secondary: boolean) => (
    <label key={o.id} className={`pill-option${secondary ? ' secondary' : ''}`}>
      <input type="checkbox" name={name} value={o.id} checked={selected.includes(o.id)} onChange={() => toggle(o.id, secondary)} />
      <span>
        {o.label}
        <Check className="tick" size={18} strokeWidth={2} aria-hidden="true" />
      </span>
    </label>
  );
  return (
    <fieldset className="step checks">
      <legend className={legendClassName} tabIndex={-1}>{legend}</legend>
      <div className="pill-options">
        {options.map((o) => row(o, false))}
        {allowOther && row({ id: 'other', label: otherLabel }, false)}
      </div>
      {allowOther && selected.includes('other') && (
        <div className="field">
          <label htmlFor={`${name}-other`}>Tell us more (optional)</label>
          <input id={`${name}-other`} className="text-input" type="text" maxLength={500} value={otherText ?? ''} onChange={(e) => onOtherText?.(e.target.value)} />
        </div>
      )}
      {extras && extras.length > 0 && <div className="pill-options extras">{extras.map((o) => row(o, true))}</div>}
    </fieldset>
  );
}
