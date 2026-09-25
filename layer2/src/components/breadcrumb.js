// SPDX-License-Identifier: Apache-2.0
//
// Breadcrumb — Tier S (vsBreadcrumb only). Spec reference: pilot components/navigation/VBreadcrumb.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

/**
 * The path to the current page. The last item is the current page (aria-current="page").
 * @param {Object} props
 * @param {Array<{label: *, href?: string}>} props.items - href through vf.safeUrl; without href: text
 * @param {string} [props.label] - the nav's aria-label; replaces the `breadcrumb.label` message
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsBreadcrumb(props) {
  const p = props || {};
  const list = p.items || [];
  const items = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i] || {};
    const last = i === list.length - 1;
    const inner = last || !present(item.href)
      ? html`<span ${attrs({ class: 'vf-breadcrumb__current', 'aria-current': last ? 'page' : null })}>${item.label}</span>`
      : html`<a ${attrs({ class: 'vf-breadcrumb__link', href: item.href })}>${item.label}</a>`;
    items.push(html`<li class="vf-breadcrumb__item">${inner}</li>`);
  }
  return html`<nav ${attrs({ class: cls('vf-breadcrumb', p.className), id: p.id, 'data-ref': p.ref, 'aria-label': msg('breadcrumb.label', p.label) })}><ol class="vf-breadcrumb__list">${items}</ol></nav>`;
}
