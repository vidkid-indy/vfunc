// SPDX-License-Identifier: Apache-2.0
//
// Switch — Tier S (vsSwitch only). Spec reference: pilot components/atoms/VSwitch.js.
// A native checkbox with role="switch": keyboard, forms and `change` events work as usual.

import vf from '../_internal/vf.js';
import { checkControl } from './checkbox.js';

/**
 * An on/off switch.
 * @param {Object} props
 * @param {string|SafeHtml} props.label
 * @param {boolean} [props.checked]
 *   Also: name, value, disabled, required, hint, error, id, ref, action, describedBy, className
 * @returns {SafeHtml}
 */
export function vsSwitch(props) {
  return checkControl('vf-switch', props || {}, 'switch', { role: 'switch' },
    vf.html`<span class="vf-switch__track" aria-hidden="true"></span>`);
}
