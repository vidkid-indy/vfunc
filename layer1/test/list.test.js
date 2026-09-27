// SPDX-License-Identifier: Apache-2.0
// The official keyed list plugin (layer1/plugins/list.js, D-044).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flush, captureWarnings } from './setup-dom.js';
import vf from '../src/vfunc.js';
import vfList from '../plugins/list.js';

const api = vfList.install(vf);
const row = (item) => vf.html`<tr><td><button type="button" data-action="select">${item.label}</button></td></tr>`;

function table(items) {
  const t = document.createElement('table');
  const tbody = document.createElement('tbody');
  t.appendChild(tbody);
  document.body.appendChild(t);
  const rows = api.create(tbody, { key: (item) => item.id, render: row, items: items });
  return { tbody, rows };
}

const make = (n, from) => Array.from({ length: n }, (x, i) => ({ id: (from || 1) + i, label: 'row ' + ((from || 1) + i) }));
const keys = (tbody) => Array.from(tbody.children, (tr) => tr.getAttribute('data-vf-key'));
const labels = (tbody) => Array.from(tbody.children, (tr) => tr.textContent);

/** Counts insertBefore / appendChild / removeChild / replaceChild on this container only. */
function countMoves(tbody) {
  const counts = { moves: 0 };
  for (const name of ['insertBefore', 'appendChild', 'removeChild', 'replaceChild']) {
    const original = tbody[name];
    tbody[name] = function () { counts.moves++; return original.apply(this, arguments); };
  }
  return counts;
}

test('the plugin installs through vf.use into vf.ext.list', () => {
  const list = vf.use(vfList);
  assert.equal(vf.ext.list, list);
  assert.equal(typeof list.create, 'function');
});

