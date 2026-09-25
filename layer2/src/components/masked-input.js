// SPDX-License-Identifier: Apache-2.0
//
// MaskedInput — Tier P (vsMaskedInput + vfMaskedInput). Spec reference: pilot
// components/atoms/VfMaskedInput.js and VMaskedInput.js applyMask (rewritten: the caret stays
// after the same typed character, hooks on the id, raw value alongside the formatted one).
//
// Mask tokens: 0 = digit, a = letter (A–Z), * = letter or digit. Anything else is shown as is.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { emit } from '../_internal/common.js';
import { fieldIds, field } from '../_internal/field.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';
import { controlAttrs } from './input.js';

const html = vf.html;

const TOKENS = { '0': /[0-9]/, a: /[A-Za-z]/, '*': /[A-Za-z0-9]/ };

/** The typed characters that fit the mask, with the mask's literals in between: "01012345678" → "010-1234-5678". */
export function applyMask(value, mask) {
  const chars = String(value == null ? '' : value);
  let out = '';
  let j = 0;
  for (let i = 0; i < mask.length && j < chars.length; i++) {
    const m = mask.charAt(i);
    const token = Object.prototype.hasOwnProperty.call(TOKENS, m) ? TOKENS[m] : null;
    if (token) {
      while (j < chars.length && !token.test(chars.charAt(j))) j++;
      if (j >= chars.length) break;
      out += chars.charAt(j++);
    } else {
      out += m;
      if (chars.charAt(j) === m) j++;
    }
  }
  return out;
}

/** Only the characters in token positions: "010-1234-5678" → "01012345678". */
export function unmask(value, mask) {
  const text = applyMask(value, mask);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (Object.prototype.hasOwnProperty.call(TOKENS, mask.charAt(i))) out += text.charAt(i);
  }
  return out;
}

/**
 * A text input formatted by a mask.
 * @param {Object} props
 * @param {string} props.mask - e.g. '000-0000-0000', '000000-0000000', 'aa-0000'
 * @param {string} [props.value] - formatted with the mask
 *   Also: name, placeholder, autocomplete, size, disabled, readonly, required, label, hint, error,
 *   id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsMaskedInput(props) {
  const p = props || {};
  const a = fieldIds(p, 'masked');
  const mask = String(p.mask || '');
  const base = controlAttrs('vf-input', p, a, 'vsMaskedInput');
  base.type = 'text';
  base.value = applyMask(p.value, mask);
  base.placeholder = p.placeholder;
  base.autocomplete = p.autocomplete;
  base.maxlength = mask.length || null;
  base.inputmode = /^[^a*]*$/.test(mask) ? 'numeric' : null;
  base['data-mask'] = mask;
  return field(p, a, html`<input ${attrs(base)}>`);
}

/**
 * vsMaskedInput with behavior: formats while typing and keeps the caret after the same character.
 * @param {Object} props - vsMaskedInput props, plus:
 * @param {function} [props.onInput] - ({ sender, event, data: { value, raw } }) on every change of the text
 * @param {function} [props.onChange] - the same data on the native change (commit)
 * @returns {Object} instance with getValue() → formatted, getRawValue() → raw, setValue()
 */
export function vfMaskedInput(props) {
  const p = props || {};
  const mask = String(p.mask || '');
  function tokensBefore(text, end) {
    let n = 0;
    for (let i = 0; i < end && i < text.length; i++) if (Object.prototype.hasOwnProperty.call(TOKENS, mask.charAt(i))) n++;
    return n;
  }
  function caretAfter(text, count) {
    if (count === 0) return 0;
    let n = 0;
    for (let i = 0; i < text.length; i++) {
      if (Object.prototype.hasOwnProperty.call(TOKENS, mask.charAt(i))) n++;
      if (n === count) return i + 1;
    }
    return text.length;
  }
  const state = stateOf(p, 'masked', { value: applyMask(p.value, mask), mask: mask });
  return instance({
    state: state,
    render: function (s) { return vsMaskedInput(s); },
    delegates: [
      {
        selector: idSelector(state.id),
        eventType: 'input',
        onEvent: function (e) {
          const input = e.target;
          const typed = input.value;
          let caret = null;
          try { caret = input.selectionStart; } catch (err) { /* no selection API */ }
          // How many accepted characters (not literals) are before the caret.
          let count = 0;
          if (caret != null) {
            const head = applyMask(typed.slice(0, caret), mask);
            count = tokensBefore(head, head.length);
          }
          const formatted = applyMask(typed, mask);
          if (formatted !== typed) {
            input.value = formatted;
            if (caret != null) {
              const at = caretAfter(formatted, count);
              try { input.setSelectionRange(at, at); } catch (err) { /* not focused */ }
            }
          }
          if (formatted === e.sender.state.value) return;
          e.sender.state.value = formatted;
          emit(p.onInput, e.sender, e.event, { value: formatted, raw: unmask(formatted, mask) });
        }
      },
      {
        selector: idSelector(state.id),
        eventType: 'change',
        onEvent: function (e) {
          emit(p.onChange, e.sender, e.event, { value: e.sender.state.value, raw: unmask(e.sender.state.value, mask) });
        }
      }
    ],
    methods: {
      getRawValue: function () { return unmask(this.state.value, mask); },
      setValue: function (value) { this.setState({ value: applyMask(value, mask) }); }
    }
  });
}
