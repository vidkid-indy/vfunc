// SPDX-License-Identifier: Apache-2.0
//
// Slider — Tier S (vsSlider only). Spec reference: pilot components/atoms/VSlider.js.
// A native range input: keyboard, forms and `input` / `change` events work as usual.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { fieldIds, field, controlClass, inputAttrs } from '../_internal/field.js';

const html = vf.html;

/**
 * A range slider.
 * @param {Object} props
 * @param {number} [props.value]
 * @param {number} [props.min=0]
 * @param {number} [props.max=100]
 * @param {number} [props.step=1]
 *   Also: name, disabled, label, hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsSlider(props) {
  const p = props || {};
  const a = fieldIds(p, 'slider');
  return field(p, a, html`<input ${attrs(inputAttrs(controlClass('vf-slider', p, a), p, a, {
    type: 'range',
    value: p.value,
    min: p.min == null ? 0 : p.min,
    max: p.max == null ? 100 : p.max,
    step: p.step == null ? 1 : p.step,
    readonly: null,
    required: null
  }))}>`);
}
