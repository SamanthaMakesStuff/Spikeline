import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LoadExampleData } from '../app/ExampleData';
import { RestoreBackup } from '../app/BackupControls';
import { ThemePicker } from '../app/ThemePicker';
import { usePageTitle } from '../app/usePageTitle';
import { ProfileLine } from '../charts/svg/ProfileLine';
import { APP_NAME } from '../config';
import { NOT_DIAGNOSTIC, WELCOME } from '../content/copy';
import { useStore } from '../storage/store';
import { useUI } from '../app/ui';

// Example profile only: made-up values, labelled as such.
const EXAMPLE_VALUES = [66, 40, 50, 74, 60, 42, 46, 36, 40, 62, 76];
const EXAMPLE_HUES = ['teal', 'teal', 'teal', 'teal', 'plum', 'plum', 'tomato', 'tomato', 'tomato', 'butter', 'butter'] as const;

export function Welcome() {
  usePageTitle('');
  const navigate = useNavigate();
  const returning = useStore((s) => Object.keys(s.data.answers).length > 0 || !!s.data.flags.consented);
  const openSupport = useUI((s) => s.openSupport);

  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <div className="stack-lg">
        <div className="stack-sm">
          <p className="wordmark" aria-hidden="true">{APP_NAME}</p>
          <h1>{WELCOME.headline}</h1>
          <p className="lead">{WELCOME.subline}</p>
        </div>

        {returning ? (
          <div className="btn-row">
            <Link to="/hub" className="btn btn-primary">Carry on <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></Link>
            <RestoreBackup />
          </div>
        ) : (
          <section aria-labelledby="theme-h" className="stack">
            <h2 id="theme-h" style={{ fontSize: '1.3rem' }}>{WELCOME.themeHeading}</h2>
            <ThemePicker idPrefix="welcome-theme" />
          </section>
        )}

        <section aria-labelledby="what-h" className="stack">
          <h2 id="what-h" style={{ fontSize: '1.3rem' }}>What this is, and isn’t</h2>
          <div className="callout"><p className="prose">{NOT_DIAGNOSTIC}</p></div>
          <p className="prose">{WELCOME.howLong}</p>
          <p className="prose">{WELCOME.privacy}</p>
          <p><button type="button" className="btn-link" onClick={openSupport}>Need support? Find help now</button></p>
          <p><LoadExampleData /></p>
        </section>

        {!returning && (
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/how-it-works')}>
              Start <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <RestoreBackup />
          </div>
        )}

        <figure style={{ margin: 0 }} className="stack-sm">
          <ProfileLine values={EXAMPLE_VALUES} hues={[...EXAMPLE_HUES]} />
          <figcaption className="example-tag">Example profile</figcaption>
        </figure>
      </div>
    </div>
  );
}
