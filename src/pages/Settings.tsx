import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadExampleData } from '../app/ExampleData';
import { DeleteEverything } from '../app/DeleteEverything';
import { RestoreBackup, SaveBackupButton } from '../app/BackupControls';
import { BACKGROUND_OPTIONS, COLOUR_OPTIONS, OptionGroup } from '../app/ThemePicker';
import { usePageTitle } from '../app/usePageTitle';
import { useStore } from '../storage/store';
import type { Settings as S } from '../storage/schema';

export function Settings() {
  usePageTitle('Settings');
  const s = useStore((x) => x.data.settings);
  const set = useStore((x) => x.setSettings);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#delete') document.getElementById('delete')?.scrollIntoView();
  }, [hash]);

  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>Settings</h1>
      <OptionGroup name="s-colours" legend="Colours" options={COLOUR_OPTIONS} value={s.colours} onChange={(colours) => set({ colours })} />
      <OptionGroup name="s-bg" legend="Background" options={BACKGROUND_OPTIONS} value={s.background} onChange={(background) => set({ background })} />
      <OptionGroup<S['font']> name="s-font" legend="Font" value={s.font} onChange={(font) => set({ font })} options={[
        { value: 'default', label: 'Lexend and Bricolage Grotesque' },
        { value: 'hyperlegible', label: 'Atkinson Hyperlegible' },
        { value: 'dyslexic', label: 'OpenDyslexic' },
        { value: 'system', label: 'System' },
      ]} />
      <OptionGroup name="s-size" legend="Text size" value={String(s.textSize)} onChange={(v) => set({ textSize: Number(v) as S['textSize'] })}
        options={[100, 125, 150, 175, 200].map((n) => ({ value: String(n), label: `${n}%` }))} />
      <OptionGroup<S['lineSpacing']> name="s-lines" legend="Line spacing" value={s.lineSpacing} onChange={(lineSpacing) => set({ lineSpacing })} options={[{ value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }]} />
      <OptionGroup<S['letterSpacing']> name="s-letters" legend="Letter spacing" value={s.letterSpacing} onChange={(letterSpacing) => set({ letterSpacing })} options={[{ value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }]} />
      <OptionGroup<S['motion']> name="s-motion" legend="Gentle motion" value={s.motion} onChange={(motion) => set({ motion })} options={[{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }]} />
      <OptionGroup<S['layout']> name="s-layout" legend="Questions per screen" value={s.layout} onChange={(layout) => set({ layout })} options={[
        { value: 'auto', label: 'Automatic' }, { value: 'one', label: 'One at a time' }, { value: 'few', label: 'A few at a time' },
      ]} />

      <section className="stack" aria-labelledby="data-h">
        <h2 id="data-h" style={{ fontSize: '1.5rem' }}>Your answers</h2>
        <SaveBackupButton />
        <div className="stack-sm"><div><LoadExampleData className="btn" /></div><p className="hint prose">Fills the app with made-up answers so you can look at the results. You’ll be asked before anything of yours is replaced.</p></div>
        <RestoreBackup />
        <div id="delete" className="stack-sm" tabIndex={-1}>
          <DeleteEverything />
          <p className="hint prose">This removes everything from this device. If you’re on a shared computer, save a backup first if you want to keep your answers.</p>
        </div>
      </section>
    </div>
  );
}
