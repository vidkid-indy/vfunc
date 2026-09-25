// SPDX-License-Identifier: Apache-2.0
//
// Table — Tier S (vsTable only, core, D-031). Spec reference: pilot components/molecules/VTable.js
// (rewritten: sortable headers are buttons with data-action "sort" and aria-sort, rows carry their
// key, empty and loading states). A list screen is vsTable + vfPagination + app state; vfGrid in
// the data file adds selection and built-in sorting and paging.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present, hasValue } from '../_internal/common.js';
import { vsEmptyState } from './empty-state.js';

const html = vf.html;

const ALIGNS = { start: 1, center: 1, end: 1 };

/** The text or markup of a cell: column.render(row, index), else row[column.key]. */
function cellOf(column, row, index) {
  if (typeof column.render === 'function') return column.render(row, index);
  return row == null ? '' : row[column.key];
}

/** The key of a row: row[rowKey], else its index. */
export function rowKeyOf(row, index, rowKey) {
  const k = rowKey || 'id';
  return row != null && typeof row === 'object' && row[k] != null ? String(row[k]) : String(index);
}

/**
 * A table.
 * @param {Object} props
 * @param {Array<{key: string, label: *, align?: 'start'|'center'|'end', sortable?: boolean, render?: function(Object, number): *}>} props.columns
 * @param {Array<Object>} props.data - the rows to show
 * @param {{key: string, dir: 'asc'|'desc'}} [props.sort] - the sorted column (aria-sort)
 * @param {string} [props.rowKey='id'] - `data-value` of each row
 * @param {string[]} [props.selected] - keys of rows marked `data-state="selected"`
 * @param {string} [props.rowAction] - `data-action` on each row, for a delegate on row clicks
 * @param {*} [props.caption] - the table's caption (its accessible name)
 * @param {*} [props.emptyText] - title of the empty state; replaces `emptyState.title`
 * @param {boolean} [props.loading] - `aria-busy`; without rows, a loading row
 * @param {number} [props.indexBase=0] - added to the row index given to render (paged data)
 *   Also: id (of the table), ref, className
 * @returns {SafeHtml}
 */
export function vsTable(props) {
  const p = props || {};
  const columns = p.columns || [];
  const rows = p.data || [];
  const sort = p.sort || {};
  const base = Number(p.indexBase) || 0;
  const head = [];
  for (let c = 0; c < columns.length; c++) {
    const col = columns[c];
    const align = ALIGNS[col.align] ? col.align : null;
    const sorted = col.sortable && sort.key === col.key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : (col.sortable ? 'none' : null);
    const label = col.sortable
      ? html`<button ${attrs({ type: 'button', class: 'vf-table__sort', 'data-action': 'sort', 'data-value': col.key })}>${col.label}<span class="vf-table__sort-icon" aria-hidden="true"></span></button>`
      : col.label;
    head.push(html`<th ${attrs({ class: 'vf-table__head', scope: 'col', 'data-align': align, 'aria-sort': sorted })}>${label}</th>`);
  }
  const body = [];
  for (let r = 0; r < rows.length; r++) {
    const key = rowKeyOf(rows[r], base + r, p.rowKey);
    const cells = [];
    for (let c = 0; c < columns.length; c++) {
      cells.push(html`<td ${attrs({ class: 'vf-table__cell', 'data-align': ALIGNS[columns[c].align] ? columns[c].align : null })}>${cellOf(columns[c], rows[r], base + r)}</td>`);
    }
    body.push(html`<tr ${attrs({
      class: 'vf-table__row',
      'data-value': key,
      'data-index': base + r,
      'data-action': p.rowAction,
      'data-state': hasValue(p.selected, key) ? 'selected' : null
    })}>${cells}</tr>`);
  }
  if (!rows.length) {
    body.push(html`<tr><td class="vf-table__empty" colspan="${columns.length || 1}">${p.loading
      ? html`<span class="vf-table__loading">${msg('common.loading')}</span>`
      : vsEmptyState({ title: p.emptyText })}</td></tr>`);
  }
  return html`<div ${attrs({ class: cls('vf-table', p.className), 'data-ref': p.ref, 'data-state': p.loading ? 'loading' : null })}><table ${attrs({
    class: 'vf-table__table',
    id: p.id,
    'aria-busy': p.loading ? true : null
  })}>${present(p.caption) ? html`<caption class="vf-table__caption">${p.caption}</caption>` : ''}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
