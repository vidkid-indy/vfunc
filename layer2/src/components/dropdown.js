// SPDX-License-Identifier: Apache-2.0
//
// Dropdown — Tier F (vfDropdown only). Spec reference: pilot components/navigation/VDropdownMenu.js
// (rewritten on the WAI-ARIA menu button pattern, D-032).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { cls, extend, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';
import { placementOf } from '../_internal/position.js';
import { menuMarkup, triggerAria, menuBehavior, withMenu } from '../_internal/menu.js';
import { vsButton } from './button.js';

const html = vf.html;

function render(s) {
  const trigger = vsButton(extend({}, s.trigger, { id: s.id + '-trigger', action: 'menu', aria: triggerAria(s.id, s.expanded) }));
  return html`<div ${attrs({ class: cls('vf-dropdown', s.className), id: s.id, 'data-ref': s.ref })}>${trigger}${menuMarkup(s.id, s.items, s.expanded, s.label)}</div>`;
}

/**
 * A button that opens a menu of actions.
 * @param {Object} props
 * @param {Object} props.trigger - vsButton props of the trigger (label, variant, size, disabled …)
 * @param {Array<{label: *, action?: string, disabled?: boolean, danger?: boolean, separator?: boolean}>} props.items
 * @param {'bottom-start'|'bottom-end'|'top-start'|'top-end'} [props.placement='bottom-start']
 * @param {string} [props.label] - aria-label of the menu (default: named by the trigger)
 * @param {function} [props.onSelect] - ({ sender, event, data: { action, item } })
 *   Also: id, ref, className
 * @returns {Object} instance with open(), close(), isOpen()
 */
export function vfDropdown(props) {
  const p = props || {};
  const behavior = menuBehavior(function (sender, event, item) {
    emit(p.onSelect, sender, event, { action: item.action, item: item });
  });
  return instance(withMenu({
    state: stateOf(p, 'dropdown', { trigger: p.trigger || {}, expanded: false, placement: placementOf(p.placement) }),
    render: render,
    methods: { isOpen: function () { return behavior.ctrl.isOpen(); } }
  }, behavior));
}
