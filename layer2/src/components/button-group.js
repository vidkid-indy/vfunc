// SPDX-License-Identifier: Apache-2.0
//
// ButtonGroup — Tier S (vsButtonGroup only). Spec reference: pilot components/molecules/VButtonGroup.js.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls, extend } from '../_internal/common.js';
import { vsButton } from './button.js';

const html = vf.html;

const SIZES = ['md', 'sm', 'lg'];

/**
 * Buttons side by side in a `role="group"`.
 * @param {Object} props
 * @param {Array<Object>} props.buttons - vsButton props for each button
 * @param {string} [props.label] - `aria-label` of the group
 * @param {'md'|'sm'|'lg'} [props.size] - for every button that has no size of its own
 * @param {boolean} [props.attached] - joined edges (`data-attached`)
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsButtonGroup(props) {
  const p = props || {};
  const size = oneOf('vsButtonGroup size', p.size, SIZES);
  const list = p.buttons || [];
  const buttons = [];
  for (let i = 0; i < list.length; i++) buttons.push(vsButton(extend({ size: size }, list[i])));
  return html`<div ${attrs({
    class: cls('vf-button-group', p.className),
    role: 'group',
    id: p.id,
    'data-ref': p.ref,
    'data-attached': p.attached ? 'true' : null,
    'aria-label': p.label
  })}>${buttons}</div>`;
}
