// SPDX-License-Identifier: Apache-2.0
//
// NumberInput — Tier P (vsNumberInput + vfNumberInput). Spec reference: pilot
// components/atoms/VfNumberInput.js (rewritten: hooks on data-action instead of classes,
// messages instead of fixed text, values rounded to the step's decimals, clamped on commit).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { emit } from '../_internal/common.js';
import { fieldIds, field, inputAttrs } from '../_internal/field.js';
import { stateOf, instance, control, idSelector } from '../_internal/instance.js';
import { boxAttrs } from './input.js';

const html = vf.html;

function num(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

/** Clamps to min/max and rounds to the decimals of step (0.1 + 0.2 → 0.3). */
export function clampStep(value, p) {
  if (value == null) return null;
  let n = value;
  const min = num(p.min);
  const max = num(p.max);
  if (min != null && n < min) n = min;
  if (max != null && n > max) n = max;
  const decimals = (String(p.step == null ? 1 : p.step).split('.')[1] || '').length;
  return Number(n.toFixed(decimals));
}

/**
 * A number input with decrease / increase buttons (data-action "decrement" / "increment").
 * @param {Object} props
 * @param {?number} [props.value]
 * @param {number} [props.min]
 * @param {number} [props.max]
 * @param {number} [props.step=1]
 * @param {string} [props.decrementLabel] - replaces the `numberInput.decrement` message
 * @param {string} [props.incrementLabel] - replaces the `numberInput.increment` message
 *   Also: name, placeholder, size, disabled, readonly, required, label, hint, error, id, ref,
 *   action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsNumberInput(props) {
  const p = props || {};
  const a = fieldIds(p, 'number');
  const value = num(p.value);
  const min = num(p.min);
  const max = num(p.max);
  const locked = !!p.disabled || !!p.readonly;
  const box = html`<div ${attrs(boxAttrs('vf-number-input', p, a, 'vsNumberInput'))}><button ${attrs({
    type: 'button',
    class: 'vf-number-input__step',
    'data-action': 'decrement',
    'aria-label': msg('numberInput.decrement', p.decrementLabel),
    'aria-controls': a.id,
    tabindex: -1,
    disabled: locked || (value != null && min != null && value <= min)
  })}><span aria-hidden="true">&minus;</span></button><input ${attrs(inputAttrs('vf-number-input__input', p, a, {
    type: 'number',
    value: value,
    min: min,
    max: max,
    step: p.step == null ? 1 : p.step,
    placeholder: p.placeholder,
    inputmode: 'decimal'
  }))}><button ${attrs({
    type: 'button',
    class: 'vf-number-input__step',
    'data-action': 'increment',
    'aria-label': msg('numberInput.increment', p.incrementLabel),
    'aria-controls': a.id,
    tabindex: -1,
    disabled: locked || (value != null && max != null && value >= max)
  })}><span aria-hidden="true">+</span></button></div>`;
  return field(p, a, box);
}

/**
 * vsNumberInput with behavior: the buttons step the value, typed values are clamped when
 * committed (change), `onChange({ sender, event, data: { value } })` after each change.
 * @param {Object} props - vsNumberInput props, plus onChange
 * @returns {Object} instance with getValue() → number|null, setValue(number|null)
 */
export function vfNumberInput(props) {
  const p = props || {};
  function commit(e, value) {
    const next = clampStep(value, e.sender.state);
    const input = control(e.sender);
    if (input && input.value !== (next == null ? '' : String(next))) input.value = next == null ? '' : String(next);
    if (next === e.sender.state.value) return;
    e.sender.setState({ value: next });
    emit(p.onChange, e.sender, e.event, { value: next });
  }
  function stepBy(direction) {
    return function (e) {
      const s = e.sender.state;
      if (s.disabled || s.readonly) return;
      const step = num(s.step) || 1;
      // From empty, the first step lands on min (up) or max (down), else on 0.
      const edge = num(direction > 0 ? s.min : s.max);
      commit(e, s.value == null ? (edge == null ? 0 : edge) : s.value + direction * step);
    };
  }
  const state = stateOf(p, 'number', { value: clampStep(num(p.value), p) });
  return instance({
    state: state,
    render: function (s) { return vsNumberInput(s); },
    delegates: [
      { selector: '[data-action="decrement"]', eventType: 'click', onEvent: stepBy(-1) },
      { selector: '[data-action="increment"]', eventType: 'click', onEvent: stepBy(1) },
      { selector: idSelector(state.id), eventType: 'change', onEvent: function (e) { commit(e, num(e.target.value)); } }
    ],
    methods: {
      setValue: function (value) { this.setState({ value: clampStep(num(value), this.state) }); }
    }
  });
}
