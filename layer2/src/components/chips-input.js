// SPDX-License-Identifier: Apache-2.0
//
// ChipsInput — Tier P (vsChipsInput + vfChipsInput). Spec reference: pilot
// components/atoms/VfChipsInput.js (rewritten: vsTag chips with data-action "remove", one hidden
// input per chip for form submission, IME-aware Enter, no fixed placeholder text).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { emit } from '../_internal/common.js';
import { fieldIds, field, controlClass, inputAttrs } from '../_internal/field.js';
import { stateOf, instance, control, idSelector, composing } from '../_internal/instance.js';
import { vsTag } from './tag.js';

const html = vf.html;

function list(value) {
  if (Object.prototype.toString.call(value) !== '[object Array]') return [];
  const out = [];
  for (let i = 0; i < value.length; i++) if (value[i] != null && value[i] !== '') out.push(String(value[i]));
  return out;
}

/**
 * Chips (vsTag, removable) followed by a text input. Each chip also writes
 * `<input type="hidden" name>`, so a form submits them as repeated fields.
 * @param {Object} props
 * @param {string[]} [props.value]
 * @param {string} [props.placeholder]
 * @param {number} [props.max] - no input once reached
 *   Also: name, disabled, required, label, hint, error, id, ref, describedBy, className
 * @returns {SafeHtml}
 */
export function vsChipsInput(props) {
  const p = props || {};
  const a = fieldIds(p, 'chips');
  const values = list(p.value);
  const full = p.max != null && values.length >= Number(p.max);
  const chips = [];
  const hidden = [];
  for (let i = 0; i < values.length; i++) {
    chips.push(html`<li class="vf-chips-input__chip">${vsTag({ label: values[i], value: values[i], removable: true, disabled: !!p.disabled })}</li>`);
    if (p.name) hidden.push(html`<input ${attrs({ type: 'hidden', name: p.name, value: values[i] })}>`);
  }
  const box = html`<div ${attrs({ class: controlClass('vf-chips-input', p, a), 'data-state': p.disabled ? 'disabled' : null })}>${chips.length ? html`<ul class="vf-chips-input__list">${chips}</ul>` : ''}<input ${attrs(inputAttrs('vf-chips-input__input', p, a, {
    type: 'text',
    name: null,
    'data-action': null,
    placeholder: p.placeholder,
    autocomplete: 'off',
    readonly: null,
    required: !!p.required && values.length === 0,
    disabled: !!p.disabled || full
  }))}>${hidden}</div>`;
  return field(p, a, box);
}

/**
 * vsChipsInput with behavior: Enter or a comma adds the typed text (trimmed, no duplicates, up to
 * max), Backspace in an empty input removes the last chip, the remove buttons remove theirs.
 * @param {Object} props - vsChipsInput props, plus onChange ({ sender, event, data: { value } })
 * @returns {Object} instance with getValue() → string[], setValue(string[]), add(text), remove(text)
 */
export function vfChipsInput(props) {
  const p = props || {};
  function change(sender, event, next) {
    sender.setState({ value: next });
    emit(p.onChange, sender, event, { value: next.slice() });
  }
  function add(sender, event, text) {
    const s = sender.state;
    const value = String(text == null ? '' : text).replace(/^\s+|\s+$/g, '');
    if (!value || s.disabled || s.value.indexOf(value) >= 0) return false;
    if (s.max != null && s.value.length >= Number(s.max)) return false;
    change(sender, event, s.value.concat([value]));
    return true;
  }
  function remove(sender, event, value) {
    const s = sender.state;
    const index = s.value.indexOf(String(value));
    if (index < 0 || s.disabled) return;
    const next = s.value.slice();
    next.splice(index, 1);
    change(sender, event, next);
  }
  const state = stateOf(p, 'chips', { value: list(p.value) });
  return instance({
    state: state,
    render: function (s) { return vsChipsInput(s); },
    delegates: [
      {
        selector: idSelector(state.id),
        eventType: 'keydown',
        onEvent: function (e) {
          if (composing(e.event)) return;
          const key = e.event.key;
          const input = e.target;
          if (key === 'Enter' || key === ',') {
            e.event.preventDefault();
            if (add(e.sender, e.event, input.value)) input.value = '';
          } else if (key === 'Backspace' && input.value === '' && e.sender.state.value.length) {
            remove(e.sender, e.event, e.sender.state.value[e.sender.state.value.length - 1]);
          }
        }
      },
      {
        selector: '[data-action="remove"]',
        eventType: 'click',
        onEvent: function (e) {
          remove(e.sender, e.event, e.target.getAttribute('data-value'));
          // The chip is gone: continue typing in the input.
          const input = control(e.sender);
          if (input) input.focus();
        }
      }
    ],
    methods: {
      setValue: function (value) { this.setState({ value: list(value) }); },
      add: function (text) { return add(this, null, text); },
      remove: function (text) { remove(this, null, text); }
    }
  });
}
