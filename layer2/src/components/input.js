// SPDX-License-Identifier: Apache-2.0
//
// Input — Tier S (vsInput only). Spec reference: pilot components/atoms/VInput.js (rewritten:
// escaped attributes, field wrapper with aria links, size as data-size).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { extend } from '../_internal/common.js';
import { fieldIds, field, controlClass, inputAttrs } from '../_internal/field.js';

const html = vf.html;

// The first value is the default.
const TYPES = ['text', 'email', 'tel', 'url', 'number', 'search', 'password', 'date', 'time', 'datetime-local', 'month', 'week'];
export const SIZES = ['md', 'sm', 'lg'];

/**
 * The attributes shared by the text-like controls (input, textarea, select).
 * @param {string} block - the control's class
 * @param {Object} p - props
 * @param {Object} a - from fieldIds
 */
export function controlAttrs(block, p, a, name) {
  return inputAttrs(controlClass(block, p, a), p, a, { 'data-size': oneOf(name + ' size', p.size, SIZES) });
}

/** The box around an input and its buttons (number, search, password): class and data-size. */
export function boxAttrs(block, p, a, name) {
  return { class: controlClass(block, p, a), 'data-size': oneOf(name + ' size', p.size, SIZES) };
}

/**
 * An `<input>`, wrapped in a field when label, hint or error is given.
 * @param {Object} props - name, value, type, placeholder, autocomplete, inputmode, pattern, min,
 *   max, step, minlength, maxlength, size, disabled, readonly, required, label, hint, error, id,
 *   ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsInput(props) {
  const p = props || {};
  const a = fieldIds(p, 'input');
  const control = html`<input ${attrs(extend(controlAttrs('vf-input', p, a, 'vsInput'), {
    type: oneOf('vsInput type', p.type, TYPES),
    value: p.value,
    placeholder: p.placeholder,
    autocomplete: p.autocomplete,
    inputmode: p.inputmode,
    pattern: p.pattern,
    min: p.min,
    max: p.max,
    step: p.step,
    minlength: p.minlength,
    maxlength: p.maxlength
  }))}>`;
  return field(p, a, control);
}
