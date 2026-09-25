// SPDX-License-Identifier: Apache-2.0
//
// Visible text of the components (rule 22). The English messages are registered by index.js as
// defaults of the engine's i18n, below the app's messages (D-028), so the priority is:
// component props > app messages (vf.t) > built-in locale bundle (e.g. vfunc-ui.locale.ko.js) > en.
// This module only reads them, so the data file (D-033) can use it without registering them twice.

import vf from './vf.js';

/**
 * The text for a message key, or the component's own prop when one was given.
 * @param {string} key - `<component>.<key>`
 * @param {*} [override] - a prop value that replaces the message (null, undefined, '' do not)
 * @param {Object} [params] - placeholders for vf.t
 */
export function msg(key, override, params) {
  if (override != null && override !== '') return override;
  return vf.t(key, params);
}
