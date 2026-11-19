import { z } from 'zod';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { LENS_WORDS } from '../content/drivers';
import { ITEMS, ITEM_BY_ID } from '../content/items';
import { SPOKES, SPOKE_BY_ID } from '../content/spokes';
import { ideasFor, resolveIdeaRef } from '../results/Panels';
import { buildSummary, type Seg } from '../results/summary';
import type { Profile, RelativeLabel } from '../scoring/profile';
import type { AboutYou } from '../storage/schema';
import { PRESET_BY_ID, type PresetId, type SectionKey } from './sections';

/**
 * A Spikeprint is computed results for the chosen sections only. It never holds raw answers.
 * Keys are short so private links stay small. Rendered the same way in the viewer, print, PDF and image.
 *   p preset · n name · d date · ex example data · hp hard period · sec included sections
 *   sp spokes {i number, e ease, h hard-day ease, c cost, x drop, r relative, l label, f flags} · mid your middle
 */
const rel = z.enum(['s', 'm', 'x']);
const meter = z.object({ l: z.string().max(120), v: z.number().min(0).max(100) });
const lines = z.array(z.string().max(500)).max(30);
const text = z.string().max(4000);

export const spikeprintSchema = z.object({
  v: z.literal(1),
  p: z.enum(['work', 'health', 'friends', 'me']),
  n: z.string().max(80).optional(),
  d: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ex: z.literal(true).optional(),
  hp: z.literal(true).optional(),
  sec: z.array(z.string().max(30)).max(30),
  sp: z.array(z.object({
    i: z.number().int().min(1).max(11),
    e: z.number().min(0).max(100),
    h: z.number().min(0).max(100).optional(),
    c: z.number().min(0).max(100).optional(),
    x: z.number().min(-100).max(100).optional(),
    r: z.number().min(-100).max(100).optional(),
    l: rel.optional(),
    f: z.array(z.enum(['c', 'v'])).max(2).optional(),
    b: z.number().int().min(1).max(2).optional(),
  })).max(11).optional(),
  mid: z.number().min(0).max(100).optional(),
  sm: lines.optional(),
  st: z.array(z.object({ n: z.string().max(80), c: z.enum(['s', 'o']).optional() })).max(30).optional(),
  ld: z.array(meter).max(30).optional(),
  dr: z.string().max(500).optional(),
  ad: z.object({ m: z.array(meter).max(12), t: lines.optional() }).optional(),
  mk: z.object({ m: z.number().min(0).max(100).optional(), c: z.number().min(0).max(100).optional(), w: lines.optional(), y: lines.optional() }).optional(),
  bo: z.object({ v: z.number().min(0).max(100).optional(), s: lines.optional(), k: lines.optional(), h: z.string().max(80).optional() }).optional(),
  it: z.object({ t: z.string().max(500).optional(), k: lines.optional(), r: z.string().max(200).optional(), c: z.string().max(200).optional() }).optional(),
  ea: lines.optional(),
  ho: z.string().max(800).optional(),
  au: z.object({ v: z.number().min(0).max(100).optional(), f: lines.optional(), s: z.boolean().optional() }).optional(),
  me: z.string().max(400).optional(),
  en: z.object({ d: lines.optional(), r: lines.optional(), e: z.number().min(0).max(100).optional() }).optional(),
  id: z.array(z.object({ k: z.enum(['s', 'l', 'n', 'a']), r: z.string().max(60) })).max(20).optional(),
  dx: lines.optional(),
  nh: text.optional(),
  nk: text.optional(),
});

export type SpikeprintData = z.infer<typeof spikeprintSchema>;

const REL_CODE: Record<RelativeLabel, 's' | 'm' | 'x'> = { strength: 's', middle: 'm', stretch: 'x' };
const REL_FROM: Record<'s' | 'm' | 'x', RelativeLabel> = { s: 'strength', m: 'middle', x: 'stretch' };
const r = (n: number) => Math.round(n);

export const isoDate = (d = new Date()) => d.toISOString().slice(0, 10);

export interface BuildInput {
  profile: Profile;
  about: AboutYou;
  reflection: { whatHelps?: string; wantPeopleToKnow?: string };
  preset: PresetId;
  sections: Partial<Record<SectionKey, boolean>>;
  name?: string;
  example?: boolean;
  date?: string;
}

const segsToMarked = (segs: Seg[]) => segs.map((s) => (s.bold ? `*${s.text}*` : s.text)).join('');
const DX_LABELS: Record<string, string> = { autism: 'Autism', adhd: 'ADHD', dyslexia: 'Dyslexia', dyspraxia: 'Dyspraxia or DCD', dyscalculia: 'Dyscalculia' };
const DX_STATUS: Record<string, string> = { diagnosed: 'diagnosed', self: 'self-identified', exploring: 'exploring' };

