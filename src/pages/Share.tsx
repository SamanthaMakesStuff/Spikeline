import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Copy, Download, Lock, Printer } from 'lucide-react';
import { announce } from '../a11y/announce';
import { usePageTitle } from '../app/usePageTitle';
import { SHARE_NAME } from '../config';
import { SPIKEPRINT_EXPLAINER } from '../content/copy';
import { useProfile } from '../results/useProfile';
import { countPdfPages, suggestToRemove } from '../share/fit';
import { copyText, downloadBlob } from '../share/download';
import {
  PRESETS, PRESET_BY_ID, SECTION_DEFS, SECTION_GROUPS, SENSITIVE_HINT, defaultSelection, spikeprintFileName,
  type PresetId, type SectionKey,
} from '../share/sections';
import { SpikeprintView } from '../share/SpikeprintView';
import { buildSpikeprint, encodeLink } from '../share/spikeprint';
import { useBusy } from '../share/useBusy';
import { useStore } from '../storage/store';
import { SHARE_LINK_SOFT_LIMIT } from '../config';

const STEPS = ['Who is it for?', 'What to include', 'Preview', 'Get it as…'];

export function Share() {
  usePageTitle(`Create my ${SHARE_NAME}`);
  const profile = useProfile();
  const about = useStore((s) => s.data.aboutYou);
  const reflection = useStore((s) => s.data.reflection);
  const drafts = useStore((s) => s.data.shareDrafts);
  const colours = useStore((s) => s.data.settings.colours);
  const example = useStore((s) => !!s.data.flags.example);
  const setShareDraft = useStore((s) => s.setShareDraft);
  const [step, setStep] = useState(1);
  const [preset, setPreset] = useState<PresetId>('work');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const draft = drafts[preset];
  const sections = { ...defaultSelection(preset), ...(draft?.sections ?? {}) } as Record<SectionKey, boolean>;
  const name = draft?.name ?? about.preferredName ?? '';
  const theme = `${colours}-light`;

  const sectionsKey = JSON.stringify(sections);
  const data = useMemo(
    () => buildSpikeprint({ profile, about, reflection, preset, sections, name, example }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, about, reflection, preset, sectionsKey, name, example],
  );

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  if (!profile.hasEnough) {
    return (
      <div className="page page-narrow" style={{ marginInline: 0 }}>
        <h1>Create my {SHARE_NAME}</h1>
        <p className="lead">Answer a few more sections first. We need enough answers in at least 3 areas to make your profile.</p>
        <div><Link to="/hub" className="btn btn-primary">Back to sections</Link></div>
      </div>
    );
  }

  const update = (next: Partial<Record<SectionKey, boolean>>, nextName = name) =>
    setShareDraft(preset, { sections: { ...sections, ...next }, name: nextName });

  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <div className="stack-sm">
        <h1>Create my {SHARE_NAME}</h1>
        <p className="prose">{SPIKEPRINT_EXPLAINER}</p>
        <ol className="share-steps small" aria-label="Steps">
          {STEPS.map((s, i) => <li key={s} className="chip" aria-current={step === i + 1 ? 'step' : undefined} style={step === i + 1 ? { background: 'var(--action)', color: 'var(--on-action)' } : undefined}>{i + 1}. {s}</li>)}
        </ol>
      </div>

      {step === 1 && (
        <section className="stack" aria-labelledby="s1">
          <h2 id="s1" ref={headingRef} tabIndex={-1} style={{ fontSize: '1.6rem' }}>1. Who is this {SHARE_NAME} for?</h2>
          <fieldset className="plain">
            <legend className="sr-only">Who is this {SHARE_NAME} for?</legend>
            <div className="preset-grid">
              {PRESETS.map((p) => (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control -- the label text is nested two levels down, which the linter can't see
                <label key={p.id} className="pill-option">
                  <input type="radio" name="preset" checked={preset === p.id} onChange={() => setPreset(p.id)} />
                  <span style={{ borderRadius: 'var(--radius-card)', alignItems: 'flex-start', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <strong>{p.label}</strong>
                    <span className="small" style={{ fontWeight: 400 }}>{p.blurb}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      )}

      {step === 2 && (
        <section className="stack" aria-labelledby="s2">
          <h2 id="s2" ref={headingRef} tabIndex={-1} style={{ fontSize: '1.6rem' }}>2. Choose what to include</h2>
          <div className="field">
            <label htmlFor="sp-name">Name on your {SHARE_NAME} (optional)</label>
            <input id="sp-name" className="text-input" type="text" maxLength={80} autoComplete="off" value={name} onChange={(e) => update({}, e.target.value)} />
          </div>
          {SECTION_GROUPS.map((g) => (
            <fieldset key={g} className="plain stack-sm">
              <legend>{g}</legend>
              {SECTION_DEFS.filter((s) => s.group === g).map((s) => (
                <div key={s.key}>
                  <label className="check-label" style={{ alignItems: 'flex-start' }}>
                    <input type="checkbox" checked={!!sections[s.key]} onChange={(e) => update({ [s.key]: e.target.checked })} aria-describedby={s.sensitive ? `${s.key}-hint` : undefined} />
                    <span>{s.label} {s.sensitive && <span className="sens"><Lock size={14} strokeWidth={2} aria-hidden="true" /> Sensitive</span>}</span>
                  </label>
                  {s.sensitive && <p id={`${s.key}-hint`} className="hint" style={{ marginLeft: '2rem' }}>{SENSITIVE_HINT}</p>}
                </div>
              ))}
            </fieldset>
          ))}
          <div><button type="button" className="btn" onClick={() => setShareDraft(preset, { sections: defaultSelection(preset), name })}>Reset to {PRESET_BY_ID[preset].label} defaults</button></div>
        </section>
      )}

      {step === 3 && (
        <section className="stack" aria-labelledby="s3">
          <h2 id="s3" ref={headingRef} tabIndex={-1} style={{ fontSize: '1.6rem' }}>3. Preview your {SHARE_NAME}</h2>
          <p className="muted">This is what other people will see. It always uses the light version of your colours.</p>
          <SpikeprintView data={data} theme={theme} />
        </section>
      )}

      {step === 4 && <GetIt data={data} theme={theme} headingRef={headingRef} preset={preset} />}

      <div className="q-nav no-print">
        <div className="group">
          {step > 1 && <button type="button" className="btn" onClick={() => setStep(step - 1)}><ArrowLeft size={20} strokeWidth={2} aria-hidden="true" /> Back</button>}
          <Link to="/results" className="btn">Your profile</Link>
        </div>
        {step < 4 && <button type="button" className="btn btn-primary" onClick={() => { setStep(step + 1); announce(`Step ${step + 1} of 4`); }}>Next <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></button>}
      </div>
    </div>
  );
}

function GetIt({ data, theme, headingRef, preset }: { data: ReturnType<typeof buildSpikeprint>; theme: string; headingRef: React.RefObject<HTMLHeadingElement>; preset: PresetId }) {
  const busy = useBusy();
  const [allowSecond, setAllowSecond] = useState(false);
  const [fitMessage, setFitMessage] = useState('');
  const [size, setSize] = useState<'portrait' | 'landscape'>('portrait');
  const [alt, setAlt] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  const fileDate = data.d;
  const pdf = async () => {
    setError(''); setFitMessage('');
    try {
      await busy.run('Making your PDF…', async () => {
        const { renderPdf } = await import('../share/pdf');
        const bytes = await renderPdf(data, { theme, allowSecondPage: allowSecond });
        const pages = countPdfPages(bytes);
        if (pages > 1 && !allowSecond) {
          setFitMessage(`This doesn’t fit on one page at a readable size, and we don’t shrink text. Untick some sections (the biggest are ${suggestToRemove(data).join(', ')}), or allow a second page.`);
          return;
        }
        downloadBlob(spikeprintFileName(data.n, 'pdf', fileDate), new Blob([bytes], { type: 'application/pdf' }));
        announce('Your PDF is ready');
      });
    } catch { setError('We couldn’t make the PDF. Try again, or use the Print view instead.'); }
  };
  const png = async () => {
    setError('');
    try {
      await busy.run('Making your image…', async () => {
        const { renderPng, altText } = await import('../share/png');
        const blob = await renderPng(data, { size, theme });
        setAlt(altText(data));
        downloadBlob(spikeprintFileName(data.n, 'png', fileDate, `-${size}`), blob);
        announce('Your image is ready');
      });
    } catch { setError('We couldn’t make the image. Try again, or use the Print view instead.'); }
  };
  const makeLink = () => {
    const url = encodeLink(data);
    setLink(url);
  };
  const copy = async () => {
    const ok = await copyText(link);
    setCopied(ok ? 'Link copied.' : 'We couldn’t copy it automatically. Select the link and copy it yourself.');
    announce(ok ? 'Link copied' : 'Copy failed');
  };
  const tooLong = link.length > SHARE_LINK_SOFT_LIMIT;

  return (
    <section className="stack-lg" aria-labelledby="s4">
      <h2 id="s4" ref={headingRef} tabIndex={-1} style={{ fontSize: '1.6rem' }}>4. Get your {SHARE_NAME} as…</h2>
      <p className="callout">The Print view and the private link are the most accessible formats for screen readers. The PDF may not be fully tagged.</p>
      <p role="status" className="hint">{busy.label}</p>
      {error && <p role="alert" className="notice">{error}</p>}

      <div className="stack">
        <h3>PDF</h3>
        <p className="prose">One A4 page, with text you can select.</p>
        <label className="check-label"><input type="checkbox" checked={allowSecond} onChange={(e) => setAllowSecond(e.target.checked)} />Allow a second page</label>
        <div><button type="button" className="btn btn-primary" onClick={pdf}><Download size={20} strokeWidth={2} aria-hidden="true" /> Download {SHARE_NAME} (PDF)</button></div>
        {fitMessage && <p role="alert" className="notice">{fitMessage}</p>}
      </div>

      <div className="stack">
        <h3>Image</h3>
        <fieldset className="plain">
          <legend className="sr-only">Image size</legend>
          <div className="seg-group">
            {([['portrait', 'Portrait, for messages and social'], ['landscape', 'Landscape, for slides and email']] as const).map(([v, label]) => (
              <label key={v} className="pill-option"><input type="radio" name="img-size" checked={size === v} onChange={() => setSize(v)} /><span>{label}</span></label>
            ))}
          </div>
        </fieldset>
        <div><button type="button" className="btn btn-primary" onClick={png}><Download size={20} strokeWidth={2} aria-hidden="true" /> Download {SHARE_NAME} (image)</button></div>
        {alt && (
          <div className="stack-sm">
            <label htmlFor="alt-text" style={{ fontWeight: 500 }}>Alt text to copy</label>
            <textarea id="alt-text" className="textarea" readOnly value={alt} style={{ minHeight: '6rem' }} />
            <div><button type="button" className="btn" onClick={() => copyText(alt).then((ok) => announce(ok ? 'Alt text copied' : 'Copy failed'))}><Copy size={20} strokeWidth={2} aria-hidden="true" /> Copy alt text</button></div>
          </div>
        )}
      </div>

      <div className="stack">
        <h3>Private link</h3>
        <p className="callout">Anyone with this link can see your {SHARE_NAME}. The information is inside the link itself, so we don’t store it anywhere, and that also means we can’t delete it. Only send it to people you trust.</p>
        {!link ? (
          <div><button type="button" className="btn btn-primary" onClick={makeLink}>Make my link</button></div>
        ) : (
          <div className="stack-sm">
            <label htmlFor="link-box" style={{ fontWeight: 500 }}>Your private link</label>
            <textarea id="link-box" className="textarea link-box" readOnly value={link} style={{ minHeight: '5rem' }} onFocus={(e) => e.currentTarget.select()} />
            <p className="hint tabular">{link.length} characters</p>
            {tooLong && <p role="note" className="notice">This link is long, and some apps cut long links short. Untick some sections, or send a PDF instead.</p>}
            <div><button type="button" className="btn btn-primary" onClick={copy}><Copy size={20} strokeWidth={2} aria-hidden="true" /> Copy {SHARE_NAME} link</button></div>
            {copied && <p role="status">{copied}</p>}
          </div>
        )}
      </div>

      <div className="stack">
        <h3>Print</h3>
        <div><Link to={`/print?preset=${preset}`} className="btn btn-primary"><Printer size={20} strokeWidth={2} aria-hidden="true" /> Print my {SHARE_NAME}</Link></div>
      </div>
    </section>
  );
}
