// SPDX-License-Identifier: Apache-2.0
//
// Variant (c), vanilla: hand-written DOM operations, the baseline. Each operation touches only the rows it
// changes (a keyed list kept by hand). Same markup as the vfunc pages; no library.

(function () {
  'use strict';

  const data = window.benchData;
  const tbody = document.getElementById('tbody');
  let rows = []; // { id, label, tr, text }
  let selectedTr = null;

  // One row built once and cloned for every row (the technique of js-framework-benchmark's vanillajs).
  const prototypeRow = (() => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-state', '');
    const idCell = document.createElement('td');
    idCell.className = 'bench__id';
    idCell.appendChild(document.createTextNode(''));
    const labelCell = document.createElement('td');
    labelCell.className = 'bench__label';
    const select = document.createElement('button');
    select.type = 'button';
    select.setAttribute('data-action', 'select');
    select.appendChild(document.createTextNode(''));
    labelCell.appendChild(select);
    const removeCell = document.createElement('td');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('data-action', 'remove');
    remove.setAttribute('aria-label', 'Remove');
    remove.textContent = '×';
    removeCell.appendChild(remove);
    tr.appendChild(idCell);
    tr.appendChild(labelCell);
    tr.appendChild(removeCell);
    return tr;
  })();

  function createRow(r) {
    const tr = prototypeRow.cloneNode(true);
    tr.setAttribute('data-id', String(r.id));
    tr.firstChild.firstChild.data = String(r.id);
    const text = tr.childNodes[1].firstChild.firstChild;
    text.data = r.label;
    return { id: r.id, label: r.label, tr: tr, text: text };
  }

  function append(list) {
    const fragment = document.createDocumentFragment();
    for (const r of list) {
      const item = createRow(r);
      rows.push(item);
      fragment.appendChild(item.tr);
    }
    tbody.appendChild(fragment);
  }

  function clear() {
    tbody.textContent = '';
    rows = [];
    selectedTr = null;
  }

  const actions = {
    run: () => { clear(); append(data.build(data.size)); },
    runlots: () => { clear(); append(data.build(data.size * 10)); },
    add: () => append(data.build(data.size)),
    update: () => {
      for (let i = 0; i < rows.length; i += 10) {
        rows[i].label += ' !!!';
        rows[i].text.data = rows[i].label;
      }
    },
    clear: clear,
    swap: () => {
      if (rows.length < data.size) return;
      const a = rows[1];
      const b = rows[data.size - 2];
      const afterB = b.tr.nextSibling;
      tbody.insertBefore(b.tr, a.tr);
      tbody.insertBefore(a.tr, afterB);
      rows[1] = b;
      rows[data.size - 2] = a;
    }
  };

  document.getElementById('toolbar').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button && actions[button.getAttribute('data-action')]) actions[button.getAttribute('data-action')]();
  });

  tbody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || !tbody.contains(button)) return;
    const tr = button.closest('tr');
    if (button.getAttribute('data-action') === 'select') {
      if (selectedTr) selectedTr.setAttribute('data-state', '');
      tr.setAttribute('data-state', 'selected');
      selectedTr = tr;
    } else if (button.getAttribute('data-action') === 'remove') {
      const id = Number(tr.getAttribute('data-id'));
      const index = rows.findIndex((r) => r.id === id);
      if (selectedTr === tr) selectedTr = null;
      tr.remove();
      rows.splice(index, 1);
    }
  });

  data.ready();
})();
