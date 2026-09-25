// SPDX-License-Identifier: Apache-2.0
//
// Avatar — Tier S (vsAvatar only). Spec reference: pilot components/atoms/VAvatar.js.
// An image (src through vf.safeUrl) or the initials of the name.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

const SIZES = ['md', 'sm', 'lg'];

/** "Ada Lovelace" → "AL", "홍길동" → "홍". */
export function initials(name) {
  const words = String(name == null ? '' : name).replace(/^\s+|\s+$/g, '').split(/\s+/);
  if (!words[0]) return '';
  const first = words[0].charAt(0);
  return (words.length > 1 ? first + words[words.length - 1].charAt(0) : first).toUpperCase();
}

/**
 * A user picture or initials.
 * @param {Object} props
 * @param {string} [props.name] - the accessible name, and the initials without src
 * @param {string} [props.src] - image URL (vf.safeUrl)
 * @param {string} [props.alt] - the accessible name when it differs from name
 * @param {'md'|'sm'|'lg'} [props.size='md'] - `data-size`
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsAvatar(props) {
  const p = props || {};
  const label = present(p.alt) ? p.alt : p.name;
  const inside = present(p.src)
    ? html`<img alt="" ${attrs({ class: 'vf-avatar__image', src: p.src })}>`
    : html`<span class="vf-avatar__initials" aria-hidden="true">${initials(p.name)}</span>`;
  return html`<span ${attrs({
    class: cls('vf-avatar', p.className),
    id: p.id,
    'data-ref': p.ref,
    'data-size': oneOf('vsAvatar size', p.size, SIZES),
    role: present(label) ? 'img' : null,
    'aria-label': label
  })}>${inside}</span>`;
}
