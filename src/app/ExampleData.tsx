import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { announce } from '../a11y/announce';
import { exampleState } from '../content/exampleData';
import { backupFileName, downloadTextFile, serialiseBackup } from '../storage/backup';
import { useStore } from '../storage/store';
import { Dialog } from './Dialog';

/** A link-style control that fills the app with clearly labelled example answers. */
export function LoadExampleData({ className = 'btn-link' }: { className?: string }) {
  const data = useStore((s) => s.data);
  const replaceAll = useStore((s) => s.replaceAll);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const hasReal = Object.keys(data.answers).length > 0 && !data.flags.example;

  const load = () => {
    replaceAll(exampleState(data));
    setConfirm(false);
    announce('Example data loaded');
    navigate('/results');
  };

  return (
    <>
      <button type="button" className={className} onClick={() => (hasReal ? setConfirm(true) : load())}>Try it with example data</button>
      <Dialog id="example" open={confirm} onClose={() => setConfirm(false)} title="Replace your answers with example data?">
        <p>This swaps the answers on this device for made-up example answers, so you can look around. Your own answers will be gone unless you save a backup first.</p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => downloadTextFile(backupFileName(), serialiseBackup(data))}>Save backup first</button>
          <button type="button" className="btn btn-primary" onClick={load}>Use example data</button>
          <button type="button" className="btn" onClick={() => setConfirm(false)}>Cancel</button>
        </div>
      </Dialog>
    </>
  );
}
