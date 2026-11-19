import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageTitle } from '../app/usePageTitle';
import { CONSENT_LABEL, DEPENDS_TIP_LONG, TIMEFRAME_TIP } from '../content/copy';
import { useStore } from '../storage/store';

export function HowItWorks() {
  usePageTitle('Before you start');
  const navigate = useNavigate();
  const consented = useStore((s) => !!s.data.flags.consented);
  const setFlag = useStore((s) => s.setFlag);
  const [checked, setChecked] = useState(consented);

  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>Before you start</h1>
      <ul className="stack prose" style={{ paddingLeft: '1.2rem', margin: 0 }}>
        <li><strong>Think about the last 3 months.</strong> {TIMEFRAME_TIP}</li>
        <li><strong>“Doesn’t apply to my life”</strong> is a fine answer. We leave that question out, and it never counts as zero.</li>
        <li><strong>“It depends”</strong> is fine too. {DEPENDS_TIP_LONG}</li>
        <li><strong>Go at your own pace.</strong> Every answer saves as you go. You can skip questions, pause, and answer sections in any order.</li>
        <li><strong>Support is always one tap away.</strong> The “Need support?” button is at the top of every screen.</li>
      </ul>
      <div className="notice">
        <label className="check-label" style={{ alignItems: 'flex-start' }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>{CONSENT_LABEL}</span>
        </label>
      </div>
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary"
          aria-disabled={!checked}
          onClick={() => {
            if (!checked) return;
            setFlag({ consented: true });
            navigate('/about-you');
          }}
        >
          Continue <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        {!checked && <span className="hint">Tick the box to continue.</span>}
      </div>
    </div>
  );
}
