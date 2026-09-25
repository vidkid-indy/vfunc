// SPDX-License-Identifier: Apache-2.0
//
// TimePicker — Tier P (vsTimePicker + vfTimePicker). A native <input type="time"> in the user's
// locale (D-030). Spec reference: pilot components/atoms/VfTimePicker.js (props only).

import { msg } from '../_internal/messages.js';
import { extend, emit } from '../_internal/common.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';
import { isoTime } from '../_internal/dates.js';
import { vsInput } from './input.js';

/**
 * A time input. Values are 'HH:mm' strings ('HH:mm:ss' with a step under 60 seconds).
 * @param {Object} props
 * @param {string|Date} [props.value]
 * @param {string} [props.min]
 * @param {string} [props.max]
 * @param {number} [props.step] - seconds, e.g. 900 for 15 minutes
 * @param {string} [props.placeholder] - shown only where the browser has no time input (IE11);
 *   replaces the `timePicker.placeholder` message
 *   Also: name, size, disabled, readonly, required, label, hint, error, id, ref, action,
 *   describedBy, className
 * @returns {SafeHtml}
 */
export function vsTimePicker(props) {
  const p = props || {};
  return vsInput(extend({}, p, {
    type: 'time',
    value: isoTime(p.value),
    min: isoTime(p.min),
    max: isoTime(p.max),
    placeholder: msg('timePicker.placeholder', p.placeholder)
  }));
}

/**
 * vsTimePicker with behavior: normalizes typed times ("9:5" → "09:05") where the input is plain
 * text, marks text that is not a time with aria-invalid, and calls onChange.
 * @param {Object} props - vsTimePicker props, plus onChange ({ sender, event, data: { value } })
 * @returns {Object} instance with getValue() → 'HH:mm' or '', setValue()
 */
export function vfTimePicker(props) {
  const p = props || {};
  const state = stateOf(p, 'time', { value: isoTime(p.value) });
  return instance({
    state: state,
    render: function (s) { return vsTimePicker(s); },
    delegates: [{
      selector: idSelector(state.id),
      eventType: 'change',
      onEvent: function (e) {
        const input = e.target;
        const value = isoTime(input.value);
        if (!value && input.value !== '') {
          input.setAttribute('aria-invalid', 'true');
          return;
        }
        if (!e.sender.state.error) input.removeAttribute('aria-invalid');
        if (input.value !== value) input.value = value;
        if (value === e.sender.state.value) return;
        e.sender.state.value = value;
        emit(p.onChange, e.sender, e.event, { value: value });
      }
    }],
    methods: {
      setValue: function (value) { this.setState({ value: isoTime(value) }); }
    }
  });
}
