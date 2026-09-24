// SPDX-License-Identifier: Apache-2.0
// Phase 2 component features: lifecycle hooks, refs, data-vf-keep, focus restore, vf.attach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flush, click, captureWarnings } from './setup-dom.js';
import vf from '../src/vfunc.js';

const { html } = vf;

test('onMount runs when mount puts the element in a parent, once', async () => {
  const calls = [];
  const host = document.createElement('div');
  const c = vf.vfunc({ innerHTML: 'x', onMount: (inst) => calls.push(inst === c) });
  await c.mount(host);
  await c.mount(host);
  assert.deepEqual(calls, [true]);
});

test('onUpdate runs after every refresh; onDestroy runs before removal', async () => {
  const log = [];
  const host = document.createElement('div');
  const c = vf.vfunc({
    state: { v: 0 },
    render: (s) => html`<b>${s.v}</b>`,
    onUpdate: (inst) => log.push('update:' + inst.$node.textContent),
    onDestroy: (inst) => log.push('destroy:' + (inst.$node.parentNode === host))
  });
  await c.mount(host);
  c.v = 1;
  await flush();
  c.destroy();
  c.destroy();
  assert.deepEqual(log, ['update:1', 'destroy:true']);
});

test('a throwing hook goes to onError and does not break the engine', () => {
  const errors = [];
  const original = console.error;
  console.error = () => {};
  try {
    const c = vf.vfunc({ innerHTML: 'x', onMount: () => { throw new Error('m'); }, onError: (e) => errors.push(e.message) });
    c.mount(document.createElement('div'));
  } finally { console.error = original; }
  assert.deepEqual(errors, ['m']);
});

test('refs map data-ref elements and are refreshed', async () => {
  const c = vf.vfunc({
    state: { n: 1 },
    render: (s) => html`<input data-ref="field"><span data-ref="count">${s.n}</span>`
  });
  assert.equal(c.refs.field.tagName, 'INPUT');
  const before = c.refs.count;
  c.n = 2;
  await flush();
  assert.notEqual(c.refs.count, before);
  assert.equal(c.refs.count.textContent, '2');
});

test('data-vf-keep keeps an element (and what a library drew in it) across refreshes', async () => {
  const c = vf.vfunc({
    state: { title: 'a' },
    render: (s) => html`<h2>${s.title}</h2><div data-vf-keep="chart" class="host"></div>`
  });
  const host = c.$node.querySelector('[data-vf-keep="chart"]');
  host.appendChild(document.createElement('canvas')); // a third-party widget draws here
  c.title = 'b';
  await flush();
  const after = c.$node.querySelector('[data-vf-keep="chart"]');
  assert.equal(after, host, 'same element');
  assert.equal(after.querySelector('canvas') !== null, true, 'library content survived');
  assert.equal(c.$node.querySelector('h2').textContent, 'b');
});

test('data-vf-keep works with replaceRoot and warns on duplicate keys', async () => {
  const c = vf.vfunc({
    replaceRoot: true,
    state: { n: 0 },
    render: (s) => html`<section><p>${s.n}</p><div data-vf-keep="k"></div><div data-vf-keep="k"></div></section>`
  });
  const kept = c.$node.querySelector('[data-vf-keep="k"]');
  let warnings;
  await (async () => {
    warnings = captureWarnings(() => c.refresh());
  })();
  assert.equal(c.$node.querySelector('[data-vf-keep="k"]'), kept);
  assert.equal(warnings.length, 1);
});

test('focus and caret position inside the component survive a refresh', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const c = vf.vfunc({
    state: { hint: 'a' },
    render: (s) => html`<input id="name" value="hello"><small>${s.hint}</small>`
  });
  await c.mount(host);
  const input = c.ids.name;
  input.focus();
  input.setSelectionRange(2, 3);
  c.hint = 'b';
  await flush();
  assert.notEqual(c.ids.name, input, 'the input was re-rendered');
  assert.equal(document.activeElement, c.ids.name, 'focus moved to the new input');
  assert.equal(c.ids.name.selectionStart, 2);
  host.remove();
});

