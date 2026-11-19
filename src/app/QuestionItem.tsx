import { useEffect, useRef } from 'react';
import { announce } from '../a11y/announce';
import { DRIVER_NOT_SURE, DRIVER_OTHER, DRIVER_SETS } from '../content/drivers';
import { WHY_GENERIC } from '../content/copy';
import type { Item } from '../content/items';
import { M6_COLS } from '../content/items/m6-hormones';
import {
  CONTEXT_TAGS, COST_FOLLOW_UP, DEPENDS_TAGS_PROMPT, DEPENDS_TIP, DEPENDS_TYPICAL_PROMPT, SCALES, type ScaleKind,
} from '../content/scales';
import { SECTION_BY_ID } from '../content/sections';
import { sanitiseAnswer, stepsFor, type StepKind } from '../engine/flow';
import type { Answer } from '../storage/schema';
import { CheckGroup, PillRadioGroup, type PillOption } from './answers';
import { GlossaryTip } from './GlossaryTip';
import { useMediaQuery } from './useMediaQuery';

interface Props {
  item: Item;
  answer: Answer | undefined;
  onChange: (a: Answer) => void;
  /** Move focus to the first legend when this item mounts (used for the first item on a new screen). */
  focusFirst?: boolean;
  headingLevel?: 'legend';
}

const levels = (kind: ScaleKind): PillOption[] => SCALES[kind].labels.map((label, value) => ({ value, label, level: value }));
const extrasOf = (kind: ScaleKind): PillOption[] => SCALES[kind].extras.map((e) => ({ value: e.id, label: e.label }));

const promptFor = (item: Item, step: StepKind): string => {
  switch (step) {
    case 'ease': return SCALES.EASE.prompt;
    case 'depends': return DEPENDS_TAGS_PROMPT;
    case 'cost': return SCALES.COST.prompt;
    case 'hard': return SCALES.HARD.prompt;
    case 'freq': return SCALES.FREQ.prompt;
    case 'like': return SCALES.LIKE.prompt;
    case 'costfu': return COST_FOLLOW_UP.prompt;
    case 'driver': return item.driverSet ? DRIVER_SETS[item.driverSet].prompt : '';
    default: return '';
  }
};

