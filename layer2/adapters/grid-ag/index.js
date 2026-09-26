// SPDX-License-Identifier: Apache-2.0
//
// vfGridAg — the G-1 grid contract on AG Grid Community (MIT). The vendor is not bundled (rule 23):
// load ag-grid-community 36.x (dist/ag-grid-community.min.js → global agGrid) or pass the library
// as `lib`. The Quartz theme gets its colors and font from the --vf-* tokens.
// CSP: AG Grid 33+ injects its styles and an icon font, so a page with AG Grid needs
// style-src 'unsafe-inline' and font-src data: (script-src stays strict; D-034 10).
// AG Grid Enterprise features need a commercial license from AG Grid; this adapter uses Community only.
// No IE11 (AG Grid does not support it): use vf.vfGrid there.
//
// Steps of the integration guide (G-2): 2 lib, 3 keep host, 4 create in onMount, 5 update through
// the grid API, 6 events as { sender, event, data }, 7 destroy, 9 theme, 10 locale, 11 XSS, 12 .instance.

import vf from '../../src/_internal/vf.js';
import { extend, emit } from '../../src/_internal/common.js';
import { stateOf, instance } from '../../src/_internal/instance.js';
import { vendorLib, hostMarkup, hostOf, textOf, cellNode, rowKeyOf, register, token } from '../../src/_internal/adapter.js';

/** The Quartz theme with the vfunc tokens (G-2 step 9). */
function theme(lib) {
  if (!lib.themeQuartz || typeof lib.themeQuartz.withParams !== 'function') return undefined;
  const params = {
    accentColor: token('--vf-color-primary'),
    foregroundColor: token('--vf-color-text'),
    backgroundColor: token('--vf-color-surface'),
    borderColor: token('--vf-color-border'),
    fontFamily: 'inherit'
  };
  for (const k in params) if (Object.prototype.hasOwnProperty.call(params, k) && !params[k]) delete params[k];
  return lib.themeQuartz.withParams(params);
}

function columnDefs(columns) {
  const out = [];
  for (let i = 0; i < (columns || []).length; i++) {
    const c = columns[i];
    out.push({
      field: c.key,
      colId: c.key,
      headerName: textOf(c.label),
      sortable: !!c.sortable,
      type: c.align === 'end' ? 'rightAligned' : undefined,
      cellRenderer: typeof c.render === 'function'
        ? (function (col) { return function (params) { return cellNode(col, params.data, params.node.rowIndex); }; }(c))
        : undefined
    });
  }
  return out;
}

/** vf.vfGrid's props on AG Grid; `options` goes to the grid options as is. */
export function vfGridAg(props) {
  const p = props || {};
  let api = null;
  let unsubscribe = null;
  const state = stateOf(p, 'grid-ag', {
    columns: (p.columns || []).slice(),
    data: (p.data || []).slice(),
    selectable: p.selectable === true ? 'multiple' : (p.selectable === 'single' || p.selectable === 'multiple' ? p.selectable : 'none'),
    instance: null
  });
  delete state.lib;
  delete state.options;

  function noRows() {
    // An HTML string for AG Grid: the message is escaped.
    return '<span>' + vf.esc(vf.t('emptyState.title')) + '</span>';
  }

  return instance({
    state: state,
    render: function (s) { return hostMarkup(s, 'vf-grid-ag'); },
    methods: {
      setData: function (data) {
        this.state.data = (data || []).slice();
        if (api) api.setGridOption('rowData', this.state.data);
      },
      getData: function () { return this.state.data.slice(); },
      setColumns: function (columns) {
        this.state.columns = (columns || []).slice();
        if (api) api.setGridOption('columnDefs', columnDefs(this.state.columns));
      },
      getSelection: function () { return api ? api.getSelectedRows() : []; },
      clearSelection: function () { if (api) api.deselectAll(); },
      setPage: function (page) { if (api) api.paginationGoToPage(Math.max(1, Math.floor(Number(page) || 1)) - 1); },
      getValue: function () {
        const rows = api ? api.getSelectedRows() : [];
        const keys = [];
        for (let i = 0; i < rows.length; i++) keys.push(rowKeyOf(rows[i], this.state.rowKey));
        return keys;
      }
    },
    onMount: function (self) {
      const lib = vendorLib(p, 'agGrid', 'vfGridAg');
      const host = hostOf(self);
      const s = self.state;
      if (s.height != null) host.style.height = typeof s.height === 'number' ? s.height + 'px' : String(s.height);
      const options = extend({
        theme: theme(lib),
        columnDefs: columnDefs(s.columns),
        rowData: s.data,
        getRowId: function (params) { return rowKeyOf(params.data, s.rowKey); },
        pagination: true,
        paginationPageSize: Math.max(1, Math.floor(Number(s.pageSize) || 10)),
        paginationPageSizeSelector: false,
        domLayout: s.height != null ? 'normal' : 'autoHeight',
        overlayNoRowsTemplate: noRows(),
        rowSelection: s.selectable === 'none' ? undefined : { mode: s.selectable === 'single' ? 'singleRow' : 'multiRow' },
        onRowClicked: function (e) {
          emit(p.onRowClick, self, e.event || null, { row: e.data, key: rowKeyOf(e.data, s.rowKey), index: e.rowIndex });
        },
        onSelectionChanged: function (e) {
          if (e.source === 'api') return;
          const rows = e.api.getSelectedRows();
          const keys = [];
          for (let i = 0; i < rows.length; i++) keys.push(rowKeyOf(rows[i], s.rowKey));
          emit(p.onSelect, self, null, { keys: keys, rows: rows });
        },
        onSortChanged: function (e) {
          const cols = e.api.getColumnState();
          for (let i = 0; i < cols.length; i++) {
            if (cols[i].sort) return emit(p.onSort, self, null, { key: cols[i].colId, dir: cols[i].sort });
          }
        }
      }, p.options);
      api = lib.createGrid(host, options);
      self.state.instance = api;
      unsubscribe = vf.i18n.subscribe(function () {
        if (api) api.setGridOption('overlayNoRowsTemplate', noRows());
      });
    },
    onDestroy: function (self) {
      if (unsubscribe) unsubscribe();
      if (api) api.destroy();
      api = null;
      unsubscribe = null;
      self.state.instance = null;
    }
  });
}

register({ vfGridAg: vfGridAg });

export default vfGridAg;
