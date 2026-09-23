// SPDX-License-Identifier: Apache-2.0
// Security tests for Phase 1 (plan section M: S3, S5, and the pilot's sanitizeUrl rule).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flush, captureWarnings } from './setup-dom.js';
import vf from '../src/vfunc.js';

test('esc escapes both quote types', () => {
  assert.equal(vf.esc(`<a href="x" title='y'>&</a>`), '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  assert.equal(vf.esc(null), '');
  assert.equal(String(vf.nl2br('a<b>\nc')), 'a&lt;b&gt;<br>c');
  assert.ok(vf.nl2br('x') instanceof vf.SafeHtml, 'nl2br output is trusted by vf.html');
});

test('safeUrl allows relative and http(s)/mailto/tel, blocks other schemes', () => {
  for (const ok of ['/path', './a', '#top', '?q=1', 'page.html', 'https://x.test', 'http://x.test', 'mailto:a@b.c', 'tel:123', '//cdn.test/x']) {
    assert.equal(vf.safeUrl(ok), ok, ok);
  }
  for (const bad of ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)',
                     'java\nscript:x', 'data:text/html,<script>', 'vbscript:x', '\u0001javascript:x']) {
    assert.equal(vf.safeUrl(bad), '#', JSON.stringify(bad));
  }
});

test('opts refuse HTML sinks and string handlers, and sanitize URL properties', () => {
  let c;
  const warnings = captureWarnings(() => {
    c = vf.vfunc({ tag: 'a', opts: { innerHTML: '<img src=x onerror=alert(1)>', onclick: 'alert(1)', href: 'javascript:alert(1)' } });
  });
  assert.equal(c.$node.innerHTML, '');
  assert.equal(c.$node.getAttribute('onclick'), null);
  assert.equal(c.$node.getAttribute('href'), '#');
  assert.equal(warnings.length, 2);
});

test('function handlers in opts are still allowed', () => {
  let clicked = false;
  const c = vf.vfunc({ tag: 'button', opts: { onclick: () => { clicked = true; } } });
  c.$node.click();
  assert.equal(clicked, true);
});

test('vf.el applies the same property rules', () => {
  let a;
  captureWarnings(() => { a = vf.el('a', { href: 'javascript:x', outerHTML: '<b>', textContent: 'ok' }); });
  assert.equal(a.getAttribute('href'), '#');
  assert.equal(a.textContent, 'ok');
});

test('setState ignores __proto__ / constructor / prototype from outside JSON', async () => {
  const c = vf.vfunc({ state: {}, render: () => '' });
  const payload = JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"x": 1}, "safe": 1}');
  captureWarnings(() => c.setState(payload));
  await flush();
  assert.equal({}.polluted, undefined, 'Object.prototype is not polluted');
  assert.equal(Object.getPrototypeOf(c.state), Object.prototype);
  assert.equal(c.state.safe, 1);
  assert.equal(hasOwn(c.state, '__proto__'), false);
  assert.equal(typeof c.constructor, 'function', 'the instance constructor is untouched');
});

test('reserved state keys do not shadow engine members', async () => {
  let c;
  const warnings = captureWarnings(() => {
    c = vf.vfunc({ state: { refresh: 'no', mount: 'no', _cfg: 'no', title: 'yes' }, render: (s) => s.title });
  });
  assert.equal(typeof c.refresh, 'function');
  assert.equal(typeof c.mount, 'function');
  assert.equal(c.title, 'yes');
  assert.equal(c.state.refresh, 'no');
  assert.ok(warnings.length >= 3);
});

test('reserved method names and element ids are refused with a warning', () => {
  let c;
  const warnings = captureWarnings(() => {
    c = vf.vfunc({ methods: { destroy() { return 'mine'; } }, innerHTML: '<i id="setState"></i><i id="hasOwnProperty"></i>' });
  });
  assert.equal(typeof c.destroy, 'function');
  assert.notEqual(c.destroy(), 'mine');
  assert.equal(typeof c.setState, 'function');
  assert.equal(c.methods.destroy(), 'mine');
  assert.ok(warnings.length >= 3);
});

test('ids and slots named like inherited members do not resolve to Object.prototype', () => {
  const child = vf.vfunc({ innerHTML: 'c' });
  const c = vf.vfunc({
    innerHTML: '<p>x</p>',
    events: [{ id: 'toString', eventType: 'click', onEvent: () => {} }],
    childs: [{ targetId: 'valueOf', component: child }]
  });
  assert.equal(c._listeners.length, 0, 'no listener bound to an inherited function');
  assert.equal(c.$node.lastChild, child.$node, 'unknown slot falls back to the root');
});

test('idMap skips dangerous ids', () => {
  const root = vf.node('<div><i id="__proto__"></i><i id="ok"></i></div>');
  const map = vf.idMap(root);
  assert.deepEqual(Object.keys(map), ['ok']);
  assert.equal(Object.getPrototypeOf(map), Object.prototype);
});

function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
