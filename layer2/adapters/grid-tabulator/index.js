// SPDX-License-Identifier: Apache-2.0
//
// vfGridTabulator — the G-1 grid contract on Tabulator (MIT). The vendor is not bundled (rule 23):
// load tabulator-tables 6.x (dist/js/tabulator.min.js → global Tabulator, dist/css/tabulator.min.css)
// or pass the library as `lib`. No IE11 (Tabulator 6 does not support it): use vf.vfGrid there.
// Tabulator builds asynchronously: calls made before "tableBuilt" are applied when it is built.

import vf from '../../src/_internal/vf.js';
import { extend, emit } from '../../src/_internal/common.js';
import { stateOf, instance } from '../../src/_internal/instance.js';
import { vendorLib, hostMarkup, hostOf, textOf, cellNode, rowKeyOf, register } from '../../src/_internal/adapter.js';

const ALIGN = { start: 'left', center: 'center', end: 'right' };

function columnDefs(columns) {
  const out = [];
  for (let i = 0; i < (columns || []).length; i++) {
    const c = columns[i];
    out.push({
      title: textOf(c.label),
      field: c.key,
      headerSort: !!c.sortable,
      hozAlign: ALIGN[c.align] || undefined,
      formatter: typeof c.render === 'function'
        ? (function (col) { return function (cell) { return cellNode(col, cell.getData(), cell.getRow().getPosition()); }; }(c))
        : undefined
    });
  }
  return out;
}

/** vf.vfGrid's props on Tabulator; `options` goes to the Tabulator options as is. */
export function vfGridTabulator(props) {
  const p = props || {};
  let table = null;
  let built = false;
  let pending = [];
  let unsubscribe = null;
  let lastSort = '';
  const state = stateOf(p, 'grid-tabulator', {
    columns: (p.columns || []).slice(),
    data: (p.data || []).slice(),
    selectable: p.selectable === true ? 'multiple' : (p.selectable === 'single' || p.selectable === 'multiple' ? p.selectable : 'none'),
    instance: null
  });
  delete state.lib;
  delete state.options;

  /** Runs now when the table is built, else once it is (the result is returned when run now). */
  function whenBuilt(fn) {
    if (table && built) return fn(table);
    pending.push(fn);
    return undefined;
  }

  return instance({
    state: state,
    render: function (s) { return hostMarkup(s, 'vf-grid-tabulator'); },
    methods: {
      setData: function (data) {
        this.state.data = (data || []).slice();
        const rows = this.state.data;
        return whenBuilt(function (t) { return t.setData(rows); });
      },
      getData: function () { return this.state.data.slice(); },
      setColumns: function (columns) {
        this.state.columns = (columns || []).slice();
        const defs = columnDefs(this.state.columns);
        return whenBuilt(function (t) { return t.setColumns(defs); });
      },
      getSelection: function () { return table && built ? table.getSelectedData() : []; },
      clearSelection: function () { whenBuilt(function (t) { t.deselectRow(); }); },
      setPage: function (page) {
        const n = Math.max(1, Math.floor(Number(page) || 1));
        return whenBuilt(function (t) { return t.setPage(n); });
      },
      getValue: function () {
        const rows = this.getSelection();
        const keys = [];
        for (let i = 0; i < rows.length; i++) keys.push(rowKeyOf(rows[i], this.state.rowKey));
        return keys;
      }
    },
    onMount: function (self) {
      const Lib = vendorLib(p, 'Tabulator', 'vfGridTabulator');
      const s = self.state;
      const options = extend({
        data: s.data,
        index: s.rowKey || 'id',
        columns: columnDefs(s.columns),
        layout: 'fitColumns',
        height: s.height != null ? s.height : false,
        pagination: true,
        paginationSize: Math.max(1, Math.floor(Number(s.pageSize) || 10)),
        selectableRows: s.selectable === 'multiple' ? true : (s.selectable === 'single' ? 1 : false),
        placeholder: vf.t('emptyState.title')
      }, p.options);
      table = new Lib(hostOf(self), options);
      self.state.instance = table;
      table.on('tableBuilt', function () {
        built = true;
        const queue = pending;
        pending = [];
        for (let i = 0; i < queue.length; i++) queue[i](table);
      });
      table.on('rowClick', function (e, row) {
        emit(p.onRowClick, self, e, { row: row.getData(), key: String(row.getIndex()), index: row.getPosition() });
      });
      table.on('rowSelectionChanged', function (data) {
        if (!built) return;
        const keys = [];
        for (let i = 0; i < data.length; i++) keys.push(rowKeyOf(data[i], s.rowKey));
        emit(p.onSelect, self, null, { keys: keys, rows: data });
      });
      table.on('dataSorted', function (sorters) {
        const first = sorters && sorters[0];
        const now = first ? first.field + ' ' + first.dir : '';
        if (!first || now === lastSort) return;
        lastSort = now;
        emit(p.onSort, self, null, { key: first.field, dir: first.dir });
      });
      unsubscribe = vf.i18n.subscribe(function () {
        whenBuilt(function (t) { if (t.options) t.options.placeholder = vf.t('emptyState.title'); });
      });
    },
    onDestroy: function (self) {
      if (unsubscribe) unsubscribe();
      if (table) table.destroy();
      table = null;
      built = false;
      pending = [];
      unsubscribe = null;
      self.state.instance = null;
    }
  });
}

register({ vfGridTabulator: vfGridTabulator });

export default vfGridTabulator;
