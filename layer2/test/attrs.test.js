// SPDX-License-Identifier: Apache-2.0
// The attribute builder behind every vs* function (rule 20): names from an allow-list, values escaped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureWarnings } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import { attrs } from '../src/_internal/attrs.js';

test('values are escaped; absent values leave the attribute out; booleans follow vf.html', () => {
  assert.equal(String(attrs({ id: 'a"b', title: '<x>', name: null, value: '', hidden: false, disabled: true })),
    'id="a&quot;b" title="&lt;x&gt;" disabled');
  assert.equal(String(attrs({ 'aria-expanded': false, 'aria-busy': true, 'data-state': 'open' })),
    'aria-expanded="false" aria-busy="true" data-state="open"');
});

test('names outside the allow-list are dropped whatever the value, with a warning', () => {
  let out;
  const warnings = captureWarnings(() => {
    out = String(attrs({ onclick: 'alert(1)', href: 'javascript:x', 'data-x onclick': false, 'aria-x" y': true, style: 'color:red' }));
  });
  assert.equal(out, '');
  assert.equal(warnings.length, 5);
});

test('the result is inserted inside a tag by vf.html', () => {
  const holder = document.createElement('div');
  holder.innerHTML = String(vf.html`<input ${attrs({ id: 'q', required: true, placeholder: '"x"' })}>`);
  const input = holder.firstElementChild;
  assert.equal(input.id, 'q');
  assert.equal(input.required, true);
  assert.equal(input.getAttribute('placeholder'), '"x"');
});
