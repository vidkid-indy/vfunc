// SPDX-License-Identifier: Apache-2.0
//
// Button — Tier S (vsButton only). Spec reference: pilot components/atoms/VButton.js (rewritten:
// escaped attributes, variant and size as data-* instead of classes, no inline styles).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { oneOf } from '../_internal/props.js';

const html = vf.html;

// The first value is the default.
const VARIANTS = ['secondary', 'primary', 'danger', 'ghost'];
const SIZES = ['md', 'sm', 'lg'];
const TYPES = ['button', 'submit', 'reset'];

/**
 * A `<button>`.
 * @param {Object} props
 * @param {string|SafeHtml} props.label - Text (escaped), or vf.html markup such as an icon + text.
 * @param {'secondary'|'primary'|'danger'|'ghost'} [props.variant='secondary'] - `data-variant`
 * @param {'md'|'sm'|'lg'} [props.size='md'] - `data-size`
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.action] - `data-action`, for delegates
 * @param {string} [props.ref] - `data-ref`
 * @param {string} [props.id]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading] - disabled, `aria-busy`, a spinner and a hidden "Loading" text
 * @param {string} [props.loadingText] - replaces the `common.loading` message
 * @param {string} [props.ariaLabel] - for icon-only buttons
 * @param {string} [props.className] - extra classes, for your own CSS
 * @returns {SafeHtml}
 */
export function vsButton(props) {
  const p = props || {};
  const loading = !!p.loading;
  const spinner = loading ? html`<span class="vf-button__spinner" aria-hidden="true"></span>` : '';
  const status = loading ? html`<span class="vf-visually-hidden">${msg('common.loading', p.loadingText)}</span>` : '';
  return html`<button ${attrs({
    type: oneOf('vsButton type', p.type, TYPES),
    class: 'vf-button' + (p.className ? ' ' + p.className : ''),
    id: p.id,
    'data-action': p.action,
    'data-ref': p.ref,
    'data-variant': oneOf('vsButton variant', p.variant, VARIANTS),
    'data-size': oneOf('vsButton size', p.size, SIZES),
    'aria-label': p.ariaLabel,
    'aria-busy': loading || null,
    disabled: !!p.disabled || loading
  })}>${spinner}<span class="vf-button__label">${p.label}</span>${status}</button>`;
}
