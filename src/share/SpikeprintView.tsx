import { Wheel } from '../charts/svg/Wheel';
import { LoadMeter } from '../results/Panels';
import { BatteryGlyph } from '../results/glyphs';
import { HARD_PERIOD_NOTE, SPIKEPRINT_CAPTION, SPIKEPRINT_FOOTER } from '../content/copy';
import { SPOKE_BY_ID, SPOKE_GROUPS } from '../content/spokes';
import { easeText, relWords, costText } from '../results/describe';
import { SHARE_NAME } from '../config';
import { PRESET_BY_ID } from './sections';
import { has, ideaGroups, strengthText, wheelProfile, type SpikeprintData } from './spikeprint';

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** Summary sentences are stored with *bold* markers around area names. */
export function MarkedText({ text }: { text: string }) {
  return <>{text.split('*').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}</>;
}

interface Props {
  data: SpikeprintData;
  /** Theme for the output. Spikeprints always use the light version of the colour choice. */
  theme: string;
  /** Print view: tables are always expanded. */
  expandTables?: boolean;
  /** Title heading level (the page's own heading is 1). */
  titleLevel?: 1 | 2;
  className?: string;
}

export function SpikeprintView({ data, theme, expandTables, titleLevel = 2, className = '' }: Props) {
  const preset = PRESET_BY_ID[data.p];
  const Title = (`h${titleLevel}` as 'h1' | 'h2');
  const wp = wheelProfile(data);
  const stretch = wp.spokes.filter((s) => s.ease !== undefined && (s.relLabel === 'stretch' || s.flags.length > 0));
  const ideas = ideaGroups(data);

  const table = (
    <table className="data-table">
      <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 'var(--space-2)' }}>Ease is out of 100.{data.mid !== undefined ? ` My own middle is ${data.mid}.` : ''}</caption>
      <thead><tr><th scope="col">Area</th><th scope="col">Typical ease</th><th scope="col">Hard-day ease</th><th scope="col">Energy cost</th><th scope="col">Compared with my middle</th></tr></thead>
      <tbody>
        {wp.spokes.map((s) => (
          <tr key={s.spokeId}>
            <th scope="row">{s.num}. {s.label}</th>
            <td>{s.ease === undefined ? 'Not enough answers yet' : `${s.ease} · ${easeText(s.ease)}`}</td>
            <td>{s.ease === undefined ? '' : s.hard === undefined ? 'Not asked' : s.hard}</td>
            <td>{s.cost === undefined ? '' : costText(s.cost)}</td>
            <td>{relWords(s.relLabel).replace('your middle', 'my middle')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const h = (text: string, id: string) => <h2 id={id} style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>{text}</h2>;

  return (
    <article data-theme={theme} className={`spikeprint ${className}`} aria-label={`${SHARE_NAME}: ${preset.title}`}>
      <header className="stack-sm">
        <p className="sp-wordmark">{SHARE_NAME}</p>
        <Title style={{ fontSize: titleLevel === 1 ? '2.4rem' : '1.9rem' }}>{preset.title}</Title>
        <p className="muted">{data.n ? `${data.n} · ` : ''}{formatDate(data.d)}</p>
        {data.ex && <p><span className="badge">Example data, not a real person’s profile</span></p>}
      </header>

      {data.hp && <div className="callout" role="note"><p style={{ fontWeight: 500 }}>{HARD_PERIOD_NOTE}</p></div>}

      {has(data, 'summary') && data.sm && (
        <section className="stack-sm" aria-label="Profile at a glance">
          <p className="lead">{data.sm.map((s, i) => <span key={i}><MarkedText text={s} />{' '}</span>)}</p>
        </section>
      )}

      {has(data, 'wheel') && (
        <section className="stack" aria-labelledby="sp-wheel">
          {h('Profile wheel', 'sp-wheel')}
          <div className="chart-area">
            <div className="wheel-box">
              <Wheel profile={wp} desc="Further out means easier. Each wedge is one area." title={`Profile wheel: ${preset.title}`} />
            </div>
            <div className="key stack">
              {SPOKE_GROUPS.map((g) => (
                <div key={g.id}>
                  <p style={{ fontWeight: 600 }}>{g.label}</p>
                  <ol>
                    {wp.spokes.filter((s) => SPOKE_BY_ID[s.spokeId].group === g.id).map((s) => (
                      <li key={s.spokeId}>
                        <span className={`num-badge hue-${g.hue}`} aria-hidden="true">{s.num}</span>
                        {s.label} <span className="muted">{s.ease === undefined ? 'Not enough answers yet' : relWords(s.relLabel).replace('your middle', 'my middle')}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
          <p className="muted small prose">{SPIKEPRINT_CAPTION}</p>
          {expandTables ? table : <details className="disclosure"><summary>Show as a table</summary><div style={{ overflowX: 'auto' }}>{table}</div></details>}
        </section>
      )}

      {has(data, 'stretch') && stretch.length > 0 && (
        <section className="stack-sm" aria-labelledby="sp-stretch">
          {h('Stretch and variable areas', 'sp-stretch')}
          <ul className="stack-sm" style={{ paddingLeft: '1.1rem', margin: 0 }}>
            {stretch.map((s) => (
              <li key={s.spokeId}>
                <strong>{s.label}</strong>: {[
                  s.relLabel === 'stretch' ? 'harder than my own middle' : undefined,
                  s.flags.includes('varies') ? 'varies on hard days' : undefined,
                  s.flags.includes('costly') ? 'manageable but costly' : undefined,
                  s.cost !== undefined ? `energy cost: ${costText(s.cost).toLowerCase()}` : undefined,
                ].filter(Boolean).join('; ')}.
              </li>
            ))}
          </ul>
        </section>
      )}

      {has(data, 'strengths') && data.st && (
        <section className="stack-sm" aria-labelledby="sp-str">
          {h('Strengths', 'sp-str')}
          <ul className="area-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.st.map((s) => (
              <li key={s.n} className="area-card">
                <div className="cap hue-butter">{s.n}</div>
                <div className="body">
                  <p className="small">{strengthText(s.n) ? `“${strengthText(s.n)}”` : ''}</p>
                  {s.c && <span className="badge">{s.c === 'o' ? 'Costs me often' : 'Costs me sometimes'}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {has(data, 'load') && data.ld && (
        <section className="stack-sm" aria-labelledby="sp-load">
          {h('What I carry', 'sp-load')}
          {data.ld.map((l) => <LoadMeter key={l.l} label={l.l} value={l.v} />)}
        </section>
      )}
      {has(data, 'drivers') && data.dr && <section className="stack-sm" aria-label="What gets in the way"><p className="prose">{data.dr}</p></section>}

      {has(data, 'energy') && data.en && (
        <section className="stack-sm" aria-labelledby="sp-en">
          {h('Energy', 'sp-en')}
          {!!data.en.d?.length && <div className="stack-sm"><h3>What drains me</h3><ul className="chip-list">{data.en.d.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
          {!!data.en.r?.length && <div className="stack-sm"><h3>What recharges me</h3><ul className="chip-list">{data.en.r.map((x) => <li key={x} className="chip">{x}</li>)}</ul></div>}
          {data.en.e !== undefined && <p className="cluster"><BatteryGlyph cost={100 - data.en.e} size={30} /> Energy left at the end of a usual day: {data.en.e >= 75 ? 'usually plenty' : data.en.e >= 50 ? 'some' : data.en.e >= 25 ? 'not much' : 'very little'}.</p>}
        </section>
      )}

      {has(data, 'adhd') && data.ad && (
        <section className="stack-sm" aria-labelledby="sp-adhd">
          {h('Patterns often linked with ADHD', 'sp-adhd')}
          <p className="muted small prose">Shown beside the profile, not mixed into it. Many people without ADHD recognise some of these.</p>
          {data.ad.m.map((l) => <LoadMeter key={l.l} label={l.l} value={l.v} hue="plum" />)}
          {!!data.ad.t?.length && <ul className="chip-list">{data.ad.t.map((x) => <li key={x} className="chip">{x}</li>)}</ul>}
        </section>
      )}

      {has(data, 'masking') && data.mk && (
        <section className="stack-sm" aria-labelledby="sp-mask">
          {h('Adjusting how I come across', 'sp-mask')}
          {data.mk.m !== undefined && <LoadMeter label="Adjusting how I come across" value={data.mk.m} />}
          {data.mk.c !== undefined && <LoadMeter label="Cost of adjusting" value={data.mk.c} />}
          {!!data.mk.w?.length && <p><strong>Where:</strong> {data.mk.w.join(', ')}.</p>}
          {!!data.mk.y?.length && <p><strong>Why:</strong> {data.mk.y.join(', ')}.</p>}
        </section>
      )}

      {has(data, 'burnout') && data.bo && (
        <section className="stack-sm" aria-labelledby="sp-bo">
          {h('Hard periods', 'sp-bo')}
          {data.bo.v !== undefined && <LoadMeter label="Hard-period signs" value={data.bo.v} />}
          {data.bo.h && <p>A stretch of exhaustion that rest didn’t fix: {data.bo.h.toLowerCase()}.</p>}
          {!!data.bo.s?.length && <p><strong>Early signs:</strong> {data.bo.s.join(', ')}.</p>}
          {!!data.bo.k?.length && <p><strong>What contributed:</strong> {data.bo.k.join(', ')}.</p>}
        </section>
      )}

      {has(data, 'interests') && data.it && (
        <section className="stack-sm" aria-labelledby="sp-int">
          {h('Interests', 'sp-int')}
          {data.it.t && <p className="prose">“{data.it.t}”</p>}
          {!!data.it.k?.length && <ul className="chip-list">{data.it.k.map((x) => <li key={x} className="chip">{x}</li>)}</ul>}
          {data.it.r && <p>{data.it.r}</p>}
          {data.it.c && <p>{data.it.c}</p>}
        </section>
      )}

      {has(data, 'adjustments') && ideas.length > 0 && (
        <section className="stack-sm" aria-labelledby="sp-id">
          {h('Ideas that might help', 'sp-id')}
          <p className="muted small">Ideas to try or ask about, not instructions.</p>
          <div className="area-grid">
            {ideas.map((g) => (
              <div key={g.title} className="panel stack-sm">
                <h3>{g.title}</h3>
                <ul className="stack-sm" style={{ paddingLeft: '1.1rem', margin: 0 }}>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {has(data, 'eating') && data.ea && <section className="stack-sm" aria-labelledby="sp-ea">{h('Eating and food', 'sp-ea')}<p><strong>Patterns I described:</strong></p><ul className="chip-list">{data.ea.map((x) => <li key={x} className="chip">{x}</li>)}</ul></section>}
      {has(data, 'hormones') && data.ho && <section className="stack-sm" aria-labelledby="sp-ho">{h('Hormones and life stage', 'sp-ho')}<p className="prose">{data.ho}</p></section>}
      {has(data, 'autonomy') && data.au && (
        <section className="stack-sm" aria-labelledby="sp-au">
          {h('Autonomy needs', 'sp-au')}
          {data.au.v !== undefined && <LoadMeter label="Demands feel like pressure" value={data.au.v} />}
          {data.au.s && <p>Having a say in how and when I do things helps me get them done.</p>}
          {!!data.au.f?.length && <ul className="chip-list">{data.au.f.map((x) => <li key={x} className="chip">{x}</li>)}</ul>}
        </section>
      )}
      {has(data, 'medication') && data.me && <section className="stack-sm" aria-labelledby="sp-me">{h('Medication', 'sp-me')}<p className="prose">{data.me}</p></section>}
      {has(data, 'diagnoses') && data.dx && <section className="stack-sm" aria-labelledby="sp-dx">{h('Diagnoses', 'sp-dx')}<ul className="chip-list">{data.dx.map((x) => <li key={x} className="chip">{x}</li>)}</ul></section>}
      {has(data, 'whatHelps') && data.nh && <section className="stack-sm" aria-labelledby="sp-nh">{h('What helps me', 'sp-nh')}<p className="prose" style={{ whiteSpace: 'pre-wrap' }}>{data.nh}</p></section>}
      {has(data, 'wantPeopleToKnow') && data.nk && <section className="stack-sm" aria-labelledby="sp-nk">{h('What I’d like people to know', 'sp-nk')}<p className="prose" style={{ whiteSpace: 'pre-wrap' }}>{data.nk}</p></section>}

      <footer className="small muted prose">{SPIKEPRINT_FOOTER}</footer>
    </article>
  );
}
