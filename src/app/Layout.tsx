import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LiveRegion } from '../a11y/LiveRegion';
import { STORAGE_FAILED } from '../content/copy';
import { useStore } from '../storage/store';
import { applySettings } from '../design/theme';
import { Dialog } from './Dialog';
import { Header } from './Header';
import { SupportPanel } from './SupportPanel';
import { ThemePicker } from './ThemePicker';
import { useUI } from './ui';

export function useApplySettings() {
  const settings = useStore((s) => s.data.settings);
  useEffect(() => {
    applySettings(settings);
    if (settings.background !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applySettings(settings);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [settings]);
}

/** On a route change, move focus to the page heading (or an element marked data-autofocus). Not on first load. */
function useRouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // A page may already have moved focus inside <main> (for example to a question). Don't override it.
    const active = document.activeElement;
    if (active && active !== document.body && document.getElementById('main')?.contains(active)) {
      window.scrollTo(0, 0);
      return;
    }
    const target = document.querySelector<HTMLElement>('[data-autofocus]') ?? document.querySelector<HTMLElement>('main h1');
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: false });
    }
    window.scrollTo(0, 0);
  }, [pathname]);
}

export function Layout() {
  useApplySettings();
  useRouteFocus();
  const persistent = useStore((s) => s.persistent);
  const example = useStore((s) => !!s.data.flags.example);
  const clearExample = useStore((s) => s.clearExample);
  const navigate = useNavigate();
  const coloursOpen = useUI((s) => s.coloursOpen);
  const closeColours = useUI((s) => s.closeColours);
  return (
    <>
      <a href="#main" className="skip-link no-print">Skip to content</a>
      <Header />
      {!persistent && <p className="banner" role="alert">{STORAGE_FAILED}</p>}
      {example && (
        <div className="banner no-print" role="note">
          Example data. These aren’t your answers.{' '}
          <button type="button" className="btn-link" onClick={() => { clearExample(); navigate('/hub'); }}>Clear example data</button>
        </div>
      )}
      <main id="main">
        <Outlet />
      </main>
      <footer className="page no-print" style={{ paddingTop: 0 }}>
        <nav aria-label="More about Spikeline" className="cluster small">
          <Link to="/about-this-tool">How this works</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/next-steps">Next steps</Link>
          <Link to="/support">Support</Link>
        </nav>
      </footer>
      <SupportPanel />
      <Dialog id="colours" open={coloursOpen} onClose={closeColours} title="Colours">
        <ThemePicker idPrefix="dialog-theme" />
      </Dialog>
      <LiveRegion />
    </>
  );
}

/** Minimal frame for a shared Spikeprint: the viewer’s own colours, a Colours button and support, nothing of the app’s data. */
export function ViewLayout() {
  useApplySettings();
  const coloursOpen = useUI((s) => s.coloursOpen);
  const closeColours = useUI((s) => s.closeColours);
  const openColours = useUI((s) => s.openColours);
  const openSupport = useUI((s) => s.openSupport);
  return (
    <>
      <a href="#main" className="skip-link no-print">Skip to content</a>
      <header className="app-header no-print">
        <button type="button" className="btn btn-support header-support" onClick={openSupport}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" style={{ fill: 'var(--butter)', stroke: 'var(--on-support)', strokeWidth: 1.5 }} /></svg>
          Need support?
        </button>
        <Link to="/" className="wordmark">Spikeline</Link>
        <div className="header-actions"><button type="button" className="btn" onClick={openColours}>Colours</button></div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="page no-print" style={{ paddingTop: 0 }}>
        <p><Link to="/">Make your own with Spikeline</Link></p>
      </footer>
      <SupportPanel />
      <Dialog id="colours" open={coloursOpen} onClose={closeColours} title="Colours"><ThemePicker idPrefix="view-theme" /></Dialog>
      <LiveRegion />
    </>
  );
}
