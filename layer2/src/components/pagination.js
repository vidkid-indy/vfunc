// SPDX-License-Identifier: Apache-2.0
//
// Pagination — Tier P (vsPagination + vfPagination). Spec reference: pilot
// components/navigation/VPaginationPreview.js (props only). vfGrid (Phase 3) renders it too.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';

const html = vf.html;

/** The number of pages for `total` items (at least 1). */
export function pageCount(total, pageSize) {
  const size = Math.max(1, Math.floor(Number(pageSize) || 10));
  return Math.max(1, Math.ceil((Number(total) || 0) / size));
}

/** The pages to show: 1, the last, the current ± siblings, and 0 for each gap ("…"). */
export function pageList(page, pages, siblings) {
  const out = [];
  const from = Math.max(2, page - siblings);
  const to = Math.min(pages - 1, page + siblings);
  out.push(1);
  if (from > 2) out.push(from === 3 ? 2 : 0);
  for (let n = from; n <= to; n++) out.push(n);
  if (to < pages - 1) out.push(to === pages - 2 ? pages - 1 : 0);
  if (pages > 1) out.push(pages);
  return out;
}

function clampPage(page, pages) {
  return Math.max(1, Math.min(pages, Math.floor(Number(page) || 1)));
}

/**
 * Page buttons (data-action "page", data-page) with previous / next.
 * @param {Object} props
 * @param {number} props.total - the number of items
 * @param {number} [props.page=1] - 1-based
 * @param {number} [props.pageSize=10]
 * @param {number} [props.siblings=1] - pages shown on each side of the current one
 * @param {string} [props.label] - the nav's aria-label; replaces `pagination.label`
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsPagination(props) {
  const p = props || {};
  const pages = pageCount(p.total, p.pageSize);
  const page = clampPage(p.page, pages);
  const siblings = p.siblings == null ? 1 : Math.max(0, Math.floor(Number(p.siblings) || 0));
  function button(target, text, label, current) {
    return html`<li><button ${attrs({
      type: 'button',
      class: 'vf-pagination__button',
      'data-action': 'page',
      'data-page': target,
      'aria-label': label,
      'aria-current': current ? 'page' : null,
      disabled: target < 1 || target > pages
    })}>${text}</button></li>`;
  }
  const items = [button(page - 1, html`<span aria-hidden="true">&lsaquo;</span>`, msg('pagination.previous'))];
  const list = pageList(page, pages, siblings);
  for (let i = 0; i < list.length; i++) {
    const n = list[i];
    items.push(n === 0
      ? html`<li><span class="vf-pagination__gap" aria-hidden="true">&hellip;</span></li>`
      : button(n, n, msg('pagination.page', null, { page: n }), n === page));
  }
  items.push(button(page + 1, html`<span aria-hidden="true">&rsaquo;</span>`, msg('pagination.next')));
  return html`<nav ${attrs({ class: cls('vf-pagination', p.className), id: p.id, 'data-ref': p.ref, 'aria-label': msg('pagination.label', p.label) })}><ul class="vf-pagination__list">${items}</ul></nav>`;
}

/**
 * vsPagination with behavior: a page button changes the page and calls onChange.
 * @param {Object} props - vsPagination props, plus onChange ({ sender, event, data: { page } })
 * @returns {Object} instance with getValue() → page, setValue(page), setTotal(total)
 */
export function vfPagination(props) {
  const p = props || {};
  return instance({
    state: stateOf(p, 'pagination', { page: clampPage(p.page, pageCount(p.total, p.pageSize)) }),
    render: function (s) { return vsPagination(s); },
    delegates: [{
      selector: '[data-action="page"]',
      eventType: 'click',
      onEvent: function (e) {
        const s = e.sender.state;
        const page = clampPage(e.target.getAttribute('data-page'), pageCount(s.total, s.pageSize));
        if (page === s.page) return;
        e.sender.setState({ page: page });
        emit(p.onChange, e.sender, e.event, { page: page });
      }
    }],
    methods: {
      getValue: function () { return this.state.page; },
      setValue: function (page) { this.setState({ page: clampPage(page, pageCount(this.state.total, this.state.pageSize)) }); },
      setTotal: function (total) {
        const s = this.state;
        this.setState({ total: total, page: clampPage(s.page, pageCount(total, s.pageSize)) });
      }
    }
  });
}
