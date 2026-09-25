// SPDX-License-Identifier: Apache-2.0
//
// The chart contract (G-1): props type ('bar' | 'line' | 'area' | 'pie' | 'donut'), data
// { labels, series: [{ name, data }] }, height, onClick, options, lib; methods setData, setType,
// resize, destroy; `.instance`. setData and setType update without creating a new vendor object.
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
 */
export function chartContract(o) {
  const props = o.props || { type: 'bar', data: SAMPLE_DATA, height: 200, label: 'Sample' };
  const { name, factory, test, assert, window } = o;
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
  baseContract(Object.assign({}, o, { props: props }));

  test(name + ' · chart: every contract method is there', () => {
    const inst = factory(props);
    for (const m of CHART_METHODS) assert.equal(typeof inst[m], 'function', m);
    inst.destroy();
  });

  test(name + ' · chart: setData and setType redraw, and the vendor object is kept', async () => {
    const inst = factory(props);
    await inst.mount(window.document.body);
    const vendor = inst.instance;
    assert.equal(o.markCount(inst), 6);
    inst.setData({ labels: ['x', 'y'], series: [{ name: 'A', data: [5, 6] }] });
    await flush();
    assert.equal(o.markCount(inst), 2);
    inst.setType('pie');
    await flush();
    assert.equal(o.markCount(inst), 2, 'two slices');
    inst.resize();
    assert.equal(inst.instance, vendor, 'no new vendor object');
    inst.destroy();
  });

  test(name + ' · chart: onClick gets { sender, event, data } with series, index, label, value', async () => {
    const calls = [];
    const inst = factory(Object.assign({}, props, { onClick: (e) => calls.push(e) }));
    await inst.mount(window.document.body);
    await o.actions.clickMark(inst, 1, 2);
    assertEvent(assert, calls[0], inst, ['series', 'index', 'label', 'value']);
    assert.deepEqual([calls[0].data.series, calls[0].data.index, calls[0].data.label, calls[0].data.value], ['B', 2, 'Mar', 1]);
    inst.destroy();
  });
}
