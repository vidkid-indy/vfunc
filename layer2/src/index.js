// SPDX-License-Identifier: Apache-2.0
//
// vfunc-ui — layer 2 of vfunc.js: vs* functions return markup (SafeHtml), vf* functions return
// instances (rule 17). Importing this module adds every member to the engine's `vf` object,
// read-only and without replacing existing members, so `vf.vsButton` works in <script> pages and
// in ES modules alike (D-002, D-029).

import vf from './_internal/vf.js';
import { DEV, warn } from './_internal/dev.js';
import { vsButton } from './components/button.js';

const members = { vsButton: vsButton };

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

export { vsButton };
export default members;
