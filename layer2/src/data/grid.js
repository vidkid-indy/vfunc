// SPDX-License-Identifier: Apache-2.0
//
// Grid — Tier F (vfGrid only), data file (D-031, D-033). Spec reference: pilot
// organisms/VDataTable.js (rendering) and VDataControl (paging); rewritten on vf.vsTable and
// vf.vsPagination of the core file. Client mode sorts, filters and pages in the browser; server
// mode shows the rows it is given and reports sort and page changes (onSort, onPage), with the
// total from props. Rows can be selected with checkboxes (multiple) or radios (single).
// G-1 grid contract: setData, getData, setColumns, getSelection, clearSelection, setPage,
// refresh, destroy, .instance (null: there is no vendor object).

import vf from '../_internal/ui.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present, extend, hasValue, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';

const html = vf.html;

function keyOf(row, index, rowKey) {
  const k = rowKey || 'id';
  return row != null && typeof row === 'object' && row[k] != null ? String(row[k]) : String(index);
}

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
}

/** The rows after filter and sort (client mode), each with its key. */
function prepared(s) {
  const out = [];
  const data = s.data || [];
  const q = present(s.query) ? String(s.query).toLowerCase() : '';
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (q && s.mode !== 'server') {
      let hit = false;
      for (let c = 0; c < s.columns.length && !hit; c++) {
        const v = row == null ? null : row[s.columns[c].key];
        if (v != null && String(v).toLowerCase().indexOf(q) >= 0) hit = true;
      }
      if (!hit) continue;
    }
    out.push({ row: row, key: keyOf(row, i, s.rowKey), order: i });
  }
  if (s.sort && s.sort.key && s.mode !== 'server') {
    const k = s.sort.key;
    const dir = s.sort.dir === 'desc' ? -1 : 1;
    out.sort(function (x, y) { return dir * compare(x.row && x.row[k], y.row && y.row[k]) || x.order - y.order; });
  }
  return out;
}

function pagesOf(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize));
}

function view(s) {
  const all = prepared(s);
  const size = Math.max(1, Math.floor(Number(s.pageSize) || 10));
  const total = s.mode === 'server' ? Math.max(0, Number(s.total) || 0) : all.length;
  const page = Math.max(1, Math.min(pagesOf(total, size), Math.floor(Number(s.page) || 1)));
  const rows = s.mode === 'server' ? all : all.slice((page - 1) * size, page * size);
  return { rows: rows, total: total, page: page, size: size };
}

function render(s) {
  const v = view(s);
  const multiple = s.selectable === 'multiple';
  const single = s.selectable === 'single';
  const keys = [];
  const data = [];
  for (let i = 0; i < v.rows.length; i++) {
    keys.push(v.rows[i].key);
    // A shallow copy carries the grid's key, so vsTable's data-value matches it (sorted or not).
    data.push(extend({}, v.rows[i].row, { __vfKey: v.rows[i].key }));
  }
  let allOn = keys.length > 0;
  for (let i = 0; i < keys.length; i++) if (!hasValue(s.selected, keys[i])) allOn = false;
  const columns = [];
  if (multiple || single) {
    columns.push({
      key: '',
      label: multiple
        ? html`<input ${attrs({ type: 'checkbox', class: 'vf-grid__check', 'data-action': 'select-all', 'aria-label': msg('grid.selectAll'), checked: allOn })}>`
        : html`<span class="vf-visually-hidden">${msg('grid.select')}</span>`,
      render: function (row, index) {
        const key = row.__vfKey;
        return html`<input ${attrs({
          type: multiple ? 'checkbox' : 'radio',
          class: 'vf-grid__check',
          name: single ? s.id + '-select' : null,
          'data-action': 'select-row',
          'data-value': key,
          'aria-label': msg('grid.selectRow', null, { index: index + 1 }),
          checked: hasValue(s.selected, key)
        })}>`;
      }
    });
  }
  for (let c = 0; c < s.columns.length; c++) columns.push(s.columns[c]);
  const from = v.total ? (v.page - 1) * v.size + 1 : 0;
  const to = v.rows.length ? Math.min(v.total, from + v.rows.length - 1) : from;
  const pager = v.total > v.size
    ? vf.vsPagination({ total: v.total, page: v.page, pageSize: v.size, id: s.id + '-pages' })
    : '';
  return html`<div ${attrs({ class: cls('vf-grid', s.className), id: s.id, 'data-ref': s.ref, 'data-mode': s.mode })}><div ${attrs({ class: 'vf-grid__scroll', id: s.id + '-scroll', 'data-height': present(s.height) ? true : null })}>${vf.vsTable({
    columns: columns,
    data: data,
    sort: s.sort,
    rowKey: '__vfKey',
    selected: s.selected,
    rowAction: 'row',
    caption: s.caption,
    emptyText: s.emptyText,
    loading: s.loading,
    indexBase: (v.page - 1) * v.size
  })}</div><div class="vf-grid__footer"><p class="vf-grid__range" aria-live="polite">${msg('grid.range', null, {
    from: vf.fmt.number(from), to: vf.fmt.number(Math.max(to, 0)), total: vf.fmt.number(v.total)
  })}</p>${pager}</div></div>`;
}

