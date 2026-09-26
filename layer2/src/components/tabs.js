// SPDX-License-Identifier: Apache-2.0
//
// Tabs — Tier P (vsTabs + vfTabs). Spec reference: pilot components/navigation/VTabStrip.js
// (rewritten on the WAI-ARIA tabs pattern: roving tabindex, arrow keys that follow the text
// direction, Home/End, automatic activation).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { cls, present, uid, emit, extend } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';
import { slotChilds, markupOnly } from '../_internal/slots.js';

const html = vf.html;

/** The active tab's index: the given id when it exists and is enabled, else the first enabled tab. */
export function activeIndex(tabs, active) {
  let first = -1;
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].disabled) continue;
    if (first < 0) first = i;
    if (present(active) && String(tabs[i].id) === String(active)) return i;
  }
  return first;
}

/**
 * Tabs (data-action "tab", data-value, data-index) and their panels. Every panel is in the markup;
 * the inactive ones are hidden.
 * @param {Object} props
 * @param {Array<{id: string, label: *, content?: *, disabled?: boolean}>} props.tabs
 * @param {string} [props.active] - the id of the active tab (default: the first enabled)
 * @param {string} [props.label] - the tablist's aria-label
 * @param {string} [props.id] - base of the tab and panel ids; generated when absent
 *   Also: ref, className
 * @returns {SafeHtml}
 */
export function vsTabs(props) {
  const p = props || {};
  const base = present(p.id) ? String(p.id) : uid('tabs');
  const tabs = p.tabs || [];
  const current = activeIndex(tabs, p.active);
  const buttons = [];
  const panels = [];
  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i];
    const on = i === current;
    buttons.push(html`<button ${attrs({
      type: 'button',
      role: 'tab',
      class: 'vf-tabs__tab',
      id: base + '-tab-' + i,
      'aria-controls': base + '-panel-' + i,
      'aria-selected': on,
      tabindex: on ? 0 : -1,
      'data-action': 'tab',
      'data-value': t.id,
      'data-index': i,
      disabled: !!t.disabled
    })}>${t.label}</button>`);
    panels.push(html`<div ${attrs({
      role: 'tabpanel',
      class: 'vf-tabs__panel',
      id: base + '-panel-' + i,
      'aria-labelledby': base + '-tab-' + i,
      tabindex: 0,
      hidden: !on
    })}>${t.content}</div>`);
  }
  return html`<div ${attrs({ class: cls('vf-tabs', p.className), id: base, 'data-ref': p.ref })}><div ${attrs({ class: 'vf-tabs__list', role: 'tablist', 'aria-label': p.label })}>${buttons}</div>${panels}</div>`;
}

/**
 * vsTabs with behavior: click or arrow keys (Left/Right follow dir="rtl"), Home, End.
 * @param {Object} props - vsTabs props (a tab's content may also be a vfunc instance, kept alive
 *   in its panel), plus onChange ({ sender, event, data: { id, index } })
 * @returns {Object} instance with getValue() → active id, setValue(id) (alias select(id))
 */
export function vfTabs(props) {
  const p = props || {};
  function select(sender, event, index, focus) {
    const tabs = sender.state.tabs || [];
    const tab = tabs[index];
    if (!tab || tab.disabled) return;
    const changed = String(tab.id) !== String(sender.state.active);
    sender.state.active = tab.id;
    sender.refresh(); // now, so the new tab can take focus
    if (focus) {
      const button = sender.ids[sender.state.id + '-tab-' + index];
      if (button) button.focus();
    }
    if (changed && event) emit(p.onChange, sender, event, { id: tab.id, index: index });
  }
  function move(sender, from, step) {
    const tabs = sender.state.tabs || [];
    for (let n = 1; n <= tabs.length; n++) {
      const i = (from + step * n + tabs.length * n) % tabs.length;
      if (!tabs[i].disabled) return i;
    }
    return from;
  }
  const state = stateOf(p, 'tabs');
  // Instances in a tab's content stay alive in its panel (D-038).
  const slots = slotChilds(state.tabs, 'content', function (i) { return state.id + '-panel-' + i; });
  state.tabs = slots.items;
  const first = (state.tabs || [])[activeIndex(state.tabs || [], p.active)];
  state.active = first ? first.id : null;
  return instance({
    state: state,
    childs: slots.childs,
    render: function (s) { return vsTabs(extend({}, s, { tabs: markupOnly(s.tabs, 'content') })); },
    delegates: [
      {
        selector: '[data-action="tab"]',
        eventType: 'click',
        onEvent: function (e) { select(e.sender, e.event, Number(e.target.getAttribute('data-index')), true); }
      },
      {
        selector: '[data-action="tab"]',
        eventType: 'keydown',
        onEvent: function (e) {
          const s = e.sender.state;
          const tabs = s.tabs || [];
          const from = Number(e.target.getAttribute('data-index'));
          const rtl = typeof window !== 'undefined' && window.getComputedStyle &&
            window.getComputedStyle(e.sender.$node).direction === 'rtl';
          const key = e.event.key;
          let to = null;
          if (key === 'ArrowRight' || key === 'Right') to = move(e.sender, from, rtl ? -1 : 1);
          else if (key === 'ArrowLeft' || key === 'Left') to = move(e.sender, from, rtl ? 1 : -1);
          else if (key === 'Home') to = move(e.sender, -1, 1);
          else if (key === 'End') to = move(e.sender, tabs.length, -1);
          if (to == null) return;
          e.event.preventDefault();
          select(e.sender, e.event, to, true);
        }
      }
    ],
    methods: {
      getValue: function () { return this.state.active; },
      setValue: function (id) { this.select(id); },
      select: function (id) {
        const tabs = this.state.tabs || [];
        for (let i = 0; i < tabs.length; i++) {
          if (String(tabs[i].id) === String(id)) return select(this, null, i, false);
        }
      }
    }
  });
}
