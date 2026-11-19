import { Link, useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { usePageTitle } from '../app/usePageTitle';
import { SHARE_NAME } from '../config';
import { useProfile } from '../results/useProfile';
import { PRESET_BY_ID, defaultSelection, type PresetId, type SectionKey } from '../share/sections';
import { SpikeprintView } from '../share/SpikeprintView';
import { buildSpikeprint } from '../share/spikeprint';
import { useStore } from '../storage/store';

export function Print() {
  const [params] = useSearchParams();
  const raw = params.get('preset') as PresetId | null;
  const preset: PresetId = raw && raw in PRESET_BY_ID ? raw : 'work';
  usePageTitle(`Print my ${SHARE_NAME}`);
  const profile = useProfile();
  const about = useStore((s) => s.data.aboutYou);
  const reflection = useStore((s) => s.data.reflection);
  const draft = useStore((s) => s.data.shareDrafts[preset]);
  const colours = useStore((s) => s.data.settings.colours);
  const example = useStore((s) => !!s.data.flags.example);
  const sections = { ...defaultSelection(preset), ...(draft?.sections ?? {}) } as Record<SectionKey, boolean>;
  const data = buildSpikeprint({ profile, about, reflection, preset, sections, name: draft?.name ?? about.preferredName, example });

  if (!profile.hasEnough) {
    return <div className="page page-narrow" style={{ marginInline: 0 }}><h1>Print my {SHARE_NAME}</h1><p>Answer a few more sections first.</p><Link to="/hub" className="btn">Back to sections</Link></div>;
  }
  return (
    <div className="page print-page">
      <div className="btn-row no-print">
        <button type="button" className="btn btn-primary" onClick={() => window.print()}><Printer size={20} strokeWidth={2} aria-hidden="true" /> Print</button>
        <Link to="/share" className="btn">Change what’s included</Link>
      </div>
      <h1 className="sr-only">Print my {SHARE_NAME}</h1>
      <SpikeprintView data={data} theme={`${colours}-light`} expandTables titleLevel={2} className="spikeprint-print" />
    </div>
  );
}