/** Build the Spikeprint for the selected sections only. Sections with no data are left out. */
export function buildSpikeprint({ profile, about, reflection, preset, sections, name, example, date }: BuildInput): SpikeprintData {
  const on = (k: SectionKey) => !!sections[k];
  const mode = PRESET_BY_ID[preset].mode;
  const out: SpikeprintData = { v: 1, p: preset, d: date ?? isoDate(), sec: [] };
  const include = (k: SectionKey) => { out.sec.push(k); };
  if (name?.trim()) out.n = name.trim();
  if (example) out.ex = true;
  if (profile.hardPeriod) out.hp = true;

  if (on('wheel') || on('stretch') || on('summary') || on('adjustments')) {
    out.sp = profile.spokes.filter((s) => s.ease !== undefined).map((s) => ({
      i: s.num, e: r(s.ease!),
      h: s.hard !== undefined ? r(s.hard) : undefined,
      c: s.cost !== undefined ? r(s.cost) : undefined,
      x: s.fluctuation !== undefined ? r(s.fluctuation) : undefined,
      r: s.rel !== undefined ? r(s.rel) : undefined,
      l: s.relLabel ? REL_CODE[s.relLabel] : undefined,
      f: s.flags.length ? s.flags.map((f) => (f === 'costly' ? 'c' : 'v') as 'c' | 'v') : undefined,
      b: s.basedOn,
    }));
    if (profile.middle !== undefined) out.mid = r(profile.middle);
  }
  if (on('wheel')) include('wheel');
  if (on('stretch')) include('stretch');
  if (on('summary')) { include('summary'); out.sm = buildSummary(profile, 'me').map(segsToMarked); }

  if (on('strengths')) {
    const st: NonNullable<SpikeprintData['st']> = profile.strengths.map((s) => ({
      n: s.name,
      c: s.cost === 'often' ? ('o' as const) : s.cost === 'sometimes' ? ('s' as const) : undefined,
    }));
    if (profile.socialMotivation.value !== undefined && profile.socialMotivation.value >= 75) st.push({ n: 'Connection matters to you' });
    if (st.length) { include('strengths'); out.st = st; }
  }
  if (on('load')) {
    const ld = profile.load.filter((l) => l.shown && !l.module).map((l) => ({ l: l.label, v: r(l.value!) }));
    if (ld.length) { include('load'); out.ld = ld; }
  }
  if (on('drivers') && profile.topLenses.length) {
    include('drivers');
    out.dr = `Most of the reasons I chose relate to ${profile.topLenses.map((l) => LENS_WORDS[l]).join(', and to ')}.`;
  }
  if (on('energy') && (profile.drains.length || profile.recharges.length || profile.energyLeft !== undefined)) {
    include('energy');
    out.en = { d: profile.drains, r: profile.recharges, e: profile.energyLeft };
  }
  if (on('adhd')) {
    const m = profile.adhd.filter((d) => d.shown).map((d) => ({ l: d.label, v: r(d.value!) }));
    if (m.length || profile.tensions.length) { include('adhd'); out.ad = { m, t: profile.tensions }; }
  }
  if (on('masking')) {
    const mk = profile.load.find((l) => l.id === 'masking');
    const mc = profile.load.find((l) => l.id === 'maskingCost');
    if (mk?.shown || mc?.shown) {
      include('masking');
      out.mk = { m: mk?.shown ? r(mk.value!) : undefined, c: mc?.shown ? r(mc.value!) : undefined, w: profile.masking.where, y: profile.masking.why };
    }
  }
  if (on('burnout')) {
    const b = profile.load.find((l) => l.id === 'burnout');
    if (b?.shown || profile.burnout.signs.length || profile.burnout.history) {
      include('burnout');
      out.bo = { v: b?.shown ? r(b.value!) : undefined, s: profile.burnout.signs, k: profile.burnout.contributors, h: profile.burnout.history };
    }
  }
  if (on('interests') && (profile.interests.text || profile.interests.topics.length)) {
    include('interests');
    const i = profile.interests;
    out.it = {
      t: i.text, k: i.topics,
      r: i.recharges === undefined ? undefined : i.recharges >= 50 ? 'Interests calm or recharge me.' : undefined,
      c: i.cost === undefined ? undefined : i.cost >= 50 ? 'Interruptions, or losing time to my interest, sometimes cause problems.' : undefined,
    };
  }
  if (on('adjustments')) {
    const groups = ideasFor(profile, mode).map((g) => g.ref);
    if (groups.length) { include('adjustments'); out.id = groups; }
  }
  if (on('eating') && profile.eating.patterns.length) { include('eating'); out.ea = profile.eating.patterns; }
  if (on('hormones') && profile.hormones.length) {
    include('hormones');
    const names: Record<string, string> = { sensory: 'sensory sensitivity', emotional: 'emotional control', focus: 'focus and organising', social: 'social energy', masking: 'ability to mask', sleep: 'sleep', energy: 'overall energy' };
    out.ho = `I noticed hormone-linked changes in: ${profile.hormones.map((h) => `${h.rows.map((x) => names[x] ?? x).join(', ')} (${h.situation})`).join('; ')}.`;
  }
  if (on('autonomy') && profile.autonomy) {
    include('autonomy');
    out.au = { v: profile.autonomy.pressure === undefined ? undefined : r(profile.autonomy.pressure), f: profile.autonomy.factors, s: (profile.autonomy.wantsSay ?? 0) >= 50 || undefined };
  }
  if (on('medication') && profile.medication) {
    include('medication');
    out.me = `${profile.medication.takes ? 'I take ADHD medication' : 'I don’t take ADHD medication'}${profile.medication.change ? `; it has changed my sensory experience, anxiety or social energy: ${profile.medication.change.toLowerCase()}` : ''}.`;
  }
  if (on('diagnoses')) {
    const dx = Object.entries(about.diagnoses ?? {}).map(([k, v]) => `${DX_LABELS[k] ?? k} (${DX_STATUS[v]})`);
    if (about.diagnosisOther?.trim()) dx.push(about.diagnosisOther.trim());
    if (dx.length) { include('diagnoses'); out.dx = dx; }
  }
  if (on('whatHelps') && reflection.whatHelps?.trim()) { include('whatHelps'); out.nh = reflection.whatHelps.trim(); }
  if (on('wantPeopleToKnow') && reflection.wantPeopleToKnow?.trim()) { include('wantPeopleToKnow'); out.nk = reflection.wantPeopleToKnow.trim(); }
  return JSON.parse(JSON.stringify(out)) as SpikeprintData; // drop undefined keys
}

