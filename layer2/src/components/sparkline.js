// SPDX-License-Identifier: Apache-2.0
//
// Sparkline — Tier S (vsSparkline only, core, D-031). A small static SVG trend (line or bars)
// for tables and stat cards. It is an image with a text alternative (first, last, low, high);
// color and size come from CSS (currentColor, .vf-sparkline).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { msg } from '../_internal/messages.js';
import { cls, present } from '../_internal/common.js';

const html = vf.html;

const TYPES = ['line', 'bar'];
// The drawing box in SVG user units; the element is sized by CSS (the SVG stretches to it).
const W = 100;
const H = 24;

function numbers(data) {
  const out = [];
  const list = data || [];
  for (let i = 0; i < list.length; i++) {
    const n = Number(list[i]);
    if (!isNaN(n)) out.push(n);
  }
  return out;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * @param {Object} props
 * @param {number[]} props.data
 * @param {'line'|'bar'} [props.type='line'] - `data-type`
 * @param {string} [props.label] - the text alternative; replaces the `sparkline.summary` message
 * @param {Intl.NumberFormatOptions} [props.format] - for the numbers in the summary
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsSparkline(props) {
  const p = props || {};
  const values = numbers(p.data);
  const type = oneOf('vsSparkline type', p.type, TYPES);
  let low = Infinity;
  let high = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] < low) low = values[i];
    if (values[i] > high) high = values[i];
  }
  // Bars grow from zero; a line uses the whole height.
  const min = type === 'bar' ? Math.min(low, 0) : low;
  const max = type === 'bar' ? Math.max(high, 0) : high;
  const span = max - min || 1;
  const y = function (v) { return round(H - ((v - min) / span) * H); };
  let marks = '';
  if (values.length && type === 'line') {
    const step = values.length > 1 ? W / (values.length - 1) : 0;
    const points = [];
    for (let i = 0; i < values.length; i++) points.push(round(i * step) + ',' + y(values[i]));
    marks = html`<polyline class="vf-sparkline__line" points="${points.join(' ')}"></polyline>`;
  } else if (values.length) {
    const band = W / values.length;
    const bars = [];
    for (let i = 0; i < values.length; i++) {
      const top = Math.min(y(values[i]), y(0));
      const height = Math.max(round(Math.abs(y(values[i]) - y(0))), 0.5);
      bars.push(html`<rect class="vf-sparkline__bar" x="${round(i * band + band * 0.15)}" y="${top}" width="${round(band * 0.7)}" height="${height}"></rect>`);
    }
    marks = html`${bars}`;
  }
  const f = function (n) { return vf.fmt.number(n, p.format); };
  const label = present(p.label) ? p.label : values.length
    ? msg('sparkline.summary', null, { first: f(values[0]), last: f(values[values.length - 1]), min: f(low), max: f(high) })
    : msg('sparkline.empty');
  return html`<svg ${attrs({ class: cls('vf-sparkline', p.className), id: p.id, 'data-ref': p.ref, 'data-type': type, role: 'img', 'aria-label': label })} viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" focusable="false">${marks}</svg>`;
}
