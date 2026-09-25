// SPDX-License-Identifier: Apache-2.0
//
// Card — Tier S (vsCard only). Spec reference: pilot components/molecules/VCard.js. The slots take
// vf.html markup (or vfunc instances); a plain string is text.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

/** 'h2'…'h6' for a heading level (default 3). */
export function heading(level) {
  const n = Number(level);
  return 'h' + (n >= 2 && n <= 6 ? Math.floor(n) : 3);
}

/**
 * A surface with an optional header, body and footer.
 * @param {Object} props
 * @param {string|SafeHtml} [props.title]
 * @param {string|SafeHtml} [props.subtitle]
 * @param {*} [props.actions] - markup at the end of the header (buttons)
 * @param {*} [props.body]
 * @param {*} [props.footer]
 * @param {number} [props.headingLevel=3] - the title's heading level, 2–6
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsCard(props) {
  const p = props || {};
  const h = heading(p.headingLevel);
  const head = present(p.title) || present(p.subtitle) || present(p.actions)
    ? html`<div class="vf-card__header"><div class="vf-card__heading">${present(p.title) ? html`<${h} class="vf-card__title">${p.title}</${h}>` : ''}${present(p.subtitle) ? html`<p class="vf-card__subtitle">${p.subtitle}</p>` : ''}</div>${present(p.actions) ? html`<div class="vf-card__actions">${p.actions}</div>` : ''}</div>`
    : '';
  const body = present(p.body) ? html`<div class="vf-card__body">${p.body}</div>` : '';
  const footer = present(p.footer) ? html`<div class="vf-card__footer">${p.footer}</div>` : '';
  return html`<div ${attrs({ class: cls('vf-card', p.className), id: p.id, 'data-ref': p.ref })}>${head}${body}${footer}</div>`;
}
