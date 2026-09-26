// SPDX-License-Identifier: Apache-2.0
//
// The grid contract on vfGridAg with the real AG Grid (window.agGrid), shared by contract.html and
// csp-nonce.html. The UI actions press AG Grid's own DOM.

import { vfGridAg } from '../../dist/vfunc-grid-ag.esm.js';
import { gridContract } from './grid.contract.js';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

/**
 * @param {Object} common - { vf, test, assert, window }
 * @param {Object} [extra] - { name, options }: a suite name suffix and grid options added to every instance
 */
export function agGridSuite(common, extra) {
  const x = extra || {};
  gridContract(Object.assign({}, common, {
    name: 'vfGridAg (AG Grid 36.2.0)' + (x.name ? ' ' + x.name : ''),
    factory: (props) => vfGridAg(Object.assign({}, props, {
      lib: window.agGrid,
      options: Object.assign({}, props && props.options, x.options)
    })),
    wait: 60,
    leakWait: 1000, // AG Grid finishes a 500 ms timer after destroy
    // Through the grid API: rows that AG Grid is animating out stay in the DOM for a moment.
    visibleKeys: (inst) => {
      const api = inst.instance;
      const out = [];
      const first = api.getFirstDisplayedRowIndex();
      const last = api.getLastDisplayedRowIndex();
      for (let i = first; i >= 0 && i <= last; i++) out.push(api.getDisplayedRowAtIndex(i).id);
      return out;
    },
    actions: {
      sort: async (inst, key) => { click(inst.$node.querySelector('.ag-header-cell[col-id="' + key + '"] .ag-header-cell-label')); await pause(60); },
      selectRow: async (inst, key) => { click(inst.$node.querySelector('.ag-row[row-id="' + key + '"] .ag-selection-checkbox input')); await pause(60); },
      clickRow: async (inst, key) => { click(inst.$node.querySelector('.ag-row[row-id="' + key + '"] .ag-cell[col-id="name"]')); await pause(60); }
    }
  }));
}
