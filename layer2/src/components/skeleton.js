// SPDX-License-Identifier: Apache-2.0
//
// Skeleton — Tier S (vsSkeleton only). Spec reference: pilot components/atoms/VSkeleton.js.
// Decorative placeholders: hidden from screen readers; mark the loading region with aria-busy.
// No width prop: sizes come from CSS (the last text line is shorter), so JS holds no lengths.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls } from '../_internal/common.js';

const html = vf.html;

const VARIANTS = ['text', 'rect', 'circle'];

/**
 * @param {Object} props
 * @param {'text'|'rect'|'circle'} [props.variant='text'] - `data-variant`
 * @param {number} [props.lines=1] - text lines (1–20)
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsSkeleton(props) {
  const p = props || {};
  const variant = oneOf('vsSkeleton variant', p.variant, VARIANTS);
  const count = variant === 'text' ? Math.max(1, Math.min(20, Math.floor(Number(p.lines) || 1))) : 1;
  const lines = [];
  for (let i = 0; i < count; i++) lines.push(html`<span class="vf-skeleton__line"></span>`);
  return html`<div ${attrs({ class: cls('vf-skeleton', p.className), id: p.id, 'data-ref': p.ref, 'data-variant': variant, 'aria-hidden': true })}>${lines}</div>`;
}
