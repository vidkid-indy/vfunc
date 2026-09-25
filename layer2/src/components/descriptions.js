// SPDX-License-Identifier: Apache-2.0
//
// Descriptions — Tier S (vsDescriptions only). Spec reference: pilot components/molecules/VDescriptions.js.
// Label/value pairs as a <dl>; `columns` lays them out in a grid.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

/**
 * @param {Object} props
 * @param {Array<{label: *, value: *}>} props.items
 * @param {1|2|3|4} [props.columns=1] - `data-columns`
 * @param {string|SafeHtml} [props.title]
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsDescriptions(props) {
  const p = props || {};
  const columns = Math.max(1, Math.min(4, Math.floor(Number(p.columns) || 1)));
  const list = p.items || [];
  const items = [];
  for (let i = 0; i < list.length; i++) {
    items.push(html`<div class="vf-descriptions__item"><dt class="vf-descriptions__label">${list[i].label}</dt><dd class="vf-descriptions__value">${list[i].value}</dd></div>`);
  }
  const title = present(p.title) ? html`<p class="vf-descriptions__title">${p.title}</p>` : '';
  return html`<div ${attrs({ class: cls('vf-descriptions', p.className), id: p.id, 'data-ref': p.ref, 'data-columns': columns })}>${title}<dl class="vf-descriptions__list">${items}</dl></div>`;
}
