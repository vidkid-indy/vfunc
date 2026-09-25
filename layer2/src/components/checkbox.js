// SPDX-License-Identifier: Apache-2.0
//
// Checkbox — Tier S (vsCheckbox only). Spec reference: pilot components/atoms/VCheckbox.js.
// The label wraps the native checkbox, so clicking the text toggles it without an id.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { cls, extend } from '../_internal/common.js';
import { fieldIds, field, inputAttrs, requiredMark } from '../_internal/field.js';

const html = vf.html;

/**
 * The shared markup of vsCheckbox and vsSwitch.
 * @param {string} block - 'vf-check' or 'vf-switch'
 * @param {Object} p - props
 * @param {string} prefix - for a generated id
 * @param {Object} [extra] - more attributes of the input (role)
 * @param {SafeHtml|string} [decoration] - markup after the input (the switch track)
 */
export function checkControl(block, p, prefix, extra, decoration) {
  // The label wraps the input, so only a hint or an error needs the field wrapper.
  const a = fieldIds({ id: p.id, hint: p.hint, error: p.error, describedBy: p.describedBy, required: p.required }, prefix);
  const input = inputAttrs(block + '__input', p, a, extend({ type: 'checkbox', value: p.value, checked: !!p.checked, readonly: null }, extra));
  const control = html`<label ${attrs({ class: a.wrapped ? block : cls(block, p.className) })}><input ${attrs(input)}>${decoration || ''}<span class="${block}__label">${p.label}${requiredMark(a)}</span></label>`;
  return field(p, a, control, true);
}

/**
 * A native checkbox with its label.
 * @param {Object} props
 * @param {string|SafeHtml} props.label
 * @param {boolean} [props.checked]
 * @param {string} [props.value] - the submitted value (the browser's default is "on")
 *   Also: name, disabled, required, hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsCheckbox(props) {
  return checkControl('vf-check', props || {}, 'check');
}
