// SPDX-License-Identifier: Apache-2.0
//
// Entry of the <script> builds (dist/vfunc.js, dist/vfunc.min.js). Joins the engine to window.vf
// (D-002): creates it when missing; otherwise adds only the members it lacks, as read-only
// properties, and never replaces what is already there.

import vf from '../layer1/src/vfunc.js';

/* global __VFUNC_DEV__ */

const root = typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : undefined);

// Call as `if (__VFUNC_DEV__) devWarn(...)` so the minified builds drop the message too.
function devWarn(message) {
  if (typeof console !== 'undefined' && console.warn) console.warn('[vfunc] ' + message);
}

if (root) {
  const existing = root.vf;
  if (existing == null) {
    root.vf = vf;
  } else if (typeof existing !== 'object' && typeof existing !== 'function') {
    if (__VFUNC_DEV__) devWarn('window.vf is not an object; vfunc was not installed.');
  } else if (typeof existing.vfunc === 'function' && existing.vfunc !== vf.vfunc) {
    if (__VFUNC_DEV__) devWarn('vfunc ' + existing.version + ' is already loaded; this copy (' + vf.version + ') was ignored.');
  } else {
    const hasOwn = Object.prototype.hasOwnProperty;
    const conflicts = [];
    const keys = Object.keys(vf);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (hasOwn.call(existing, key)) {
        if (existing[key] !== vf[key]) conflicts.push(key);
      } else {
        Object.defineProperty(existing, key, Object.getOwnPropertyDescriptor(vf, key));
      }
    }
    if (__VFUNC_DEV__ && conflicts.length) devWarn('window.vf already has ' + conflicts.join(', ') + '; the existing members were kept.');
  }
}
