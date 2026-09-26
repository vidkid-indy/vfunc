// SPDX-License-Identifier: Apache-2.0
// The official adapters pass the G-1 contracts with mock vendor libraries (D-034 7): this checks the
// adapter wiring (props → vendor options, vendor events → { sender, event, data }, cleanup).
// The browser page layer2/adapters/_contract/contract.html runs the same suites with the real
// vendors from the CDN.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import '../src/index.js';
import { vfGridAg } from '../adapters/grid-ag/index.js';
import { vfGridTabulator } from '../adapters/grid-tabulator/index.js';
import { vfChartChartjs } from '../adapters/chart-chartjs/index.js';
import { vfChartEcharts } from '../adapters/chart-echarts/index.js';
import { gridContract } from '../adapters/_contract/grid.contract.js';
import { chartContract } from '../adapters/_contract/chart.contract.js';

const document = window.document;

/** Draws the page of rows as <div data-key> so the tests can read the order. */
function drawRows(host, rows, keyOf, page, size) {
  while (host.firstChild) host.removeChild(host.firstChild);
  const shown = rows.slice(page * size, (page + 1) * size);
  for (const row of shown) {
    const div = document.createElement('div');
    div.setAttribute('data-key', keyOf(row));
    host.appendChild(div);
  }
}

function sortRows(rows, sort) {
  if (!sort) return rows.slice();
  return rows.slice().sort((a, b) => (a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0) * (sort.dir === 'desc' ? -1 : 1));
}

// --- mock AG Grid -----------------------------------------------------------------------------

const mockAgGrid = {
  createGrid(host, o) {
    const api = {
      o, rows: o.rowData.slice(), selected: [], page: 0, sort: null,
      draw() { drawRows(host, sortRows(this.rows, this.sort), (r) => o.getRowId({ data: r }), this.page, o.paginationPageSize); },
      setGridOption(key, value) {
        if (key === 'rowData') this.rows = value.slice();
        if (key === 'columnDefs') o.columnDefs = value;
        this.draw();
      },
      getSelectedRows() { return this.selected.slice(); },
      deselectAll() { this.selected = []; o.onSelectionChanged({ source: 'api', api: this }); },
      paginationGoToPage(n) { this.page = n; this.draw(); },
      getColumnState() { return o.columnDefs.map((c) => ({ colId: c.colId, sort: this.sort && this.sort.key === c.colId ? this.sort.dir : null })); },
      destroy() { while (host.firstChild) host.removeChild(host.firstChild); }
    };
    api.draw();
    return api;
  }
};

gridContract({
  name: 'vfGridAg (mock AG Grid)',
  factory: (props) => vfGridAg(Object.assign({}, props, { lib: mockAgGrid })),
  vf, test, assert, window,
  visibleKeys: (inst) => Array.from(inst.$node.querySelectorAll('[data-key]')).map((d) => d.getAttribute('data-key')),
  actions: {
    sort: (inst, key) => { const api = inst.instance; api.sort = { key, dir: 'asc' }; api.draw(); api.o.onSortChanged({ api }); },
    selectRow: (inst, key) => {
      const api = inst.instance;
      api.selected = api.rows.filter((r) => r.id === key);
      api.o.onSelectionChanged({ source: 'checkboxSelected', api });
    },
    clickRow: (inst, key) => { const api = inst.instance; api.o.onRowClicked({ data: api.rows.find((r) => r.id === key), rowIndex: 0, event: null }); }
  }
});

// --- mock Tabulator (builds asynchronously, like the real one) ---------------------------------

class MockTabulator {
  constructor(host, o) {
    this.host = host;
    this.o = o;
    this.rows = o.data.slice();
    this.selected = [];
    this.page = 1;
    this.handlers = {};
    this.sort = null;
    this.timer = setTimeout(() => { this.timer = null; this.draw(); this.fire('tableBuilt'); }, 0);
  }
  on(name, fn) { (this.handlers[name] = this.handlers[name] || []).push(fn); }
  fire(name, ...args) { for (const fn of this.handlers[name] || []) fn(...args); }
  draw() { drawRows(this.host, sortRows(this.rows, this.sort), (r) => String(r[this.o.index]), this.page - 1, this.o.paginationSize); }
  setData(rows) { this.rows = rows.slice(); this.draw(); return Promise.resolve(); }
  setColumns(columns) { this.o.columns = columns; this.draw(); }
  getSelectedData() { return this.selected.slice(); }
  deselectRow() { this.selected = []; this.fire('rowSelectionChanged', []); }
  setPage(n) { this.page = n; this.draw(); return Promise.resolve(); }
  destroy() { if (this.timer) clearTimeout(this.timer); while (this.host.firstChild) this.host.removeChild(this.host.firstChild); }
}

