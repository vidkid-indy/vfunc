// SPDX-License-Identifier: Apache-2.0
// The official keyboard shortcut plugin (layer1/plugins/shortcut.js, D-030).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window } from './setup-dom.js';
import vf from '../src/vfunc.js';
import vfShortcut from '../plugins/shortcut.js';

function press(target, key, init) {
  const event = new window.KeyboardEvent('keydown', Object.assign({ key: key, bubbles: true, cancelable: true }, init || {}));
  target.dispatchEvent(event);
  return event;
}

function setup(options) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  return { root: root, api: vfShortcut.install(vf, Object.assign({ target: root }, options)) };
}

test('the plugin installs through vf.use into vf.ext.shortcut', () => {
  const api = vf.use(vfShortcut, { target: document.createElement('div') });
  assert.equal(vf.ext.shortcut, api);
  assert.equal(typeof api.add, 'function');
  api.destroy();
});

test('combos are canonical: modifier order, mod, aliases, case, symbols ignore shift', () => {
  const { api } = setup({ apple: false });
  assert.equal(api.parse('Shift+Ctrl+K'), 'ctrl+shift+k');
  assert.equal(api.parse('mod+k'), 'ctrl+k');
  assert.equal(api.parse('esc'), 'escape');
  assert.equal(api.parse('shift+?'), '?');
  assert.equal(api.parse('ctrl++'), 'ctrl++');
  assert.equal(api.parse('ctrl+a+b'), '', 'two keys');
  assert.equal(api.parse('ctrl'), '', 'no key');
  assert.equal(setup({ apple: true }).api.parse('mod+k'), 'meta+k');
  api.destroy();
});

test('a matching keydown runs the handler and prevents the default; others do not', () => {
  const { root, api } = setup({ apple: false });
  const calls = [];
  api.add('mod+s', (event, info) => calls.push(info), { label: 'Save' });
  const hit = press(root, 's', { ctrlKey: true });
  assert.deepEqual(calls, [{ combo: 'ctrl+s', label: 'Save' }]);
  assert.equal(hit.defaultPrevented, true);
  const miss = press(root, 's');
  assert.equal(calls.length, 1);
  assert.equal(miss.defaultPrevented, false);
  press(root, 'S', { ctrlKey: true, shiftKey: true });
  assert.equal(calls.length, 1, 'ctrl+shift+s is another combo');
  api.add('?', () => calls.push('help'));
  press(root, '?', { shiftKey: true });
  assert.equal(calls[1], 'help', 'shift+/ types ? and matches "?"');
  api.add('esc', () => calls.push('esc'), { preventDefault: false });
  const esc = press(root, 'Esc');
  assert.equal(calls[2], 'esc', 'the IE11 key name');
  assert.equal(esc.defaultPrevented, false);
  api.destroy();
});

test('keys in inputs and IME compositions are ignored unless allowed', () => {
  const { root, api } = setup({ apple: false });
  const input = document.createElement('input');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  root.appendChild(input);
  root.appendChild(checkbox);
  const calls = [];
  api.add('k', () => calls.push('k'));
  api.add('escape', () => calls.push('esc'), { allowInInput: true });
  press(input, 'k');
  assert.deepEqual(calls, []);
  press(checkbox, 'k');
  assert.deepEqual(calls, ['k'], 'a checkbox is not a text field');
  press(input, 'Escape');
  assert.deepEqual(calls, ['k', 'esc']);
  press(root, 'k', { isComposing: true });
  press(root, 'k', { keyCode: 229 });
  assert.deepEqual(calls, ['k', 'esc'], 'IME composition');
  api.destroy();
});

test('the newest shortcut of a combo wins; remove, the returned off function, list, destroy', () => {
  const { root, api } = setup({ apple: false });
  const calls = [];
  const global = () => calls.push('global');
  api.add('escape', global, { label: 'Close panel' });
  const off = api.add('escape', () => calls.push('dialog'), { label: 'Close dialog' });
  api.add('mod+k', () => {}, { label: 'Search' });
  press(root, 'Escape');
  assert.deepEqual(calls, ['dialog']);
  assert.deepEqual(api.list(), [{ combo: 'ctrl+k', label: 'Search' }, { combo: 'escape', label: 'Close dialog' }]);
  off();
  press(root, 'Escape');
  assert.deepEqual(calls, ['dialog', 'global']);
  api.remove('esc', global);
  press(root, 'Escape');
  assert.equal(calls.length, 2);
  api.destroy();
  assert.deepEqual(api.list(), []);
  api.add('x', () => calls.push('x'));
  press(root, 'x');
  assert.equal(calls.length, 2, 'no listener after destroy');
});

test('an invalid combo or handler is refused with a warning and a no-op remover', () => {
  const { api } = setup();
  const warnings = [];
  const original = console.warn;
  console.warn = (m) => warnings.push(m);
  let off;
  try { off = api.add('ctrl+a+b', () => {}); } finally { console.warn = original; }
  assert.equal(warnings.length, 1);
  assert.doesNotThrow(off);
  assert.deepEqual(api.list(), []);
  api.destroy();
});
