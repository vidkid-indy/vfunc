// SPDX-License-Identifier: Apache-2.0
//
// Variant (d), keyed — the recommended page with the official list plugin (D-044):
// - the toolbar is adopted with vf.attach and no render, as in the recommended page;
// - the <tbody> is a vf.attach target without render (it owns the delegation), and vfList keeps one
//   element per row: set() draws new or changed rows, moves rows to a new order and removes missing ones;
// - selecting a row draws those two rows again (refresh(key)); the selection is kept in a closure.

(function () {
  'use strict';

  const data = window.benchData;
  let selected = 0;

  const list = vf.use(vfList);
  const rows = list.create('#tbody', {
    key: (r) => r.id,
    render: (r) => vf.html`<tr data-id="${r.id}" data-state="${r.id === selected ? 'selected' : ''}"><td class="bench__id">${r.id}</td><td class="bench__label"><button type="button" data-action="select">${r.label}</button></td><td><button type="button" data-action="remove" aria-label="Remove">×</button></td></tr>`
  });

  const idOf = (e) => Number(e.target.closest('[data-vf-key]').getAttribute('data-vf-key'));

  vf.attach('#tbody', {
    delegates: [
      { selector: '[data-action="select"]', eventType: 'click', onEvent: (e) => {
        const previous = selected;
        selected = idOf(e);
        if (previous) rows.refresh(previous);
        rows.refresh(selected);
      } },
      { selector: '[data-action="remove"]', eventType: 'click', onEvent: (e) => {
        const id = idOf(e);
        rows.set(rows.items().filter((r) => r.id !== id));
      } }
    ]
  });

  const replace = (items) => {
    selected = 0;
    rows.set(items);
  };

  vf.attach('#toolbar', {
    delegates: [
      { selector: '[data-action="run"]', eventType: 'click', onEvent: () => replace(data.build(data.size)) },
      { selector: '[data-action="runlots"]', eventType: 'click', onEvent: () => replace(data.build(data.size * 10)) },
      { selector: '[data-action="add"]', eventType: 'click', onEvent: () => rows.set(rows.items().concat(data.build(data.size))) },
      { selector: '[data-action="update"]', eventType: 'click', onEvent: () => rows.set(data.updateEvery10th(rows.items())) },
      { selector: '[data-action="clear"]', eventType: 'click', onEvent: () => replace([]) },
      { selector: '[data-action="swap"]', eventType: 'click', onEvent: () => rows.set(data.swap(rows.items())) }
    ]
  });

  data.ready();
})();
