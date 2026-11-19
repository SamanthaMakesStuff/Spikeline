import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SaveBackupButton } from '../app/BackupControls';
import { ProgressRing } from '../app/ProgressRing';
import { usePageTitle } from '../app/usePageTitle';
import { STORAGE_NOTE } from '../content/copy';
import type { Hue, ModuleId, Section } from '../content/items';
import { GROUPS, SECTION_BY_ID, sectionsInGroup } from '../content/sections';
import { sectionProgress } from '../engine/flow';
import { computeProfile } from '../scoring/profile';
import { MIN_SPOKES_FOR_RESULTS } from '../config';
import { useStore } from '../storage/store';
import { useMemo } from 'react';

function statusText(section: Section, optedIn: boolean, p: ReturnType<typeof sectionProgress>): string {
  if (section.optIn && !optedIn) return 'Choose to add';
  if (p.done) return 'Done';
  if (p.started) return `${p.answered} of ${p.total}`;
  return `About ${p.minutesLeft} min`;
}

export function Hub() {
  usePageTitle('Your sections');
  const answers = useStore((s) => s.data.answers);
  const optedIn = useStore((s) => s.data.optedInModules);
  const flags = useStore((s) => s.data.flags);
  const setFlag = useStore((s) => s.setFlag);
  const persistent = useStore((s) => s.persistent);

  const profile = useMemo(() => computeProfile(answers), [answers]);
  const finished = flags.finished ?? [];

  // Carry on: the section last worked on if unfinished, else the first unfinished core or recommended section.
  const progressOf = (id: Section['id']) => sectionProgress(id, answers, finished);
  const candidates = GROUPS.filter((g) => g.id !== 'optional').flatMap((g) => sectionsInGroup(g.id));
  const last = flags.lastSection ? SECTION_BY_ID[flags.lastSection as keyof typeof SECTION_BY_ID] : undefined;
  const next = (last && !progressOf(last.id).done && (!last.optIn || optedIn.includes(last.id as ModuleId)) ? last : undefined)
    ?? candidates.find((s) => !progressOf(s.id).done) ?? candidates[0];
  const nextProgress = progressOf(next.id);
  const anyAnswers = Object.keys(answers).length > 0;

  return (
    <div className="page">
      <div className="page-head">
        <div className="stack-sm">
          <h1>Your sections</h1>
          <p className="muted">Answer in any order. Everything saves as you go.</p>
        </div>
      </div>

      <section aria-labelledby="next-h" className="carry-on">
        <ProgressRing fraction={nextProgress.total ? nextProgress.answered / nextProgress.total : 0} size={64} />
        <div className="stack-sm">
          <p className="small" style={{ fontWeight: 500 }}>{anyAnswers ? 'Next up' : 'Start here'}</p>
          <h2 id="next-h" style={{ fontSize: '1.7rem' }}>{next.title}</h2>
          <p className="small tabular">{nextProgress.started ? `${nextProgress.answered} of ${nextProgress.total} answered · about ${nextProgress.minutesLeft} min left` : `About ${nextProgress.minutesLeft} min`}</p>
        </div>
        <Link to={`/q/${next.id}/1`} className="btn btn-primary" aria-label={anyAnswers ? `Carry on with ${next.title}` : `Start with ${next.title}`}>
          {anyAnswers ? 'Carry on' : 'Start'} <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </Link>
      </section>

      <div className="two-col">
        <div className="grow stack-lg">
          {GROUPS.filter((g) => ['focusDoing', 'communicating', 'body', 'practical', 'strengthsEnergy'].includes(g.id)).map((g) => (
            <GroupList key={g.id} id={g.id} title={g.title} hue={g.hue} />
          ))}
        </div>
        <div className="side stack-lg">
          <GroupList id="recommended" title="Recommended extras" />
          <GroupList id="optional" title="Optional: choose to add" />

          <section aria-labelledby="prof-h" className="panel stack">
            <h2 id="prof-h" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Your profile</h2>
            {profile.hasEnough ? (
              <p>You’ve answered enough to see your profile. It fills in as you answer more.</p>
            ) : (
              <p>Answer a few more sections to see your profile. We need at least {MIN_SPOKES_FOR_RESULTS} areas with enough answers.</p>
            )}
            <div className="btn-row">
              {profile.hasEnough
                ? <Link to="/results" className="btn btn-primary">See my results</Link>
                : <span className="btn" aria-disabled="true" role="link">See my results</span>}
              <Link to="/reflection" className="btn">Reflection</Link>
            </div>
          </section>

          <section aria-labelledby="data-h" className="stack-sm">
            <h2 id="data-h" style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Your answers</h2>
            {!flags.storageNoteSeen && persistent && (
              <div className="notice stack-sm">
                <p className="small">{STORAGE_NOTE}</p>
                <div><button type="button" className="btn" onClick={() => setFlag({ storageNoteSeen: true })}>Got it</button></div>
              </div>
            )}
            <p className="small muted">Using a shared computer? <Link to="/settings#delete">Delete everything</Link> before you leave.</p>
            <SaveBackupButton />
          </section>
        </div>
      </div>
    </div>
  );

  function GroupList({ id, title, hue }: { id: Parameters<typeof sectionsInGroup>[0]; title: string; hue?: Hue }) {
    const list = sectionsInGroup(id);
    return (
      <section className="stack-sm" aria-labelledby={`g-${id}`}>
        <h2 id={`g-${id}`} className={`group-pill ${hue ? `hue-${hue}` : ''}`}>{title}</h2>
        <ul className="row-list">
          {list.map((s) => {
            const p = progressOf(s.id);
            const isOpted = !s.optIn || optedIn.includes(s.id as ModuleId);
            const status = statusText(s, isOpted, p);
            return (
              <li key={s.id}>
                <Link to={`/q/${s.id}/1`} className="row-link">
                  <ProgressRing fraction={p.total ? p.answered / p.total : 0} hue={hue} done={p.done} />
                  <span className="row-title">{s.title}</span>
                  <span className="row-status">{status}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
}