test('create draws one row per item in order, with data-vf-key, and escapes the text', () => {
  const { tbody, rows } = table([{ id: 1, label: '<img src=x onerror=alert(1)>' }, { id: 'b', label: 'two' }]);
  assert.deepEqual(keys(tbody), ['1', 'b']);
  assert.equal(tbody.querySelector('img'), null);
  assert.equal(tbody.children[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(rows.element(1), tbody.children[0]);
  assert.equal(rows.element('b'), tbody.children[1]);
  assert.equal(rows.element(9), null);
});

test('a plain string from render is text, not markup: it is refused as a row', () => {
  const tbody = document.createElement('tbody');
  const warnings = captureWarnings(() => {
    api.create(tbody, { key: (i) => i.id, render: (i) => '<tr><td>' + i.label + '</td></tr>', items: make(2) });
  });
  assert.equal(tbody.children.length, 0);
  assert.equal(warnings.length, 2);
  assert.match(warnings[0], /one element/);
});

test('set keeps the element of every unchanged item and redraws only changed ones', () => {
  const items = make(5);
  const { tbody, rows } = table(items);
  const before = Array.from(tbody.children);
  const next = items.slice();
  next[2] = { id: 3, label: 'changed' };
  rows.set(next);
  const after = Array.from(tbody.children);
  assert.deepEqual(labels(tbody), ['row 1', 'row 2', 'changed', 'row 4', 'row 5']);
  for (const i of [0, 1, 3, 4]) assert.equal(after[i], before[i], 'kept ' + i);
  assert.notEqual(after[2], before[2]);
});

test('swap moves two rows at most; remove and append touch only their rows', () => {
  const items = make(100);
  const { tbody, rows } = table(items);
  const before = Array.from(tbody.children);
  const counts = countMoves(tbody);
  const swapped = items.slice();
  swapped[1] = items[98];
  swapped[98] = items[1];
  rows.set(swapped);
  assert.ok(counts.moves <= 2, 'moves: ' + counts.moves);
  assert.equal(tbody.children[1], before[98]);
  assert.equal(tbody.children[98], before[1]);

  counts.moves = 0;
  rows.set(swapped.filter((x) => x.id !== 50));
  assert.equal(counts.moves, 1);
  assert.equal(tbody.children.length, 99);

  counts.moves = 0;
  rows.set(rows.items().concat(make(3, 101)));
  assert.equal(counts.moves, 3);
  assert.deepEqual(keys(tbody).slice(-3), ['101', '102', '103']);
});

test('random reorders, inserts and removals always end in the order of the items', () => {
  let seed = 11;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const { tbody, rows } = table(make(30));
  let next = make(30);
  let id = 1000;
  for (let round = 0; round < 200; round++) {
    next = next.slice();
    const op = rnd(4);
    if (op === 0 && next.length) next.splice(rnd(next.length), 1);
    else if (op === 1) next.splice(rnd(next.length + 1), 0, { id: id, label: 'n' + id++ });
    else if (op === 2 && next.length > 1) { const a = rnd(next.length); const b = rnd(next.length); const t = next[a]; next[a] = next[b]; next[b] = t; }
    else if (next.length) { const i = rnd(next.length); next[i] = { id: next[i].id, label: 'u' + round }; }
    if (round % 37 === 0) next.reverse();
    rows.set(next);
    assert.deepEqual(keys(tbody), next.map((x) => String(x.id)), 'round ' + round);
    assert.deepEqual(labels(tbody), next.map((x) => x.label), 'round ' + round);
  }
  rows.set([]);
  assert.equal(tbody.children.length, 0);
});

test('duplicate and missing keys are reported and skipped', () => {
  const tbody = document.createElement('tbody');
  const warnings = captureWarnings(() => {
    api.create(tbody, { key: (i) => i.id, render: row, items: [{ id: 1, label: 'a' }, { id: 1, label: 'b' }, { label: 'c' }] });
  });
  assert.deepEqual(labels(tbody), ['a']);
  assert.equal(warnings.length, 2);
});

test('refresh draws an item again after an in-place change; refresh() draws all', () => {
  const items = make(3);
  const { tbody, rows } = table(items);
  const first = tbody.children[0];
  items[1].label = 'mutated';
  rows.set(items);
  assert.equal(tbody.children[1].textContent, 'row 2', 'same object: not drawn again');
  rows.refresh(2);
  assert.equal(tbody.children[1].textContent, 'mutated');
  assert.equal(tbody.children[0], first);
  rows.refresh();
  assert.notEqual(tbody.children[0], first);
  assert.deepEqual(rows.items(), items);
});

test('focus stays on the same data-action when its row is drawn again', () => {
  const items = make(3);
  const { tbody, rows } = table(items);
  tbody.children[1].querySelector('button').focus();
  const next = items.slice();
  next[1] = { id: 2, label: 'new' };
  rows.set(next);
  assert.equal(document.activeElement, tbody.children[1].querySelector('button'));
});

test('inside a component: data-vf-keep keeps the rows through its render, delegation finds the item', async () => {
  const picked = [];
  let list;
  const app = vf.vfunc({
    state: { title: 'A' },
    render: (s) => vf.html`<h2>${s.title}</h2><table><tbody data-vf-keep="rows" data-ref="rows"></tbody></table>`,
    delegates: [{ selector: '[data-action="select"]', eventType: 'click',
      onEvent: (e) => picked.push(e.target.closest('[data-vf-key]').getAttribute('data-vf-key')) }],
    onMount: (inst) => { list = api.create(inst.refs.rows, { key: (i) => i.id, render: row, items: make(3) }); },
    onDestroy: () => list.destroy()
  });
  await app.mount(document.body);
  const kept = app.refs.rows.children[2];
  app.setState({ title: 'B' });
  await flush();
  assert.equal(app.$node.querySelector('h2').textContent, 'B');
  assert.equal(app.refs.rows.children[2], kept);
  kept.querySelector('button').click();
  assert.deepEqual(picked, ['3']);
  app.destroy();
});

test('destroy removes the rows it drew; later calls do nothing', () => {
  const { tbody, rows } = table(make(3));
  rows.destroy();
  assert.equal(tbody.children.length, 0);
  rows.set(make(2));
  rows.refresh();
  assert.equal(tbody.children.length, 0);
});

test('create checks its arguments', () => {
  const warnings = captureWarnings(() => assert.equal(api.create('#missing-list', { key: (i) => i, render: row }), null));
  assert.equal(warnings.length, 1);
  assert.throws(() => api.create(document.createElement('ul'), { render: row }), TypeError);
});
