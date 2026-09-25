// SPDX-License-Identifier: Apache-2.0
//
// Rating — Tier P (vsRating + vfRating). Spec reference: pilot components/atoms/VfRating.js
// (rewritten on native radios: arrow keys, focus and forms work without code).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present, uid, emit } from '../_internal/common.js';
import { fieldIds, fieldset } from '../_internal/field.js';
import { stateOf, instance } from '../_internal/instance.js';

const html = vf.html;

function clampMax(max) {
  return Math.max(1, Math.min(10, Math.floor(Number(max) || 5)));
}

/**
 * Stars as radio buttons (data-action "rate"); `readonly` shows them as an image with a text alternative.
 * @param {Object} props
 * @param {number} [props.value=0]
 * @param {number} [props.max=5] - 1–10
 * @param {boolean} [props.readonly]
 * @param {string|SafeHtml} [props.label] - the legend; replaces the `rating.label` message
 * @param {string} [props.name] - generated when absent
 *   Also: disabled, required, hint, error, id (of the root), ref, describedBy, className
 * @returns {SafeHtml}
 */
export function vsRating(props) {
  const p = props || {};
  const max = clampMax(p.max);
  const value = Math.max(0, Math.min(max, Math.round(Number(p.value) || 0)));
  const stars = [];
  if (p.readonly) {
    for (let i = 1; i <= max; i++) stars.push(html`<span ${attrs({ class: 'vf-rating__star', 'data-state': i <= value ? 'on' : 'off' })}>&#9733;</span>`);
    return html`<span ${attrs({
      class: cls('vf-rating', p.className),
      id: p.id,
      'data-ref': p.ref,
      'data-readonly': 'true',
      role: 'img',
      'aria-label': msg('rating.value', null, { value: value, max: max })
    })}>${stars}</span>`;
  }
  const a = fieldIds(p, 'rating', true);
  const name = present(p.name) ? p.name : uid('rating-name');
  for (let i = 1; i <= max; i++) {
    stars.push(html`<label class="vf-rating__item"><input ${attrs({
      type: 'radio',
      class: 'vf-rating__input vf-visually-hidden',
      name: name,
      value: i,
      'data-action': 'rate',
      checked: i === value,
      disabled: !!p.disabled,
      required: !!p.required
    })}><span ${attrs({ class: 'vf-rating__star', 'data-state': i <= value ? 'on' : 'off', 'aria-hidden': true })}>&#9733;</span><span class="vf-visually-hidden">${msg('rating.value', null, { value: i, max: max })}</span></label>`);
  }
  return fieldset('vf-field vf-rating', p, a, msg('rating.label', p.label), html`<div class="vf-rating__stars">${stars}</div>`);
}

/**
 * vsRating with behavior: choosing a star updates the stars and calls onChange.
 * @param {Object} props - vsRating props, plus onChange ({ sender, event, data: { value } })
 * @returns {Object} instance with getValue() → number, setValue(number)
 */
export function vfRating(props) {
  const p = props || {};
  const state = stateOf(p, 'rating', { value: Number(p.value) || 0, name: present(p.name) ? p.name : uid('rating-name') });
  return instance({
    state: state,
    render: function (s) { return vsRating(s); },
    delegates: [{
      selector: '[data-action="rate"]',
      eventType: 'change',
      onEvent: function (e) {
        const value = Number(e.target.value);
        if (value === e.sender.state.value) return;
        e.sender.setState({ value: value });
        emit(p.onChange, e.sender, e.event, { value: value });
      }
    }]
  });
}
