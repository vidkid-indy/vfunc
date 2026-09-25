// SPDX-License-Identifier: Apache-2.0
//
// Textarea — Tier S (vsTextarea only). Spec reference: pilot components/atoms/VTextarea.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { extend } from '../_internal/common.js';
import { fieldIds, field } from '../_internal/field.js';
import { controlAttrs } from './input.js';

const html = vf.html;

/**
 * A `<textarea>` (the value is escaped text), wrapped in a field when label, hint or error is given.
 * @param {Object} props - name, value, rows (3), placeholder, maxlength, minlength, size, disabled,
 *   readonly, required, label, hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsTextarea(props) {
  const p = props || {};
  const a = fieldIds(p, 'textarea');
  const control = html`<textarea ${attrs(extend(controlAttrs('vf-textarea', p, a, 'vsTextarea'), {
    rows: p.rows == null ? 3 : p.rows,
    placeholder: p.placeholder,
    minlength: p.minlength,
    maxlength: p.maxlength
  }))}>${p.value == null ? '' : String(p.value)}</textarea>`;
  return field(p, a, control);
}
