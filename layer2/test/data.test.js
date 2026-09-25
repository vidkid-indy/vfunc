// SPDX-License-Identifier: Apache-2.0
// Data components: vsTable and vsSparkline (core), vfGrid, vsChart and vfChart (data file, D-031).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush, click } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import { vsTable, vsSparkline } from '../src/index.js';
import { vfGrid, vsChart, vfChart } from '../src/data.js';
import { niceTicks, arcPath } from '../src/data/geometry.js';

function parse(markup) {
  const holder = document.createElement('div');
  holder.innerHTML = String(markup);
  assert.equal(holder.children.length, 1, 'one root element');
  return holder.firstElementChild;
}

function mounted(instance) {
  document.body.appendChild(instance.$node);
  return instance;
}

function change(element, checked) {
  element.checked = checked;
  element.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function recorder() {
  const calls = [];
  const fn = (e) => calls.push(e);
  fn.calls = calls;
  return fn;
}

const EVIL = '"><img src=x onerror=alert(1)>';
const USERS = [
  { id: 'u1', name: 'Ada', age: 36 },
  { id: 'u2', name: 'Grace', age: 45 },
  { id: 'u3', name: 'Linus', age: 28 },
  { id: 'u4', name: 'Barbara', age: 52 },
  { id: 'u5', name: 'Alan', age: 41 }
];
const COLUMNS = [{ key: 'name', label: 'Name', sortable: true }, { key: 'age', label: 'Age', align: 'end', sortable: true }];

test('the data file adds its members to vf; the core ones are there too', () => {
  assert.equal(vf.vfGrid, vfGrid);
  assert.equal(vf.vsChart, vsChart);
  assert.equal(typeof vf.vsTable, 'function');
});

test('vsTable: caption, scope, sortable headers with aria-sort, row keys, alignment, escaping', () => {
  const root = parse(vsTable({ caption: 'Users', columns: COLUMNS, data: USERS.slice(0, 2), sort: { key: 'age', dir: 'desc' }, selected: ['u2'], rowAction: 'row' }));
  assert.equal(root.className, 'vf-table');
  assert.equal(root.querySelector('caption').textContent, 'Users');
  const heads = root.querySelectorAll('th');
  assert.equal(heads[0].getAttribute('scope'), 'col');
  assert.equal(heads[0].getAttribute('aria-sort'), 'none');
  assert.equal(heads[1].getAttribute('aria-sort'), 'descending');
  assert.equal(heads[1].querySelector('[data-action="sort"]').getAttribute('data-value'), 'age');
  const rows = root.querySelectorAll('tbody tr');
  assert.deepEqual(Array.from(rows).map((r) => r.getAttribute('data-value')), ['u1', 'u2']);
  assert.equal(rows[1].getAttribute('data-state'), 'selected');
  assert.equal(rows[0].getAttribute('data-action'), 'row');
  assert.equal(rows[0].querySelectorAll('td')[1].getAttribute('data-align'), 'end');
  const escaped = parse(vsTable({ columns: [{ key: 'x', label: EVIL }], data: [{ x: EVIL }] }));
  assert.equal(escaped.querySelector('img'), null);
  const custom = parse(vsTable({ columns: [{ key: 'name', label: 'N', render: (row) => vf.html`<b>${row.name}</b>` }], data: [{ name: 'Ada' }] }));
  assert.equal(custom.querySelector('td b').textContent, 'Ada');
});

test('vsTable: empty and loading states', () => {
  const empty = parse(vsTable({ columns: COLUMNS, data: [], emptyText: 'No users' }));
  assert.equal(empty.querySelector('td').getAttribute('colspan'), '2');
  assert.equal(empty.querySelector('.vf-empty-state__title').textContent, 'No users');
  const loading = parse(vsTable({ columns: COLUMNS, data: [], loading: true }));
  assert.equal(loading.querySelector('table').getAttribute('aria-busy'), 'true');
  assert.equal(loading.querySelector('.vf-table__loading').textContent, 'Loading');
});

test('vsSparkline: an image with a summary, line or bars', () => {
  const line = parse(vsSparkline({ data: [3, 5, 1, 8] }));
  assert.equal(line.tagName.toLowerCase(), 'svg');
  assert.equal(line.getAttribute('role'), 'img');
  assert.equal(line.getAttribute('aria-label'), 'From 3 to 8, low 1, high 8');
  assert.ok(line.querySelector('polyline'));
  const bars = parse(vsSparkline({ data: [1, 2, 3], type: 'bar', label: 'Visits' }));
  assert.equal(bars.querySelectorAll('rect').length, 3);
  assert.equal(bars.getAttribute('aria-label'), 'Visits');
  assert.equal(parse(vsSparkline({ data: [] })).getAttribute('aria-label'), 'No data');
});

test('geometry: round ticks from zero, arc paths', () => {
  assert.deepEqual(niceTicks(3, 47, 5).ticks, [0, 10, 20, 30, 40, 50]);
  assert.deepEqual(niceTicks(-12, 8, 4), { min: -15, max: 10, ticks: [-15, -10, -5, 0, 5, 10] });
  assert.match(arcPath(50, 50, 40, 0, 0, Math.PI), /^M 50 10 A 40 40 0 0 1 50 90 L 50 50 Z$/);
  assert.equal((arcPath(50, 50, 40, 20, 0, Math.PI * 2).match(/M /g) || []).length, 2, 'a full circle is two halves');
});

test('vfGrid: pages the client data, sorts by a header, reports sort and page', async () => {
  const onSort = recorder();
  const onPage = recorder();
  const grid = mounted(vfGrid({ columns: COLUMNS, data: USERS, pageSize: 2, onSort, onPage }));
  const names = () => Array.from(grid.$node.querySelectorAll('tbody tr')).map((r) => r.querySelectorAll('td')[0].textContent);
  assert.deepEqual(names(), ['Ada', 'Grace']);
  assert.equal(grid.$node.querySelector('.vf-grid__range').textContent, '1–2 of 5');
  click(grid.$node.querySelector('[data-action="page"][data-page="3"]'));
  await flush();
  assert.deepEqual(names(), ['Alan']);
  click(grid.$node.querySelector('[data-action="sort"][data-value="age"]'));
  await flush();
  assert.deepEqual(names(), ['Linus', 'Ada'], 'sorted ascending, back to page 1');
  click(grid.$node.querySelector('[data-action="sort"][data-value="age"]'));
  await flush();
  assert.deepEqual(names(), ['Barbara', 'Grace']);
  assert.equal(grid.$node.querySelectorAll('th')[1].getAttribute('aria-sort'), 'descending');
  assert.deepEqual(onSort.calls.map((e) => e.data), [{ key: 'age', dir: 'asc' }, { key: 'age', dir: 'desc' }]);
  assert.deepEqual(onPage.calls.map((e) => e.data.page), [3]);
  assert.equal(grid.instance, null, 'no vendor object');
  grid.destroy();
});

test('vfGrid: multiple selection across pages, select all on a page, getSelection, clearSelection', async () => {
  const onSelect = recorder();
  const grid = mounted(vfGrid({ columns: COLUMNS, data: USERS, pageSize: 2, selectable: true, onSelect }));
  change(grid.$node.querySelector('[data-action="select-row"][data-value="u2"]'), true);
  await flush();
  assert.equal(grid.$node.querySelector('tr[data-value="u2"]').getAttribute('data-state'), 'selected');
  change(grid.$node.querySelector('[data-action="select-all"]'), true);
  await flush();
  assert.deepEqual(grid.getValue().sort(), ['u1', 'u2']);
  assert.equal(grid.$node.querySelector('[data-action="select-all"]').checked, true);
  grid.setPage(2);
  await flush();
  change(grid.$node.querySelector('[data-action="select-row"][data-value="u4"]'), true);
  await flush();
  assert.deepEqual(grid.getSelection().map((u) => u.name), ['Ada', 'Grace', 'Barbara']);
  assert.deepEqual(onSelect.calls[onSelect.calls.length - 1].data.keys, ['u1', 'u2', 'u4']);
  grid.clearSelection();
  await flush();
  assert.deepEqual(grid.getValue(), []);
  grid.destroy();
});

test('vfGrid: single selection uses radios; query filters; setData keeps known selections', async () => {
  const grid = mounted(vfGrid({ columns: COLUMNS, data: USERS, selectable: 'single' }));
  const radio = grid.$node.querySelector('[data-action="select-row"][data-value="u3"]');
  assert.equal(radio.type, 'radio');
  change(radio, true);
  await flush();
  assert.deepEqual(grid.getValue(), ['u3']);
  grid.setQuery('al');
  await flush();
  assert.deepEqual(Array.from(grid.$node.querySelectorAll('tbody tr')).map((r) => r.getAttribute('data-value')), ['u5']);
  grid.setQuery('');
  grid.setData(USERS.slice(2));
  await flush();
  assert.deepEqual(grid.getValue(), ['u3'], 'u3 is still there');
  grid.setData(USERS.slice(0, 2));
  await flush();
  assert.deepEqual(grid.getValue(), [], 'u3 left the data');
  grid.destroy();
});

test('vfGrid: server mode shows the given page, the total from props, and reports sort/page', async () => {
  const onPage = recorder();
  const grid = mounted(vfGrid({ columns: COLUMNS, data: USERS.slice(0, 2), mode: 'server', total: 42, pageSize: 2, onPage }));
  assert.equal(grid.$node.querySelector('.vf-grid__range').textContent, '1–2 of 42');
  click(grid.$node.querySelector('[data-action="page"][data-page="2"]'));
  assert.deepEqual(onPage.calls.map((e) => e.data.page), [2]);
  grid.setLoading(true);
  await flush();
  assert.equal(grid.$node.querySelector('table').getAttribute('aria-busy'), 'true');
  grid.setData(USERS.slice(2, 4));
  await flush();
  assert.equal(grid.$node.querySelector('.vf-grid__range').textContent, '3–4 of 42');
  assert.equal(grid.$node.querySelector('table').hasAttribute('aria-busy'), false, 'setData ends loading');
  grid.destroy();
});

test('vfGrid: row click, but not for controls in the row; height scrolls with a sticky header', async () => {
  const onRowClick = recorder();
  const grid = await vfGrid({
    columns: [{ key: 'name', label: 'Name' }, { key: 'x', label: '', render: () => vf.html`<button>edit</button>` }],
    data: USERS.slice(0, 2), onRowClick, height: 120, selectable: true
  }).mount(document.body);
  grid.$node.querySelector('tr[data-value="u2"] td').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.deepEqual(onRowClick.calls.map((e) => [e.data.key, e.data.row.name]), [['u2', 'Grace']]);
  click(grid.$node.querySelector('tr[data-value="u1"] button'));
  change(grid.$node.querySelector('[data-action="select-row"]'), true);
  assert.equal(onRowClick.calls.length, 1, 'controls in the row do not count as a row click');
  const box = grid.ids[grid.state.id + '-scroll'];
  assert.equal(box.getAttribute('data-height'), 'true');
  assert.equal(box.style.maxHeight, '120px');
  grid.destroy();
});

const SALES = { labels: ['Jan', 'Feb', 'Mar'], series: [{ name: '2025', data: [10, 20, 15] }, { name: '2026', data: [12, 25, 30] }] };

test('vsChart: an SVG image with bars in series colors, axis ticks, legend, data table', () => {
  const fig = parse(vsChart({ type: 'bar', data: SALES, label: 'Sales', dataTable: true }));
  assert.equal(fig.tagName, 'FIGURE');
  const svg = fig.querySelector('svg');
  assert.equal(svg.getAttribute('role'), 'img');
  assert.equal(svg.getAttribute('aria-label'), 'Sales');
  const bars = fig.querySelectorAll('rect');
  assert.equal(bars.length, 6);
  assert.deepEqual(Array.from(bars).map((b) => b.getAttribute('data-series')), ['0', '0', '0', '1', '1', '1']);
  assert.equal(bars[0].hasAttribute('tabindex'), false, 'static marks are not focusable');
  assert.ok(fig.querySelectorAll('.vf-chart__tick').length >= 3);
  assert.deepEqual(Array.from(fig.querySelectorAll('.vf-chart__legend li')).map((li) => li.textContent), ['2025', '2026']);
  assert.equal(fig.querySelector('.vf-visually-hidden table caption').textContent, 'Sales');
  assert.equal(fig.querySelectorAll('.vf-visually-hidden tbody tr').length, 3);
});

test('vsChart: line, area, pie, donut, sparkline; labels escaped; colors never in the markup', () => {
  const line = parse(vsChart({ type: 'line', data: SALES }));
  assert.equal(line.querySelectorAll('.vf-chart__line').length, 2);
  assert.equal(line.querySelectorAll('circle').length, 6);
  assert.equal(parse(vsChart({ type: 'area', data: SALES })).querySelectorAll('.vf-chart__area').length, 2);
  const pie = parse(vsChart({ type: 'pie', data: { labels: ['A', 'B', 'C'], series: [{ name: 'Share', data: [1, 1, 2] }] } }));
  assert.equal(pie.querySelectorAll('.vf-chart__slice').length, 3);
  assert.deepEqual(Array.from(pie.querySelectorAll('.vf-chart__legend li')).map((li) => li.textContent), ['A', 'B', 'C']);
  assert.match(parse(vsChart({ type: 'donut', data: { labels: ['A'], series: [{ name: 'x', data: [5] }] } })).querySelector('path').getAttribute('d'), / A .* A /);
  assert.equal(parse(vsChart({ type: 'sparkline', data: SALES })).getAttribute('class'), 'vf-sparkline');
  const evil = parse(vsChart({ type: 'bar', label: EVIL, data: { labels: [EVIL], series: [{ name: EVIL, data: [1] }, { name: 'b', data: [2] }] } }));
  assert.equal(evil.querySelector('img'), null);
  assert.equal(/fill="|stroke="|style="/.test(String(vsChart({ type: 'line', data: SALES }))), false);
});

test('vfChart: focusable marks with a tooltip, onClick, legend toggles, setData / setType', async () => {
  const onClick = recorder();
  const chart = mounted(vfChart({ type: 'bar', data: SALES, label: 'Sales', onClick }));
  const bar = chart.$node.querySelector('[data-action="mark"]');
  assert.equal(bar.getAttribute('tabindex'), '0');
  assert.equal(bar.getAttribute('aria-label'), '2025, Jan: 10');
  bar.dispatchEvent(new window.Event('focusin', { bubbles: true }));
  const tip = chart.ids[chart.state.id + '-tooltip'];
  assert.equal(tip.hidden, false);
  assert.equal(tip.textContent, '2025, Jan: 10');
  bar.dispatchEvent(new window.Event('focusout', { bubbles: true }));
  assert.equal(tip.hidden, true);
  click(chart.$node.querySelectorAll('[data-action="mark"]')[4]);
  assert.deepEqual(onClick.calls.map((e) => e.data), [{ series: '2026', index: 1, label: 'Feb', value: 25 }]);
  click(chart.$node.querySelector('[data-action="toggle-series"][data-index="0"]'));
  await flush();
  assert.equal(chart.$node.querySelectorAll('rect').length, 3, 'series 0 hidden');
  assert.equal(chart.$node.querySelector('[data-action="toggle-series"][data-index="0"]').getAttribute('aria-pressed'), 'false');
  assert.equal(chart.$node.querySelector('rect').getAttribute('data-series'), '1', 'colors stay with their series');
  chart.setType('pie');
  await flush();
  assert.equal(chart.$node.getAttribute('data-type'), 'pie');
  assert.equal(chart.$node.getAttribute('data-animate'), 'true', 'a new type fades in');
  chart.setData({ labels: ['x', 'y'], series: [{ name: 's', data: [1, 3] }] });
  await flush();
  assert.equal(chart.$node.querySelectorAll('.vf-chart__slice').length, 2);
  assert.equal(chart.instance, null);
  chart.destroy();
});
