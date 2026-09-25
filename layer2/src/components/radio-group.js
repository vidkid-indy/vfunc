// SPDX-License-Identifier: Apache-2.0
//
// RadioGroup — Tier S (vsRadioGroup only). Spec reference: pilot components/atoms/VRadio.js.
// A <fieldset> with a <legend>: native radios keep arrow-key navigation and form submission.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { uid, present, normalizeOptions, hasValue } from '../_internal/common.js';
import { fieldIds, fieldset } from '../_internal/field.js';

const html = vf.html;

const DIRECTIONS = ['vertical', 'horizontal'];

/**
 * A group of radio buttons.
 * @param {Object} props
 * @param {Array<string|number|{value: *, label?: string, disabled?: boolean}>} props.options
 * @param {*} [props.value] - the checked value
 * @param {string} [props.name] - generated when absent (radios need one to form a group)
 * @param {string|SafeHtml} [props.label] - the legend
 * @param {'vertical'|'horizontal'} [props.direction='vertical'] - `data-direction`
 *   Also: disabled, required, hint, error, id (of the fieldset), ref, action (on each radio),
 *   describedBy, className
 * @returns {SafeHtml}
 */
export function vsRadioGroup(props) {
  const p = props || {};
  const a = fieldIds(p, 'radio', true);
  const name = present(p.name) ? p.name : uid('radio-name');
  const options = normalizeOptions(p.options);
  const items = [];
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    items.push(html`<label class="vf-check"><input ${attrs({
      type: 'radio',
      class: 'vf-check__input',
      name: name,
      value: o.value,
      'data-action': p.action,
      'aria-invalid': a.invalid || null,
      checked: hasValue(p.value, o.value),
      disabled: !!p.disabled || o.disabled,
      required: !!p.required
    })}><span class="vf-check__label">${o.label}</span></label>`);
  }
  return fieldset('vf-field vf-radio-group', p, a, p.label, html`<div class="vf-radio-group__options">${items}</div>`,
    { 'data-direction': oneOf('vsRadioGroup direction', p.direction, DIRECTIONS) });
}
