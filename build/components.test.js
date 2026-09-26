// SPDX-License-Identifier: Apache-2.0
//
// The generated layer 2 component list (build/components.mjs, D-036) is current and complete, and
// the hand-written summaries (llms.txt in both languages, the site's components page) name every
// component of layer2/catalog.json.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateComponents, readDeclarations, COMPONENTS_MD } from './components.mjs';
import { componentsBlock } from './site.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');
const catalog = JSON.parse(read('layer2/catalog.json'));
const names = [].concat(...catalog.components.map((c) => c.names));

test('components.md in both languages is generated and up to date', () => {
  for (const lang of Object.keys(COMPONENTS_MD)) {
    assert.equal(read(COMPONENTS_MD[lang]), generateComponents(lang), COMPONENTS_MD[lang] + ': run npm run build');
  }
});

test('components.md shows every name with its declaration, by category in catalog order', () => {
  const text = generateComponents('en');
  let last = -1;
  const ordered = [].concat(...catalog.categories.map((k) => catalog.components.filter((c) => c.category === k)));
  assert.equal(ordered.length, catalog.components.length, 'every component has a known category');
  for (const c of ordered) {
    const at = text.indexOf('### ' + c.names.map((n) => '`' + n + '`').join(' · ') + ' — ' + c.tier);
    assert.ok(at > last, c.id + ' heading after the previous one');
    last = at;
    for (const n of c.names) assert.ok(new RegExp('^function ' + n + '\\b', 'm').test(text), n + ' declaration');
  }
  for (const n of ['vfGridAg', 'vfGridTabulator', 'vfChartChartjs', 'vfChartEcharts']) assert.ok(new RegExp('^function ' + n + '\\b', 'm').test(text), n);
  assert.ok(text.indexOf('interface VsCommonProps {') < text.indexOf('### '), 'shared types come first');
});

test('the d.ts reader keeps nested types and arrow types whole', () => {
  const ds = readDeclarations([
    '/** Does it. */',
    'export interface AProps extends B {',
    '  /** A callback. */',
    '  onX?: (e: VfUiEvent<{ a: string; b: number[] }>) => void;',
    "  size?: 'md' | 'sm'; // 'quoted'",
    '}',
    'export declare function a(props: AProps): VfuncInstance & {',
    '  open(): Promise<boolean>;',
    '};'
  ].join('\n'));
  assert.deepEqual(ds[0].members, ['onX?: (e: VfUiEvent<{ a: string; b: number[] }>) => void', "size?: 'md' | 'sm'"]);
  assert.equal(ds[1].decl, 'function a(props: AProps): VfuncInstance & { open(): Promise<boolean>; }');
  assert.equal(ds[1].props, 'AProps');
});

test('llms.txt in both languages names every component', () => {
  for (const file of ['layer1/ai/llms.txt', 'layer1/ai/llms.ko.txt']) {
    const text = read(file);
    assert.deepEqual(names.filter((n) => !new RegExp('\\b' + n + '\\b').test(text)), [], file);
  }
});

test('the site components table lists every component in both languages', () => {
  for (const lang of ['ko', 'en']) {
    const html = componentsBlock(lang);
    assert.deepEqual(names.filter((n) => html.indexOf('<code>' + n + '</code>') < 0), [], lang);
  }
});
