// SPDX-License-Identifier: Apache-2.0
//
// The contract suites in the browser (D-034 7): the built-in vfGrid / vfChart and the four official
// adapters with the real vendor libraries loaded by contract.html. The UI actions press the
// vendors' own DOM, so they know each vendor's markup; the checks are the same as in node.

import vf from '../../../layer1/dist/vfunc.esm.js';
import '../../dist/vfunc-ui.esm.js';
import { vfGrid, vfChart } from '../../dist/vfunc-ui-data.esm.js';
import { vfGridTabulator } from '../../dist/vfunc-grid-tabulator.esm.js';
import { vfChartChartjs } from '../../dist/vfunc-chart-chartjs.esm.js';
import { vfChartEcharts } from '../../dist/vfunc-chart-echarts.esm.js';
import { gridContract, SAMPLE_ROWS } from './grid.contract.js';
import { chartContract } from './chart.contract.js';
import { agGridSuite } from './ag-grid.suite.js';
import { test, assert, run } from './runner.js';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

/** A click at a point, the way a pointer does it (for canvas and SVG charts). */
function pointAt(target, x, y) {
  const init = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true };
  for (const type of ['pointermove', 'mousemove', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    const Ctor = type.indexOf('pointer') === 0 && typeof PointerEvent === 'function' ? PointerEvent : MouseEvent;
    target.dispatchEvent(new Ctor(type, init));
  }
}

const common = { vf, test, assert, window };
const nameToKey = (inst, name) => {
  const rows = inst.getData().length ? inst.getData() : SAMPLE_ROWS;
  const row = rows.find((r) => r.name === name);
  return row ? row.id : name;
};

// --- built-in ----------------------------------------------------------------------------------

gridContract(Object.assign({}, common, {
  name: 'vfGrid',
  factory: vfGrid,
  visibleKeys: (inst) => Array.from(inst.$node.querySelectorAll('tbody tr[data-value]')).map((tr) => tr.getAttribute('data-value')),
  actions: {
    sort: (inst, key) => click(inst.$node.querySelector('[data-action="sort"][data-value="' + key + '"]')),
    selectRow: (inst, key) => click(inst.$node.querySelector('[data-action="select-row"][data-value="' + key + '"]')),
    clickRow: (inst, key) => click(inst.$node.querySelector('tr[data-value="' + key + '"] td:last-child'))
  }
}));

chartContract(Object.assign({}, common, {
  name: 'vfChart',
  factory: vfChart,
  hasVendor: false,
  markCount: (inst) => inst.$node.querySelectorAll('[data-action="mark"]').length,
  actions: { clickMark: (inst, s, i) => click(inst.$node.querySelector('[data-action="mark"][data-s="' + s + '"][data-index="' + i + '"]')) }
}));

// --- AG Grid -----------------------------------------------------------------------------------

agGridSuite(common);

// --- Tabulator ---------------------------------------------------------------------------------

const tabRows = (inst) => Array.from(inst.$node.querySelectorAll('.tabulator-tableholder .tabulator-row'));
const tabRow = (inst, key) => tabRows(inst).find((row) => nameToKey(inst, row.querySelector('[tabulator-field="name"]').textContent) === key);

gridContract(Object.assign({}, common, {
  name: 'vfGridTabulator (Tabulator 6.5.3)',
  factory: (props) => vfGridTabulator(Object.assign({}, props, { lib: window.Tabulator })),
  wait: 80,
  visibleKeys: (inst) => tabRows(inst).map((row) => nameToKey(inst, row.querySelector('[tabulator-field="name"]').textContent)),
  actions: {
    sort: async (inst, key) => { click(inst.$node.querySelector('.tabulator-col[tabulator-field="' + key + '"] .tabulator-col-title')); await pause(80); },
    selectRow: async (inst, key) => { click(tabRow(inst, key).querySelector('.tabulator-cell')); await pause(80); },
    clickRow: async (inst, key) => { click(tabRow(inst, key).querySelector('.tabulator-cell')); await pause(80); }
  }
}));

// --- Chart.js ----------------------------------------------------------------------------------

chartContract(Object.assign({}, common, {
  name: 'vfChartChartjs (Chart.js 4.5.1)',
  factory: (props) => vfChartChartjs(Object.assign({}, props, { lib: window.Chart })),
  wait: 50,
  markCount: (inst) => {
    const chart = inst.instance;
    let n = 0;
    for (let i = 0; i < chart.data.datasets.length; i++) n += chart.getDatasetMeta(i).data.length;
    return n;
  },
  actions: {
    clickMark: async (inst, s, i) => {
      const chart = inst.instance;
      const point = chart.getDatasetMeta(s).data[i].getCenterPoint();
      const rect = chart.canvas.getBoundingClientRect();
      pointAt(chart.canvas, rect.left + point.x, rect.top + point.y);
      await pause(50);
    }
  }
}));

// --- ECharts -----------------------------------------------------------------------------------

chartContract(Object.assign({}, common, {
  name: 'vfChartEcharts (ECharts 6.1.0)',
  factory: (props) => vfChartEcharts(Object.assign({}, props, { lib: window.echarts })),
  wait: 50,
  markCount: (inst) => inst.instance.getOption().series.reduce((n, s) => n + s.data.length, 0),
  actions: {
    clickMark: async (inst, s, i) => {
      // The center of that bar (convertToPixel gives the category's center, between the bars), fed
      // to zrender's own handler: synthetic DOM pointer events do not reach it (test only).
      const chart = inst.instance;
      const box = chart.getModel().getSeriesByIndex(s).getData().getItemLayout(i);
      const at = { zrX: box.x + box.width / 2, zrY: box.y + box.height / 2, target: null, event: null };
      const handler = chart.getZr().handler;
      for (const name of ['mousemove', 'mousedown', 'mouseup', 'click']) handler.dispatch(name, Object.assign({ type: name }, at));
      await pause(50);
    }
  }
}));

run(document.getElementById('results'), document.getElementById('summary'));
