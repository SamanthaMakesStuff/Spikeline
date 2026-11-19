import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { OptionGroup } from '../app/ThemePicker';
import { usePageTitle } from '../app/usePageTitle';
import { useStore } from '../storage/store';

const AGE_BANDS = ['18 to 24', '25 to 34', '35 to 44', '45 to 54', '55 to 64', '65 or over', 'Prefer not to say'];
const GENDERS = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'describe', label: 'I describe myself as…' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];
const DIAGNOSES = [
  { id: 'autism', label: 'Autism' },
  { id: 'adhd', label: 'ADHD' },
  { id: 'dyslexia', label: 'Dyslexia' },
  { id: 'dyspraxia', label: 'Dyspraxia or DCD' },
  { id: 'dyscalculia', label: 'Dyscalculia' },
];
const STATUS = [
  { value: 'none', label: 'Not applicable' },
  { value: 'diagnosed', label: 'Diagnosed' },
  { value: 'self', label: 'Self-identified' },
  { value: 'exploring', label: 'Exploring' },
];

export function AboutYou() {
  usePageTitle('About you');
  const navigate = useNavigate();
  const about = useStore((s) => s.data.aboutYou);
  const setAbout = useStore((s) => s.setAbout);

  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <div className="stack-sm">
        <h1>About you</h1>
        <p className="lead">All of this is optional and is never scored. It is only used in the header of a Spikeprint, and only if you choose to include it.</p>
      </div>

      <div className="field">
        <label htmlFor="name">Preferred name</label>
        <input id="name" className="text-input" type="text" autoComplete="off" maxLength={80} value={about.preferredName ?? ''} onChange={(e) => setAbout({ preferredName: e.target.value })} />
        <p className="hint">Used on your Spikeprint if you want a name on it.</p>
      </div>

      <div className="field">
        <label htmlFor="age">Age band</label>
        <select id="age" className="select" value={about.ageBand ?? ''} onChange={(e) => setAbout({ ageBand: e.target.value || undefined })}>
          <option value="">Choose one (optional)</option>
          {AGE_BANDS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <OptionGroup name="gender" legend="Gender" options={GENDERS} value={about.gender ?? ''} onChange={(gender) => setAbout({ gender })} />
      {about.gender === 'describe' && (
        <div className="field">
          <label htmlFor="gender-other">In your own words</label>
          <input id="gender-other" className="text-input" type="text" maxLength={80} value={about.genderOther ?? ''} onChange={(e) => setAbout({ genderOther: e.target.value })} />
        </div>
      )}

      <fieldset className="plain stack">
        <legend>Diagnoses you hold or are exploring</legend>
        {DIAGNOSES.map((d) => (
          <div key={d.id} className="field">
            <label htmlFor={`dx-${d.id}`}>{d.label}</label>
            <select id={`dx-${d.id}`} className="select" value={about.diagnoses?.[d.id] ?? 'none'} onChange={(e) => {
              const next = { ...(about.diagnoses ?? {}) };
              if (e.target.value === 'none') delete next[d.id];
              else next[d.id] = e.target.value as 'diagnosed' | 'self' | 'exploring';
              setAbout({ diagnoses: next });
            }}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        ))}
        <div className="field">
          <label htmlFor="dx-other">Something else (optional)</label>
          <input id="dx-other" className="text-input" type="text" maxLength={120} value={about.diagnosisOther ?? ''} onChange={(e) => setAbout({ diagnosisOther: e.target.value })} />
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="context">Work or study context</label>
        <input id="context" className="text-input" type="text" maxLength={200} value={about.context ?? ''} onChange={(e) => setAbout({ context: e.target.value })} />
        <p className="hint">For example: “office job”, “university student”, “caring for family”.</p>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={() => navigate('/hub')}>Continue <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></button>
        <Link to="/hub" className="btn">Skip</Link>
      </div>
    </div>
  );
}