export function QuestionItem({ item, answer, onChange, focusFirst }: Props) {
  const a: Answer = answer ?? { answeredAt: '' };
  const steps = stepsFor(item, answer);
  const rootRef = useRef<HTMLElement>(null);
  const prevSteps = useRef(steps.length);
  const section = SECTION_BY_ID[item.section];
  const why = item.why ?? (section.sensitive ? WHY_GENERIC : undefined);
  const wide = useMediaQuery('(min-width: 720px)');

  // Announce newly revealed questions politely. Focus never moves.
  useEffect(() => {
    if (steps.length > prevSteps.current) {
      const newest = steps[steps.length - 1];
      const p = promptFor(item, newest);
      if (p) announce(`New question: ${p}`);
    }
    prevSteps.current = steps.length;
  }, [steps, item]);

  useEffect(() => {
    if (focusFirst) rootRef.current?.querySelector<HTMLElement>('.first-legend')?.focus();
  }, [focusFirst, item.id]);

  const set = (patch: Partial<Answer>) => onChange(sanitiseAnswer(item, { ...a, ...patch }));

  const lead = (
    <>
      <span className="q-text">{item.text}</span>
      {item.example && <span className="q-example" style={{ display: 'block', marginTop: 'var(--space-2)', fontWeight: 400 }}>{item.example}</span>}
    </>
  );
  const quiet = (step: StepKind, text: string) => (
    <>
      <span className="sr-only">{item.text}. </span>
      {text || promptFor(item, step)}
    </>
  );

  const renderStep = (step: StepKind, index: number) => {
    const first = index === 0;
    const legend = (prompt: string) => first ? <>{lead}<span style={{ display: 'block', marginTop: 'var(--space-3)', fontWeight: 500 }}>{prompt}</span></> : quiet(step, prompt);
    const name = `${item.id}-${step}`;
    const legendProps = first ? { legendClassName: 'first-legend' } : {};
    switch (step) {
      case 'ease':
        return (
          <PillRadioGroup key={step} name={name} legend={legend(SCALES.EASE.prompt)} {...legendProps}
            options={levels('EASE')} extras={extrasOf('EASE')} anchor="circle" value={a.ease}
            onChange={(v) => set({ ease: v as Answer['ease'] })} />
        );
      case 'depends':
        return (
          <div key={step} className="stack">
            <p className="hint">{DEPENDS_TIP}</p>
            <CheckGroup name={`${name}-tags`} legend={quiet('depends', DEPENDS_TAGS_PROMPT)}
              options={CONTEXT_TAGS.map((t) => ({ id: t.id, label: t.label }))}
              selected={a.dependsTags ?? []} onChange={(dependsTags) => set({ dependsTags })} />
            <PillRadioGroup name={`${name}-typical`} legend={quiet('depends', DEPENDS_TYPICAL_PROMPT)}
              options={levels('EASE')} anchor="circle" value={a.dependsTypical}
              onChange={(v) => set({ dependsTypical: v as Answer['dependsTypical'] })} />
          </div>
        );
      case 'cost':
        return <PillRadioGroup key={step} name={name} legend={quiet(step, SCALES.COST.prompt)} options={levels('COST')} extras={extrasOf('COST')} anchor="battery" value={a.cost} onChange={(v) => set({ cost: v as Answer['cost'] })} />;
      case 'hard':
        return <PillRadioGroup key={step} name={name} className="hard-fieldset" legend={quiet(step, SCALES.HARD.prompt)} options={levels('HARD')} extras={extrasOf('HARD')} anchor="circle" value={a.hard} onChange={(v) => set({ hard: v as Answer['hard'] })} />;
      case 'freq':
        return <PillRadioGroup key={step} name={name} legend={legend(SCALES.FREQ.prompt)} {...legendProps} options={levels('FREQ')} extras={extrasOf('FREQ')} anchor="pill" value={a.freq} onChange={(v) => set({ freq: v as Answer['freq'] })} />;
      case 'like':
        return <PillRadioGroup key={step} name={name} legend={legend(SCALES.LIKE.prompt)} {...legendProps} options={levels('LIKE')} extras={extrasOf('LIKE')} anchor="moon" value={a.like} onChange={(v) => set({ like: v as Answer['like'] })} />;
      case 'costfu':
        return <PillRadioGroup key={step} name={name} legend={quiet(step, COST_FOLLOW_UP.prompt)} options={COST_FOLLOW_UP.options.map((o) => ({ value: o.id, label: o.label }))} value={a.costFollowUp} onChange={(v) => set({ costFollowUp: v as Answer['costFollowUp'] })} />;
      case 'driver': {
        const set_ = DRIVER_SETS[item.driverSet!];
        return (
          <CheckGroup key={step} name={name} legend={quiet(step, set_.prompt)} options={set_.options}
            selected={a.drivers ?? []} onChange={(drivers) => set({ drivers })}
            allowOther otherLabel={DRIVER_OTHER.label} otherText={a.driverOther} onOtherText={(driverOther) => set({ driverOther })}
            extras={[DRIVER_NOT_SURE]} />
        );
      }
      case 'checklist':
        return (
          <CheckGroup key={step} name={name} legend={legend('')} {...legendProps} options={item.options ?? []}
            selected={a.choices ?? []} onChange={(choices) => set({ choices })}
            allowOther={item.allowOther} otherText={a.choiceOther} onOtherText={(choiceOther) => set({ choiceOther })} />
        );
      case 'categorical':
        return <PillRadioGroup key={step} name={name} legend={legend('')} {...legendProps} options={(item.options ?? []).map((o) => ({ value: o.id, label: o.label }))} value={a.choice} onChange={(v) => set({ choice: String(v) })} />;
      case 'text':
        return (
          <div key={step} className="field">
            <label htmlFor={name} className="first-legend" tabIndex={-1}>{lead}</label>
            <textarea id={name} className="textarea" maxLength={2000} value={a.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
            <p className="hint">Optional. You can leave this blank.</p>
          </div>
        );
      case 'grid':
        return <GridStep key={step} item={item} name={name} legendLead={lead} grid={a.grid ?? {}} onChange={(grid) => set({ grid })} wide={wide} />;
    }
  };

  return (
    <section ref={rootRef} className="q-item" aria-label={`Question ${item.id}`}>
      {steps.map(renderStep)}
      {(steps.includes('cost') || steps.includes('hard')) && (
        <p className="cluster">
          {steps.includes('cost') && <GlossaryTip term="Energy cost" />}
          {steps.includes('hard') && <GlossaryTip term="Hard day" />}
        </p>
      )}
      {why && (
        <details className="disclosure">
          <summary>Why are we asking this?</summary>
          <p className="prose">{why}</p>
        </details>
      )}
    </section>
  );
}

function GridStep({ item, name, legendLead, grid, onChange, wide }: {
  item: Item; name: string; legendLead: React.ReactNode; grid: Record<string, string>; onChange: (g: Record<string, string>) => void; wide: boolean;
}) {
  const rows = item.gridRows ?? [];
  const cols = item.gridCols ?? M6_COLS;
  const setCell = (row: string, col: string) => onChange({ ...grid, [row]: col });
  if (wide) {
    return (
      <div className="stack">
        <p className="first-legend" tabIndex={-1}>{legendLead}</p>
        <table className="grid-table">
          <thead>
            <tr><td /> {cols.map((c) => <th key={c.id} scope="col">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.label}</th>
                {cols.map((c) => (
                  <td key={c.id}>
                    <span className="cellwrap">
                      <input type="radio" name={`${name}-${r.id}`} aria-label={`${r.label}: ${c.label}`} checked={grid[r.id] === c.id} onChange={() => setCell(r.id, c.id)} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="stack">
      <p className="first-legend" tabIndex={-1}>{legendLead}</p>
      {rows.map((r) => (
        <PillRadioGroup key={r.id} name={`${name}-${r.id}`} legend={r.label} options={cols.map((c) => ({ value: c.id, label: c.label }))} value={grid[r.id]} onChange={(v) => setCell(r.id, String(v))} />
      ))}
    </div>
  );
}
