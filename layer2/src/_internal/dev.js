// SPDX-License-Identifier: Apache-2.0
//
// Development-only warnings, the same way as the engine: the build defines __VFUNC_DEV__ as false
// for minified files, so `if (DEV) warn(...)` and its message disappear from them.

/* global __VFUNC_DEV__ */
export const DEV = typeof __VFUNC_DEV__ === 'undefined' ? true : __VFUNC_DEV__;

export function warn(message) {
  if (typeof console !== 'undefined' && console.warn) console.warn('[vfunc-ui] ' + message);
}
