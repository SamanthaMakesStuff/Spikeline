import { Link } from 'react-router-dom';
import { usePageTitle } from '../app/usePageTitle';

export function ComingSoon({ title }: { title: string }) {
  usePageTitle(title);
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>{title}</h1>
      <p>This part isn’t built yet.</p>
      <p><Link to="/results" className="btn">Back to your profile</Link></p>
    </div>
  );
}
