// SPDX-License-Identifier: Apache-2.0
//
// DateRangePicker — Tier F (vfDateRangePicker only). Spec reference: pilot
// components/molecules/VDateRangePicker.js (rewritten as a factory function on two native date
// inputs: the end input's min follows the start, and an end before the start moves with it).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { emit } from '../_internal/common.js';
import { fieldIds, fieldset } from '../_internal/field.js';
import { stateOf, instance } from '../_internal/instance.js';
import { isoDate, dateOf } from '../_internal/dates.js';

const html = vf.html;

function render(s) {
  const a = fieldIds(s, 'date-range', true);
  const names = s.names || [];
  const shared = {
    type: 'date',
    class: 'vf-input',
    placeholder: msg('datePicker.placeholder'),
    'aria-describedby': a.describedBy,
    'aria-invalid': a.invalid || null,
    disabled: !!s.disabled,
    readonly: !!s.readonly,
    required: !!s.required
  };
  function input(which, extra) {
    const map = {};
    for (const key in shared) if (Object.prototype.hasOwnProperty.call(shared, key)) map[key] = shared[key];
    for (const key in extra) if (Object.prototype.hasOwnProperty.call(extra, key)) map[key] = extra[key];
    map.id = a.id + '-' + which;
    map['data-action'] = which;
    return html`<div class="vf-date-range__part"><label ${attrs({ class: 'vf-date-range__label', for: map.id })}>${which === 'start' ? msg('dateRangePicker.start', s.startLabel) : msg('dateRangePicker.end', s.endLabel)}</label><input ${attrs(map)}></div>`;
  }
  const start = input('start', { name: names[0], value: s.start, min: s.min, max: s.max });
  const end = input('end', { name: names[1], value: s.end, min: s.start || s.min, max: s.max });
  return fieldset('vf-field vf-date-range', s, a, s.label,
    html`<div class="vf-date-range__inputs">${start}<span class="vf-date-range__separator" aria-hidden="true">&ndash;</span>${end}</div>`,
    { 'aria-describedby': null });
}

/**
 * A start and an end date.
 * @param {Object} props
 * @param {string|Date} [props.start]
 * @param {string|Date} [props.end]
 * @param {string|Date} [props.min]
 * @param {string|Date} [props.max]
 * @param {string[]} [props.names] - form names of the two inputs, e.g. ['from', 'to']
 * @param {string|SafeHtml} [props.label] - the legend
 * @param {string} [props.startLabel] - replaces the `dateRangePicker.start` message
 * @param {string} [props.endLabel] - replaces the `dateRangePicker.end` message
 * @param {function} [props.onChange] - ({ sender, event, data: { start, end, startDate, endDate } })
 *   Also: disabled, readonly, required, hint, error, id (of the fieldset), ref, describedBy, className
 * @returns {Object} instance with getValue() → { start, end }, setValue({ start, end })
 */
export function vfDateRangePicker(props) {
  const p = props || {};
  function commit(sender, event, start, end) {
    if (end && start && end < start) end = start;
    if (start === sender.state.start && end === sender.state.end) return;
    sender.setState({ start: start, end: end });
    emit(p.onChange, sender, event, { start: start, end: end, startDate: dateOf(start), endDate: dateOf(end) });
  }
  function changed(which) {
    return function (e) {
      const input = e.target;
      const value = isoDate(input.value);
      if (!value && input.value !== '') {
        input.setAttribute('aria-invalid', 'true');
        return;
      }
      const s = e.sender.state;
      commit(e.sender, e.event, which === 'start' ? value : s.start, which === 'end' ? value : s.end);
    };
  }
  return instance({
    state: stateOf(p, 'date-range', {
      start: isoDate(p.start),
      end: isoDate(p.end),
      min: isoDate(p.min),
      max: isoDate(p.max)
    }),
    render: render,
    delegates: [
      { selector: '[data-action="start"]', eventType: 'change', onEvent: changed('start') },
      { selector: '[data-action="end"]', eventType: 'change', onEvent: changed('end') }
    ],
    methods: {
      getValue: function () { return { start: this.state.start, end: this.state.end }; },
      setValue: function (value) {
        const v = value || {};
        let start = isoDate(v.start);
        let end = isoDate(v.end);
        if (end && start && end < start) end = start;
        this.setState({ start: start, end: end });
      }
    }
  });
}
