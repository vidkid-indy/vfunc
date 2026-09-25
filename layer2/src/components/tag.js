// SPDX-License-Identifier: Apache-2.0
//
// Tag — Tier S (vsTag only). Spec reference: pilot components/atoms/VTag.js. The remove button
// carries data-action and data-value; the app removes the tag in its own delegate.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { msg } from '../_internal/messages.js';
import { cls } from '../_internal/common.js';
import { TONES } from './badge.js';

const html = vf.html;

/**
 * A label, optionally removable.
 * @param {Object} props
 * @param {string|number|SafeHtml} props.label
 * @param {'neutral'|'primary'|'success'|'warning'|'danger'|'info'} [props.variant='neutral']
 * @param {string} [props.value] - `data-value` on the tag and on its remove button
 * @param {boolean} [props.removable] - adds a remove button
 * @param {string} [props.removeAction='remove'] - `data-action` of the remove button
 * @param {string} [props.removeLabel] - replaces the `tag.remove` message ("Remove {label}")
 * @param {boolean} [props.disabled] - disables the remove button
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsTag(props) {
  const p = props || {};
  const text = typeof p.label === 'string' || typeof p.label === 'number' ? String(p.label) : (p.value || '');
  const remove = p.removable ? html`<button ${attrs({
    type: 'button',
    class: 'vf-tag__remove',
    'data-action': p.removeAction || 'remove',
    'data-value': p.value,
    'aria-label': msg('tag.remove', p.removeLabel, { label: text }),
    disabled: !!p.disabled
  })}><span aria-hidden="true">&times;</span></button>` : '';
  return html`<span ${attrs({
    class: cls('vf-tag', p.className),
    id: p.id,
    'data-ref': p.ref,
    'data-value': p.value,
    'data-variant': oneOf('vsTag variant', p.variant, TONES)
  })}><span class="vf-tag__label">${p.label}</span>${remove}</span>`;
}
