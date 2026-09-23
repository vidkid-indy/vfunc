// SPDX-License-Identifier: Apache-2.0
// Regression tests for the engine: the pilot's 12 options must keep working after the port.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flush, click } from './setup-dom.js';
import vf, { vfunc } from '../src/vfunc.js';

test('tag, innerHTML and opts build the root element', () => {
  const c = vf.vfunc({ tag: 'section', innerHTML: '<p id="p1">hi</p>', opts: { className: 'box', id: 'root' } });
  assert.equal(c.$node.tagName, 'SECTION');
  assert.equal(c.$node.className, 'box');
  assert.equal(c.$node.id, 'root');
  assert.equal(c.$node.querySelector('p').textContent, 'hi');
});

test('can be called with or without new', () => {
  const a = vfunc({ innerHTML: 'a' });
  const b = new vfunc({ innerHTML: 'b' });
  assert.ok(a instanceof vfunc);
  assert.ok(b instanceof vfunc);
  assert.equal(a.isvfunc, true);
});

test('replaceRoot promotes the first element and keeps opts on it', () => {
  const c = vf.vfunc({ replaceRoot: true, opts: { title: 't' }, render: () => '<button class="b">x</button>' });
  assert.equal(c.$node.tagName, 'BUTTON');
  assert.equal(c.$node.title, 't');
});

test('toString returns outerHTML so an instance can be interpolated', () => {
  const c = vf.vfunc({ tag: 'span', innerHTML: 'x' });
  assert.equal(`${c}`, '<span>x</span>');
});

test('childs are appended, and slots go to the element with targetId', () => {
  const header = vf.vfunc({ innerHTML: 'H' });
  const body = vf.vfunc({ innerHTML: 'B' });
  const tail = document.createElement('i');
  const layout = vf.vfunc({
    innerHTML: '<header id="top"></header><main id="content"></main>',
    childs: [{ targetId: 'top', component: header }, { targetId: 'content', component: body }, tail]
  });
  assert.equal(layout.ids.top.firstChild, header.$node);
  assert.equal(layout.ids.content.firstChild, body.$node);
  assert.equal(layout.$node.lastChild, tail);
});

test('events bind to an id or to the root, with the event object shape', () => {
  const calls = [];
  const c = vf.vfunc({
    innerHTML: '<button id="save"><span>go</span></button>',
    events: [
      { id: 'save', eventType: 'click', onEvent: (e) => calls.push(['save', e.id, e.target.id, e.eventType, e.sender === c]) },
      { eventType: 'click', onEvent: () => calls.push(['root']) }
    ]
  });
  click(c.$node.querySelector('span'));
  assert.deepEqual(calls, [['save', 'save', 'save', 'click', true], ['root']]);
});

test('the global onEvent is the fallback handler', () => {
  let got = null;
  const c = vf.vfunc({
    innerHTML: '<a id="link">x</a>',
    events: [{ id: 'link', eventType: 'click' }],
    onEvent: (e) => { got = e.id; }
  });
  click(c.ids.link);
  assert.equal(got, 'link');
});

test('delegates match with closest() and only inside the root', () => {
  const hits = [];
  const outer = document.createElement('div');
  outer.className = 'item';
  const c = vf.vfunc({
    innerHTML: '<ul><li class="item" data-id="1"><b>one</b></li></ul>',
    delegates: [{ selector: '.item', eventType: 'click', onEvent: (e) => hits.push(e.target.getAttribute('data-id')) }]
  });
  outer.appendChild(c.$node);
  document.body.appendChild(outer);
  click(c.$node.querySelector('b'));
  click(outer); // matches .item but outside the root
  assert.deepEqual(hits, ['1']);
  outer.remove();
});

test('state, render and setState: several changes in one tick render once', async () => {
  let renders = 0;
  const c = vf.vfunc({
    state: { count: 0 },
    render: (s) => { renders++; return `<b>${s.count}</b>`; }
  });
  assert.equal(renders, 1);
  c.setState({ count: 1 });
  c.setState({ count: 2 });
  c.count = 3;
  await flush();
  assert.equal(renders, 2);
  assert.equal(c.$node.textContent, '3');
});

test('state keys are readable and writable on the instance (replacement for the Proxy)', async () => {
  const c = vf.vfunc({ state: { name: 'a' }, render: (s) => s.name });
  assert.equal(c.name, 'a');
  c.name = 'b';
  assert.equal(c.state.name, 'b');
  await flush();
  assert.equal(c.$node.textContent, 'b');
  c.setState({ extra: 1 });
  assert.equal(c.extra, 1, 'keys added later by setState get accessors too');
});

test('methods are bound and callable on the instance; e.sender works in handlers', () => {
  const c = vf.vfunc({
    state: { n: 1 },
    methods: { double() { return this.state.n * 2; } },
    innerHTML: '<button id="b">x</button>',
    events: [{ id: 'b', eventType: 'click', onEvent: (e) => { e.sender.n = e.sender.double(); } }]
  });
  assert.equal(c.double(), 2);
  const detached = c.methods.double;
  assert.equal(detached(), 2);
  click(c.ids.b);
  assert.equal(c.n, 2);
});

