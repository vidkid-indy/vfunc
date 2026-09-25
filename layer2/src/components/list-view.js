// SPDX-License-Identifier: Apache-2.0
//
// ListView — Tier P (vsListView + vfListView). Spec reference: pilot components/molecules/VfListView.js
// (rewritten: a plain list, or a listbox with roving focus when items can be selected).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls, present, uid, hasValue, extend, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';
import { vsEmptyState } from './empty-state.js';

const html = vf.html;

const SELECTABLE = ['none', 'single', 'multiple'];

function keyOf(item, index, itemKey) {
  if (item != null && typeof item === 'object' && item[itemKey] != null) return String(item[itemKey]);
  return String(index);
}

/** The default item markup: the item as text, or title / description / meta of an object. */
function defaultItem(item) {
  if (item == null || typeof item !== 'object' || item instanceof vf.SafeHtml) return item;
  return html`<span class="vf-list-view__title">${item.title != null ? item.title : item.label}</span>${present(item.description) ? html`<span class="vf-list-view__description">${item.description}</span>` : ''}${present(item.meta) ? html`<span class="vf-list-view__meta">${item.meta}</span>` : ''}`;
}

/**
 * A list of items; with `selectable`, a listbox whose options carry data-action "select".
 * @param {Object} props
 * @param {Array} props.items - strings, or objects (title/label, description, meta)
 * @param {function(*, number): SafeHtml} [props.render] - markup of one item (vf.html)
 * @param {string} [props.itemKey='id'] - the key of an object item (else its index)
 * @param {'none'|'single'|'multiple'} [props.selectable='none']
 * @param {string|string[]} [props.selected] - the selected key(s)
 * @param {string} [props.label] - aria-label of the list
 * @param {string|SafeHtml} [props.emptyText] - title of the empty state (vsEmptyState)
 * @param {string} [props.id] - base of the option ids; generated when absent
 *   Also: ref, className
 * @returns {SafeHtml}
 */
export function vsListView(props) {
  const p = props || {};
  const items = p.items || [];
  if (!items.length) {
    return html`<div ${attrs({ class: cls('vf-list-view', p.className), id: p.id, 'data-ref': p.ref, 'data-state': 'empty' })}>${vsEmptyState({ title: p.emptyText })}</div>`;
  }
  const mode = oneOf('vsListView selectable', p.selectable, SELECTABLE);
  const itemKey = p.itemKey || 'id';
  const render = typeof p.render === 'function' ? p.render : defaultItem;
  const base = present(p.id) ? String(p.id) : uid('list');
  // Roving focus: the first selected option, else the first option, is in the tab order.
  let focusIndex = 0;
  if (mode !== 'none') {
    for (let i = 0; i < items.length; i++) {
      if (hasValue(p.selected, keyOf(items[i], i, itemKey))) { focusIndex = i; break; }
    }
  }
  const rows = [];
  for (let i = 0; i < items.length; i++) {
    const key = keyOf(items[i], i, itemKey);
    rows.push(mode === 'none'
      ? html`<li class="vf-list-view__item">${render(items[i], i)}</li>`
      : html`<li ${attrs({
        class: 'vf-list-view__item',
        role: 'option',
        id: base + '-option-' + i,
        'aria-selected': hasValue(p.selected, key),
        tabindex: i === focusIndex ? 0 : -1,
        'data-action': 'select',
        'data-value': key,
        'data-index': i
      })}>${render(items[i], i)}</li>`);
  }
  return html`<ul ${attrs({
    class: cls('vf-list-view', p.className),
    id: base,
    'data-ref': p.ref,
    role: mode === 'none' ? null : 'listbox',
    'aria-multiselectable': mode === 'multiple' ? true : null,
    'aria-label': p.label
  })}>${rows}</ul>`;
}

/**
 * vsListView with behavior: click, Space or Enter selects; Up/Down/Home/End move the focus.
 * @param {Object} props - vsListView props, plus onSelect ({ sender, event, data: { value, items } })
 *   value is the selected key (single) or keys (multiple); items the selected items.
 * @returns {Object} instance with getValue(), setValue(), setItems(items)
 */
export function vfListView(props) {
  const p = props || {};
  const itemKey = p.itemKey || 'id';
  function selectedItems(s) {
    const out = [];
    for (let i = 0; i < s.items.length; i++) if (hasValue(s.selected, keyOf(s.items[i], i, itemKey))) out.push(s.items[i]);
    return out;
  }
  function choose(sender, event, key) {
    const s = sender.state;
    let next;
    if (s.selectable === 'multiple') {
      next = [];
      let found = false;
      const list = s.selected || [];
      for (let i = 0; i < list.length; i++) {
        if (String(list[i]) === key) found = true;
        else next.push(list[i]);
      }
      if (!found) next.push(key);
    } else {
      if (hasValue(s.selected, key)) return;
      next = key;
    }
    s.selected = next;
    sender.refresh(); // now, so the chosen option keeps the focus
    const option = sender.$node.querySelector('[data-value="' + key.replace(/["\\]/g, '\\$&') + '"]');
    if (option) option.focus();
    emit(p.onSelect, sender, event, { value: s.selectable === 'multiple' ? next.slice() : next, items: selectedItems(s) });
  }
  const state = stateOf(p, 'list', {
    items: (p.items || []).slice(),
    selected: p.selectable === 'multiple'
      ? (Object.prototype.toString.call(p.selected) === '[object Array]' ? p.selected.slice() : [])
      : (p.selected == null ? null : String(p.selected))
  });
  return instance({
    state: state,
    render: function (s) { return vsListView(extend({}, s, { render: p.render })); },
    delegates: [
      { selector: '[data-action="select"]', eventType: 'click', onEvent: function (e) { choose(e.sender, e.event, e.target.getAttribute('data-value')); } },
      {
        selector: '[data-action="select"]',
        eventType: 'keydown',
        onEvent: function (e) {
          const key = e.event.key;
          if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
            e.event.preventDefault();
            choose(e.sender, e.event, e.target.getAttribute('data-value'));
            return;
          }
          const options = e.sender.$node.querySelectorAll('[data-action="select"]');
          const from = Number(e.target.getAttribute('data-index'));
          let to = null;
          if (key === 'ArrowDown' || key === 'Down') to = Math.min(options.length - 1, from + 1);
          else if (key === 'ArrowUp' || key === 'Up') to = Math.max(0, from - 1);
          else if (key === 'Home') to = 0;
          else if (key === 'End') to = options.length - 1;
          if (to == null) return;
          e.event.preventDefault();
          e.target.setAttribute('tabindex', '-1');
          options[to].setAttribute('tabindex', '0');
          options[to].focus();
        }
      }
    ],
    methods: {
      getValue: function () { return this.state.selected; },
      setValue: function (selected) { this.setState({ selected: selected }); },
      setItems: function (items) { this.setState({ items: (items || []).slice() }); }
    }
  });
}
