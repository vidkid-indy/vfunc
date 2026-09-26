// SPDX-License-Identifier: Apache-2.0
//
// The grid contract (G-1): props columns, data, pageSize, selectable, height, onRowClick, onSelect,
// onSort, options, lib; methods setData, getData, setColumns, getSelection, clearSelection,
// setPage, refresh, destroy; `.instance`. setData updates without creating a new vendor object.
// The caller gives `actions` that press the UI (sort by a column, select a row, click a row), so the
// same suite runs for vfGrid and for adapters (vfGridAg, vfGridTabulator).

import { baseContract, assertEvent } from './base.contract.js';

export const GRID_METHODS = ['setData', 'getData', 'setColumns', 'getSelection', 'clearSelection', 'setPage', 'refresh', 'destroy'];

export const SAMPLE_ROWS = [
  { id: 'a', name: 'Ada', age: 36 },
  { id: 'b', name: 'Grace', age: 45 },
  { id: 'c', name: 'Linus', age: 28 }
];
export const SAMPLE_COLUMNS = [{ key: 'name', label: 'Name', sortable: true }, { key: 'age', label: 'Age', sortable: true, align: 'end' }];

/**
 * @param {Object} o - baseContract options (props default to the sample), plus:
 * @param {{sort: function(Object, string): (void|Promise), selectRow: function(Object, string): (void|Promise),
 *   clickRow: function(Object, string): (void|Promise)}} o.actions - press the UI of an instance
 * @param {function(Object): string[]} o.visibleKeys - the row keys shown now, in order
 */
export function gridContract(o) {
  const props = o.props || { columns: SAMPLE_COLUMNS, data: SAMPLE_ROWS, pageSize: 10, selectable: 'multiple' };
  const { name, factory, test, assert, window } = o;
  // Some vendors build or redraw asynchronously: wait for a returned promise, then a moment.
  const flush = (value) => Promise.resolve(value).then(() => new Promise((resolve) => setTimeout(resolve, o.wait || 0)));
  baseContract(Object.assign({}, o, { props: props }));

  test(name + ' · grid: every contract method is there', () => {
    const inst = factory(props);
    for (const m of GRID_METHODS) assert.equal(typeof inst[m], 'function', m);
    inst.destroy();
  });

  test(name + ' · grid: setData / getData, and the vendor object is kept', async () => {
    const inst = factory(props);
    await inst.mount(window.document.body);
    await flush();
    const vendor = inst.instance;
    await flush(inst.setData(SAMPLE_ROWS.slice(0, 2)));
    assert.deepEqual(inst.getData().map((r) => r.id), ['a', 'b']);
    assert.deepEqual(o.visibleKeys(inst), ['a', 'b']);
    assert.equal(inst.instance, vendor, 'setData does not create a new vendor object');
    inst.destroy();
  });

  test(name + ' · grid: onSort, onSelect and onRowClick get { sender, event, data }', async () => {
    const calls = { sort: [], select: [], row: [] };
    const inst = factory(Object.assign({}, props, {
      onSort: (e) => calls.sort.push(e),
      onSelect: (e) => calls.select.push(e),
      onRowClick: (e) => calls.row.push(e)
    }));
    await inst.mount(window.document.body);
    await flush();
    await o.actions.sort(inst, 'age');
    await flush();
    assertEvent(assert, calls.sort[0], inst, ['key', 'dir']);
    assert.equal(calls.sort[0].data.key, 'age');
    assert.deepEqual(o.visibleKeys(inst), ['c', 'a', 'b'], 'sorted by age');
    await o.actions.selectRow(inst, 'b');
    await flush();
    assertEvent(assert, calls.select[0], inst, ['keys', 'rows']);
    assert.deepEqual(inst.getSelection().map((r) => r.id), ['b']);
    await flush(inst.clearSelection());
    assert.deepEqual(inst.getSelection(), []);
    await o.actions.clickRow(inst, 'a');
    await flush();
    // Some vendors also report the row click of the selection above: look at the last one.
    const last = calls.row[calls.row.length - 1];
    assertEvent(assert, last, inst, ['row']);
    assert.equal(last.data.row.id, 'a');
    inst.destroy();
  });

  test(name + ' · grid: setPage and setColumns', async () => {
    const rows = [];
    for (let i = 0; i < 25; i++) rows.push({ id: 'r' + i, name: 'Row ' + i, age: i });
    const inst = factory(Object.assign({}, props, { data: rows, pageSize: 10 }));
    await inst.mount(window.document.body);
    await flush();
    await flush(inst.setPage(3));
    assert.deepEqual(o.visibleKeys(inst), ['r20', 'r21', 'r22', 'r23', 'r24']);
    await flush(inst.setColumns([{ key: 'name', label: 'Name' }]));
    assert.deepEqual(o.visibleKeys(inst), ['r20', 'r21', 'r22', 'r23', 'r24'], 'columns change, the page stays');
    inst.destroy();
  });
}
