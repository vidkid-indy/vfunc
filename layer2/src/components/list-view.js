// SPDX-License-Identifier: Apache-2.0
//
// ListView — Tier P (vsListView + vfListView). Spec reference: pilot components/molecules/VfListView.js
// (rewritten: a plain list, or a listbox with roving focus when items can be selected).
// vfListView keeps one element per item with the list plugin (D-045): setItems draws only new or
// changed items, and selecting changes attributes without drawing the list again.

import vf from '../_internal/vf.js';
import { list } from '../_internal/list.js';
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
 * One item. `option` (selectable lists) carries the option attributes; vsListView adds its id and
 * data-index, vfListView leaves out everything that depends on the position (D-045).
 */
function itemMarkup(content, option) {
  return option
    ? html`<li ${attrs(extend({ class: 'vf-list-view__item', role: 'option', 'data-action': 'select' }, option))}>${content}</li>`
    : html`<li class="vf-list-view__item">${content}</li>`;
}

function emptyMarkup(p) {
  return html`<div ${attrs({ class: cls('vf-list-view', p.className), id: p.id, 'data-ref': p.ref, 'data-state': 'empty' })}>${vsEmptyState({ title: p.emptyText })}</div>`;
}

function listMarkup(p, mode, id, rows) {
  return html`<ul ${attrs({
    class: cls('vf-list-view', p.className),
    id: id,
    'data-ref': p.ref,
    role: mode === 'none' ? null : 'listbox',
    'aria-multiselectable': mode === 'multiple' ? true : null,
    'aria-label': p.label
  })}>${rows}</ul>`;
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
  if (!items.length) return emptyMarkup(p);
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
    rows.push(itemMarkup(render(items[i], i), mode === 'none' ? null : {
      id: base + '-option-' + i,
      'aria-selected': hasValue(p.selected, key),
      tabindex: i === focusIndex ? 0 : -1,
      'data-value': key,
      'data-index': i
    }));
  }
  return listMarkup(p, mode, base, rows);
}

/**
 * vsListView with behavior: click, Space or Enter selects; Up/Down/Home/End move the focus.
 * Items are kept by key (itemKey, else the position): setItems draws only new or changed items, and
 * selecting changes aria-selected and tabindex without drawing the list again (D-045). Its options
 * have no id or data-index (they would change with the position); find one by data-value.
 * @param {Object} props - vsListView props, plus onSelect ({ sender, event, data: { value, items } })
 *   value is the selected key (single) or keys (multiple); items the selected items.
 * @returns {Object} instance with getValue(), setValue(), setItems(items)
 */
