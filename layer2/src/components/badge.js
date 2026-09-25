// SPDX-License-Identifier: Apache-2.0
//
// Badge — Tier S (vsBadge only). Spec reference: pilot components/atoms/VBadge.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls } from '../_internal/common.js';

const html = vf.html;

// Shared by Badge, Tag, Alert and Timeline. The first value is the default.
export const TONES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

/**
 * A small status label or count.
 * @param {Object} props
 * @param {string|number|SafeHtml} props.label
 * @param {'neutral'|'primary'|'success'|'warning'|'danger'|'info'} [props.variant='neutral'] - `data-variant`
 * @param {boolean} [props.dot] - a status dot before the label
 *   Also: id, ref, describedBy, className
 * @returns {SafeHtml}
 */
export function vsBadge(props) {
  const p = props || {};
  const dot = p.dot ? html`<span class="vf-badge__dot" aria-hidden="true"></span>` : '';
  return html`<span ${attrs({
    class: cls('vf-badge', p.className),
    id: p.id,
    'data-ref': p.ref,
    'data-variant': oneOf('vsBadge variant', p.variant, TONES),
    'aria-describedby': p.describedBy
  })}>${dot}${p.label}</span>`;
}
