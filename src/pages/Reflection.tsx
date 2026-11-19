import { Link } from 'react-router-dom';
import { usePageTitle } from '../app/usePageTitle';
import { useStore } from '../storage/store';

export function Reflection() {
  usePageTitle('Reflection');
  const reflection = useStore((s) => s.data.reflection);
  const setReflection = useStore((s) => s.setReflection);
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <div className="stack-sm">
        <h1>Reflection</h1>
        <p className="lead">Two optional questions, in your own words. Neither is scored. You can include them in a Spikeprint.</p>
      </div>
      <div className="field">
        <label htmlFor="helps">What helps you?</label>
        <textarea id="helps" className="textarea" maxLength={4000} value={reflection.whatHelps ?? ''} onChange={(e) => setReflection({ whatHelps: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="know">What would you like people to know about you?</label>
        <textarea id="know" className="textarea" maxLength={4000} value={reflection.wantPeopleToKnow ?? ''} onChange={(e) => setReflection({ wantPeopleToKnow: e.target.value })} />
      </div>
      <div><Link to="/hub" className="btn btn-primary">Back to sections</Link></div>
    </div>
  );
}
