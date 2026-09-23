// SPDX-License-Identifier: Apache-2.0
// The license gate of the build (D-010, CLAUDE.md rule 23).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, checkBundledInputs, generate, readThirdParty } from './licenses.mjs';

const entry = {
  name: 'tiny-polyfill', version: '1.0.0', license: 'MIT', copyright: 'Copyright (c) 2020 Someone',
  url: 'https://example.test/tiny-polyfill', usedIn: ['vfunc.legacy.min.js'], bundled: false
};
const data = (entries) => ({ allowedLicenses: ['MIT', 'Apache-2.0'], entries: entries });

test('our own sources pass the bundle check', () => {
  assert.deepEqual(checkBundledInputs(['layer1/src/vfunc.js', 'build/iife-entry.js'], data([])), []);
});

test('a bundled module that is not listed fails the build', () => {
  const errors = checkBundledInputs(['node_modules/tiny-polyfill/index.js', 'somewhere/else.js'], data([]));
  assert.equal(errors.length, 2);
  assert.match(errors[0], /"tiny-polyfill".*not listed as bundled/);
  assert.match(errors[1], /neither our code nor a listed third-party module/);
});

test('a listed module must be marked bundled to be accepted', () => {
  const inputs = ['node_modules/tiny-polyfill/index.js'];
  assert.equal(checkBundledInputs(inputs, data([entry])).length, 1);
  assert.deepEqual(checkBundledInputs(inputs, data([Object.assign({}, entry, { bundled: true })])), []);
});

test('third-party.json entries are validated', () => {
  assert.deepEqual(validate(data([entry])), []);
  const errors = validate(data([
    Object.assign({}, entry, { license: 'BUSL-1.1' }),
    Object.assign({}, entry, { name: 'other', bundled: true }),
    { name: 'incomplete', bundled: false }
  ]));
  assert.ok(errors.some((e) => /BUSL-1\.1.*not in allowedLicenses/.test(e)));
  assert.ok(errors.some((e) => /other: a bundled entry needs "licenseFile"/.test(e)));
  assert.ok(errors.some((e) => /incomplete: missing "license"/.test(e)));
});

test('the current third-party.json is valid and generates every output', () => {
  const files = generate(readThirdParty());
  assert.deepEqual(Object.keys(files).sort(), ['NOTICE', 'THIRD_PARTY_LICENSES.txt', 'site/data/licenses.json']);
  assert.match(files.NOTICE, /^vfunc\.js\n/);
  assert.match(files.NOTICE, /Third-party software\n-+\n/);
});
