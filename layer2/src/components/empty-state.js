// SPDX-License-Identifier: Apache-2.0
//
// EmptyState — Tier S (vsEmptyState only). Spec reference: pilot components/molecules/VEmptyState.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

/**
 * What to show when a list or a search has nothing.
 * @param {Object} props
 * @param {string|SafeHtml} [props.title] - replaces the `emptyState.title` message
 * @param {string|SafeHtml} [props.description]
 * @param {*} [props.icon] - decorative markup (hidden from screen readers)
 * @param {*} [props.action] - markup such as a vsButton
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsEmptyState(props) {
  const p = props || {};
  const icon = present(p.icon) ? html`<div class="vf-empty-state__icon" aria-hidden="true">${p.icon}</div>` : '';
  const description = present(p.description) ? html`<p class="vf-empty-state__description">${p.description}</p>` : '';
  const action = present(p.action) ? html`<div class="vf-empty-state__action">${p.action}</div>` : '';
  return html`<div ${attrs({ class: cls('vf-empty-state', p.className), id: p.id, 'data-ref': p.ref })}>${icon}<p class="vf-empty-state__title">${msg('emptyState.title', p.title)}</p>${description}${action}</div>`;
}
