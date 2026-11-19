import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { SupportCard } from '../app/SupportCard';
import { ADHD_INTRO, LOAD_CAPTION, MASKING_RESULTS_NOTE } from '../content/copy';
import { AUTONOMY_IDEA, IDEAS_DISCLAIMER, LENS_IDEAS, SENSE_IDEAS, SPOKE_IDEAS, type Idea } from '../content/adjustments';
import { LENS_WORDS } from '../content/drivers';
import type { Hue, Lens } from '../content/items';
import { SPOKES, SPOKE_BY_ID } from '../content/spokes';
import type { Profile } from '../scoring/profile';
import { basedOnText, round, wordBand } from './describe';
import { BatteryGlyph } from './glyphs';
import { GlossaryTip } from '../app/GlossaryTip';

/** Outlined pill meter with a diagonal-stripe fill: deliberately unlike the capacity charts. No middle line. */
export function LoadMeter({ label, value, basedOn, hue = 'tomato' }: { label: string; value?: number; basedOn?: number; hue?: Hue }) {
  if (value === undefined) {
    return (
      <div className="meter">
        <div className="meter-head"><span>{label}</span><span className="muted">Not enough answers yet</span></div>
      </div>
    );
  }
  return (
    <div className="meter">
      <div className="meter-head">
        <span>{label}</span>
        <span className="tabular" style={{ fontWeight: 500 }}>{wordBand(value)}</span>
      </div>
      <div className="meter-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={round(value)} aria-valuetext={wordBand(value)}>
        <div className={`meter-fill hue-${hue}`} style={{ width: `${Math.max(value, 2)}%` }} />
      </div>
      {basedOn !== undefined && <p className="small muted">{basedOnText(basedOn)}</p>}
    </div>
  );
}

const hasAny = (list: { shown: boolean }[]) => list.some((d) => d.shown);

