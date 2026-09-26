// SPDX-License-Identifier: Apache-2.0
// The built-in vfGrid and vfChart pass the G-1 contracts first (D-033), so the contracts themselves
// are checked before adapters use them (Phase 4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import '../src/locale.ko.js';
import { vfGrid, vfChart } from '../src/data.js';
import { gridContract } from '../adapters/_contract/grid.contract.js';
import { chartContract } from '../adapters/_contract/chart.contract.js';

const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

await vf.i18n.setup({ locale: 'en', locales: ['en', 'ko'] });

gridContract({
  name: 'vfGrid',
  factory: vfGrid,
  vf, test, assert, window,
  visibleKeys: (inst) => Array.from(inst.$node.querySelectorAll('tbody tr[data-value]')).map((tr) => tr.getAttribute('data-value')),
  localeProbe: (inst) => inst.$node.querySelector('.vf-grid__range').textContent,
  actions: {
    sort: (inst, key) => click(inst.$node.querySelector('[data-action="sort"][data-value="' + key + '"]')),
    selectRow: (inst, key) => {
      const box = inst.$node.querySelector('[data-action="select-row"][data-value="' + key + '"]');
      box.checked = true;
      box.dispatchEvent(new window.Event('change', { bubbles: true }));
    },
    clickRow: (inst, key) => click(inst.$node.querySelector('tr[data-value="' + key + '"] td:last-child'))
  }
});

chartContract({
  name: 'vfChart',
  factory: vfChart,
  hasVendor: false,
  vf, test, assert, window,
  markCount: (inst) => inst.$node.querySelectorAll('[data-action="mark"]').length,
  localeProbe: (inst) => inst.$node.querySelector('svg').getAttribute('aria-label'),
  props: { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar'], series: [{ name: 'A', data: [1, 2, 3] }, { name: 'B', data: [3, 2, 1] }] }, height: 200 },
  actions: {
    clickMark: (inst, series, index) => click(inst.$node.querySelector('[data-action="mark"][data-s="' + series + '"][data-index="' + index + '"]'))
  }
});
