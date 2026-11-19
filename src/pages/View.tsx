import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../app/usePageTitle';
import { SHARE_NAME } from '../config';
import { PRESET_BY_ID } from '../share/sections';
import { SpikeprintView } from '../share/SpikeprintView';
import { decodeLinkPayload } from '../share/spikeprint';
import { useStore } from '../storage/store';

/** Read-only page rendered from the link. Nothing here is saved, and no raw answers exist in the link. */
export function View() {
  const [params] = useSearchParams();
  const result = decodeLinkPayload(params.get('d'));
  const colours = useStore((s) => s.data.settings.colours);
  const mode = useStore((s) => s.data.settings.background);
  usePageTitle(result.ok ? `${SHARE_NAME}: ${PRESET_BY_ID[result.data.p].title}` : `${SHARE_NAME}`);

  if (!result.ok) {
    return (
      <div className="page page-narrow" style={{ marginInline: 0 }}>
        <h1>We couldn’t open this {SHARE_NAME}</h1>
        <p className="lead">The link may have been cut short or changed on the way. Ask the person who sent it to send it again, or to send a PDF.</p>
        <p><Link to="/" className="btn">Go to {`Spikeline`}</Link></p>
      </div>
    );
  }
  const d = result.data;
  // The viewer’s own colours; the output itself follows their background choice, not forced light.
  const theme = `${colours}-${mode === 'dark' ? 'dark' : mode === 'light' ? 'light' : typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}`;
  return (
    <div className="page">
      <p className="notice" role="note">
        This is {d.n ? `${d.n}’s` : 'a shared'} {SHARE_NAME}, a shared copy that can’t be edited.
      </p>
      <SpikeprintView data={d} theme={theme} titleLevel={1} />
    </div>
  );
}
