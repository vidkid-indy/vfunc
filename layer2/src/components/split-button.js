// SPDX-License-Identifier: Apache-2.0
//
// SplitButton — Tier P (vsSplitButton + vfSplitButton). Spec reference: pilot
// components/atoms/VfSplitButton.js (rewritten: a main button and a menu button in a group; the menu
// is the shared WAI-ARIA menu of vfDropdown, D-032).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, uid, present, emit } from '../_internal/common.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';
import { placementOf } from '../_internal/position.js';
import { menuMarkup, triggerAria, menuBehavior, withMenu } from '../_internal/menu.js';
import { vsButton } from './button.js';

const html = vf.html;

/**
 * A main action with a menu of related actions.
 * @param {Object} props
 * @param {string|SafeHtml} props.label - the main button
 * @param {string} [props.action] - data-action of the main button
 * @param {Array<{label: *, action?: string, disabled?: boolean, danger?: boolean, separator?: boolean}>} props.items
 * @param {'secondary'|'primary'|'danger'|'ghost'} [props.variant]
 * @param {'md'|'sm'|'lg'} [props.size]
 * @param {boolean} [props.disabled]
 * @param {string} [props.menuLabel] - the menu button's label; replaces `splitButton.more`
 * @param {string} [props.id] - base of the ids (base-main, base-trigger, base-menu); generated when absent
 *   Also: ref, className
 * @returns {SafeHtml}
 */
export function vsSplitButton(props) {
  const p = props || {};
  const base = present(p.id) ? String(p.id) : uid('split');
  const shared = { variant: p.variant, size: p.size, disabled: !!p.disabled };
  const main = vsButton({ label: p.label, action: p.action, id: base + '-main', variant: shared.variant, size: shared.size, disabled: shared.disabled, className: 'vf-split-button__main' });
  const more = vsButton({
    label: html`<span class="vf-split-button__caret" aria-hidden="true"></span>`,
    ariaLabel: msg('splitButton.more', p.menuLabel),
    id: base + '-trigger',
    action: 'menu',
    aria: triggerAria(base, p.expanded),
    variant: shared.variant,
    size: shared.size,
    disabled: shared.disabled,
    className: 'vf-split-button__toggle'
  });
  return html`<div ${attrs({ class: cls('vf-split-button', p.className), id: base, 'data-ref': p.ref, role: 'group' })}>${main}${more}${menuMarkup(base, p.items, p.expanded)}</div>`;
}

/**
 * vsSplitButton with behavior: the menu button opens the menu (keyboard as vfDropdown).
 * @param {Object} props - vsSplitButton props, plus:
 * @param {'bottom-start'|'bottom-end'|'top-start'|'top-end'} [props.placement='bottom-end']
 * @param {function} [props.onClick] - the main button: ({ sender, event, data: { action } })
 * @param {function} [props.onSelect] - a menu item: ({ sender, event, data: { action, item } })
 * @returns {Object} instance with open(), close(), isOpen()
 */
export function vfSplitButton(props) {
  const p = props || {};
  const behavior = menuBehavior(function (sender, event, item) {
    emit(p.onSelect, sender, event, { action: item.action, item: item });
  });
  const state = stateOf(p, 'split', { expanded: false, placement: placementOf(p.placement || 'bottom-end') });
  return instance(withMenu({
    state: state,
    render: function (s) { return vsSplitButton(s); },
    delegates: [{
      selector: idSelector(state.id + '-main'),
      eventType: 'click',
      onEvent: function (e) { emit(p.onClick, e.sender, e.event, { action: e.sender.state.action }); }
    }],
    methods: { isOpen: function () { return behavior.ctrl.isOpen(); } }
  }, behavior));
}
