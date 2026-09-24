// SPDX-License-Identifier: Apache-2.0
// Sample 14: the conversion must keep the published HTML and CSS (prompt-html-to-vfunc.md, rule 1).
// Undo the changes listed in CONVERSION.md and the two pages must be identical.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dir = new URL('../examples/14-before-after-conversion/', import.meta.url);
const read = (path) => readFileSync(new URL(path, dir), 'utf8').replace(/\r\n/g, '\n');

/** Hook attributes the conversion may add (rule 1). */
const HOOKS = /\s(?:id="(?:order-search|user-menu|kpis|summary-panel|orders-panel|order-status|orders-body)"|data-(?:action|ref|tab)="[^"]*"|aria-[a-z]+="[^"]*"|role="[^"]*")/g;

function undoAfter(html) {
  return html
    .replace(/\n\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, '')
    .replace(/\n\s*<script type="module" src="\.\/app\.js"><\/script>/, '')
    .replace(HOOKS, '')
    .replace(' hidden>', ' style="display:none">')
    .replace('<a href="#">Sign out</a>', '<a href="javascript:void(0)">Sign out</a>');
}

function undoUnsafe(html) {
  return html
    .replace(/\n\s*<script>[\s\S]*?<\/script>/, '')
    .replace(/\sonclick="[^"]*"/g, '');
}

test('after/index.html is before/index.html plus hooks, minus the unsafe items', () => {
  assert.equal(undoAfter(read('after/index.html')), undoUnsafe(read('before/index.html')));
});

test('the publisher CSS is unchanged', () => {
  assert.equal(read('after/dashboard.css'), read('before/dashboard.css'));
});

test('no unsafe item is left in the converted page', () => {
  const html = read('after/index.html');
  assert.doesNotMatch(html, /\son[a-z]+="/, 'inline handlers');
  assert.doesNotMatch(html, /javascript:/, 'javascript: URLs');
  assert.doesNotMatch(html, /\sstyle="/, 'inline styles');
  assert.doesNotMatch(html, /<script>/, 'inline scripts');
  assert.match(html, /script-src 'self';/);
});
