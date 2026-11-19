import { useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Coffee } from 'lucide-react';
import { announce } from '../a11y/announce';
import { QuestionItem } from '../app/QuestionItem';
import { SupportCard } from '../app/SupportCard';
import { useMediaQuery } from '../app/useMediaQuery';
import { usePageTitle } from '../app/usePageTitle';
import { ITEM_BY_ID, type ModuleId, type SectionId } from '../content/items';
import { GROUPS, SECTIONS, SECTION_BY_ID } from '../content/sections';
import { pageForIndex, paginate, sectionProgress, visibleItems, isAnswered } from '../engine/flow';
import { useStore } from '../storage/store';
import { TIMEFRAME_TIP } from '../content/copy';

function hueClass(group: string): string {
  const hue = GROUPS.find((g) => g.id === group)?.hue;
  return hue ? `hue-${hue}` : '';
}

export function Question() {
  const { sectionId = '', index = '1' } = useParams();
  const section = SECTION_BY_ID[sectionId as SectionId];
  if (!section) return <Navigate to="/hub" replace />;
  return <QuestionScreen key={section.id} sectionId={section.id} index={Number(index) || 1} />;
}

function QuestionScreen({ sectionId, index }: { sectionId: SectionId; index: number }) {
  const navigate = useNavigate();
  const section = SECTION_BY_ID[sectionId];
  const answers = useStore((s) => s.data.answers);
  const optedIn = useStore((s) => s.data.optedInModules);
  const settings = useStore((s) => s.data.settings);
  const flags = useStore((s) => s.data.flags);
  const putAnswer = useStore((s) => s.putAnswer);
  const optIn = useStore((s) => s.optIn);
  const setFlag = useStore((s) => s.setFlag);
  const narrow = useMediaQuery('(max-width: 767px)');

  const layout: 'one' | 'few' = settings.layout === 'auto' ? (narrow ? 'one' : 'few') : settings.layout === 'one' ? 'one' : 'few';
  const items = useMemo(() => visibleItems(sectionId, answers), [sectionId, answers]);
  const pages = useMemo(() => paginate(items, layout), [items, layout]);
  const { page, firstIndex, pageNumber } = pageForIndex(pages, index);
  const lastIndex = firstIndex + page.length - 1;
  const isLast = pageNumber === pages.length;
  const progress = sectionProgress(sectionId, answers, flags.finished);

  const order = SECTIONS.filter((s) => !s.optIn || optedIn.includes(s.id as ModuleId));
  const sectionNumber = Math.max(1, order.findIndex((s) => s.id === sectionId) + 1);

  const range = page.length > 1 ? `Questions ${firstIndex} to ${lastIndex} of ${items.length}` : `Question ${firstIndex} of ${items.length}`;
  const needsOptIn = !!section.optIn && !optedIn.includes(sectionId as ModuleId);
  usePageTitle(needsOptIn ? section.title : `${range} · ${section.title}`);

  useEffect(() => {
    if (!needsOptIn && flags.lastSection !== sectionId) setFlag({ lastSection: sectionId });
  }, [needsOptIn, sectionId, flags.lastSection, setFlag]);

  const go = (i: number) => navigate(`/q/${sectionId}/${i}`);
  const finish = () => {
    const finished = Array.from(new Set([...(flags.finished ?? []), sectionId]));
    setFlag({ finished });
    announce('Your answers are saved');
    navigate('/hub');
  };

  if (needsOptIn) {
    return (
      <div className="q-wrap">
        <div className="q-meta"><span className="timeframe-chip">Optional section</span></div>
        <div className={`q-band ${hueClass(section.group)}`}><h1>{section.title}</h1></div>
        <p className="lead">{section.optInBlurb}</p>
        {sectionId === 'M4' && <SupportCard variant="eating" />}
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => optIn(sectionId as 'M4' | 'M6' | 'M7')}>Add this section</button>
          <Link to="/hub" className="btn">Not now</Link>
        </div>
      </div>
    );
  }

  const safetyHit = page.some((i) => i.safetyAt !== undefined) || sectionId === 'M4'
    ? (['M4.4', 'M4.6'] as const).some((id) => {
      const f = answers[id]?.freq;
      return typeof f === 'number' && f >= (ITEM_BY_ID[id].safetyAt ?? 3);
    })
    : false;
  const showSupport = section.signpost && (pageNumber === 1 || page.some((i) => i.signpost));
  const minutes = progress.minutesLeft;

  return (
    <div className="q-wrap">
      <div className="q-meta">
        <span className="timeframe-chip">{page[0]?.timeframe ?? section.timeframe}</span>
        <p className="small tabular muted">Section {sectionNumber} of {order.length} · about {minutes} {minutes === 1 ? 'minute' : 'minutes'} left</p>
      </div>
      <div className={`q-band ${hueClass(section.group)}`}>
        <h1>{section.title}</h1>
      </div>
      <div className="seg-bar" aria-hidden="true">
        {items.map((it) => <span key={it.id} className={isAnswered(it, answers[it.id]) ? 'on' : ''} />)}
      </div>
      <p className="sr-only">{range}. {progress.answered} of {progress.total} answered.</p>

      {pageNumber === 1 && section.intro && <p className="prose">{section.intro}</p>}
      {pageNumber === 1 && sectionId === 'C1' && <p className="callout prose">{TIMEFRAME_TIP}</p>}
      {sectionId === 'M4' && <SupportCard variant={safetyHit ? 'eatingProminent' : 'eating'} />}
      {sectionId !== 'M4' && showSupport && <SupportCard />}

      {page.map((item, i) => (
        <QuestionItem
          key={item.id}
          item={item}
          answer={answers[item.id]}
          focusFirst={i === 0}
          onChange={(a) => putAnswer(item.id, a)}
        />
      ))}

      <nav className="q-nav" aria-label="Question navigation">
        <div className="group">
          {pageNumber > 1 ? (
            <button type="button" className="btn" onClick={() => go(pageStart(pages, pageNumber - 1))}>
              <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" /> Back
            </button>
          ) : (
            <Link to="/hub" className="btn"><ArrowLeft size={20} strokeWidth={2} aria-hidden="true" /> Sections</Link>
          )}
          <Link to="/hub" className="btn" onClick={() => announce('Your answers are saved')}>
            <Coffee size={20} strokeWidth={2} aria-hidden="true" /> Take a break
          </Link>
        </div>
        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={finish}>Finish section <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => go(lastIndex + 1)}>Next <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></button>
        )}
      </nav>
    </div>
  );
}

/** One-based index of the first item on a page (1-based page number). */
function pageStart(pages: unknown[][], pageNumber: number): number {
  let n = 1;
  for (let p = 0; p < pageNumber - 1; p++) n += pages[p].length;
  return n;
}