gridContract({
  name: 'vfGridTabulator (mock Tabulator)',
  factory: (props) => vfGridTabulator(Object.assign({}, props, { lib: MockTabulator })),
  vf, test, assert, window,
  wait: 5,
  visibleKeys: (inst) => Array.from(inst.$node.querySelectorAll('[data-key]')).map((d) => d.getAttribute('data-key')),
  actions: {
    sort: (inst, key) => { const t = inst.instance; t.sort = { key, dir: 'asc' }; t.draw(); t.fire('dataSorted', [{ field: key, dir: 'asc' }]); },
    selectRow: (inst, key) => { const t = inst.instance; t.selected = t.rows.filter((r) => r.id === key); t.fire('rowSelectionChanged', t.selected); },
    clickRow: (inst, key) => {
      const t = inst.instance;
      const row = t.rows.find((r) => r.id === key);
      t.fire('rowClick', null, { getData: () => row, getIndex: () => row.id, getPosition: () => 1 });
    }
  }
});

// --- mock Chart.js -----------------------------------------------------------------------------

class MockChart {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.data = config.data;
    this.options = config.options;
  }
  update() {}
  resize() {}
  destroy() { this.destroyed = true; }
}

const chartMarks = (inst) => inst.instance.data.datasets.reduce((n, d) => n + d.data.length, 0);

chartContract({
  name: 'vfChartChartjs (mock Chart.js)',
  factory: (props) => vfChartChartjs(Object.assign({}, props, { lib: MockChart })),
  vf, test, assert, window,
  markCount: (inst) => (inst.instance.config.type === 'pie' || inst.instance.config.type === 'doughnut'
    ? inst.instance.data.datasets[0].data.length : chartMarks(inst)),
  actions: { clickMark: (inst, s, i) => inst.instance.options.onClick({ native: null }, [{ datasetIndex: s, index: i }]) }
});

test('vfChartChartjs: colors come from the tokens, area fills, setType creates a new chart', async () => {
  document.documentElement.style.setProperty('--vf-chart-1', 'rgb(1, 2, 3)');
  const inst = vfChartChartjs({ lib: MockChart, type: 'area', data: { labels: ['a'], series: [{ name: 's', data: [1] }] } });
  await inst.mount(document.body);
  const first = inst.instance;
  assert.equal(first.config.type, 'line');
  assert.equal(first.data.datasets[0].fill, true);
  assert.equal(first.data.datasets[0].backgroundColor, 'rgb(1, 2, 3)');
  assert.equal(inst.$node.querySelector('canvas').getAttribute('role'), 'img');
  inst.setType('donut');
  assert.equal(first.destroyed, true);
  assert.equal(inst.instance.config.type, 'doughnut');
  inst.destroy();
  document.documentElement.style.removeProperty('--vf-chart-1');
});

// --- mock ECharts ------------------------------------------------------------------------------

const mockEcharts = {
  init(host) {
    return {
      host, handlers: {},
      setOption(option, notMerge) { this.option = option; this.notMerge = notMerge; },
      on(name, fn) { this.handlers[name] = fn; },
      resize() {},
      dispose() { this.disposed = true; }
    };
  }
};

chartContract({
  name: 'vfChartEcharts (mock ECharts)',
  factory: (props) => vfChartEcharts(Object.assign({}, props, { lib: mockEcharts })),
  vf, test, assert, window,
  markCount: (inst) => inst.instance.option.series.reduce((n, s) => n + s.data.length, 0),
  actions: { clickMark: (inst, s, i) => inst.instance.handlers.click({ seriesIndex: s, dataIndex: i, event: { event: null } }) }
});

