// SPDX-License-Identifier: Apache-2.0
// Phase 2 component features: lifecycle hooks, refs, data-vf-keep, focus restore, vf.attach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush, click, captureWarnings } from './setup-dom.js';
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

test('instances in childs get onMount once, before their parent, and are destroyed with it', async () => {
  const log = [];
  const hook = (name) => ({
    onMount: () => log.push('mount:' + name),
    onDestroy: (inst) => log.push('destroy:' + name + ':' + document.body.contains(inst.$node))
  });
  const grandchild = vf.vfunc(Object.assign({ innerHTML: 'g' }, hook('g')));
  const child = vf.vfunc(Object.assign({ innerHTML: '<i id="slot"></i>', childs: [{ targetId: 'slot', component: grandchild }] }, hook('c')));
  const plain = document.createElement('span');
  const parent = vf.vfunc(Object.assign({ state: { n: 0 }, render: (s) => html`<p>${s.n}</p>`, childs: [child, plain] }, hook('p')));
  await parent.mount(document.body);
  assert.deepEqual(log, ['mount:g', 'mount:c', 'mount:p']);
  parent.n = 1;
  await flush();
  assert.equal(log.length, 3, 'a refresh re-appends children without onMount');
  parent.destroy();
  assert.deepEqual(log.slice(3), ['destroy:g:true', 'destroy:c:true', 'destroy:p:true'],
    'children first; each onDestroy runs while its own element is still in place');
  assert.equal(document.body.contains(parent.$node), false);
});

test('a child that was mounted on its own, or destroyed before, is not called again', async () => {
  const log = [];
  const early = vf.vfunc({ innerHTML: 'e', onMount: () => log.push('mount:e'), onDestroy: () => log.push('destroy:e') });
  await early.mount(document.createElement('div'));
  const gone = vf.vfunc({ innerHTML: 'x', onMount: () => log.push('mount:x'), onDestroy: () => log.push('destroy:x') });
  gone.destroy();
  const parent = vf.vfunc({ innerHTML: '', childs: [early, gone] });
  const host = document.createElement('div');
  vf.attach(host, { childs: [parent] });
  assert.deepEqual(log, ['mount:e', 'destroy:x'], 'vf.attach mounts children too, once');
  parent.destroy();
  assert.deepEqual(log, ['mount:e', 'destroy:x', 'destroy:e']);
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

test('without id, data-ref or name, focus returns to the same data-action at the same position', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const c = vf.vfunc({
    state: { q: '' },
    render: (s) => html`<input data-action="search" value="${s.q}"><button type="button" data-action="go">1</button><button type="button" data-action="go">2</button><p>${s.q}</p>`,
    delegates: [{ selector: '[data-action="search"]', eventType: 'input', onEvent: (e) => e.sender.setState({ q: e.target.value }) }]
  });
  await c.mount(host);
  const input = c.$node.querySelector('[data-action="search"]');
  input.focus();
  input.value = 'mo';
  input.setSelectionRange(2, 2);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  await flush();
  const fresh = c.$node.querySelector('[data-action="search"]');
  assert.notEqual(fresh, input, 'the input was re-rendered');
  assert.equal(document.activeElement, fresh, 'focus on the new search input');
  assert.equal(fresh.selectionStart, 2);
  const second = c.$node.querySelectorAll('[data-action="go"]')[1];
  second.focus();
  c.q = 'x';
  await flush();
  assert.equal(document.activeElement, c.$node.querySelectorAll('[data-action="go"]')[1], 'the second of the same action');
  host.remove();
});

test('setState takes a function of the state, like vf.store set', async () => {
  const c = vf.vfunc({ state: { n: 1, keep: 'k' }, render: (s) => html`<b>${s.n}</b>` });
  let self = null;
  c.setState(function (s) { self = this; return { n: s.n + 1 }; });
  c.setState((s) => ({ n: s.n + 1 }));
  assert.equal(c.state.n, 3);
  assert.equal(c.state.keep, 'k', 'shallow merge');
  assert.equal(self, c, 'this is the instance');
  await flush();
  assert.equal(c.$node.textContent, '3');
  const warnings = captureWarnings(() => c.setState(42));
  assert.equal(warnings.length, 1, 'a value that is not an object warns');
});

test('destroy() keeps a vf.attach element in the page, so it can be attached again', () => {
  document.body.innerHTML = '<section id="panel" class="panel" aria-live="polite"></section><div id="adopted"><button id="b" type="button">B</button></div>';
  const panel = document.getElementById('panel');
  const destroyed = [];
  const first = vf.attach('#panel', { state: { n: 1 }, render: (s) => html`<p>${s.n}</p>`, onDestroy: () => destroyed.push(true) });
  assert.equal(panel.textContent, '1');
  first.destroy();
  assert.equal(document.getElementById('panel'), panel, 'the element stays');
  assert.equal(panel.innerHTML, '', 'what render drew is gone');
  assert.equal(panel.getAttribute('aria-live'), 'polite');
  assert.deepEqual(destroyed, [true]);
  const again = vf.attach('#panel', { render: () => html`<p>again</p>` });
  assert.ok(again, 'attached again');
  assert.equal(panel.textContent, 'again');

  let clicks = 0;
  const adopted = vf.attach('#adopted', { events: [{ id: 'b', eventType: 'click', onEvent: () => clicks++ }] });
  adopted.destroy();
  click(document.getElementById('b'));
  assert.equal(clicks, 0, 'listeners released');
  assert.equal(document.getElementById('adopted').innerHTML, '<button id="b" type="button">B</button>', 'adopted markup stays');

  document.body.innerHTML = '<div id="slot"></div>';
  const replaced = vf.attach('#slot', { replaceRoot: true, render: () => html`<output id="out">x</output>` });
  replaced.destroy();
  assert.equal(document.getElementById('out'), null, 'replaceRoot: the component root is removed');
});

test('a component without render still gets onUpdate after a state change, once per tick', async () => {
  document.body.innerHTML = '<div id="menu"><button id="toggle" type="button" aria-expanded="false">Menu</button><ul id="list" hidden></ul></div>';
  const button = document.getElementById('toggle');
  let updates = 0;
  const c = vf.attach('#menu', {
    state: { open: false },
    events: [{ id: 'toggle', eventType: 'click', onEvent: (e) => { e.sender.open = !e.sender.open; } }],
    onUpdate: (inst) => {
      updates++;
      inst.ids.toggle.setAttribute('aria-expanded', inst.open ? 'true' : 'false');
      inst.ids.list.hidden = !inst.open;
    }
  });
  click(button);
  await flush();
  assert.equal(updates, 1);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(document.getElementById('list').hidden, false);
  assert.equal(document.getElementById('toggle'), button, 'nothing was drawn again');
  c.setState({ open: false });
  c.setState({ open: false });
  await flush();
  assert.equal(updates, 2, 'one onUpdate per tick');
  c.destroy();
  c.setState({ open: true });
  await flush();
  assert.equal(updates, 2, 'no onUpdate after destroy');
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
