// SPDX-License-Identifier: Apache-2.0
//
// Field — Tier S (vsField only). Label, hint and error around a control you build yourself. The
// input components take label / hint / error directly (D-030); use vsField for anything else.

import { fieldIds, field } from '../_internal/field.js';

/**
 * @param {Object} props
 * @param {string|SafeHtml} [props.label]
 * @param {string|SafeHtml} [props.hint]
 * @param {string|SafeHtml} [props.error] - also sets aria-invalid for the control
 * @param {boolean} [props.required] - shows the required mark
 * @param {string} [props.id] - the control's id; generated when absent
 * @param {string} [props.describedBy] - extra ids for aria-describedby
 * @param {string} [props.className] - on the .vf-field wrapper
 * @param {function({id: string, describedBy: ?string, invalid: boolean, required: boolean}): SafeHtml} props.control
 * @returns {SafeHtml}
 */
export function vsField(props) {
  const p = props || {};
  const a = fieldIds(p, 'field', true);
  const control = typeof p.control === 'function'
    ? p.control({ id: a.id, describedBy: a.describedBy, invalid: a.invalid, required: a.required })
    : '';
  return field(p, a, control);
}
