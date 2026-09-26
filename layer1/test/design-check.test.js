// SPDX-License-Identifier: Apache-2.0
//
// The starter's design-check tool (layer1/starter/tools/design-check.mjs, plan K-7): each rule on a
// small project in a temporary folder, the WCAG math, and our own starter, tokens and layer 2
// examples passing it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designCheck, parseColor, contrast, readTokens, checkContrast } from '../starter/tools/design-check.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TOKENS = readFileSync(join(ROOT, 'layer1/css/vfunc.tokens.css'), 'utf8');

function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'vf-design-check-'));
  for (const name of Object.keys(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true });
    writeFileSync(join(dir, name), files[name]);
  }
  return dir;
}

const rules = (result) => result.findings.filter((f) => f.level === 'error').map((f) => f.rule + ' ' + f.file + ':' + (f.line || ''));

test('colors and the WCAG contrast ratio', () => {
  assert.deepEqual(parseColor('#fff'), [255, 255, 255, 1]);
  assert.deepEqual(parseColor('#0f172a'), [15, 23, 42, 1]);
  assert.deepEqual(parseColor('rgba(15, 23, 42, 0.5)'), [15, 23, 42, 0.5]);
  assert.equal(parseColor('var(--x)'), null);
  assert.equal(contrast([0, 0, 0], [255, 255, 255]).toFixed(1), '21.0');
  assert.equal(contrast([255, 255, 255], [37, 99, 235]).toFixed(2), '5.17');
});

test('vfunc.tokens.css passes the contrast pairs in light and dark', () => {
  assert.deepEqual(checkContrast(readTokens(TOKENS), 'tokens'), [], 'every pair is a plain color and passes, in both themes');
});

test('each rule finds its problem, and the ignore comments work', () => {
  const dir = project({
    'styles/tokens.css': TOKENS,
    'styles/app.css': [
      ':root { --vf-color-primary: #9ca3af; }',                // C1 override: allowed as a value, fails contrast
      '.card { color: var(--vf-color-text); }',
      '.card__title { color: #888; }',                          // raw-color line 3
      '.note { background: rgb(1, 2, 3); } /* design-check-ignore */',
      ''
    ].join('\n'),
    'app.js': [
      "const a = document.querySelector('.card');",            // class-selector line 1
      "const b = vf.$('[data-action=\"save\"]');",              // fine
      "vf.vfunc({ delegates: [{ selector: 'button.primary', eventType: 'click' }] });", // class-selector line 3
      "el.style.color = '#ff0000';",                            // raw-color line 4
      'const c = vf.unsafeHtml(markup);',                       // unsafe-html line 5
      '// our own static SVG, no user data',
      'const d = vf.unsafeHtml(icon);',                         // note only
      "const e = '#abc'; // design-check-ignore",
      "const f = document.querySelector('#main > [data-ref=\"list\"]');",
      ''
    ].join('\n'),
    'lib/vfunc.js': "document.querySelector('.ignored-copy');",
    'legacy.css': '/* design-check-ignore-file: IE11 */ body { color: #000; }'
  });
  try {
    const result = designCheck(dir);
    assert.deepEqual(rules(result).sort(), [
      'class-selector app.js:1',
      'class-selector app.js:3',
      'contrast styles/tokens.css:',
      'contrast styles/tokens.css:',
      'contrast styles/tokens.css:',
      'raw-color app.js:4',
      'raw-color styles/app.css:3',
      'unsafe-html app.js:5'
    ]);
    assert.ok(result.findings.some((f) => f.level === 'note' && f.rule === 'unsafe-html' && f.line === 7), 'a commented unsafeHtml is a note');
    assert.ok(result.findings.some((f) => f.rule === 'ignored' && f.file === 'legacy.css'));
    assert.equal(result.errors, 8);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the starter and the layer 2 examples pass', () => {
  const starter = designCheck(join(ROOT, 'layer1/starter'));
  assert.deepEqual(rules(starter), []);
  const examples = designCheck(join(ROOT, 'layer2/examples'), { tokens: '../../layer1/css/vfunc.tokens.css' });
  assert.deepEqual(rules(examples), []);
});