test('element ids are reachable on the instance; priority is state > methods > ids', () => {
  const c = vf.vfunc({
    state: { same: 'state' },
    methods: { same() { return 'method'; }, other() { return 'method'; } },
    innerHTML: '<i id="same"></i><i id="other"></i><i id="plain"></i>'
  });
  assert.equal(c.same, 'state');
  assert.equal(typeof c.other, 'function');
  assert.equal(c.plain, c.ids.plain);
});

test('refresh re-attaches childs without duplicates and rebinds child events', async () => {
  const child = vf.vfunc({ innerHTML: 'child' });
  let clicks = 0;
  const c = vf.vfunc({
    state: { v: 0 },
    render: (s) => `<button id="btn">${s.v}</button><div id="slot"></div>`,
    events: [{ id: 'btn', eventType: 'click', onEvent: () => clicks++ }],
    childs: [{ targetId: 'slot', component: child }]
  });
  c.setState({ v: 1 });
  await flush();
  c.setState({ v: 2 });
  await flush();
  assert.equal(c.ids.slot.childNodes.length, 1);
  assert.equal(c.ids.slot.firstChild, child.$node);
  click(c.ids.btn);
  assert.equal(clicks, 1, 'exactly one listener on the new button');
  assert.equal(c._listeners.length, 1, 'listeners of detached elements were released');
});

test('refresh keeps a single root listener when the root is kept', async () => {
  let clicks = 0;
  const c = vf.vfunc({
    state: { v: 0 },
    render: (s) => `<span>${s.v}</span>`,
    events: [{ eventType: 'click', onEvent: () => clicks++ }]
  });
  c.refresh();
  c.refresh();
  click(c.$node);
  assert.equal(clicks, 1);
});

test('replaceRoot refresh swaps the root in its parent; delegates keep working', async () => {
  const parent = document.createElement('div');
  const hits = [];
  const c = vf.vfunc({
    replaceRoot: true,
    opts: { title: 'kept' },
    state: { label: 'a' },
    render: (s) => `<button class="btn"><em>${s.label}</em></button>`,
    delegates: [{ selector: 'em', eventType: 'click', onEvent: (e) => hits.push(e.sender.label) }]
  });
  await c.mount(parent);
  const first = c.$node;
  c.label = 'b';
  await flush();
  assert.notEqual(c.$node, first);
  assert.equal(parent.firstChild, c.$node);
  assert.equal(parent.childNodes.length, 1);
  assert.equal(c.$node.title, 'kept');
  click(c.$node.querySelector('em'));
  assert.deepEqual(hits, ['b']);
});

test('mount appends once, accepts a selector and resolves with the instance', async () => {
  const host = document.createElement('div');
  host.id = 'host';
  document.body.appendChild(host);
  const c = vf.vfunc({ replaceRoot: true, render: () => '<p>x</p>' });
  const result = await c.mount('#host');
  await c.mount(host);
  assert.equal(result, c);
  assert.equal(host.childNodes.length, 1);
  host.remove();
});

test('destroy removes the element and releases every listener', () => {
  let clicks = 0;
  const parent = document.createElement('div');
  const c = vf.vfunc({
    innerHTML: '<button id="b">x</button>',
    events: [{ id: 'b', eventType: 'click', onEvent: () => clicks++ }],
    delegates: [{ selector: 'button', eventType: 'click', onEvent: () => clicks++ }]
  });
  parent.appendChild(c.$node);
  const button = c.ids.b;
  c.destroy();
  click(button);
  assert.equal(clicks, 0);
  assert.equal(parent.childNodes.length, 0);
  assert.equal(c._listeners.length, 0);
  assert.equal(c.b, undefined);
});

test('onError: a throwing render yields empty markup and reports', () => {
  const errors = [];
  const originalError = console.error;
  console.error = () => {};
  try {
    const c = vf.vfunc({ render: () => { throw new Error('boom'); }, onError: (e) => errors.push(e.message) });
    assert.equal(c.$node.innerHTML, '');
  } finally { console.error = originalError; }
  assert.deepEqual(errors, ['boom']);
});

test('onError: a throwing handler does not stop other handlers', () => {
  const errors = [];
  let second = false;
  const originalError = console.error;
  console.error = () => {};
  try {
    const c = vf.vfunc({
      innerHTML: '<button id="b">x</button>',
      events: [{ id: 'b', eventType: 'click', onEvent: () => { throw new Error('h'); } },
               { id: 'b', eventType: 'click', onEvent: () => { second = true; } }],
      onError: (e) => errors.push(e.message)
    });
    click(c.ids.b);
  } finally { console.error = originalError; }
  assert.deepEqual(errors, ['h']);
  assert.equal(second, true);
});

test('public methods work when detached (passed as callbacks)', async () => {
  const c = vf.vfunc({ state: { v: 1 }, render: (s) => String(s.v) });
  const { setState, refresh } = c;
  setState({ v: 5 });
  await flush();
  assert.equal(c.$node.textContent, '5');
  c.state.v = 6;
  refresh();
  assert.equal(c.$node.textContent, '6');
});
