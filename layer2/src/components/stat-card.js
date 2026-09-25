// SPDX-License-Identifier: Apache-2.0
//
// StatCard — Tier S (vsStatCard only). Spec reference: pilot components/molecules/VStatCard.js.
// Numbers are formatted with vf.fmt in the current locale.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

/**
 * A key figure with an optional change.
 * @param {Object} props
 * @param {string|SafeHtml} props.label
 * @param {number|string|SafeHtml} props.value - a number goes through vf.fmt.number(value, format)
 * @param {Intl.NumberFormatOptions} [props.format] - e.g. { style: 'currency', currency: 'KRW' }
 * @param {number} [props.delta] - the change as a ratio: 0.125 shows "+12.5%" (`data-trend`)
 * @param {string|SafeHtml} [props.deltaLabel] - e.g. "vs last month"
 * @param {string|SafeHtml} [props.description]
 * @param {*} [props.icon] - markup before the label
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsStatCard(props) {
  const p = props || {};
  const value = typeof p.value === 'number' ? vf.fmt.number(p.value, p.format) : p.value;
  let delta = '';
  if (typeof p.delta === 'number' && !isNaN(p.delta)) {
    const trend = p.delta > 0 ? 'up' : p.delta < 0 ? 'down' : 'flat';
    const text = (p.delta > 0 ? '+' : '') + vf.fmt.number(p.delta, { style: 'percent', maximumFractionDigits: 1 });
    const word = trend === 'up' ? msg('statCard.up') : trend === 'down' ? msg('statCard.down') : '';
    const said = word ? html`<span class="vf-visually-hidden">${word} </span>` : '';
    delta = html`<p ${attrs({ class: 'vf-stat-card__delta', 'data-trend': trend })}>${said}<span class="vf-stat-card__change">${text}</span>${present(p.deltaLabel) ? html` <span class="vf-stat-card__delta-label">${p.deltaLabel}</span>` : ''}</p>`;
  }
  const icon = present(p.icon) ? html`<span class="vf-stat-card__icon" aria-hidden="true">${p.icon}</span>` : '';
  const description = present(p.description) ? html`<p class="vf-stat-card__description">${p.description}</p>` : '';
  return html`<div ${attrs({ class: cls('vf-stat-card', p.className), id: p.id, 'data-ref': p.ref })}><p class="vf-stat-card__label">${icon}${p.label}</p><p class="vf-stat-card__value">${value}</p>${delta}${description}</div>`;
}
