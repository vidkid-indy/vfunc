// SPDX-License-Identifier: Apache-2.0
//
// Alert — Tier S (vsAlert only). Spec reference: pilot components/molecules/VAlert.js.
// danger and warning are announced at once (role="alert"), the others politely (role="status").

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { msg } from '../_internal/messages.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

const VARIANTS = ['info', 'success', 'warning', 'danger'];

/**
 * A message box.
 * @param {Object} props
 * @param {string|SafeHtml} [props.message]
 * @param {string|SafeHtml} [props.title]
 * @param {'info'|'success'|'warning'|'danger'} [props.variant='info'] - `data-variant`
 * @param {boolean} [props.dismissible] - adds a close button
 * @param {string} [props.dismissAction='dismiss'] - `data-action` of the close button
 * @param {string} [props.dismissLabel] - replaces the `alert.dismiss` message
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsAlert(props) {
  const p = props || {};
  const variant = oneOf('vsAlert variant', p.variant, VARIANTS);
  const title = present(p.title) ? html`<p class="vf-alert__title">${p.title}</p>` : '';
  const message = present(p.message) ? html`<div class="vf-alert__message">${p.message}</div>` : '';
  const dismiss = p.dismissible ? html`<button ${attrs({
    type: 'button',
    class: 'vf-alert__dismiss',
    'data-action': p.dismissAction || 'dismiss',
    'aria-label': msg('alert.dismiss', p.dismissLabel)
  })}><span aria-hidden="true">&times;</span></button>` : '';
  return html`<div ${attrs({
    class: cls('vf-alert', p.className),
    id: p.id,
    'data-ref': p.ref,
    'data-variant': variant,
    role: variant === 'danger' || variant === 'warning' ? 'alert' : 'status'
  })}><div class="vf-alert__body">${title}${message}</div>${dismiss}</div>`;
}
