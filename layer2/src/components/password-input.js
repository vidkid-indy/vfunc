// SPDX-License-Identifier: Apache-2.0
//
// PasswordInput — Tier P (vsPasswordInput + vfPasswordInput). Spec reference: pilot
// components/atoms/VfPasswordInput.js (rewritten: the toggle changes the input type in place, so
// the value, caret and focus stay; hooks on data-action).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { emit } from '../_internal/common.js';
import { fieldIds, field, inputAttrs } from '../_internal/field.js';
import { stateOf, instance, control, actionPart, idSelector } from '../_internal/instance.js';
import { boxAttrs } from './input.js';

const html = vf.html;

/**
 * A password input with a show / hide button (data-action "toggle-visibility", aria-pressed).
 * @param {Object} props
 * @param {string} [props.value]
 * @param {boolean} [props.visible] - shows the text
 * @param {string} [props.autocomplete='current-password'] - 'new-password' on sign-up forms
 * @param {string} [props.showLabel] - replaces the `passwordInput.show` message
 * @param {string} [props.hideLabel] - replaces the `passwordInput.hide` message
 *   Also: name, placeholder, minlength, maxlength, size, disabled, readonly, required, label,
 *   hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsPasswordInput(props) {
  const p = props || {};
  const a = fieldIds(p, 'password');
  const visible = !!p.visible;
  const box = html`<div ${attrs(boxAttrs('vf-password-input', p, a, 'vsPasswordInput'))}><input ${attrs(inputAttrs('vf-password-input__input', p, a, {
    type: visible ? 'text' : 'password',
    value: p.value,
    placeholder: p.placeholder,
    autocomplete: p.autocomplete || 'current-password',
    minlength: p.minlength,
    maxlength: p.maxlength
  }))}><button ${attrs({
    type: 'button',
    class: 'vf-password-input__toggle',
    'data-action': 'toggle-visibility',
    'aria-controls': a.id,
    'aria-pressed': visible,
    disabled: !!p.disabled
  })}>${visible ? msg('passwordInput.hide', p.hideLabel) : msg('passwordInput.show', p.showLabel)}</button></div>`;
  return field(p, a, box);
}

/**
 * vsPasswordInput with behavior: the button shows and hides the text without re-rendering.
 * @param {Object} props - vsPasswordInput props, plus:
 * @param {function} [props.onChange] - ({ sender, event, data: { value } }) on the native change
 * @param {function} [props.onToggle] - ({ sender, event, data: { visible } })
 * @returns {Object} instance with getValue(), setValue(), toggle(visible?)
 */
export function vfPasswordInput(props) {
  const p = props || {};
  function toggle(sender, event, visible) {
    const next = visible == null ? !sender.state.visible : !!visible;
    sender.state.visible = next;
    const input = control(sender);
    const button = actionPart(sender, 'toggle-visibility');
    if (input) input.type = next ? 'text' : 'password';
    if (button) {
      button.setAttribute('aria-pressed', next ? 'true' : 'false');
      button.textContent = next ? msg('passwordInput.hide', sender.state.hideLabel) : msg('passwordInput.show', sender.state.showLabel);
    }
    emit(p.onToggle, sender, event, { visible: next });
  }
  const state = stateOf(p, 'password', { value: p.value == null ? '' : String(p.value), visible: !!p.visible });
  return instance({
    state: state,
    render: function (s) { return vsPasswordInput(s); },
    delegates: [
      { selector: idSelector(state.id), eventType: 'input', onEvent: function (e) { e.sender.state.value = e.target.value; } },
      {
        selector: idSelector(state.id),
        eventType: 'change',
        onEvent: function (e) {
          e.sender.state.value = e.target.value;
          emit(p.onChange, e.sender, e.event, { value: e.target.value });
        }
      },
      { selector: '[data-action="toggle-visibility"]', eventType: 'click', onEvent: function (e) { toggle(e.sender, e.event); } }
    ],
    methods: {
      toggle: function (visible) { toggle(this, null, visible); }
    }
  });
}
