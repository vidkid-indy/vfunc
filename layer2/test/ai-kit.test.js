// SPDX-License-Identifier: Apache-2.0
//
// The layer 2 AI kit (layer2/ai, D-034 9, D-036): both languages have the same files and each pair
// has the same sections, as in layer 1's kit. The npm package and the site put these files in the
// same ai/<lang>/ folder as layer 1's, so no name may repeat one of layer 1's.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const AI = fileURLToPath(new URL('../ai/', import.meta.url));
const L1 = fileURLToPath(new URL('../../layer1/ai/', import.meta.url));
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const en = readdirSync(AI + 'en').sort();

test('English and Korean layer 2 kits have the same files, none named like a layer 1 file', () => {
  assert.deepEqual(readdirSync(AI + 'ko').sort(), en);
  assert.ok(en.indexOf('components.md') >= 0 && en.indexOf('prompt-html-to-components.md') >= 0);
  const l1 = readdirSync(L1 + 'en');
  assert.deepEqual(en.filter((name) => l1.indexOf(name) >= 0), []);
});

test('each layer 2 pair has the same sections', () => {
  const count = (text) => ({
    h2: (text.match(/^## /gm) || []).length,
    h3: (text.match(/^### /gm) || []).length,
    separators: (text.match(/^---$/gm) || []).length,
    checkboxes: (text.match(/^- \[ \]/gm) || []).length
  });
  for (const name of en) assert.deepEqual(count(read(AI + 'ko/' + name)), count(read(AI + 'en/' + name)), name);
});