export function vfListView(props) {
  const p = props || {};
  const itemKey = p.itemKey || 'id';
  const render = typeof p.render === 'function' ? p.render : defaultItem;
  // A render that declares the index (render(item, index)) draws a row again when its position changes.
  const usesIndex = typeof p.render === 'function' && p.render.length > 1;
  let rows = null;
  let rowsRoot = null; // the root the rows were drawn in: a render replaces the root (replaceRoot)
  let wrapped = Object.create(null); // key → { key, item, index }: the same object while the item is the same

  /** Items with their keys; an entry is reused while its item (and, for usesIndex, its position) stays, so vfList keeps the row. */
  function entries(items) {
    const next = Object.create(null);
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const key = keyOf(items[i], i, itemKey);
      const old = wrapped[key];
      const entry = old && old.item === items[i] && (!usesIndex || old.index === i) ? old : { key: key, item: items[i], index: i };
      next[key] = entry;
      out.push(entry);
    }
    wrapped = next;
    return out;
  }
  /** aria-selected from the state, and one option (the given one, else the first selected, else the first) in the tab order. */
  function sync(sender, focusKey) {
    const s = sender.state;
    const list = sender.$node.querySelectorAll('[data-action="select"]');
    let target = null;
    for (let i = 0; i < list.length; i++) {
      const key = list[i].getAttribute('data-value');
      const on = hasValue(s.selected, key);
      if (list[i].getAttribute('aria-selected') !== String(on)) list[i].setAttribute('aria-selected', String(on));
      if (!target && (focusKey != null ? key === focusKey : on)) target = list[i];
    }
    if (!target) target = list[0] || null;
    // Roving focus: one option has tabindex 0 (new rows are drawn with -1).
    const current = sender.$node.querySelector('[data-action="select"][tabindex="0"]');
    if (current !== target) {
      if (current) current.setAttribute('tabindex', '-1');
      if (target) target.setAttribute('tabindex', '0');
    }
    return target;
  }
  function build(sender) {
    if (rowsRoot === sender.$node) return;
    if (rows) rows.destroy();
    rows = null;
    rowsRoot = sender.$node;
    wrapped = Object.create(null);
    const s = sender.state;
    if (!s.items.length) return;
    const plain = s.selectable !== 'single' && s.selectable !== 'multiple'; // render already warned about a bad value
    rows = list.create(sender.$node, {
      key: function (e) { return e.key; },
      render: function (e) {
        return itemMarkup(render(e.item, e.index), plain ? null : {
          'aria-selected': hasValue(sender.state.selected, e.key),
          tabindex: -1,
          'data-value': e.key
        });
      },
      items: entries(s.items)
    });
    sync(sender);
  }
  function choose(sender, event, key) {
    const s = sender.state;
    let next;
    if (s.selectable === 'multiple') {
      next = [];
      let found = false;
      const chosen = s.selected || [];
      for (let i = 0; i < chosen.length; i++) {
        if (String(chosen[i]) === key) found = true;
        else next.push(chosen[i]);
      }
      if (!found) next.push(key);
    } else {
      if (hasValue(s.selected, key)) return;
      next = key;
    }
    s.selected = next; // no render: the options change their attributes
    const option = sync(sender, key);
    if (option) option.focus();
    const items = [];
    for (let i = 0; i < s.items.length; i++) if (hasValue(next, keyOf(s.items[i], i, itemKey))) items.push(s.items[i]);
    emit(p.onSelect, sender, event, { value: s.selectable === 'multiple' ? next.slice() : next, items: items });
  }
  const state = stateOf(p, 'list', {
    items: (p.items || []).slice(),
    selected: p.selectable === 'multiple'
      ? (Object.prototype.toString.call(p.selected) === '[object Array]' ? p.selected.slice() : [])
      : (p.selected == null ? null : String(p.selected))
  });
  const self = instance({
    state: state,
    // The root only; the rows belong to the list plugin (drawn in onMount / onUpdate).
    render: function (s) {
      return s.items.length ? listMarkup(s, oneOf('vsListView selectable', s.selectable, SELECTABLE), s.id, '') : emptyMarkup(s);
    },
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
          const list = e.sender.$node.querySelectorAll('[data-action="select"]');
          const from = Array.prototype.indexOf.call(list, e.target);
          let to = null;
          if (key === 'ArrowDown' || key === 'Down') to = Math.min(list.length - 1, from + 1);
          else if (key === 'ArrowUp' || key === 'Up') to = Math.max(0, from - 1);
          else if (key === 'Home') to = 0;
          else if (key === 'End') to = list.length - 1;
          if (to == null || to < 0) return;
          e.event.preventDefault();
          e.target.setAttribute('tabindex', '-1');
          list[to].setAttribute('tabindex', '0');
          list[to].focus();
        }
      }
    ],
    methods: {
      getValue: function () { return this.state.selected; },
      setValue: function (selected) {
        this.state.selected = selected;
        sync(this);
      },
      setItems: function (items) {
        const s = this.state;
        const next = (items || []).slice();
        // From or to an empty list the root changes (empty state ↔ list): draw it again.
        if (!rows || !next.length) {
          this.setState({ items: next });
          return;
        }
        s.items = next;
        rows.set(entries(next));
        sync(this);
      }
    },
    onMount: build,
    onUpdate: build,
    onDestroy: function () {
      if (rows) rows.destroy();
    }
  });
  build(self); // the rows exist as soon as the instance does, like its markup
  return self;
}
