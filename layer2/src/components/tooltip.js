// SPDX-License-Identifier: Apache-2.0
//
// Tooltip — Tier S (vsTooltip only). Spec reference: pilot components/atoms/VTooltip.js (rewritten
// without JS: CSS shows the bubble on hover and on keyboard focus inside the wrapper).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { cls, present, uid } from '../_internal/common.js';

const html = vf.html;

const PLACEMENTS = ['top', 'bottom', 'start', 'end'];

/**
 * A short text shown next to a trigger on hover and focus.
 * @param {Object} props
 * @param {string} props.text - plain text (a tooltip holds no interactive content)
 * @param {function({describedBy: string}): SafeHtml|SafeHtml} props.trigger - a function gets the
 *   bubble's id to put in the trigger's aria-describedby: (a) => vf.vsButton({ label, describedBy: a.describedBy })
 * @param {'top'|'bottom'|'start'|'end'} [props.placement='top'] - `data-placement`
 * @param {string} [props.id] - the bubble's id; generated when absent
 *   Also: ref, className
 * @returns {SafeHtml}
 */
export function vsTooltip(props) {
  const p = props || {};
  const id = present(p.id) ? p.id : uid('tooltip');
  const trigger = typeof p.trigger === 'function' ? p.trigger({ describedBy: id }) : p.trigger;
  return html`<span ${attrs({
    class: cls('vf-tooltip', p.className),
    'data-ref': p.ref,
    'data-placement': oneOf('vsTooltip placement', p.placement, PLACEMENTS)
  })}>${trigger}<span ${attrs({ class: 'vf-tooltip__bubble', role: 'tooltip', id: id })}>${p.text}</span></span>`;
}
