// SPDX-License-Identifier: Apache-2.0
//
// Select — Tier S (vsSelect only). Spec reference: pilot components/atoms/VSelect.js (rewritten:
// the pilot put id and name into the markup unescaped).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { extend, normalizeOptions, hasValue, present } from '../_internal/common.js';
import { fieldIds, field } from '../_internal/field.js';
import { controlAttrs } from './input.js';

const html = vf.html;

function optionList(options, value) {
  const out = [];
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    if (o.options) {
      out.push(html`<optgroup ${attrs({ label: o.label, disabled: o.disabled })}>${optionList(o.options, value)}</optgroup>`);
    } else {
      out.push(html`<option value="${o.value}" ${attrs({ selected: hasValue(value, o.value), disabled: o.disabled })}>${o.label}</option>`);
    }
  }
  return out;
}

/**
 * A `<select>`, wrapped in a field when label, hint or error is given.
 * @param {Object} props
 * @param {Array<string|number|{value: *, label?: string, disabled?: boolean}|{label: string, options: Array}>} props.options
 *   `{ label, options }` makes an `<optgroup>`.
 * @param {*|Array} [props.value] - the selected value (an array with `multiple`)
 * @param {string} [props.placeholder] - an empty first option
 * @param {boolean} [props.multiple]
 *   Also: name, size, disabled, required, label, hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsSelect(props) {
  const p = props || {};
  const a = fieldIds(p, 'select');
  const base = controlAttrs('vf-select', p, a, 'vsSelect');
  base.readonly = null; // not an attribute of <select>
  const placeholder = present(p.placeholder)
    ? html`<option value="" ${attrs({ selected: !present(p.value) })}>${p.placeholder}</option>` : '';
  const control = html`<select ${attrs(extend(base, { multiple: !!p.multiple }))}>${placeholder}${optionList(normalizeOptions(p.options), p.value)}</select>`;
  return field(p, a, control);
}
