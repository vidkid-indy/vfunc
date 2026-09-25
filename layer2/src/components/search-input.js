// SPDX-License-Identifier: Apache-2.0
//
// SearchInput — Tier P (vsSearchInput + vfSearchInput). Spec reference: pilot
// components/atoms/VfSearchInput.js (rewritten: IME-aware debounce, clear button on data-action).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { present, emit } from '../_internal/common.js';
import { fieldIds, field, inputAttrs } from '../_internal/field.js';
import { stateOf, instance, control, actionPart, idSelector, composing } from '../_internal/instance.js';
import { boxAttrs } from './input.js';

const html = vf.html;

/**
 * A search box with a clear button (data-action "clear", hidden while empty).
 * @param {Object} props
 * @param {string} [props.value]
 * @param {string} [props.placeholder] - replaces the `searchInput.placeholder` message
 * @param {string} [props.ariaLabel] - the accessible name without a visible label; replaces `searchInput.label`
 * @param {string} [props.clearLabel] - replaces the `searchInput.clear` message
 *   Also: name, size, disabled, label, hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsSearchInput(props) {
  const p = props || {};
  const a = fieldIds(p, 'search');
  const filled = present(p.value);
  const box = html`<div ${attrs(boxAttrs('vf-search-input', p, a, 'vsSearchInput'))}><input ${attrs(inputAttrs('vf-search-input__input', p, a, {
    type: 'search',
    value: p.value,
    placeholder: msg('searchInput.placeholder', p.placeholder),
    autocomplete: 'off',
    'aria-label': present(p.label) ? null : msg('searchInput.label', p.ariaLabel)
  }))}><button ${attrs({
    type: 'button',
    class: 'vf-search-input__clear',
    'data-action': 'clear',
    'aria-label': msg('searchInput.clear', p.clearLabel),
    'aria-controls': a.id,
    hidden: !filled || !!p.disabled
  })}><span aria-hidden="true">&times;</span></button></div>`;
  return field(p, a, box);
}

/**
 * vsSearchInput with behavior: `onSearch` after typing stops for `debounce` ms (not while an
 * IME is composing), at once on Enter, and with '' after clear or Escape.
 * @param {Object} props - vsSearchInput props, plus:
 * @param {number} [props.debounce=300] - ms; 0 searches on every input
 * @param {function} [props.onSearch] - ({ sender, event, data: { value } })
 * @param {function} [props.onClear] - ({ sender, event, data: {} })
 * @returns {Object} instance with getValue(), setValue(), clear(), focus()
 */
export function vfSearchInput(props) {
  const p = props || {};
  const wait = p.debounce == null ? 300 : Math.max(0, Number(p.debounce) || 0);
  let timer = null;
  let last = null;

  function cancel() {
    if (timer) clearTimeout(timer);
    timer = null;
  }
  function search(sender, event) {
    cancel();
    const value = sender.state.value || '';
    if (value === last) return;
    last = value;
    emit(p.onSearch, sender, event, { value: value });
  }
  function typed(e) {
    const value = e.target.value;
    e.sender.state.value = value; // no refresh while typing: keeps the caret and the IME
    const clear = actionPart(e.sender, 'clear');
    if (clear) clear.hidden = value === '';
    cancel();
    if (wait === 0) search(e.sender, e.event);
    else timer = setTimeout(function () { search(e.sender, e.event); }, wait);
  }
  function clear(sender, event) {
    cancel();
    const input = control(sender);
    if (input) {
      input.value = '';
      input.focus();
    }
    sender.state.value = '';
    const button = actionPart(sender, 'clear');
    if (button) button.hidden = true;
    emit(p.onClear, sender, event, {});
    search(sender, event);
  }

  const state = stateOf(p, 'search', { value: p.value == null ? '' : String(p.value) });
  last = state.value;
  const self = state.id;
  return instance({
    state: state,
    render: function (s) { return vsSearchInput(s); },
    delegates: [
      { selector: idSelector(self), eventType: 'input', onEvent: function (e) { if (!composing(e.event)) typed(e); } },
      { selector: idSelector(self), eventType: 'compositionend', onEvent: typed },
      {
        selector: idSelector(self),
        eventType: 'keydown',
        onEvent: function (e) {
          if (composing(e.event)) return;
          const key = e.event.key;
          if (key === 'Enter') {
            e.event.preventDefault();
            search(e.sender, e.event);
          } else if ((key === 'Escape' || key === 'Esc') && e.target.value !== '') {
            e.event.preventDefault();
            clear(e.sender, e.event);
          }
        }
      },
      { selector: '[data-action="clear"]', eventType: 'click', onEvent: function (e) { clear(e.sender, e.event); } }
    ],
    methods: {
      setValue: function (value) {
        cancel();
        last = value == null ? '' : String(value);
        this.setState({ value: last });
      },
      clear: function () { clear(this, null); },
      focus: function () {
        const input = control(this);
        if (input) input.focus();
      }
    },
    onDestroy: cancel
  });
}
