// SPDX-License-Identifier: Apache-2.0
// Tests for the DOM and form helpers (the pilot's vf.common.js, renamed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup-dom.js';
import vf, * as named from '../src/vfunc.js';

test('the default export and the named exports expose the same API', () => {
  for (const key of ['vfunc', '$', '$$', 'el', 'node', 'frag', 'idMap', 'form', 'esc', 'nl2br', 'safeUrl', 'version']) {
    assert.ok(key in vf, key);
    assert.equal(named[key], vf[key], key);
  }
  assert.equal(typeof vf.version, 'string');
});

test('removed pilot APIs are gone', () => {
  for (const key of ['_vfnode', 'escapeAttr', 'com']) assert.equal(key in vf, false, key);
  assert.equal(globalThis.window.vf, undefined, 'the ESM source does not write window.vf');
});

test('$ and $$ search the document or a given root', () => {
  document.body.innerHTML = '<ul id="list"><li>a</li><li>b</li></ul><p><li>c</li></p>';
  const list = vf.$('#list');
  assert.equal(list.id, 'list');
  assert.equal(vf.$$('li').length, 3);
  const inList = vf.$$('li', list);
  assert.ok(Array.isArray(inList));
  assert.equal(inList.length, 2);
  document.body.innerHTML = '';
});

test('node returns the first element; frag keeps every top-level node', () => {
  const n = vf.node(' text <b>x</b><i>y</i>');
  assert.equal(n.tagName, 'B');
  assert.equal(vf.node(''), null);
  const f = vf.frag('a<b>x</b>c');
  assert.equal(f.childNodes.length, 3);
});

test('idMap maps descendant ids only', () => {
  const root = vf.node('<div id="root"><p id="a"><span id="b"></span></p></div>');
  const map = vf.idMap(root);
  assert.deepEqual(Object.keys(map).sort(), ['a', 'b']);
});

function buildForm() {
  return vf.node(`<form>
    <input id="name" value="kim">
    <input id="email" type="email" value="a@b.c">
    <input id="pw" type="password" value="secret">
    <input id="agree" type="checkbox" checked>
    <input id="token" type="hidden" value="t">
    <textarea id="memo">hello</textarea>
    <select id="grade" user-default="1"><option value="a">A</option><option value="b" selected>B</option></select>
    <select id="tags" multiple><option value="x" selected>X</option><option value="y" selected>Y</option></select>
    <button id="go" type="button">go</button>
  </form>`);
}

test('form.values reads a root element or an id map', () => {
  const f = buildForm();
  const values = vf.form.values(f);
  assert.deepEqual(values, {
    name: 'kim', email: 'a@b.c', pw: 'secret', agree: true, token: 't',
    memo: 'hello', grade: 'b', tags: ['x', 'y']
  });
  assert.deepEqual(vf.form.values({ name: f.querySelector('#name') }), { name: 'kim' });
  assert.equal('pw' in vf.form.values(f, { skipPassword: true }), false);
});

test('form.reset clears every value input type, keeps hidden, applies user-default', () => {
  const f = buildForm();
  const values = vf.form.reset(f);
  assert.equal(values.name, '');
  assert.equal(values.email, '', 'email inputs are cleared too (the pilot only cleared text/password)');
  assert.equal(values.pw, '');
  assert.equal(values.agree, false);
  assert.equal(values.token, 't');
  assert.equal(values.memo, '');
  assert.equal(values.grade, 'b', 'user-default="1" selects the second option');
});
