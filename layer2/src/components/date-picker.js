// SPDX-License-Identifier: Apache-2.0
//
// DatePicker — Tier P (vsDatePicker + vfDatePicker). A native <input type="date"> (the browser
// draws the calendar in the user's locale); no calendar of our own (D-030). Spec reference: pilot
// components/atoms/VfDatePicker.js (props only).

import { msg } from '../_internal/messages.js';
import { extend, emit } from '../_internal/common.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';
import { isoDate, dateOf } from '../_internal/dates.js';
import { vsInput } from './input.js';

/**
 * A date input. Values are 'YYYY-MM-DD' strings (a Date is accepted).
 * @param {Object} props
 * @param {string|Date} [props.value]
 * @param {string|Date} [props.min]
 * @param {string|Date} [props.max]
 * @param {string} [props.placeholder] - shown only where the browser has no date input (IE11);
 *   replaces the `datePicker.placeholder` message
 *   Also: name, size, disabled, readonly, required, label, hint, error, id, ref, action,
 *   describedBy, className
 * @returns {SafeHtml}
 */
export function vsDatePicker(props) {
  const p = props || {};
  return vsInput(extend({}, p, {
    type: 'date',
    value: isoDate(p.value),
    min: isoDate(p.min),
    max: isoDate(p.max),
    placeholder: msg('datePicker.placeholder', p.placeholder)
  }));
}

/**
 * vsDatePicker with behavior: normalizes typed dates where the input is plain text, marks text
 * that is not a date with aria-invalid, and calls onChange with the value and a Date.
 * @param {Object} props - vsDatePicker props, plus onChange ({ sender, event, data: { value, date } })
 * @returns {Object} instance with getValue() → 'YYYY-MM-DD' or '', getDate() → Date|null, setValue()
 */
export function vfDatePicker(props) {
  const p = props || {};
  const state = stateOf(p, 'date', { value: isoDate(p.value) });
  return instance({
    state: state,
    render: function (s) { return vsDatePicker(s); },
    delegates: [{
      selector: idSelector(state.id),
      eventType: 'change',
      onEvent: function (e) {
        const input = e.target;
        const value = isoDate(input.value);
        if (!value && input.value !== '') {
          input.setAttribute('aria-invalid', 'true');
          return;
        }
        if (!e.sender.state.error) input.removeAttribute('aria-invalid');
        if (input.value !== value) input.value = value;
        if (value === e.sender.state.value) return;
        e.sender.state.value = value;
        emit(p.onChange, e.sender, e.event, { value: value, date: dateOf(value) });
      }
    }],
    methods: {
      getDate: function () { return dateOf(this.state.value); },
      setValue: function (value) { this.setState({ value: isoDate(value) }); }
    }
  });
}