test('vfChartEcharts: one chart for every type, aria on, the label as description', async () => {
  const inst = vfChartEcharts({ lib: mockEcharts, type: 'bar', label: 'Sales', data: { labels: ['a', 'b'], series: [{ name: 's', data: [1, 2] }] } });
  await inst.mount(document.body);
  const chart = inst.instance;
  assert.equal(chart.option.aria.enabled, true);
  assert.equal(chart.option.aria.label.description, 'Sales');
  inst.setType('donut');
  assert.equal(inst.instance, chart, 'the same chart');
  assert.deepEqual(chart.option.series[0].radius, ['45%', '70%']);
  assert.equal(chart.notMerge, true);
  inst.destroy();
  assert.equal(chart.disposed, true);
});

test('adapters join vf and say clearly when their library is missing', async () => {
  assert.equal(vf.vfGridAg, vfGridAg);
  assert.equal(vf.vfGridTabulator, vfGridTabulator);
  assert.equal(vf.vfChartChartjs, vfChartChartjs);
  assert.equal(vf.vfChartEcharts, vfChartEcharts);
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args.map(String).join(' '));
  let inst;
  try {
    inst = vfGridAg({ columns: [], data: [] });
    await inst.mount(document.body); // the engine reports a throwing onMount through console.error / onError
  } finally {
    console.error = original;
  }
  assert.ok(errors.some((m) => /vfGridAg: load the vendor library first \(global agGrid\)/.test(m)), errors.join('\n'));
  assert.equal(inst.instance, null);
  assert.doesNotThrow(() => inst.destroy(), 'destroy without a vendor object');
});

test('grid adapters render cells as nodes: vf.html markup, plain text escaped', async () => {
  let options;
  const lib = { createGrid(host, o) { options = o; return mockAgGrid.createGrid(host, o); } };
  const inst = vfGridAg({ lib, columns: [{ key: 'x', label: 'X', render: (row) => (row.safe ? vf.html`<b>${row.x}</b>` : row.x) }], data: [{ id: '1', x: '<img src=x onerror=alert(1)>' }, { id: '2', x: 'ok', safe: true }] });
  await inst.mount(document.body);
  const plain = options.columnDefs[0].cellRenderer({ data: { x: '<img src=x>' }, node: { rowIndex: 0 } });
  assert.equal(plain.querySelector('img'), null);
  assert.equal(plain.textContent, '<img src=x>');
  const markup = options.columnDefs[0].cellRenderer({ data: { x: 'ok', safe: true }, node: { rowIndex: 1 } });
  assert.equal(markup.querySelector('b').textContent, 'ok');
  inst.destroy();
});

test('adapter declaration files parse and declare their function; dist files join vf after vfunc.js only', async () => {
  const { readFileSync } = await import('node:fs');
  const { transformSync } = await import('esbuild');
  const { runInNewContext } = await import('node:vm');
  const { Window } = await import('happy-dom');
  for (const [file, name] of [['grid-ag', 'vfGridAg'], ['grid-tabulator', 'vfGridTabulator'], ['chart-chartjs', 'vfChartChartjs'], ['chart-echarts', 'vfChartEcharts']]) {
    const dts = readFileSync(new URL('../types/adapters/' + file + '.d.ts', import.meta.url), 'utf8');
    assert.doesNotThrow(() => transformSync(dts, { loader: 'ts', sourcefile: file + '.d.ts' }), file);
    assert.match(dts, new RegExp('export declare function ' + name + '\\b'));
    assert.match(dts, new RegExp('readonly ' + name + ': typeof ' + name + ';'));
    for (const suffix of ['.js', '.min.js']) {
      const page = new Window({ url: 'https://example.test/' });
      const sandbox = { window: page, self: page, document: page.document, navigator: page.navigator, setTimeout, console };
      runInNewContext(readFileSync(new URL('../../layer1/dist/vfunc.js', import.meta.url), 'utf8'), sandbox);
      runInNewContext(readFileSync(new URL('../dist/vfunc-' + file + suffix, import.meta.url), 'utf8'), sandbox);
      assert.equal(typeof page.vf[name], 'function', file + suffix);
    }
  }
});
