// SPDX-License-Identifier: Apache-2.0
//
// The menu of vfDropdown and vfSplitButton: markup and the WAI-ARIA menu button keyboard (D-032).
// Trigger: Enter, Space, ArrowDown open on the first item, ArrowUp on the last, a click toggles.
// Menu: ArrowUp/Down (wrapping), Home, End, a letter moves to the next item starting with it,
// Enter/Space/click choose, Escape closes and returns to the trigger, Tab closes.

import vf from './vf.js';
import { attrs } from './attrs.js';
import { extend } from './common.js';
import { floatControl } from './floating.js';

const html = vf.html;

/**
 * @param {string} base - the instance id: the trigger is base-trigger, the menu base-menu
 * @param {Array<{label: *, action?: string, disabled?: boolean, danger?: boolean, separator?: boolean}>} items
 * @param {boolean} open
 * @param {string} [label] - aria-label of the menu (default: labelled by the trigger)
 */
export function menuMarkup(base, items, open, label) {
  const out = [];
  const list = items || [];
  let index = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i] || {};
    if (item.separator) {
      out.push(html`<div class="vf-menu__separator" role="separator"></div>`);
      continue;
    }
    out.push(html`<button ${attrs({
      type: 'button',
      role: 'menuitem',
      class: 'vf-menu__item',
      tabindex: -1,
      'data-action': 'menu-item',
      'data-value': item.action,
      'data-index': index,
      'data-variant': item.danger ? 'danger' : null,
      'aria-disabled': item.disabled ? true : null
    })}>${item.label}</button>`);
    index += 1;
  }
  return html`<div ${attrs({ class: 'vf-menu', role: 'menu', id: base + '-menu', 'aria-labelledby': label ? null : base + '-trigger', 'aria-label': label, hidden: !open })}>${out}</div>`;
}

/** The attributes of the trigger of a menu (for vsButton's `aria` prop). */
export function triggerAria(base, open) {
  return { haspopup: 'menu', expanded: !!open, controls: base + '-menu' };
}

/** The items of the menu (without separators), from the model: action, label, index among items. */
function modelItems(items) {
  const out = [];
  for (let i = 0; i < (items || []).length; i++) if (items[i] && !items[i].separator) out.push(items[i]);
  return out;
}

/**
 * Behavior to merge into an instance spec: delegates for the trigger (data-action "menu") and the
 * items, the float controller, and methods open / close.
 * @param {function(Object, Event, Object): void} onSelect - (sender, event, item)
 */
export function menuBehavior(onSelect) {
  const ctrl = floatControl({
    panel: function (s) { return s.ids[s.state.id + '-menu'] || null; },
    trigger: function (s) { return s.ids[s.state.id + '-trigger'] || null; }
  });
  function items(sender) {
    return sender.$node.querySelectorAll('[data-action="menu-item"]');
  }
  function focusAt(sender, index) {
    const list = items(sender);
    if (!list.length) return;
    const i = ((index % list.length) + list.length) % list.length;
    list[i].focus();
  }
  function openAt(sender, index) {
    ctrl.open(sender);
    focusAt(sender, index);
  }
  function choose(sender, event, element) {
    if (element.getAttribute('aria-disabled') === 'true') return;
    const item = modelItems(sender.state.items)[Number(element.getAttribute('data-index'))];
    ctrl.close('select', event, true);
    onSelect(sender, event, item || {});
  }
  function typeahead(sender, from, letter) {
    const list = items(sender);
    for (let n = 1; n <= list.length; n++) {
      const i = (from + n) % list.length;
      if ((list[i].textContent || '').replace(/^\s+/, '').charAt(0).toLowerCase() === letter) return focusAt(sender, i);
    }
  }
  return {
    ctrl: ctrl,
    delegates: [
      {
        selector: '[data-action="menu"]',
        eventType: 'click',
        onEvent: function (e) {
          if (ctrl.isOpen()) ctrl.close('toggle', e.event, true);
          else openAt(e.sender, 0);
        }
      },
      {
        selector: '[data-action="menu"]',
        eventType: 'keydown',
        onEvent: function (e) {
          const key = e.event.key;
          if (key === 'ArrowDown' || key === 'Down') {
            e.event.preventDefault();
            openAt(e.sender, 0);
          } else if (key === 'ArrowUp' || key === 'Up') {
            e.event.preventDefault();
            openAt(e.sender, -1);
          }
        }
      },
      { selector: '[data-action="menu-item"]', eventType: 'click', onEvent: function (e) { choose(e.sender, e.event, e.target); } },
      {
        selector: '[data-action="menu-item"]',
        eventType: 'keydown',
        onEvent: function (e) {
          const key = e.event.key;
          const from = Number(e.target.getAttribute('data-index'));
          let to = null;
          if (key === 'ArrowDown' || key === 'Down') to = from + 1;
          else if (key === 'ArrowUp' || key === 'Up') to = from - 1;
          else if (key === 'Home') to = 0;
          else if (key === 'End') to = -1;
          else if (key === 'Tab') return ctrl.close('tab', e.event, false);
          else if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
            e.event.preventDefault();
            return choose(e.sender, e.event, e.target);
          } else if (key && key.length === 1 && /\S/.test(key)) {
            return typeahead(e.sender, from, key.toLowerCase());
          }
          if (to == null) return;
          e.event.preventDefault();
          focusAt(e.sender, to);
        }
      }
    ],
    methods: {
      open: function () { openAt(this, 0); },
      close: function () { ctrl.close('code', null, false); }
    },
    onUpdate: function () { ctrl.reposition(); },
    onDestroy: function () { ctrl.stop(); }
  };
}

/** Joins behavior into an instance spec (delegates first from the spec, then the menu's). */
export function withMenu(spec, behavior) {
  return extend({}, spec, {
    delegates: (spec.delegates || []).concat(behavior.delegates),
    methods: extend({}, behavior.methods, spec.methods),
    onUpdate: behavior.onUpdate,
    onDestroy: behavior.onDestroy
  });
}
