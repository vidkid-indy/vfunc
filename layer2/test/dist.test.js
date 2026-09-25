// SPDX-License-Identifier: Apache-2.0
// Smoke tests of the built layer 2 files in layer2/dist (run `npm run build` first; dist is committed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { Window } from 'happy-dom';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const file = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

/** Runs <script> files in a fresh page; returns its window and the console calls. */
function loadScripts(paths) {
  const page = new Window({ url: 'https://example.test/' });
  const logs = { warn: [], error: [] };
  const sandbox = {
    window: page, self: page, document: page.document, navigator: page.navigator, setTimeout: setTimeout,
    console: { warn: (...a) => logs.warn.push(a.join(' ')), error: (...a) => logs.error.push(a.join(' ')), log: () => {} }
  };
  for (const path of paths) runInNewContext(file(path), sandbox, { filename: path });
  return { vf: page.vf, page: page, logs: logs };
}

const LAYER1 = 'layer1/dist/';
const LAYER2 = 'layer2/dist/';

test('layer 2 files carry the package version in their banner', () => {
  for (const name of ['vfunc-ui.js', 'vfunc-ui.min.js', 'vfunc-ui.esm.js', 'vfunc-ui.esm.min.js', 'vfunc-ui.legacy.min.js',
    'vfunc-ui.locale.ko.js', 'vfunc-all.min.js', 'vfunc-ui.css', 'vfunc-ui.legacy.css']) {
    assert.ok(file(LAYER2 + name).startsWith('/*! vfunc-ui (vfunc.js layer 2) v' + pkg.version + ' | Apache-2.0') ||
      file(LAYER2 + name).startsWith('/*! vfunc.js v' + pkg.version), name);
  }
});

test('vfunc-ui.js joins the window.vf of vfunc.js; the ko bundle adds defaults', () => {
  for (const [engine, ui] of [['vfunc.js', 'vfunc-ui.js'], ['vfunc.min.js', 'vfunc-ui.min.js'], ['vfunc.legacy.min.js', 'vfunc-ui.legacy.min.js']]) {
    const { vf, page, logs } = loadScripts([LAYER1 + engine, LAYER2 + ui, LAYER2 + 'vfunc-ui.locale.ko.js']);
    assert.equal(typeof vf.vsButton, 'function', ui);
    const holder = page.document.createElement('div');
    holder.innerHTML = String(vf.vsButton({ label: 'Go', loading: true }));
    assert.equal(holder.querySelector('button').getAttribute('data-variant'), 'secondary', ui);
    assert.equal(vf.t('common.loading'), 'Loading', ui);
    assert.deepEqual(logs.warn.concat(logs.error), [], ui);
  }
});

test('vfunc-ui.js without vfunc.js stops with a clear error', () => {
  assert.throws(() => loadScripts([LAYER2 + 'vfunc-ui.js']), /load vfunc\.js before this file/);
});

test('vfunc-all.js files hold both layers in one <script>', () => {
  for (const name of ['vfunc-all.js', 'vfunc-all.min.js', 'vfunc-all.legacy.min.js']) {
    const { vf } = loadScripts([LAYER2 + name]);
    assert.equal(typeof vf.vfunc, 'function', name);
    assert.equal(typeof vf.vsButton, 'function', name);
    assert.equal(vf.version, pkg.version, name);
  }
});

test('the minified files have no development warnings', () => {
  const { vf, logs } = loadScripts([LAYER1 + 'vfunc.min.js', LAYER2 + 'vfunc-ui.min.js']);
  vf.vsButton({ label: 'x', variant: 'huge' });
  assert.deepEqual(logs.warn, []);
  assert.doesNotMatch(file(LAYER2 + 'vfunc-ui.min.js'), /is not one of/);
});

test('the ES modules import the engine file that matches them (one engine instance)', () => {
  assert.match(file(LAYER2 + 'vfunc-ui.esm.js'), /from "\.\.\/\.\.\/layer1\/dist\/vfunc\.esm\.js"/);
  assert.match(file(LAYER2 + 'vfunc-ui.esm.min.js'), /from"\.\.\/\.\.\/layer1\/dist\/vfunc\.esm\.min\.js"/);
  assert.match(file(LAYER2 + 'vfunc-ui.locale.ko.esm.min.js'), /\.\.\/\.\.\/layer1\/dist\/vfunc\.esm\.min\.js/);
});

test('the IE CSS has no custom properties, cascade layers or logical properties', () => {
  const legacy = file(LAYER2 + 'vfunc-ui.legacy.css');
  assert.doesNotMatch(legacy, /var\(|@layer/);
  assert.doesNotMatch(legacy, /(^|[;{\s])(?:[a-z-]+-)?(?:inline|block)(?:-[a-z-]+)?\s*:/m, 'logical property');
  assert.match(legacy, /\.vf-visually-hidden \{/);
  const modern = file(LAYER2 + 'vfunc-ui.css');
  assert.match(modern, /@layer vf\.base, vf\.components;/);
});
