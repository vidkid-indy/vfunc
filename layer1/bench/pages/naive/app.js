// SPDX-License-Identifier: Apache-2.0
//
// Variant (a), naive: the whole screen — toolbar and table — is one component with one state, and every
// operation, even selecting a row, goes through setState and redraws all of it.

(function () {
  'use strict';

  const data = window.benchData;

  const row = (r, selected) => vf.html`<tr data-id="${r.id}" data-state="${r.id === selected ? 'selected' : ''}"><td class="bench__id">${r.id}</td><td class="bench__label"><button type="button" data-action="select">${r.label}</button></td><td><button type="button" data-action="remove" aria-label="Remove">×</button></td></tr>`;

  const idOf = (e) => Number(e.target.closest('tr').getAttribute('data-id'));

  const app = vf.vfunc({
    state: { rows: [], selected: 0 },
    render: (s) => vf.html`
      <div class="bench__toolbar">
        <button type="button" id="run" data-action="run">Create rows</button>
        <button type="button" id="runlots" data-action="runlots">Create 10× rows</button>
        <button type="button" id="add" data-action="add">Append rows</button>
        <button type="button" id="update" data-action="update">Update every 10th row</button>
        <button type="button" id="clear" data-action="clear">Clear</button>
        <button type="button" id="swaprows" data-action="swap">Swap rows</button>
      </div>
      <table class="bench__table"><tbody id="tbody">${s.rows.map((r) => row(r, s.selected))}</tbody></table>`,
    delegates: [
      { selector: '[data-action="run"]', eventType: 'click', onEvent: (e) => e.sender.setState({ rows: data.build(data.size), selected: 0 }) },
      { selector: '[data-action="runlots"]', eventType: 'click', onEvent: (e) => e.sender.setState({ rows: data.build(data.size * 10), selected: 0 }) },
      { selector: '[data-action="add"]', eventType: 'click', onEvent: (e) => e.sender.setState((s) => ({ rows: s.rows.concat(data.build(data.size)) })) },
      { selector: '[data-action="update"]', eventType: 'click', onEvent: (e) => e.sender.setState((s) => ({ rows: data.updateEvery10th(s.rows) })) },
      { selector: '[data-action="clear"]', eventType: 'click', onEvent: (e) => e.sender.setState({ rows: [], selected: 0 }) },
      { selector: '[data-action="swap"]', eventType: 'click', onEvent: (e) => e.sender.setState((s) => ({ rows: data.swap(s.rows) })) },
      { selector: '[data-action="select"]', eventType: 'click', onEvent: (e) => e.sender.setState({ selected: idOf(e) }) },
      { selector: '[data-action="remove"]', eventType: 'click', onEvent: (e) => {
        const id = idOf(e);
        e.sender.setState((s) => ({ rows: s.rows.filter((r) => r.id !== id) }));
      } }
    ]
  });

  app.mount('#app').then(data.ready);
})();
