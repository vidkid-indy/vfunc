// SPDX-License-Identifier: Apache-2.0
//
// Prop checks shared by the components.

import { DEV, warn } from './dev.js';

/**
 * Returns `value` when it is one of `allowed`, else the default `allowed[0]` (warns in development).
 * @param {string} prop - for the warning, e.g. "vsButton variant"
 */
export function oneOf(prop, value, allowed) {
  if (value == null || value === '') return allowed[0];
  if (allowed.indexOf(value) >= 0) return value;
  if (DEV) warn(prop + ' "' + value + '" is not one of ' + allowed.join(', ') + '; using "' + allowed[0] + '".');
  return allowed[0];
}