export function LoadPanel({ profile }: { profile: Profile }) {
  const core = profile.load.filter((l) => !l.module);
  const sensory = profile.modalities;
  if (!hasAny(core) && sensory.length === 0 && profile.energyLeft === undefined && !profile.absorption) return null;
  return (
    <section className="stack" aria-labelledby="carry-h">
      <h2 id="carry-h" style={{ fontSize: '1.7rem' }}>What you carry</h2>
      <p className="muted prose">{LOAD_CAPTION}</p>
      <div className="stack">
        {core.filter((l) => l.shown).map((l) => <LoadMeter key={l.id} label={l.label} value={l.value} basedOn={l.basedOn} />)}
      </div>
      {profile.absorption && <p className="callout prose">You often get so absorbed you stop noticing time, hunger or people.</p>}
      {sensory.length > 0 && (
        <div className="stack-sm">
          <h3>Senses that affect you most</h3>
          <ul className="chip-list">{sensory.map((m) => <li key={m} className="chip">{m}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

export function StrengthsPanel({ profile }: { profile: Profile }) {
  const cards = profile.strengths;
  const connection = profile.socialMotivation.value !== undefined && profile.socialMotivation.value >= 75;
  if (cards.length === 0 && !connection) return null;
  return (
    <section className="stack" aria-labelledby="str-h">
      <h2 id="str-h" style={{ fontSize: '1.7rem' }}>Your strengths</h2>
      <ul className="area-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {connection && (
          <li className="area-card"><div className="cap hue-butter"><Heart size={18} strokeWidth={2} aria-hidden="true" /> Connection matters to you</div><div className="body"><p className="small">You said you want close relationships and enjoy time with people you know well.</p></div></li>
        )}
        {cards.map((c) => (
          <li key={c.id} className="area-card">
            <div className="cap hue-butter">{c.name}</div>
            <div className="body">
              <p className="small">{c.id === 'C1.4' ? 'You often get so absorbed you stop noticing time, hunger or people.' : `“${c.text}”`}</p>
              {c.cost && <span className="badge">{c.cost === 'often' ? 'Costs me often' : 'Costs me sometimes'}</span>}
              {c.noScore && <p className="small muted">Shown as a strength. It isn’t scored.</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdhdPanel({ profile }: { profile: Profile }) {
  const shown = profile.adhd.filter((d) => d.shown);
  const w = profile.waiting;
  if (shown.length === 0 && !w && profile.tensions.length === 0 && !profile.medication) return null;
  return (
    <section className="stack" aria-labelledby="adhd-h">
      <h2 id="adhd-h" style={{ fontSize: '1.7rem' }}>Patterns often linked with ADHD</h2>
      <p className="muted prose">{ADHD_INTRO}</p>
      <div className="stack">
        {shown.map((d) => <LoadMeter key={d.id} label={d.label} value={d.value} basedOn={d.basedOn} hue="plum" />)}
      </div>
      {w && (
        <p className="cluster"><BatteryGlyph cost={w.cost} /> Waiting is {w.ease >= 50 ? 'easier' : 'harder'} for you ({round(w.ease)} of 100){w.cost !== undefined ? ', with a visible energy cost' : ''}.</p>
      )}
      {profile.tensions.length > 0 && (
        <div className="stack-sm">
          <h3>You recognise</h3>
          <ul className="chip-list">{profile.tensions.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
        </div>
      )}
      {profile.medication && (
        <p className="small muted">Private to you: you {profile.medication.takes ? 'said you take ADHD medication' : 'said you don’t take ADHD medication'}{profile.medication.change ? `, and that it changed your sensory experience, anxiety or social energy: ${profile.medication.change.toLowerCase()}` : ''}. This is never included in a Spikeprint unless you choose it.</p>
      )}
    </section>
  );
}

export function ExtrasPanels({ profile }: { profile: Profile }) {
  const mk = profile.load.find((l) => l.id === 'masking');
  const mc = profile.load.find((l) => l.id === 'maskingCost');
  const burn = profile.load.find((l) => l.id === 'burnout');
  const i = profile.interests;
  const anyInterest = i.text || i.topics.length || i.recharges !== undefined || i.cost !== undefined || i.intensity !== undefined;
  return (
    <>
      {(mk?.shown || mc?.shown || profile.masking.where.length > 0) && (
        <section className="stack" aria-labelledby="mask-h">
          <h2 id="mask-h" style={{ fontSize: '1.7rem' }}>Adjusting how you come across</h2>
          <p className="prose">{MASKING_RESULTS_NOTE}</p>
          <p><GlossaryTip term="Masking" /></p>
          {mk?.shown && <LoadMeter label={mk.label} value={mk.value} basedOn={mk.basedOn} />}
          {mc?.shown && <LoadMeter label={mc.label} value={mc.value} basedOn={mc.basedOn} />}
          {profile.masking.where.length > 0 && <p><strong>Where:</strong> {profile.masking.where.join(', ')}.</p>}
          {profile.masking.why.length > 0 && <p><strong>Why:</strong> {profile.masking.why.join(', ')}.</p>}
          <SupportCard />
        </section>
      )}

      {anyInterest && (
        <section className="stack" aria-labelledby="int-h">
          <h2 id="int-h" style={{ fontSize: '1.7rem' }}>Interests</h2>
          {i.text && <p className="prose">“{i.text}”</p>}
          {i.topics.length > 0 && <ul className="chip-list">{i.topics.map((t) => <li key={t} className="chip">{t}</li>)}</ul>}
          {i.recharges !== undefined && <p><strong>What it does for me:</strong> {i.recharges >= 75 ? 'Interests often calm or recharge you.' : i.recharges >= 50 ? 'Interests sometimes calm or recharge you.' : 'Interests don’t often calm or recharge you.'}</p>}
          {i.cost !== undefined && <p><strong>What it can cost:</strong> {i.cost >= 75 ? 'Being interrupted, or losing time to your interest, often causes problems.' : i.cost >= 50 ? 'Being interrupted, or losing time to your interest, sometimes causes problems.' : 'Your interest rarely causes problems.'}</p>}
          {i.pattern !== undefined && i.pattern >= 50 && <p>Your interests tend to change over time, very intense for a while and then fading.</p>}
        </section>
      )}

      {(burn?.shown || profile.burnout.signs.length > 0 || profile.burnout.history) && (
        <section className="stack" aria-labelledby="burn-h">
          <h2 id="burn-h" style={{ fontSize: '1.7rem' }}>Hard periods</h2>
          {burn?.shown && <LoadMeter label={burn.label} value={burn.value} basedOn={burn.basedOn} />}
          {profile.burnout.history && <p><strong>A stretch of exhaustion that rest didn’t fix:</strong> {profile.burnout.history.toLowerCase()}.</p>}
          {profile.burnout.signs.length > 0 && <div className="stack-sm"><h3>Early signs you notice</h3><ul className="chip-list">{profile.burnout.signs.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
          {profile.burnout.contributors.length > 0 && <div className="stack-sm"><h3>What contributed</h3><ul className="chip-list">{profile.burnout.contributors.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
          <SupportCard />
        </section>
      )}

      {(profile.eating.patterns.length > 0 || profile.eating.safety) && (
        <section className="stack" aria-labelledby="eat-h">
          <h2 id="eat-h" style={{ fontSize: '1.7rem' }}>Eating and food</h2>
          <p><strong>Patterns you described:</strong></p>
          <ul className="chip-list">{profile.eating.patterns.map((x) => <li key={x} className="chip">{x}</li>)}</ul>
          <SupportCard variant={profile.eating.safety ? 'eatingProminent' : 'eating'} />
        </section>
      )}

      {profile.hormones.length > 0 && (
        <section className="stack" aria-labelledby="hor-h">
          <h2 id="hor-h" style={{ fontSize: '1.7rem' }}>Hormones and life stage</h2>
          <p className="prose">
            You noticed hormone-linked changes in: {profile.hormones.map((h) => `${h.rows.map(rowName).join(', ')} (${h.situation})`).join('; ')}. It can help to track these over time.
          </p>
        </section>
      )}

      {profile.autonomy && (
        <section className="stack" aria-labelledby="aut-h">
          <h2 id="aut-h" style={{ fontSize: '1.7rem' }}>Autonomy needs</h2>
          {profile.autonomy.pressure !== undefined && <LoadMeter label="Demands feel like pressure" value={profile.autonomy.pressure} />}
          {profile.autonomy.wantsSay !== undefined && profile.autonomy.wantsSay >= 50 && <p>Having a say in how and when you do things helps you get them done.</p>}
          {profile.autonomy.factors.length > 0 && <div className="stack-sm"><h3>What makes demands harder</h3><ul className="chip-list">{profile.autonomy.factors.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
        </section>
      )}
    </>
  );
}

const ROW_NAMES: Record<string, string> = { sensory: 'sensory sensitivity', emotional: 'emotional control', focus: 'focus and organising', social: 'social energy', masking: 'ability to mask', sleep: 'sleep', energy: 'overall energy' };
const rowName = (id: string) => ROW_NAMES[id] ?? id;

export function EnergyPanel({ profile }: { profile: Profile }) {
  if (profile.energyLeft === undefined && profile.drains.length === 0 && profile.recharges.length === 0) return null;
  return (
    <section className="stack" aria-labelledby="en-h">
      <h2 id="en-h" style={{ fontSize: '1.7rem' }}>Energy</h2>
      {profile.drains.length > 0 && <div className="stack-sm"><h3>What drains you</h3><ul className="chip-list">{profile.drains.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
      {profile.recharges.length > 0 && <div className="stack-sm"><h3>What recharges you</h3><ul className="chip-list">{profile.recharges.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
      {profile.energyLeft !== undefined && (
        <p className="cluster">
          <BatteryGlyph cost={100 - profile.energyLeft} size={36} />
          <span><strong>Energy left at the end of a usual day:</strong> {profile.energyLeft >= 75 ? 'usually plenty' : profile.energyLeft >= 50 ? 'some' : profile.energyLeft >= 25 ? 'not much' : 'very little'}.</span>
        </p>
      )}
    </section>
  );
}

export interface IdeaGroup {
  title: string;
  items: string[];
  /** Reference into the ideas library, so a Spikeprint link can carry a few characters instead of the text. */
  ref: { k: 's' | 'l' | 'n' | 'a'; r: string };
}

const SENSE_KEYS = Object.keys(SENSE_IDEAS);
const senseKeyOf = (label: string) => label.toLowerCase().split(' ')[0];

export function ideasFor(profile: { spokes: { spokeId: keyof typeof SPOKE_IDEAS; num: number; label: string; ease?: number; relLabel?: string; flags: string[] }[]; topLenses: Lens[]; modalities: string[]; autonomy?: { pressure?: number } }, mode: 'work' | 'everyday', perGroup = 3): IdeaGroup[] {
  const pick = (i: Idea) => (mode === 'work' ? i.work : i.everyday);
  const groups: IdeaGroup[] = [];
  for (const s of profile.spokes) {
    if (s.ease === undefined) continue;
    if (s.relLabel === 'stretch' || s.flags.length > 0) {
      groups.push({ title: s.label, items: SPOKE_IDEAS[s.spokeId].slice(0, perGroup).map(pick), ref: { k: 's', r: String(s.num) } });
    }
  }
  for (const l of profile.topLenses) {
    groups.push({ title: `Ideas for ${LENS_WORDS[l]}`, items: [pick(LENS_IDEAS[l])], ref: { k: 'l', r: l } });
  }
  const senseKeys = profile.modalities.map(senseKeyOf).filter((k) => SENSE_KEYS.includes(k));
  if (senseKeys.length) groups.push({ title: 'For your senses', items: senseKeys.map((k) => SENSE_IDEAS[k]), ref: { k: 'n', r: senseKeys.join(',') } });
  if ((profile.autonomy?.pressure ?? 0) >= 50) groups.push({ title: 'Autonomy', items: [pick(AUTONOMY_IDEA)], ref: { k: 'a', r: '' } });
  return groups;
}

/** Rebuild an idea group from its reference (used when reading a shared Spikeprint). */
export function resolveIdeaRef(ref: IdeaGroup['ref'], mode: 'work' | 'everyday', perGroup = 2): { title: string; items: string[] } | undefined {
  const pick = (i: Idea) => (mode === 'work' ? i.work : i.everyday);
  if (ref.k === 's') {
    const spoke = SPOKES.find((x) => String(x.n) === ref.r);
    return spoke ? { title: spoke.label, items: SPOKE_IDEAS[spoke.id].slice(0, perGroup).map(pick) } : undefined;
  }
  if (ref.k === 'l' && ref.r in LENS_IDEAS) return { title: `Ideas for ${LENS_WORDS[ref.r as Lens]}`, items: [pick(LENS_IDEAS[ref.r as Lens])] };
  if (ref.k === 'n') return { title: 'For your senses', items: ref.r.split(',').filter((k) => k in SENSE_IDEAS).map((k) => SENSE_IDEAS[k]) };
  if (ref.k === 'a') return { title: 'Autonomy', items: [pick(AUTONOMY_IDEA)] };
  return undefined;
}

export function IdeasPanel({ profile, mode = 'everyday' }: { profile: Profile; mode?: 'work' | 'everyday' }) {
  const groups = ideasFor(profile, mode);
  if (groups.length === 0) return null;
  return (
    <section className="stack" aria-labelledby="ideas-h">
      <h2 id="ideas-h" style={{ fontSize: '1.7rem' }}>Ideas that might help</h2>
      <p className="muted">{IDEAS_DISCLAIMER}</p>
      <div className="area-grid">
        {groups.map((g) => (
          <div key={g.title} className="panel stack-sm">
            <h3>{g.title}</h3>
            <ul className="stack-sm" style={{ paddingLeft: '1.1rem', margin: 0 }}>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="small muted"><Link to="/about-this-tool">How these ideas are chosen</Link></p>
    </section>
  );
}

export { SPOKE_BY_ID };
