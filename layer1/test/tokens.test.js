// SPDX-License-Identifier: Apache-2.0
// layer1/css/vfunc.tokens.css: token names are public API (D-011, D-018), both dark blocks must
// agree, and the main text and UI pairs must meet WCAG AA in both themes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/vfunc.tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function block(pattern) {
  const start = css.search(pattern);
  assert.ok(start >= 0, 'block ' + pattern);
  let depth = 0;
  let open = -1;
  for (let i = start; i < css.length; i++) {
    if (css[i] === '{') { depth++; if (open < 0) open = i; }
    if (css[i] === '}') { depth--; if (depth === 0) return css.slice(open + 1, i); }
  }
  throw new Error('unclosed block');
}

function tokens(text) {
  const map = {};
  const re = /(--vf-[a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(text)) !== null) map[m[1]] = m[2].trim();
  return map;
}

const light = tokens(block(/^:root\s*\{/m));
const darkAuto = tokens(block(/:root:not\(\[data-theme="light"\]\)\s*\{/));
const darkForced = tokens(block(/:root\[data-theme="dark"\]\s*\{/));
const dark = Object.assign({}, light, darkAuto);

/** The public token names. Changing this list is an API change (CLAUDE.md rule 18). */
const PUBLIC = [
  'color-primary', 'color-primary-hover', 'color-primary-active', 'color-primary-soft', 'color-on-primary',
  'color-success', 'color-success-soft', 'color-success-text', 'color-warning', 'color-warning-soft', 'color-warning-text',
  'color-danger', 'color-danger-soft', 'color-danger-text', 'color-info', 'color-info-soft', 'color-info-text',
  'color-bg', 'color-surface', 'color-surface-muted', 'color-overlay',
  'color-text', 'color-text-muted', 'color-text-disabled', 'color-text-inverse',
  'color-border', 'color-border-strong', 'color-focus', 'focus-ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-7', 'chart-8',
  'shadow-1', 'shadow-2', 'shadow-3', 'radius-sm', 'radius-md', 'radius-lg', 'radius-full',
  'space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-7',
  'font-body', 'font-mono', 'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl', 'font-size-2xl',
  'font-weight-normal', 'font-weight-strong', 'line-height',
  'duration-fast', 'duration-base', 'easing', 'z-dropdown', 'z-popover', 'z-drawer', 'z-modal', 'z-toast'
].map((name) => '--vf-' + name);

test('the light theme defines exactly the public token names', () => {
  assert.deepEqual(Object.keys(light).sort(), PUBLIC.slice().sort());
});

test('the OS dark theme and data-theme="dark" are identical and only override known tokens', () => {
  assert.deepEqual(darkForced, darkAuto);
  for (const name of Object.keys(darkAuto)) assert.ok(PUBLIC.indexOf(name) >= 0, name);
});

function rgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  assert.ok(m, 'expected #rrggbb, got ' + hex);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, minimum]: 4.5 for text, 3 for UI parts (WCAG 1.4.3 and 1.4.11).
const PAIRS = [
  ['text', 'bg', 4.5], ['text', 'surface', 4.5], ['text', 'surface-muted', 4.5],
  ['text-muted', 'bg', 4.5], ['text-muted', 'surface', 4.5],
  ['on-primary', 'primary', 4.5], ['on-primary', 'primary-hover', 4.5], ['primary', 'surface', 3],
  ['success-text', 'success-soft', 4.5], ['warning-text', 'warning-soft', 4.5],
  ['danger-text', 'danger-soft', 4.5], ['info-text', 'info-soft', 4.5],
  ['success', 'surface', 3], ['warning', 'surface', 3], ['danger', 'surface', 3],
  ['border-strong', 'surface', 1.4], ['focus', 'surface', 3]
];

for (const [themeName, theme] of [['light', light], ['dark', dark]]) {
  test('WCAG AA contrast in the ' + themeName + ' theme', () => {
    const failures = [];
    for (const [fg, bg, min] of PAIRS) {
      const ratio = contrast(theme['--vf-color-' + fg], theme['--vf-color-' + bg]);
      if (ratio < min) failures.push(fg + ' on ' + bg + ' = ' + ratio.toFixed(2) + ' (< ' + min + ')');
    }
    assert.deepEqual(failures, []);
  });
}
