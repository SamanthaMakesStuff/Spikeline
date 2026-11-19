import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { SPOKE_GROUPS, SPOKE_BY_ID } from '../content/spokes';
import { LABELS, HARD_DAY_LEGEND_NOTE } from '../content/copy';
import { SPOKE_IDEAS } from '../content/adjustments';
import type { Profile, SpokeResult } from '../scoring/profile';
import { basedOnText, costText, describeSpoke, easeText, round } from './describe';
import { BatteryGlyph, FlagBadges, RelativeBadge } from './glyphs';

function NumBadge({ s }: { s: SpokeResult }) {
  const hue = SPOKE_BY_ID[s.spokeId].hue;
  return <span className={`num-badge hue-${hue}`} aria-hidden="true">{s.num}</span>;
}

/** Dot-and-range track. Relative mode: −50…+50 around your middle. Absolute mode: 0–100. */
function Track({ s, middle, absolute }: { s: SpokeResult; middle: number; absolute: boolean }) {
  const W = 300;
  const x = (ease: number) => (absolute ? 10 + (ease / 100) * (W - 20) : W / 2 + ((ease - middle) / 50) * (W / 2 - 10));
  const e = s.ease!;
  const h = s.hard !== undefined && s.fluctuation !== undefined ? s.hard : undefined;
  const cx = absolute ? x(middle) : W / 2;
  return (
    <svg viewBox={`0 0 ${W} 28`} width="100%" height="28" aria-hidden="true" style={{ display: 'block', maxWidth: 360 }}>
      <line x1="8" y1="14" x2={W - 8} y2="14" style={{ stroke: 'var(--hatch)', strokeWidth: 4, strokeLinecap: 'round' }} />
      <line x1={cx} y1="3" x2={cx} y2="25" style={{ stroke: 'var(--ink-muted)', strokeWidth: 1.5, strokeDasharray: '2 3' }} />
      {h !== undefined && <line x1={x(h)} y1="14" x2={x(e)} y2="14" style={{ stroke: 'var(--ink)', strokeWidth: 2 }} />}
      {h !== undefined && <circle cx={x(h)} cy="14" r="5" style={{ fill: 'var(--bg)', stroke: 'var(--ink)', strokeWidth: 2 }} />}
      <circle cx={x(e)} cy="14" r="6" style={{ fill: 'var(--ink)' }} />
    </svg>
  );
}