export const has = (d: SpikeprintData, k: SectionKey) => d.sec.includes(k);

// ----- Private link ---------------------------------------------------------------------------

export function encodeLink(d: SpikeprintData, base = `${location.origin}${location.pathname}`): string {
  return `${base}#/view?d=${compressToEncodedURIComponent(JSON.stringify(d))}`;
}

export type DecodeResult = { ok: true; data: SpikeprintData } | { ok: false };

export function decodeLinkPayload(payload: string | null): DecodeResult {
  if (!payload) return { ok: false };
  try {
    const json = decompressFromEncodedURIComponent(payload);
    if (!json) return { ok: false };
    const parsed = spikeprintSchema.safeParse(JSON.parse(json));
    return parsed.success ? { ok: true, data: parsed.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

// ----- Reading a Spikeprint back into chart shapes -----------------------------------------------

export interface WheelSpokeView {
  spokeId: (typeof SPOKES)[number]['id'];
  num: number;
  label: string;
  ease?: number;
  hard?: number;
  fluctuation?: number;
  cost?: number;
  rel?: number;
  relLabel?: RelativeLabel;
  flags: ('costly' | 'varies')[];
  basedOn?: number;
}
export interface WheelProfile { spokes: WheelSpokeView[]; middle?: number }

export function wheelProfile(d: SpikeprintData): WheelProfile {
  return {
    middle: d.mid,
    spokes: SPOKES.map((def) => {
      const s = d.sp?.find((x) => x.i === def.n);
      return {
        spokeId: def.id, num: def.n, label: def.label,
        ease: s?.e, hard: s?.h, cost: s?.c, fluctuation: s?.x, rel: s?.r,
        relLabel: s?.l ? REL_FROM[s.l] : undefined,
        flags: (s?.f ?? []).map((f) => (f === 'c' ? 'costly' : 'varies')),
        basedOn: s?.b,
      };
    }),
  };
}

/** Free-text sections the person typed, listed so the UI can warn that they travel in the link. */
export const itemIdsInPayload = (d: SpikeprintData) => Object.keys(ITEM_BY_ID).filter((id) => JSON.stringify(d).includes(`"${id}"`));
export { SPOKE_BY_ID };

/** Strength name → the first-person sentence shown under it. Looked up from content, so it needn’t travel in a link. */
export function strengthText(name: string): string | undefined {
  if (name === 'Connection matters to you') return 'I want close relationships and enjoy time with people I know well.';
  if (name === 'Deep absorption') return 'I often get so absorbed I stop noticing time, hunger or people.';
  if (name === 'Your interests recharge you') return 'Time on my interests calms me down or recharges me.';
  return ITEMS.find((i) => i.scoresInto?.strength === name)?.text;
}

export function ideaGroups(d: SpikeprintData) {
  const mode = PRESET_BY_ID[d.p].mode;
  return (d.id ?? []).map((ref) => resolveIdeaRef(ref, mode)).filter((g): g is { title: string; items: string[] } => !!g);
}
