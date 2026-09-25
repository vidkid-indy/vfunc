// SPDX-License-Identifier: Apache-2.0
//
// The field wrapper of the input components (D-030): label, hint and error around a control, with
// the ids that link them (label[for], aria-describedby, aria-invalid). Also the attributes every
// form control shares and the fieldset used by groups (radios, stars, date range).

import vf from './vf.js';
import { attrs } from './attrs.js';
import { uid, present, cls, extend } from './common.js';

const html = vf.html;

/**
 * Ids and aria values for a control.
 * @param {Object} p - props with id, label, hint, error, required, describedBy
 * @param {string} prefix - for a generated id, e.g. "input"
 * @param {boolean} [always] - wrap even without label/hint/error (vsField, groups)
 */
export function fieldIds(p, prefix, always) {
  const wrapped = !!always || present(p.label) || present(p.hint) || present(p.error);
  const id = present(p.id) ? String(p.id) : (wrapped ? uid(prefix) : null);
  const hintId = present(p.hint) ? id + '-hint' : null;
  const errorId = present(p.error) ? id + '-error' : null;
  const described = [];
  if (present(p.describedBy)) described.push(p.describedBy);
  if (hintId) described.push(hintId);
  if (errorId) described.push(errorId);
  return {
    wrapped: wrapped,
    id: id,
    hintId: hintId,
    errorId: errorId,
    describedBy: described.length ? described.join(' ') : null,
    invalid: present(p.error),
    required: !!p.required
  };
}

/** The attributes of a form control: hooks, aria links and states, plus `extra`. */
export function inputAttrs(className, p, a, extra) {
  return extend({
    class: className,
    id: a.id,
    name: p.name,
    'data-ref': p.ref,
    'data-action': p.action,
    'aria-describedby': a.describedBy,
    'aria-invalid': a.invalid || null,
    disabled: !!p.disabled,
    readonly: !!p.readonly,
    required: !!p.required
  }, extra);
}

/** The required mark after a label. */
export function requiredMark(a) {
  return a.required ? html`<span class="vf-field__required" aria-hidden="true">*</span>` : '';
}

/** The hint and error paragraphs (their ids are in a.describedBy). */
export function fieldTexts(p, a) {
  return html`${a.hintId ? html`<p ${attrs({ class: 'vf-field__hint', id: a.hintId })}>${p.hint}</p>` : ''}${a.errorId ? html`<p ${attrs({ class: 'vf-field__error', id: a.errorId })}>${p.error}</p>` : ''}`;
}

/** The outer attributes of a field wrapper. */
function wrapperAttrs(block, p, a, extra) {
  return extend({ class: cls(block, p.className), 'data-state': a.invalid ? 'invalid' : null }, extra);
}

/**
 * The control wrapped in `.vf-field` when `a.wrapped`, else the control itself.
 * @param {Object} p - props (label, hint, error, required, className)
 * @param {Object} a - from fieldIds
 * @param {SafeHtml} control
 * @param {boolean} [ownLabel] - the control shows the label itself (checkbox, switch)
 */
export function field(p, a, control, ownLabel) {
  if (!a.wrapped) return control;
  const label = !ownLabel && present(p.label)
    ? html`<label ${attrs({ class: 'vf-field__label', for: a.id })}>${p.label}${requiredMark(a)}</label>` : '';
  return html`<div ${attrs(wrapperAttrs('vf-field', p, a))}>${label}${control}${fieldTexts(p, a)}</div>`;
}

/**
 * A `<fieldset>` field for a group of controls: the legend names the group, the hint and error
 * are linked to it.
 * @param {string} block - e.g. 'vf-field vf-radio-group'
 * @param {*} legend - text or markup; nothing when absent
 * @param {SafeHtml} inner
 * @param {Object} [extra] - more attributes of the fieldset
 */
export function fieldset(block, p, a, legend, inner, extra) {
  const head = present(legend) ? html`<legend class="vf-field__label">${legend}${requiredMark(a)}</legend>` : '';
  return html`<fieldset ${attrs(wrapperAttrs(block, p, a, extend({ id: a.id, 'data-ref': p.ref, 'aria-describedby': a.describedBy }, extra)))}>${head}${inner}${fieldTexts(p, a)}</fieldset>`;
}

/** The class of the control itself: the user's className goes on the wrapper when there is one. */
export function controlClass(block, p, a) {
  return a.wrapped ? block : cls(block, p.className);
}
