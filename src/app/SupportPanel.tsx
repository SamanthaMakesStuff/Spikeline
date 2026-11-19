import { Link } from 'react-router-dom';
import { SUPPORT_SERVICES } from '../content/signposting';
import { useUI } from './ui';
import { Dialog } from './Dialog';

export function SupportContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="stack">
      <p>If things feel like too much right now, these services can help. You don’t have to finish anything here first.</p>
      <ul className="support-list">
        {SUPPORT_SERVICES.map((s) => (
          <li key={s.id} className="support-item stack-sm">
            <h3>{s.name}</h3>
            <p>{s.what}</p>
            {s.phone && (
              <p className="cluster">
                {s.phone.map((p) => (
                  <a key={p.tel} className="tel" href={`tel:${p.tel}`}>{p.label}</a>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p>
        <Link to="/next-steps" onClick={onNavigate}>Talking to your GP and other next steps</Link>
      </p>
    </div>
  );
}

export function SupportPanel() {
  const open = useUI((s) => s.supportOpen);
  const close = useUI((s) => s.closeSupport);
  return (
    <Dialog id="support" open={open} onClose={close} title="Support now">
      <SupportContent onNavigate={close} />
    </Dialog>
  );
}
