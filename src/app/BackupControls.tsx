import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { announce } from '../a11y/announce';
import { BACKUP_EXPLAINER } from '../content/copy';
import { backupFileName, downloadTextFile, formatDate, parseBackup, serialiseBackup, type ParsedBackup } from '../storage/backup';
import { useStore } from '../storage/store';
import { Dialog } from './Dialog';

export function SaveBackupButton() {
  const data = useStore((s) => s.data);
  return (
    <div className="stack-sm">
      <div>
        <button type="button" className="btn" onClick={() => {
          downloadTextFile(backupFileName(), serialiseBackup(data));
          announce('Backup saved to your downloads');
        }}>
          <Download size={20} strokeWidth={2} aria-hidden="true" />
          Save backup
        </button>
      </div>
      <p className="hint prose">{BACKUP_EXPLAINER}</p>
    </div>
  );
}

export function RestoreBackup({ onRestored, variant = 'default' }: { onRestored?: () => void; variant?: 'default' | 'quiet' }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceAll = useStore((s) => s.replaceAll);
  const [parsed, setParsed] = useState<Extract<ParsedBackup, { ok: true }> | null>(null);
  const [error, setError] = useState('');

  const onFile = async (file?: File) => {
    setError('');
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseBackup(text);
      if (!result.ok) setError('We couldn’t read that file. Check that it’s a Spikeline backup file, then try again.');
      else setParsed(result);
    } catch {
      setError('We couldn’t read that file. Check that it’s a Spikeline backup file, then try again.');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="stack-sm">
      <div>
        <button type="button" className={variant === 'quiet' ? 'btn' : 'btn'} onClick={() => inputRef.current?.click()}>
          <Upload size={20} strokeWidth={2} aria-hidden="true" />
          Restore backup
        </button>
        <input ref={inputRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Choose a backup file" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {error && <p role="alert" className="notice">{error}</p>}
      <Dialog id="restore" open={!!parsed} onClose={() => setParsed(null)} title="Restore this backup?">
        {parsed && (
          <>
            <p>
              This backup has <span className="tabular">{parsed.answerCount}</span> {parsed.answerCount === 1 ? 'answer' : 'answers'}, last changed {formatDate(parsed.updatedAt)}. Replace what’s on this device?
            </p>
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={() => {
                replaceAll(parsed.state);
                setParsed(null);
                announce('Backup restored');
                onRestored?.();
              }}>Replace</button>
              <button type="button" className="btn" onClick={() => setParsed(null)}>Cancel</button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