test('vf.attach adopts published markup without re-rendering it', () => {
  document.body.innerHTML = '<form id="search"><input id="q" value="typed"><button id="go" type="button">Go</button></form>';
  const original = document.getElementById('search');
  const seen = [];
  const mounted = [];
  const c = vf.attach('#search', {
    state: { count: 0 },
    events: [{ id: 'go', eventType: 'click', onEvent: (e) => { e.sender.count++; seen.push(e.sender.ids.q.value); } }],
    onMount: () => mounted.push(true)
  });
  assert.equal(c.$node, original, 'the same element, not a copy');
  click(document.getElementById('go'));
  assert.deepEqual(seen, ['typed']);
  assert.equal(c.count, 1);
  assert.deepEqual(mounted, [true]);
  document.body.innerHTML = '';
});

test('vf.attach with render keeps the element and renders only its inside', async () => {
  document.body.innerHTML = '<p>before</p><section id="slot" class="panel" aria-live="polite" data-x="1">old</section><p>after</p>';
  const original = document.getElementById('slot');
  const updates = [];
  original.addEventListener('custom', () => updates.push('listener kept'));
  const c = vf.attach('#slot', { state: { n: 1 }, render: (s) => html`<output>${s.n}</output>` });
  assert.equal(c.$node, original, 'the same element');
  assert.equal(original.outerHTML, '<section id="slot" class="panel" aria-live="polite" data-x="1"><output>1</output></section>');
  c.n = 2;
  await flush();
  assert.equal(document.body.children[1], original, 'still the same element after a refresh');
  assert.equal(original.innerHTML, '<output>2</output>');
  original.dispatchEvent(new Event('custom'));
  assert.deepEqual(updates, ['listener kept']);
  document.body.innerHTML = '';
});

test('vf.attach with render parses rows in the context of the target tag', async () => {
  document.body.innerHTML = '<table><tbody id="rows"><tr><td>old</td></tr></tbody></table>';
  const c = vf.attach('#rows', { state: { items: ['a', 'b'] }, render: (s) => html`${s.items.map((x) => html`<tr><td>${x}</td></tr>`)}` });
  assert.equal(c.$node.tagName, 'TBODY');
  assert.equal(document.querySelectorAll('#rows tr').length, 2);
  c.items = ['a', 'b', 'c'];
  await flush();
  assert.equal(document.querySelectorAll('table tbody tr').length, 3, 'no second tbody or table');
  document.body.innerHTML = '';
});

test('vf.attach with replaceRoot: true replaces the element with the first rendered element', async () => {
  document.body.innerHTML = '<p>before</p><div id="slot">old</div><p>after</p>';
  const c = vf.attach('#slot', { replaceRoot: true, state: { n: 1 }, render: (s) => html`<output>${s.n}</output>` });
  assert.equal(document.body.children[1], c.$node);
  assert.equal(c.$node.tagName, 'OUTPUT');
  c.n = 2;
  await flush();
  assert.equal(document.body.children[1].textContent, '2');
  document.body.innerHTML = '';
});

test('vf.attach warns when render returns the target element itself', () => {
  document.body.innerHTML = '<div id="box"></div>';
  let c;
  const warnings = captureWarnings(() => { c = vf.attach('#box', { render: () => html`<div id="box">x</div>` }); });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /render returned the target element itself/);
  assert.ok(c);
  document.body.innerHTML = '';
});

test('vf.attach keeps data-vf-keep elements of the published markup on the first render', () => {
  document.body.innerHTML = '<div id="w"><div data-vf-keep="map" id="map">widget</div></div>';
  const widget = document.getElementById('map');
  vf.attach('#w', { render: () => html`<h2>Map</h2><div data-vf-keep="map"></div>` });
  assert.equal(document.getElementById('map'), widget);
  assert.equal(document.querySelector('#w h2').textContent, 'Map');
  document.body.innerHTML = '';
});

test('vf.attach returns null and warns when the target is missing', () => {
  let result;
  const warnings = captureWarnings(() => { result = vf.attach('#does-not-exist', {}); });
  assert.equal(result, null);
  assert.equal(warnings.length, 1);
});
