// SPDX-License-Identifier: Apache-2.0
//
// Variant (b), recommended — only what the kit (llms.txt) and the guide teach:
// - the published toolbar is adopted with vf.attach and no render (its markup is never rebuilt);
// - `render` sits on the smallest element whose content changes, the <tbody> ("attach render to the
//   smallest element", common mistakes);
// - selecting a row is state kept in the data-state attribute: the two rows change their attribute and
//   nothing is redrawn; the next render writes the same selection from the closure.
// Rows are still redrawn together when the list changes: the engine has no keyed diff (FAQ).

(function () {
  'use strict';

  const data = window.benchData;
  let selected = 0;

  const row = (r) => vf.html`<tr data-id="${r.id}" data-state="${r.id === selected ? 'selected' : ''}"><td class="bench__id">${r.id}</td><td class="bench__label"><button type="button" data-action="select">${r.label}</button></td><td><button type="button" data-action="remove" aria-label="Remove">×</button></td></tr>`;

  const table = vf.attach('#tbody', {
    state: { rows: [] },
    render: (s) => vf.html`${s.rows.map(row)}`,
    delegates: [
      { selector: '[data-action="select"]', eventType: 'click', onEvent: (e) => {
        const tr = e.target.closest('tr');
        const previous = e.sender.$node.querySelector('tr[data-state="selected"]');
        if (previous) previous.setAttribute('data-state', '');
        tr.setAttribute('data-state', 'selected');
        selected = Number(tr.getAttribute('data-id'));
      } },
      { selector: '[data-action="remove"]', eventType: 'click', onEvent: (e) => {
        const id = Number(e.target.closest('tr').getAttribute('data-id'));
        e.sender.setState((s) => ({ rows: s.rows.filter((r) => r.id !== id) }));
      } }
    ]
  });

  const replace = (rows) => {
    selected = 0;
    table.setState({ rows: rows });
  };

  vf.attach('#toolbar', {
    delegates: [
      { selector: '[data-action="run"]', eventType: 'click', onEvent: () => replace(data.build(data.size)) },
      { selector: '[data-action="runlots"]', eventType: 'click', onEvent: () => replace(data.build(data.size * 10)) },
      { selector: '[data-action="add"]', eventType: 'click', onEvent: () => table.setState((s) => ({ rows: s.rows.concat(data.build(data.size)) })) },
      { selector: '[data-action="update"]', eventType: 'click', onEvent: () => table.setState((s) => ({ rows: data.updateEvery10th(s.rows) })) },
      { selector: '[data-action="clear"]', eventType: 'click', onEvent: () => replace([]) },
      { selector: '[data-action="swap"]', eventType: 'click', onEvent: () => table.setState((s) => ({ rows: data.swap(s.rows) })) }
    ]
  });

  data.ready();
})();
