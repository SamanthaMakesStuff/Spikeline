import { Link } from 'react-router-dom';
import { Check, Palette, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { APP_NAME } from '../config';
import { useStore } from '../storage/store';
import { useUI } from './ui';

export function Header() {
  const saveStatus = useStore((s) => s.saveStatus);
  const openSupport = useUI((s) => s.openSupport);
  const openColours = useUI((s) => s.openColours);
  const failed = saveStatus === 'failed';
  return (
    <header className="app-header">
      {/* First in the DOM so it is one keystroke after the skip link; CSS puts it at the end visually. */}
        <button type="button" className="btn btn-support header-support" onClick={openSupport}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <circle cx="6" cy="6" r="5" style={{ fill: 'var(--butter)', stroke: 'var(--on-support)', strokeWidth: 1.5 }} />
          </svg>
          Need support?
        </button>
      <Link to="/hub" className="wordmark">{APP_NAME}</Link>
      <div className="header-actions">
        {/* Fixed width so it never shifts the layout. Announcements go through the shared live region, not this element. */}
        <p className="save-status">
          {failed ? <TriangleAlert size={16} strokeWidth={2} aria-hidden="true" /> : <Check size={16} strokeWidth={2} aria-hidden="true" />}
          {failed ? 'Not saved on this device' : 'Saved on this device'}
        </p>
        <button type="button" className="btn" onClick={openColours}>
          <Palette size={20} strokeWidth={2} aria-hidden="true" />
          Colours
        </button>
        <Link to="/settings" className="btn">
          <SlidersHorizontal size={20} strokeWidth={2} aria-hidden="true" />
          Settings
        </Link>
      </div>
    </header>
  );
}
