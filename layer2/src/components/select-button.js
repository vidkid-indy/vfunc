// SPDX-License-Identifier: Apache-2.0
//
// SelectButton — Tier P (vsSelectButton + vfSelectButton). Spec reference: pilot
// components/atoms/VfSelectButton.js (rewritten: aria-pressed toggle buttons in a labelled group,
// hidden inputs for forms, hooks on data-action "select" + data-value).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls, present, normalizeOptions, hasValue, emit } from '../_internal/common.js';
import { fieldIds, controlClass, fieldTexts } from '../_internal/field.js';
import { stateOf, instance } from '../_internal/instance.js';
import { SIZES } from './input.js';

const html = vf.html;

/**
 * Options as toggle buttons: one choice, or several with `multiple`.
 * @param {Object} props
 * @param {Array} props.options - strings/numbers or { value, label, disabled }
 * @param {*|Array} [props.value] - an array with `multiple`
 * @param {boolean} [props.multiple]
 * @param {string|SafeHtml} [props.label] - a visible label that names the group
 * @param {string} [props.ariaLabel] - names the group without a visible label
 * @param {string} [props.name] - hidden inputs for form submission
 *   Also: size, disabled, hint, error, id (of the group), ref, describedBy, className
 * @returns {SafeHtml}
 */
export function vsSelectButton(props) {
  const p = props || {};
  const a = fieldIds(p, 'select-button');
  const options = normalizeOptions(p.options);
  const buttons = [];
  const hidden = [];
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    const on = hasValue(p.value, o.value);
    buttons.push(html`<button ${attrs({
      type: 'button',
      class: 'vf-select-button__option',
      'data-action': 'select',
      'data-value': o.value,
      'aria-pressed': on,
      disabled: !!p.disabled || o.disabled
    })}>${o.label}</button>`);
    if (on && present(p.name)) hidden.push(html`<input ${attrs({ type: 'hidden', name: p.name, value: o.value })}>`);
  }
  const labelId = a.wrapped && present(p.label) ? a.id + '-label' : null;
  const group = html`<div ${attrs({
    class: controlClass('vf-select-button', p, a),
    role: 'group',
    id: a.id,
    'data-ref': p.ref,
    'data-size': oneOf('vsSelectButton size', p.size, SIZES),
    'aria-labelledby': labelId,
    'aria-label': labelId ? null : p.ariaLabel,
    'aria-describedby': a.describedBy
  })}>${buttons}${hidden}</div>`;
  if (!a.wrapped) return group;
  const label = labelId ? html`<span ${attrs({ class: 'vf-field__label', id: labelId })}>${p.label}</span>` : '';
  return html`<div ${attrs({ class: cls('vf-field', p.className), 'data-state': a.invalid ? 'invalid' : null })}>${label}${group}${fieldTexts(p, a)}</div>`;
}

/**
 * vsSelectButton with behavior: a click selects (or with `multiple` toggles) an option.
 * @param {Object} props - vsSelectButton props, plus onChange ({ sender, event, data: { value } })
 * @returns {Object} instance with getValue() → value or array, setValue()
 */
export function vfSelectButton(props) {
  const p = props || {};
  const initial = p.multiple
    ? (Object.prototype.toString.call(p.value) === '[object Array]' ? p.value.slice() : (p.value == null ? [] : [p.value]))
    : p.value;
  return instance({
    state: stateOf(p, 'select-button', { value: initial }),
    render: function (s) { return vsSelectButton(s); },
    delegates: [{
      selector: '[data-action="select"]',
      eventType: 'click',
      onEvent: function (e) {
        const s = e.sender.state;
        if (s.disabled) return;
        const picked = e.target.getAttribute('data-value');
        let next;
        if (s.multiple) {
          next = [];
          let found = false;
          for (let i = 0; i < s.value.length; i++) {
            if (String(s.value[i]) === picked) found = true;
            else next.push(s.value[i]);
          }
          if (!found) next.push(picked);
        } else {
          if (hasValue(s.value, picked)) return;
          next = picked;
        }
        e.sender.setState({ value: next });
        emit(p.onChange, e.sender, e.event, { value: next });
      }
    }]
  });
}
