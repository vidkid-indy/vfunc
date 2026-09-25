// SPDX-License-Identifier: Apache-2.0
//
// Progress — Tier S (vsProgress only). Spec reference: pilot components/atoms/VProgress.js.
// A native <progress> (IE10+): the bar length needs no inline style, and the element is
// labelable. Without a value it shows the indeterminate state.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { present } from '../_internal/common.js';
import { fieldIds, field, controlClass } from '../_internal/field.js';

const html = vf.html;

/**
 * A progress bar.
 * @param {Object} props
 * @param {?number} [props.value] - null or absent: indeterminate
 * @param {number} [props.max=100]
 * @param {string|SafeHtml} [props.label]
 * @param {boolean} [props.showValue] - the percentage as text next to the bar (vf.fmt.number)
 *   Also: hint, id, ref, describedBy, className
 * @returns {SafeHtml}
 */
export function vsProgress(props) {
  const p = props || {};
  const a = fieldIds(p, 'progress');
  const max = p.max == null ? 100 : Number(p.max);
  const known = present(p.value) || p.value === 0;
  const value = known ? Math.max(0, Math.min(max, Number(p.value))) : null;
  const bar = html`<progress ${attrs({
    class: controlClass('vf-progress', p, a),
    id: a.id,
    value: value,
    max: max,
    'data-ref': p.ref,
    'aria-describedby': a.describedBy
  })}></progress>`;
  const text = p.showValue && known
    ? html`<span class="vf-progress__value" aria-hidden="true">${vf.fmt.number(max ? value / max : 0, { style: 'percent' })}</span>` : '';
  return field(p, a, text ? html`<div class="vf-progress__row">${bar}${text}</div>` : bar);
}
