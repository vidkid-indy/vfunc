// SPDX-License-Identifier: Apache-2.0
// Smoke tests of the built files in layer1/dist (run `npm run build` first; dist is committed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { Window } from 'happy-dom';
import './setup-dom.js';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const distFile = (name) => readFileSync(new URL('../dist/' + name, import.meta.url), 'utf8');

/**
 * Runs <script> builds in a fresh page and returns its window plus the console calls.
 * `before` can prepare window.vf before the scripts run.
 */
function loadScripts(files, before) {
  const page = new Window({ url: 'https://example.test/' });
  const logs = { warn: [], error: [] };
  const consoleStub = {
    warn: (...args) => logs.warn.push(args.join(' ')),
    error: (...args) => logs.error.push(args.join(' ')),
    log: () => {}
  };
  const sandbox = { window: page, self: page, document: page.document, console: consoleStub, setTimeout: setTimeout };
  if (before) before(page);
  for (const file of files) runInNewContext(distFile(file), sandbox, { filename: file });
  return { vf: page.vf, page: page, logs: logs };
}

test('dist files carry the version of package.json in the banner and in vf.version', () => {
  for (const file of ['vfunc.js', 'vfunc.min.js', 'vfunc.esm.js', 'vfunc.esm.min.js']) {
    const text = distFile(file);
    assert.ok(text.startsWith('/*! vfunc.js v' + pkg.version + ' | Apache-2.0'), file + ' banner');
    if (file.indexOf('.min.') > 0) assert.equal(text.indexOf('0.0.0-dev'), -1, file + ' has no dev version');
  }
  assert.equal(loadScripts(['vfunc.min.js']).vf.version, pkg.version);
});

test('the <script> build creates window.vf with read-only official members', () => {
  const { vf, page } = loadScripts(['vfunc.js']);
  assert.equal(typeof vf.vfunc, 'function');
  assert.throws(() => { 'use strict'; vf.html = null; });
  const counter = vf.vfunc({
    state: { count: 1 },
    render: (s) => vf.html`<b data-ref="out">${s.count}</b>`
  });
  counter.mount(page.document.body);
  assert.equal(page.document.body.querySelector('b').textContent, '1');
  counter.count = 2;
  counter.refresh();
  assert.equal(counter.refs.out.textContent, '2');
});

test('the minified build has no development warnings but keeps every security check', () => {
  const { vf, logs } = loadScripts(['vfunc.min.js']);
  const element = vf.el('div', { innerHTML: '<img src=x onerror=alert(1)>', onclick: 'alert(1)' });
  assert.equal(element.innerHTML, '');
  assert.equal(element.onclick, null);
  assert.deepEqual(logs.warn, []);

  const markup = String(vf.html`<a href="${'javascript:alert(1)'}" onclick="${'x'}">${'<i>'}</a>`);
  assert.equal(markup, '<a href="#" onclick="">&lt;i&gt;</a>');
  assert.equal(logs.error.length, 1);
  assert.match(logs.error[0], /blocked an unsafe value/);

  vf.config({ strict: true });
  assert.throws(() => vf.html`<div onclick="${'x'}"></div>`, /blocked an unsafe value/);
});

test('the development build explains what was refused', () => {
  const { vf, logs } = loadScripts(['vfunc.js']);
  vf.el('div', { innerHTML: 'x' });
  assert.equal(logs.warn.length, 1);
  assert.match(logs.warn[0], /vf\.el: "innerHTML" is not allowed/);
});

test('the <script> build joins an existing window.vf without replacing its members', () => {
  const { vf, logs } = loadScripts(['vfunc.js'], (page) => {
    page.vf = { ui: 'layer2', version: 'mine' };
  });
  assert.equal(vf.ui, 'layer2');
  assert.equal(vf.version, 'mine');
  assert.equal(typeof vf.vfunc, 'function');
  assert.throws(() => { 'use strict'; vf.attach = null; });
  assert.equal(logs.warn.length, 1);
  assert.match(logs.warn[0], /already has version/);
});

test('loading the <script> build twice keeps the first copy', () => {
  const { vf, logs } = loadScripts(['vfunc.min.js', 'vfunc.js']);
  const first = vf.vfunc;
  assert.equal(typeof first, 'function');
  assert.equal(vf.vfunc, first);
  assert.equal(logs.warn.length, 1);
  assert.match(logs.warn[0], /is already loaded/);
});

test('the ES module builds export the same API and do not touch window.vf', async () => {
  for (const file of ['vfunc.esm.js', 'vfunc.esm.min.js']) {
    const mod = await import('../dist/' + file);
    const vf = mod.default;
    assert.equal(vf.version, pkg.version);
    for (const key of Object.keys(vf)) assert.equal(mod[key], vf[key], file + ' export ' + key);
    assert.equal(globalThis.window.vf, undefined);
  }
});
