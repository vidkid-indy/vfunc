// SPDX-License-Identifier: Apache-2.0
//
// What the official adapters share (D-034, G-2 steps 2–12): the vendor library from `lib` or a
// global, a host element marked data-vf-keep (vendor DOM never goes into render output, so a
// parent refresh keeps it), chart colors read from the --vf-chart-* tokens, size tracking,
// locale changes, and cell / label content that stays safe (vf.html markup or text, never a
// plain HTML string).

import vf from './vf.js';
import { attrs } from './attrs.js';
import { cls } from './common.js';

const html = vf.html;

/**
 * The vendor library: `props.lib`, else window[globalName]. Throws a clear error when missing
 * (G-2 step 2: load the library before creating the component, or inject it).
 */
export function vendorLib(p, globalName, name) {
  const lib = p.lib || (typeof window !== 'undefined' ? window[globalName] : null);
  if (!lib) throw new Error('[vfunc-ui] ' + name + ': load the vendor library first (global ' + globalName + ') or pass it as `lib`.');
  return lib;
}

/** Root markup: the vendor draws inside the data-vf-keep host only (G-2 step 3). */
export function hostMarkup(s, block) {
  return html`<div ${attrs({ class: cls('vf-adapter ' + block, s.className), id: s.id, 'data-ref': s.ref })}><div class="vf-adapter__host" data-vf-keep="host"></div></div>`;
}

export function hostOf(self) {
  return self.$node.querySelector('[data-vf-keep="host"]');
}

/** The value of a design token (vendors need color values; rule 21 keeps them out of JS). */
export function token(name) {
  if (typeof window === 'undefined' || !window.getComputedStyle) return '';
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).replace(/^\s+|\s+$/g, '');
}

/** The eight chart colors from --vf-chart-1 … 8 (empty ones are left out). */
export function chartColors() {
  const out = [];
  for (let i = 1; i <= 8; i++) {
    const c = token('--vf-chart-' + i);
    if (c) out.push(c);
  }
  return out;
}

export function reducedMotion() {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    return false;
  }
}

/** Calls fn when the element's size changes (ResizeObserver, else window resize). Returns stop(). */
export function watchSize(el, fn) {
  if (typeof window === 'undefined') return function () {};
  if (typeof window.ResizeObserver === 'function') {
    const observer = new window.ResizeObserver(function () { fn(); });
    observer.observe(el);
    return function () { observer.disconnect(); };
  }
  window.addEventListener('resize', fn);
  return function () { window.removeEventListener('resize', fn); };
}

/** Plain text of a label that may be vf.html markup (for vendors that take header text). */
export function textOf(value) {
  if (value == null) return '';
  if (value instanceof vf.SafeHtml) {
    const el = vf.node(vf.html`<span>${value}</span>`);
    return el ? el.textContent : '';
  }
  return String(value);
}

/**
 * A DOM node for a cell from column.render(row, index): vf.html markup becomes elements, anything
 * else is text. Vendors that accept a node never see an HTML string (G-2 step 11: XSS).
 */
export function cellNode(column, row, index) {
  const value = column.render(row, index);
  const span = document.createElement('span');
  span.appendChild(value instanceof vf.SafeHtml ? vf.frag(value) : document.createTextNode(value == null ? '' : String(value)));
  return span;
}

/** Adds adapter functions to vf, read-only, without replacing existing members (rule 17). */
export function register(members) {
  for (const key in members) {
    if (!Object.prototype.hasOwnProperty.call(members, key) || Object.prototype.hasOwnProperty.call(vf, key)) continue;
    Object.defineProperty(vf, key, { value: members[key], enumerable: true, writable: false, configurable: false });
  }
}

/** The key of a row, as the grid contract uses it. */
export function rowKeyOf(row, rowKey) {
  const k = rowKey || 'id';
  return row != null && row[k] != null ? String(row[k]) : '';
}

/** 'bar' | 'line' | 'area' | 'pie' | 'donut' — anything else is 'bar'. */
export function chartType(type) {
  return /^(bar|line|area|pie|donut)$/.test(type) ? type : 'bar';
}

/** Data in the chart contract shape. */
export function chartData(data) {
  const d = data || {};
  const series = [];
  for (let i = 0; i < (d.series || []).length; i++) {
    const s = d.series[i] || {};
    series.push({ name: s.name == null ? String(i + 1) : String(s.name), data: (s.data || []).slice() });
  }
  return { labels: (d.labels || []).slice(), series: series };
}
