// SPDX-License-Identifier: Apache-2.0
//
// Accordion — Tier P (vsAccordion + vfAccordion). Spec reference: pilot
// components/navigation/VfAccordion.js (rewritten on the WAI-ARIA accordion pattern: heading >
// button with aria-expanded and aria-controls, region panels; no <details> because of IE11).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { cls, present, uid, hasValue, extend, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';
import { heading } from './card.js';

const html = vf.html;

/**
 * Sections that open and close.
 * @param {Object} props
 * @param {Array<{id: string, title: *, content?: *, open?: boolean, disabled?: boolean}>} props.items
 * @param {string[]} [props.open] - ids of the open items (in addition to item.open)
 * @param {number} [props.headingLevel=3] - 2–6
 * @param {string} [props.id] - base of the button and panel ids; generated when absent
 *   Also: ref, className
 * @returns {SafeHtml}
 */
export function vsAccordion(props) {
  const p = props || {};
  const base = present(p.id) ? String(p.id) : uid('accordion');
  const h = heading(p.headingLevel);
  const list = p.items || [];
  const items = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const open = !!item.open || hasValue(p.open, String(item.id));
    items.push(html`<div ${attrs({ class: 'vf-accordion__item', 'data-state': open ? 'open' : 'closed' })}><${h} class="vf-accordion__heading"><button ${attrs({
      type: 'button',
      class: 'vf-accordion__trigger',
      id: base + '-trigger-' + i,
      'aria-expanded': open,
      'aria-controls': base + '-panel-' + i,
      'data-action': 'toggle',
      'data-value': item.id,
      disabled: !!item.disabled
    })}>${item.title}</button></${h}><div ${attrs({
      class: 'vf-accordion__panel',
      id: base + '-panel-' + i,
      role: 'region',
      'aria-labelledby': base + '-trigger-' + i,
      hidden: !open
    })}>${item.content}</div></div>`);
  }
  return html`<div ${attrs({ class: cls('vf-accordion', p.className), id: base, 'data-ref': p.ref })}>${items}</div>`;
}

/**
 * vsAccordion with behavior: the buttons open and close their panel; one at a time unless multiple.
 * @param {Object} props - vsAccordion props, plus:
 * @param {boolean} [props.multiple] - several items may be open
 * @param {function} [props.onToggle] - ({ sender, event, data: { id, open, openIds } })
 * @returns {Object} instance with getValue() → open ids, setValue(ids), open(id), close(id), toggle(id)
 */
export function vfAccordion(props) {
  const p = props || {};
  // The open ids, in item order: item.open or listed in `open`; one at most unless multiple.
  function openIds(items, open, seed) {
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const id = String(items[i].id);
      if ((seed && items[i].open) || hasValue(open, id)) out.push(id);
    }
    return p.multiple ? out : out.slice(0, 1);
  }
  function set(sender, event, id, open) {
    const s = sender.state;
    const key = String(id);
    const was = hasValue(s.openIds, key);
    if (was === open) return;
    let next;
    if (open) next = p.multiple ? s.openIds.concat([key]) : [key];
    else {
      next = [];
      for (let i = 0; i < s.openIds.length; i++) if (s.openIds[i] !== key) next.push(s.openIds[i]);
    }
    sender.setState({ openIds: next });
    if (event) emit(p.onToggle, sender, event, { id: key, open: open, openIds: next.slice() });
  }
  const items = [];
  const given = p.items || [];
  // item.open only seeds the state; afterwards `open` decides.
  for (let i = 0; i < given.length; i++) {
    const copy = {};
    for (const k in given[i]) if (Object.prototype.hasOwnProperty.call(given[i], k) && k !== 'open') copy[k] = given[i][k];
    items.push(copy);
  }
  // State key `openIds`, not `open`: a state key would hide the open() method on the instance.
  const state = stateOf(p, 'accordion', { items: items, openIds: openIds(given, p.open, true) });
  delete state.open;
  return instance({
    state: state,
    render: function (s) { return vsAccordion(extend({}, s, { open: s.openIds })); },
    delegates: [{
      selector: '[data-action="toggle"]',
      eventType: 'click',
      onEvent: function (e) {
        const id = e.target.getAttribute('data-value');
        set(e.sender, e.event, id, !hasValue(e.sender.state.openIds, id));
      }
    }],
    methods: {
      getValue: function () { return this.state.openIds.slice(); },
      setValue: function (ids) { this.setState({ openIds: openIds(this.state.items, ids) }); },
      open: function (id) { set(this, null, id, true); },
      close: function (id) { set(this, null, id, false); },
      toggle: function (id) { set(this, null, id, !hasValue(this.state.openIds, String(id))); }
    }
  });
}
