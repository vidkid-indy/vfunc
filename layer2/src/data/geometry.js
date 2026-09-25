// SPDX-License-Identifier: Apache-2.0
//
// Chart geometry in SVG user units: round axis ticks and pie / donut arc paths. No DOM, no colors.

/** Rounds to 2 decimals so the markup stays short. */
export function r2(n) {
  return Math.round(n * 100) / 100;
}

/** A round step (1, 2, 2.5, 5 × 10^n) so about `count` ticks cover the span. */
function niceStep(span, count) {
  const raw = span / Math.max(1, count);
  const power = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
  const f = raw / power;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * power;
}

/**
 * Axis from 0 (or below, for negative values) to a round maximum.
 * @returns {{min: number, max: number, ticks: number[]}}
 */
export function niceTicks(lo, hi, count) {
  let min = Math.min(0, lo);
  let max = Math.max(0, hi);
  if (min === max) max = min + 1;
  const step = niceStep(max - min, count || 5);
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return { min: min, max: max, ticks: ticks };
}

function point(cx, cy, radius, angle) {
  return r2(cx + radius * Math.sin(angle)) + ' ' + r2(cy - radius * Math.cos(angle));
}

/**
 * The path of a pie slice (inner 0) or a donut segment, clockwise from 12 o'clock.
 * @param {number} a0 - start angle in radians
 * @param {number} a1 - end angle in radians
 */
export function arcPath(cx, cy, radius, inner, a0, a1) {
  // A full circle cannot be one arc: draw it as two halves.
  if (a1 - a0 >= Math.PI * 2 - 1e-6) {
    const mid = a0 + Math.PI;
    return arcPath(cx, cy, radius, inner, a0, mid) + ' ' + arcPath(cx, cy, radius, inner, mid, a0 + Math.PI * 2);
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const outer = 'M ' + point(cx, cy, radius, a0) + ' A ' + radius + ' ' + radius + ' 0 ' + large + ' 1 ' + point(cx, cy, radius, a1);
  if (!inner) return outer + ' L ' + r2(cx) + ' ' + r2(cy) + ' Z';
  return outer + ' L ' + point(cx, cy, inner, a1) + ' A ' + inner + ' ' + inner + ' 0 ' + large + ' 0 ' + point(cx, cy, inner, a0) + ' Z';
}
