import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProfileLine } from '../charts/svg/ProfileLine';
import { DEFAULT_LAYERS, Wheel, type WheelLayers } from '../charts/svg/Wheel';
import { useUI } from '../app/ui';
import { usePageTitle } from '../app/usePageTitle';
import { BUTTONS, CHART_CAPTION, HARD_DAY_LEGEND_NOTE, HARD_PERIOD_NOTE, IPSATIVE_EXPLAINER, NOT_DIAGNOSTIC, GETTING_STARTED_INSIGHT } from '../content/copy';
import { SPOKE_BY_ID } from '../content/spokes';
import { buildSummary, summaryText } from './summary';
import { CardsView, RowsView } from './Views';
import { AdhdPanel, EnergyPanel, ExtrasPanels, IdeasPanel, LoadPanel, StrengthsPanel } from './Panels';
import { easeText, relWords } from './describe';
import { useProfile } from './useProfile';

type View = 'wheel' | 'rows' | 'cards';

const LAYER_LABELS: [keyof WheelLayers, string][] = [
  ['typical', 'Typical day'], ['hard', 'Hard days'], ['cost', 'Energy cost'], ['middle', 'Your middle'], ['band', 'Near-your-middle band'],
];

export function Results() {
  usePageTitle('Your profile');
  const navigate = useNavigate();
  const profile = useProfile();
  const openSupport = useUI((s) => s.openSupport);
  const [view, setView] = useState<View>('wheel');
  const [layers, setLayers] = useState<WheelLayers>(DEFAULT_LAYERS);
  const summary = buildSummary(profile);

  if (!profile.hasEnough) {
    return (
      <div className="page page-narrow" style={{ marginInline: 0 }}>
        <h1>Your profile</h1>
        <p className="lead">Answer a few more sections to see your profile.</p>
        <p className="prose">We need enough answers in at least 3 areas to show where things are easier or harder for you. You have {profile.shownCount} so far.</p>
        <div><Link to="/hub" className="btn btn-primary">Back to sections</Link></div>
      </div>
    );
  }

  return (
    <div className="page">
      {profile.hardPeriod && (
        <div className="callout" role="note">
          <p style={{ fontWeight: 500 }}>{HARD_PERIOD_NOTE} <button type="button" className="btn-link" onClick={openSupport}>Support options</button></p>
        </div>
      )}

      <section aria-labelledby="top-h" className="stack-lg">
        <div className="page-head">
          <h1 id="top-h" style={{ fontSize: '3rem' }}>Your profile</h1>
          <div style={{ flex: '0 1 360px' }}>
            <ProfileLine values={profile.spokes.filter((s) => s.ease !== undefined).map((s) => s.ease!)} hues={profile.spokes.filter((s) => s.ease !== undefined).map((s) => SPOKE_BY_ID[s.spokeId].hue)} />
          </div>
        </div>
        <h2 className="sr-only">Your profile at a glance</h2>
        <p className="lead" style={{ fontSize: '1.2rem' }}>
          {summary.map((sentence, i) => (
            <span key={i}>{sentence.map((seg, j) => seg.bold ? <strong key={j}>{seg.text}</strong> : <span key={j}>{seg.text}</span>)}{' '}</span>
          ))}
        </p>
        {profile.insights.includes('gettingStarted') && <p className="callout prose">{GETTING_STARTED_INSIGHT}</p>}
      </section>

      <section className="stack" aria-labelledby="chart-h">
        <h2 id="chart-h" className="sr-only">Your profile chart</h2>
        <div className="chart-controls">
          <div className="tab-row" role="group" aria-label="Show my profile as">
            <span style={{ fontWeight: 500, marginRight: 'var(--space-1)' }}>Show as</span>
            {(['wheel', 'rows', 'cards'] as View[]).map((v) => (
              <button key={v} type="button" className="btn" aria-pressed={view === v} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
            ))}
          </div>
          {view === 'wheel' && (
            <fieldset className="plain cluster" style={{ gap: 'var(--space-2) var(--space-4)' }}>
              <legend className="sr-only">Layers</legend>
              {LAYER_LABELS.map(([key, label]) => (
                <label key={key} className="check-label">
                  <input type="checkbox" checked={layers[key]} onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </fieldset>
          )}
        </div>

        {view === 'wheel' && (
          <div className="chart-area">
            <div className="wheel-box">
              <Wheel profile={profile} layers={layers} desc={summaryText(profile)} onOpen={(id) => navigate(`/results/area/${id}`)} />
            </div>
            <div className="key stack">
              {['Focus and doing', 'Communicating and connecting', 'Body, senses and feelings', 'Practical skills'].map((gt) => {
                const list = profile.spokes.filter((s) => {
                  const grp = SPOKE_BY_ID[s.spokeId].group;
                  return ({ focusDoing: 'Focus and doing', communicating: 'Communicating and connecting', body: 'Body, senses and feelings', practical: 'Practical skills' } as const)[grp] === gt;
                });
                return (
                  <div key={gt}>
                    <p style={{ fontWeight: 600 }}>{gt}</p>
                    <ol>
                      {list.map((s) => (
                        <li key={s.spokeId}>
                          <span className={`num-badge hue-${SPOKE_BY_ID[s.spokeId].hue}`} aria-hidden="true">{s.num}</span>
                          <Link to={`/results/area/${s.spokeId}`}>{s.label}</Link>
                          <span className="muted"> {s.ease === undefined ? 'Not enough answers yet' : relWords(s.relLabel)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {view === 'rows' && <RowsView profile={profile} />}
        {view === 'cards' && <CardsView profile={profile} />}

        {view === 'wheel' && (
          <>
            <p className="muted prose">{CHART_CAPTION}</p>
            <p className="small muted prose">{HARD_DAY_LEGEND_NOTE}</p>
          </>
        )}

        <details className="disclosure">
          <summary>Show as a table</summary>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 'var(--space-2)' }}>
                Ease is out of 100. Your middle is {Math.round(profile.middle ?? 0)}.
              </caption>
              <thead>
                <tr><th scope="col">Area</th><th scope="col">Typical ease</th><th scope="col">Hard-day ease</th><th scope="col">Energy cost</th><th scope="col">Compared with your middle</th><th scope="col">Notes</th></tr>
              </thead>
              <tbody>
                {profile.spokes.map((s) => (
                  <tr key={s.spokeId}>
                    <th scope="row">{s.num}. {s.label}</th>
                    <td>{s.ease === undefined ? 'Not enough answers yet' : `${Math.round(s.ease)} · ${easeText(s.ease)}`}</td>
                    <td>{s.ease === undefined ? '' : s.hard !== undefined ? Math.round(s.hard) : 'Not asked'}</td>
                    <td>{s.cost === undefined ? '' : `${Math.round(s.cost)}`}</td>
                    <td>{relWords(s.relLabel)}</td>
                    <td>{[s.flags.includes('costly') ? 'Manageable but costly' : '', s.flags.includes('varies') ? 'Varies on hard days' : '', s.basedOn ? `Based on ${s.basedOn} ${s.basedOn === 1 ? 'question' : 'questions'}` : ''].filter(Boolean).join('. ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <LoadPanel profile={profile} />
      <StrengthsPanel profile={profile} />
      <AdhdPanel profile={profile} />
      <ExtrasPanels profile={profile} />
      <EnergyPanel profile={profile} />
      <IdeasPanel profile={profile} />

      <section className="stack" aria-labelledby="read-h">
        <h2 id="read-h" style={{ fontSize: '1.3rem' }}>How to read this</h2>
        <p className="prose">{IPSATIVE_EXPLAINER}</p>
        <div className="callout"><p className="prose">{NOT_DIAGNOSTIC}</p></div>
        <div className="btn-row">
          <Link to="/share" className="btn btn-primary">{BUTTONS.create} <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></Link>
          <Link to="/next-steps" className="btn">{BUTTONS.nextSteps}</Link>
        </div>
      </section>
    </div>
  );
}
