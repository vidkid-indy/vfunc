// SPDX-License-Identifier: Apache-2.0
//
// Spinner — Tier S (vsSpinner only). Spec reference: pilot components/atoms/VSpinner.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { msg } from '../_internal/messages.js';
import { cls } from '../_internal/common.js';

const html = vf.html;

const SIZES = ['md', 'sm', 'lg'];

/**
 * A loading indicator with a hidden status text.
 * @param {Object} props
 * @param {string} [props.label] - replaces the `common.loading` message
 * @param {'md'|'sm'|'lg'} [props.size='md'] - `data-size`
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsSpinner(props) {
  const p = props || {};
  return html`<span ${attrs({
    class: cls('vf-spinner', p.className),
    id: p.id,
    'data-ref': p.ref,
    'data-size': oneOf('vsSpinner size', p.size, SIZES),
    role: 'status'
  })}><span class="vf-spinner__circle" aria-hidden="true"></span><span class="vf-visually-hidden">${msg('common.loading', p.label)}</span></span>`;
}
