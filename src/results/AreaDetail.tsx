import { Link, Navigate, useParams } from 'react-router-dom';
import { usePageTitle } from '../app/usePageTitle';
import { SPOKE_IDEAS } from '../content/adjustments';
import { LABELS } from '../content/copy';
import { SPOKE_BY_ID } from '../content/spokes';
import { easeText, costText, basedOnText, describeSpoke, round } from './describe';
import { BatteryGlyph, FlagBadges, RelativeBadge } from './glyphs';
import { useProfile } from './useProfile';
import { IDEAS_DISCLAIMER } from '../content/adjustments';

export function AreaDetail() {
  const { spokeId = '' } = useParams();
  const profile = useProfile();
  const s = profile.spokes.find((x) => x.spokeId === spokeId);
  usePageTitle(s ? s.label : 'Area');
  if (!s || !(spokeId in SPOKE_BY_ID)) return <Navigate to="/results" replace />;
  const hue = SPOKE_BY_ID[s.spokeId].hue;
  const uniqueDrivers = Array.from(new Set(s.drivers.map((d) => d.label)));
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <p><Link to="/results">Back to your profile</Link></p>
      <div className="stack-sm">
        <span className={`group-pill hue-${hue}`}>{s.num}. {SPOKE_BY_ID[s.spokeId].group === 'focusDoing' ? 'Focus and doing' : SPOKE_BY_ID[s.spokeId].group === 'communicating' ? 'Communicating and connecting' : SPOKE_BY_ID[s.spokeId].group === 'body' ? 'Body, senses and feelings' : 'Practical skills'}</span>
        <h1>{s.label}</h1>
        <p className="lead">{describeSpoke(s).replace(/^[^:]+: /, '')}</p>
      </div>

      {s.ease === undefined ? <p className="callout">{LABELS.notEnough}. <Link to="/hub">Answer more in this area</Link>.</p> : (
        <>
          <div className="cluster"><RelativeBadge label={s.relLabel} /><FlagBadges flags={s.flags} /></div>
          <dl className="stack" style={{ margin: 0 }}>
            <div><dt style={{ fontWeight: 600 }}>Typical day</dt><dd style={{ margin: 0 }} className="tabular">{round(s.ease)} of 100 · {easeText(s.ease)}</dd></div>
            <div><dt style={{ fontWeight: 600 }}>Hard day</dt><dd style={{ margin: 0 }} className="tabular">{s.hard === undefined ? 'Not asked for this area, or not answered' : `${round(s.hard)} of 100 · ${easeText(s.hard)}`}</dd></div>
            {s.fluctuation !== undefined && <div><dt style={{ fontWeight: 600 }}>Drop on hard days</dt><dd style={{ margin: 0 }} className="tabular">{round(s.fluctuation)} points</dd></div>}
            <div><dt style={{ fontWeight: 600 }}>Energy cost</dt><dd style={{ margin: 0 }} className="cluster"><BatteryGlyph cost={s.cost} /> {s.cost === undefined ? 'Not answered' : costText(s.cost)}</dd></div>
            {s.rel !== undefined && <div><dt style={{ fontWeight: 600 }}>Compared with your middle</dt><dd style={{ margin: 0 }} className="tabular">{s.rel >= 0 ? '+' : '−'}{Math.abs(round(s.rel))} points</dd></div>}
          </dl>
          {s.basedOn !== undefined && <p className="muted">{basedOnText(s.basedOn)}</p>}
          {s.contextTags.length > 0 && <div className="stack-sm"><h2 style={{ fontSize: '1.3rem' }}>It depends on</h2><ul className="chip-list">{s.contextTags.map((t) => <li key={t} className="chip">{t}</li>)}</ul></div>}
          {uniqueDrivers.length > 0 && <div className="stack-sm"><h2 style={{ fontSize: '1.3rem' }}>What gets in the way</h2><ul className="stack-sm" style={{ paddingLeft: '1.1rem', margin: 0 }}>{uniqueDrivers.map((d) => <li key={d}>{d}</li>)}</ul></div>}
          <div className="stack-sm">
            <h2 style={{ fontSize: '1.3rem' }}>Ideas that might help</h2>
            <p className="muted">{IDEAS_DISCLAIMER}</p>
            <ul className="stack-sm" style={{ paddingLeft: '1.1rem', margin: 0 }}>
              {SPOKE_IDEAS[s.spokeId].map((i) => <li key={i.work}><strong>At work:</strong> {i.work}<br /><strong>Day to day:</strong> {i.everyday}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
