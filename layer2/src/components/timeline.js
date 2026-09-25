// SPDX-License-Identifier: Apache-2.0
//
// Timeline — Tier S (vsTimeline only). Spec reference: pilot components/molecules/VTimeline.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls, present } from '../_internal/common.js';
import { TONES } from './badge.js';

const html = vf.html;

function timeOf(value, format) {
  if (!present(value) && value !== 0) return '';
  const date = value instanceof Date ? value : new Date(value);
  const valid = !isNaN(date.getTime());
  const iso = valid ? date.toISOString() : null;
  const text = valid ? vf.fmt.date(date, format) : String(value);
  return html`<time ${attrs({ class: 'vf-timeline__time', datetime: typeof value === 'string' ? value : iso })}>${text}</time>`;
}

/**
 * Events in order.
 * @param {Object} props
 * @param {Array<{title: *, time?: Date|number|string, description?: *, variant?: string}>} props.items
 * @param {Intl.DateTimeFormatOptions} [props.timeFormat] - for vf.fmt.date
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsTimeline(props) {
  const p = props || {};
  const list = p.items || [];
  const items = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i] || {};
    items.push(html`<li ${attrs({ class: 'vf-timeline__item', 'data-variant': oneOf('vsTimeline variant', item.variant, TONES) })}><span class="vf-timeline__marker" aria-hidden="true"></span><div class="vf-timeline__content"><p class="vf-timeline__title">${item.title}</p>${timeOf(item.time, p.timeFormat)}${present(item.description) ? html`<p class="vf-timeline__description">${item.description}</p>` : ''}</div></li>`);
  }
  return html`<ol ${attrs({ class: cls('vf-timeline', p.className), id: p.id, 'data-ref': p.ref })}>${items}</ol>`;
}
