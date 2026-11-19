import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { announce } from '../a11y/announce';
import { backupFileName, downloadTextFile, serialiseBackup } from '../storage/backup';
import { useStore } from '../storage/store';
import { Dialog } from './Dialog';

export function DeleteEverything() {
  const [open, setOpen] = useState(false);
  const data = useStore((s) => s.data);
  const wipe = useStore((s) => s.deleteEverything);
  const navigate = useNavigate();
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        <Trash2 size={20} strokeWidth={2} aria-hidden="true" />
        Delete everything
      </button>
      <Dialog id="delete" open={open} onClose={() => setOpen(false)} title="Delete everything?">
        <p>This removes all your answers, notes and settings from this device. It can’t be undone unless you have a backup.</p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => downloadTextFile(backupFileName(), serialiseBackup(data))}>Save backup first</button>
          <button type="button" className="btn btn-danger" onClick={() => {
            wipe();
            setOpen(false);
            announce('Your answers were deleted from this device');
            navigate('/');
          }}>Yes, delete my answers</button>
          <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </Dialog>
    </>
  );
}