export function RowsView({ profile }: { profile: Profile }) {
  const [sortStrongest, setSort] = useState(false);
  const [absolute, setAbsolute] = useState(false);
  const middle = profile.middle ?? 50;
  const motivation = profile.socialMotivation;
  return (
    <div className="stack-lg">
      <div className="cluster">
        <label className="check-label"><input type="checkbox" checked={sortStrongest} onChange={(e) => setSort(e.target.checked)} />Sort by strongest</label>
        <label className="check-label"><input type="checkbox" checked={absolute} onChange={(e) => setAbsolute(e.target.checked)} />Show as 0–100 instead</label>
      </div>
      <p className="small muted prose">
        {absolute ? 'Further right means easier. The dashed line is your middle.' : 'The dashed line is your middle. Further right means easier for you than your middle.'} The solid dot is a typical day and the ring is a hard day. {HARD_DAY_LEGEND_NOTE}
      </p>
      {SPOKE_GROUPS.map((g) => {
        let rows = profile.spokes.filter((s) => SPOKE_BY_ID[s.spokeId].group === g.id);
        if (sortStrongest) rows = [...rows].sort((a, b) => (b.rel ?? -999) - (a.rel ?? -999));
        return (
          <section key={g.id} className="stack-sm" aria-labelledby={`rows-${g.id}`}>
            <h3 id={`rows-${g.id}`} className={`group-pill hue-${g.hue}`} style={{ fontSize: '.95rem' }}>{g.label}</h3>
            <ul className="row-list">
              {rows.map((s) => (
                <li key={s.spokeId}>
                  <div className="row-link" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <NumBadge s={s} />
                    <Link to={`/results/area/${s.spokeId}`} className="row-title" style={{ flex: '1 1 12rem' }} aria-label={describeSpoke(s)}>{s.label}</Link>
                    {s.ease === undefined ? (
                      <span className="small muted" style={{ flex: '2 1 14rem' }}>{LABELS.notEnough}</span>
                    ) : (
                      <>
                        <span style={{ flex: '2 1 14rem' }}><Track s={s} middle={middle} absolute={absolute} /></span>
                        <span className="small tabular" style={{ flex: '0 0 auto' }}>
                          {absolute ? `${round(s.ease)} of 100` : `${(s.rel ?? 0) >= 0 ? '+' : '−'}${Math.abs(round(s.rel ?? 0))}`}
                        </span>
                        <BatteryGlyph cost={s.cost} label={s.cost === undefined ? 'Energy cost not answered' : `Energy cost: ${costText(s.cost).toLowerCase()}`} />
                      </>
                    )}
                  </div>
                  {s.spokeId === 'socialEase' && (
                    <div className="row-link" style={{ flexWrap: 'wrap', borderTop: '1px solid var(--outline)' }}>
                      <Heart size={20} strokeWidth={2} aria-hidden="true" />
                      <span className="row-title" style={{ flex: '1 1 12rem' }}>Wanting connection<br /><span className="small muted" style={{ fontWeight: 400 }}>How much you want this, not how easy it is</span></span>
                      {motivation.value === undefined ? <span className="small muted" style={{ flex: '2 1 14rem' }}>{LABELS.notEnough}</span> : (
                        <>
                          <svg viewBox="0 0 300 28" width="100%" height="28" aria-hidden="true" style={{ flex: '2 1 14rem', maxWidth: 360 }}>
                            <line x1="8" y1="14" x2="292" y2="14" style={{ stroke: 'var(--hatch)', strokeWidth: 4, strokeLinecap: 'round' }} />
                            <path transform={`translate(${10 + (motivation.value / 100) * 280 - 9} 5) scale(.75)`} d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" style={{ fill: 'var(--ink)', stroke: 'var(--bg)', strokeWidth: 1.5 }} />
                          </svg>
                          <span className="small tabular">{round(motivation.value)} of 100</span>
                        </>
                      )}
                    </div>
                  )}
                  {s.basedOn !== undefined && <p className="small muted" style={{ padding: '0 var(--space-4) var(--space-2)' }}>{basedOnText(s.basedOn)}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function CardsView({ profile, mode = 'everyday' }: { profile: Profile; mode?: 'work' | 'everyday' }) {
  return (
    <ul className="area-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {profile.spokes.map((s) => {
        const hue = SPOKE_BY_ID[s.spokeId].hue;
        const ideas = (s.relLabel === 'stretch' || s.flags.length > 0) ? SPOKE_IDEAS[s.spokeId].slice(0, 2) : [];
        return (
          <li key={s.spokeId} className="area-card">
            <div className={`cap hue-${hue}`}>
              <span className="num-badge" style={{ background: 'var(--surface)', color: 'var(--ink)' }} aria-hidden="true">{s.num}</span>
              <Link to={`/results/area/${s.spokeId}`} style={{ color: 'inherit' }}>{s.label}</Link>
            </div>
            <div className="body">
              {s.ease === undefined ? <p className="muted">{LABELS.notEnough}</p> : (
                <>
                  <div className="cluster"><RelativeBadge label={s.relLabel} /><FlagBadges flags={s.flags} /></div>
                  <div className="stack-sm">
                    <p className="small tabular">Ease: {round(s.ease)} of 100 · {easeText(s.ease)}</p>
                    <div className="gauge" role="img" aria-label={`Ease ${round(s.ease)} out of 100`}><span style={{ width: `${s.ease}%` }} /></div>
                  </div>
                  <p className="small cluster">
                    <BatteryGlyph cost={s.cost} />
                    {s.cost === undefined ? 'Energy cost not answered' : `Energy cost: ${costText(s.cost).toLowerCase()}`}
                  </p>
                  {s.contextTags.length > 0 && <p className="small">Depends on: {s.contextTags.join(', ')}</p>}
                  {s.basedOn !== undefined && <p className="small muted">{basedOnText(s.basedOn)}</p>}
                  {ideas.length > 0 && (
                    <ul className="small stack-sm" style={{ paddingLeft: '1.1rem', margin: 0 }}>
                      {ideas.map((i) => <li key={i.work}>{mode === 'work' ? i.work : i.everyday}</li>)}
                    </ul>
                  )}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
