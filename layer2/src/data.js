// SPDX-License-Identifier: Apache-2.0
//
// vfunc-ui-data — the grid and the charts of layer 2 (D-031, D-033). Load it after vfunc-ui.js
// (or import it; it imports the core module). It adds its members to the same `vf` object,
// read-only and without replacing existing members. Its messages are in the core bundles.

import vf from './_internal/ui.js';
import { DEV, warn } from './_internal/dev.js';
import { vfGrid } from './data/grid.js';
import { vsChart, vfChart } from './data/chart.js';

const members = {
  vfGrid: vfGrid,
  vsChart: vsChart,
  vfChart: vfChart
};

const hasOwn = Object.prototype.hasOwnProperty;
const conflicts = [];
for (const key in members) {
  if (!hasOwn.call(members, key)) continue;
  if (hasOwn.call(vf, key)) {
    if (vf[key] !== members[key]) conflicts.push(key);
    continue;
  }
  Object.defineProperty(vf, key, { value: members[key], enumerable: true, writable: false, configurable: false });
}
if (DEV && conflicts.length) warn('vf already has ' + conflicts.join(', ') + '; the existing members were kept.');

export {
  vfGrid,
  vsChart,
  vfChart
};
export default members;
