// SPDX-License-Identifier: Apache-2.0
//
// The chart contract (G-1): props type ('bar' | 'line' | 'area' | 'pie' | 'donut'), data
// { labels, series: [{ name, data }] }, height, onClick, options, lib; methods setData, setType,
// resize, destroy; `.instance`. setData updates without creating a new vendor object; setType may
// create one when the vendor cannot change the type of a chart (Chart.js), and `.instance` is then
// the new one (D-034 6).
// The caller gives `actions.clickMark(instance, seriesIndex, index)` and `markCount(instance)`, so
// the same suite runs for vfChart and for adapters (vfChartChartjs, vfChartEcharts).

import { baseContract, assertEvent } from './base.contract.js';

export const CHART_METHODS = ['setData', 'setType', 'resize', 'destroy'];

export const SAMPLE_DATA = {
  labels: ['Jan', 'Feb', 'Mar'],
  series: [{ name: 'A', data: [1, 2, 3] }, { name: 'B', data: [3, 2, 1] }]
};

/**
 * @param {Object} o - baseContract options (props default to a bar chart of SAMPLE_DATA), plus:
 * @param {{clickMark: function(Object, number, number): (void|Promise)}} o.actions
 * @param {function(Object): number} o.markCount - the number of drawn marks (bars, points, slices)
 * @param {boolean} [o.hasVendor=true] - false for the built-in vfChart (no vendor object)
 * @param {number} [o.wait=0] - ms to wait after updates (vendors that redraw later)
 */
export function chartContract(o) {
  const props = o.props || { type: 'bar', data: SAMPLE_DATA, height: 200, label: 'Sample' };
  const { name, factory, test, assert, window } = o;
  const settle = (value) => Promise.resolve(value).then(() => new Promise((resolve) => setTimeout(resolve, o.wait || 0)));
  baseContract(Object.assign({}, o, { props: props }));

  test(name + ' · chart: every contract method is there', () => {
    const inst = factory(props);
    for (const m of CHART_METHODS) assert.equal(typeof inst[m], 'function', m);
    inst.destroy();
  });

  test(name + ' · chart: setData keeps the vendor object; setType redraws; .instance is current', async () => {
    const inst = factory(props);
    await inst.mount(window.document.body);
    await settle();
    const vendor = inst.instance;
    if (o.hasVendor !== false) assert.ok(vendor, 'the vendor object after mount');
    assert.equal(o.markCount(inst), 6);
    await settle(inst.setData({ labels: ['x', 'y'], series: [{ name: 'A', data: [5, 6] }] }));
    assert.equal(o.markCount(inst), 2);
    assert.equal(inst.instance, vendor, 'setData does not create a new vendor object');
    await settle(inst.setType('pie'));
    assert.equal(o.markCount(inst), 2, 'two slices');
    if (o.hasVendor !== false) assert.ok(inst.instance, '.instance is the current vendor object');
    inst.resize();
    inst.destroy();
    assert.equal(inst.instance, null, '.instance is released on destroy');
  });

  test(name + ' · chart: onClick gets { sender, event, data } with series, index, label, value', async () => {
    const calls = [];
    const inst = factory(Object.assign({}, props, { onClick: (e) => calls.push(e) }));
    await inst.mount(window.document.body);
    await settle();
    await o.actions.clickMark(inst, 1, 2);
    assertEvent(assert, calls[0], inst, ['series', 'index', 'label', 'value']);
    assert.deepEqual([calls[0].data.series, calls[0].data.index, calls[0].data.label, calls[0].data.value], ['B', 2, 'Mar', 1]);
    inst.destroy();
  });
}
