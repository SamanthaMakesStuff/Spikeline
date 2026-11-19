// Runs before first paint (loaded synchronously from <head>) so there is no flash of the wrong theme.
// Reads the saved settings from localStorage and sets attributes on <html>. Keep in step with src/design/theme.ts.
(function () {
  var root = document.documentElement;
  var s = {};
  try {
    var raw = window.localStorage.getItem('spikeline:v1');
    if (raw) s = (JSON.parse(raw) || {}).settings || {};
  } catch (e) {}
  var colours = s.colours || 'bright';
  var bg = s.background || 'system';
  var mode = bg;
  if (bg === 'system') {
    mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', colours + '-' + mode);
  root.setAttribute('data-font', s.font || 'default');
  root.setAttribute('data-lines', s.lineSpacing || 'normal');
  root.setAttribute('data-letters', s.letterSpacing || 'normal');
  root.setAttribute('data-motion', s.motion || 'off');
  root.style.setProperty('--text-scale', String((s.textSize || 100) / 100));
})();