/**
 * A data grid.
 * @param {Object} props
 * @param {Array<{key: string, label: *, align?: string, sortable?: boolean, render?: function(Object, number): *}>} props.columns
 * @param {Array<Object>} props.data
 * @param {number} [props.pageSize=10]
 * @param {'none'|'single'|'multiple'|boolean} [props.selectable='none'] - true means 'multiple'
 * @param {number|string} [props.height] - a maximum height (number: px); the header stays on top
 * @param {string} [props.rowKey='id'] - the key of a row (else its index)
 * @param {'client'|'server'} [props.mode='client'] - server: rows are one page, total from props
 * @param {number} [props.total] - server mode: the number of rows on the server
 * @param {string} [props.query] - client mode: keep rows where a column contains this text
 * @param {{key: string, dir: 'asc'|'desc'}} [props.sort]
 * @param {boolean} [props.loading]
 * @param {*} [props.caption] - the table's accessible name
 * @param {*} [props.emptyText]
 * @param {function} [props.onRowClick] - ({ sender, event, data: { row, key, index } }) — not for clicks on controls in the row
 * @param {function} [props.onSelect] - ({ sender, event, data: { keys, rows } })
 * @param {function} [props.onSort] - ({ sender, event, data: { key, dir } })
 * @param {function} [props.onPage] - ({ sender, event, data: { page } })
 * @param {*} [props.options] - accepted for the grid contract (vendor options); not used here
 * @param {*} [props.lib] - accepted for the grid contract (vendor library); not used here
 *   Also: id, ref, className
 * @returns {Object} instance: setData, getData, setColumns, getSelection, clearSelection, setPage,
 *   setQuery, setLoading, setTotal, refresh, destroy, .instance (null)
 */
