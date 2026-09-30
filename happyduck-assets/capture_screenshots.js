const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseDir = __dirname;
const htmlUrl = 'file:///' + path.join(baseDir, 'mock_ui.html').replace(/\\/g, '/');

const states = [
  { id: 'ui_01', file: 'ui_01_smartcut_empty.png' },
  { id: 'ui_02', file: 'ui_02_smartcut_waveform.png' },
  { id: 'ui_03', file: 'ui_03_smartcut_repetition_mode.png' },
  { id: 'ui_04', file: 'ui_04_smartcut_silence_mode.png' },
  { id: 'ui_05', file: 'ui_05_smartcut_progress.png' },
  { id: 'ui_06', file: 'ui_06_caption_templates.png' },
  { id: 'ui_07', file: 'ui_07_caption_generating.png' },
  { id: 'ui_08', file: 'ui_08_caption_done_edit_button.png' },
  { id: 'ui_09', file: 'ui_09_caption_editor.png' }
];

console.log('Capturing 9 UI screenshots using Chrome headless (420x600 @ 2x)...');

for (const s of states) {
  const targetUrl = `${htmlUrl}?state=${s.id}&clean=1`;
  const outFile = path.join(baseDir, s.file);
  try {
    execFileSync(chromePath, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=420,600',
      '--device-scale-factor=2',
      `--screenshot=${outFile}`,
      targetUrl
    ]);
    console.log(`[OK] Generated: ${s.file}`);
  } catch (err) {
    console.error(`[ERR] Failed ${s.id}:`, err.message);
  }
}

console.log('All screenshots captured!');