export function vfGrid(props) {
  const p = props || {};
  function rowsByKey(s, keys) {
    const out = [];
    const data = s.data || [];
    for (let i = 0; i < data.length; i++) if (hasValue(keys, keyOf(data[i], i, s.rowKey))) out.push(data[i]);
    return out;
  }
  function select(sender, event, keys) {
    sender.setState({ selected: keys });
    emit(p.onSelect, sender, event, { keys: keys.slice(), rows: rowsByKey(sender.state, keys) });
  }
  function applyHeight(self) {
    const box = self.ids[self.state.id + '-scroll'];
    const h = self.state.height;
    if (box && present(h)) box.style.maxHeight = typeof h === 'number' ? h + 'px' : String(h);
  }
  const selectable = p.selectable === true ? 'multiple' : (p.selectable === 'single' || p.selectable === 'multiple' ? p.selectable : 'none');
  const state = stateOf(p, 'grid', {
    columns: (p.columns || []).slice(),
    data: (p.data || []).slice(),
    mode: p.mode === 'server' ? 'server' : 'client',
    selectable: selectable,
    selected: [],
    page: Math.max(1, Math.floor(Number(p.page) || 1)),
    sort: p.sort || null,
    instance: null
  });
  delete state.options;
  delete state.lib;
  return instance({
    state: state,
    render: render,
    delegates: [
      {
        selector: '[data-action="sort"]',
        eventType: 'click',
        onEvent: function (e) {
          const key = e.target.getAttribute('data-value');
          const now = e.sender.state.sort;
          const dir = now && now.key === key && now.dir === 'asc' ? 'desc' : 'asc';
          e.sender.setState({ sort: { key: key, dir: dir }, page: 1 });
          emit(p.onSort, e.sender, e.event, { key: key, dir: dir });
        }
      },
      {
        selector: '[data-action="page"]',
        eventType: 'click',
        onEvent: function (e) {
          const page = Number(e.target.getAttribute('data-page'));
          if (page === e.sender.state.page) return;
          e.sender.setState({ page: page });
          emit(p.onPage, e.sender, e.event, { page: page });
        }
      },
      {
        selector: '[data-action="select-row"]',
        eventType: 'change',
        onEvent: function (e) {
          const key = e.target.getAttribute('data-value');
          const s = e.sender.state;
          let keys;
          if (s.selectable === 'single') keys = [key];
          else {
            keys = [];
            for (let i = 0; i < s.selected.length; i++) if (s.selected[i] !== key) keys.push(s.selected[i]);
            if (e.target.checked) keys.push(key);
          }
          select(e.sender, e.event, keys);
        }
      },
      {
        selector: '[data-action="select-all"]',
        eventType: 'change',
        onEvent: function (e) {
          const s = e.sender.state;
          const pageKeys = [];
          const v = view(s);
          for (let i = 0; i < v.rows.length; i++) pageKeys.push(v.rows[i].key);
          const keys = [];
          for (let i = 0; i < s.selected.length; i++) if (pageKeys.indexOf(s.selected[i]) < 0) keys.push(s.selected[i]);
          if (e.target.checked) for (let i = 0; i < pageKeys.length; i++) keys.push(pageKeys[i]);
          select(e.sender, e.event, keys);
        }
      },
      {
        selector: '[data-action="row"]',
        eventType: 'click',
        onEvent: function (e) {
          // A click on a control inside the row belongs to that control.
          for (let node = e.event.target; node && node !== e.target; node = node.parentNode) {
            if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL)$/.test(node.tagName)) return;
          }
          const key = e.target.getAttribute('data-value');
          const index = Number(e.target.getAttribute('data-index'));
          const rows = rowsByKey(e.sender.state, [key]);
          emit(p.onRowClick, e.sender, e.event, { row: rows[0] || null, key: key, index: index });
        }
      }
    ],
    methods: {
      setData: function (data) {
        const s = this.state;
        const next = (data || []).slice();
        const keys = [];
        for (let i = 0; i < next.length; i++) keys.push(keyOf(next[i], i, s.rowKey));
        const kept = [];
        for (let i = 0; i < s.selected.length; i++) if (keys.indexOf(s.selected[i]) >= 0) kept.push(s.selected[i]);
        this.setState({ data: next, selected: kept, page: s.mode === 'server' ? s.page : 1, loading: false });
      },
      getData: function () { return this.state.data.slice(); },
      setColumns: function (columns) { this.setState({ columns: (columns || []).slice() }); },
      getSelection: function () { return rowsByKey(this.state, this.state.selected); },
      clearSelection: function () { this.setState({ selected: [] }); },
      setPage: function (page) { this.setState({ page: Math.max(1, Math.floor(Number(page) || 1)) }); },
      setQuery: function (query) { this.setState({ query: query, page: 1 }); },
      setLoading: function (loading) { this.setState({ loading: !!loading }); },
      setTotal: function (total) { this.setState({ total: total }); },
      getValue: function () { return this.state.selected.slice(); },
      setValue: function (keys) { this.setState({ selected: (keys || []).slice() }); }
    },
    onMount: applyHeight,
    onUpdate: applyHeight
  });
}
