// SPDX-License-Identifier: Apache-2.0
// catalog.json, the exports of layer2/src/index.js and layer2/types/vfunc-ui.d.ts stay 1:1 (D-027),
// and every message key exists in both built-in bundles (rule 22).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';
import '../../layer1/test/setup-dom.js';
import ui, * as named from '../src/index.js';
import en from '../src/locales/en.js';
import ko from '../src/locales/ko.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const catalog = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
const dts = readFileSync(new URL('../types/vfunc-ui.d.ts', import.meta.url), 'utf8');

const sorted = (list) => Array.from(new Set(list)).sort();
const catalogNames = () => catalog.components.reduce((all, c) => all.concat(c.names), []);

function flatKeys(table, prefix) {
  const keys = [];
  for (const key of Object.keys(table)) {
    const value = table[key];
    const path = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object') keys.push(...flatKeys(value, path));
    else keys.push(path);
  }
  return keys;
}

test('catalog names = exports of index.js = members of the default export', () => {
  const exported = Object.keys(named).filter((key) => key !== 'default');
  assert.deepEqual(sorted(catalogNames()), sorted(exported));
  assert.deepEqual(sorted(Object.keys(ui)), sorted(exported));
});

test('catalog entries follow the naming rule of their tier (rule 17)', () => {
  for (const c of catalog.components) {
    assert.ok(catalog.categories.indexOf(c.category) >= 0, c.id + ' category');
    const vs = c.names.filter((n) => /^vs[A-Z]/.test(n));
    const vfn = c.names.filter((n) => /^vf[A-Z]/.test(n));
    assert.equal(vs.length + vfn.length, c.names.length, c.id + ': names start with vs or vf');
    if (c.tier === 'S') assert.ok(vs.length === 1 && vfn.length === 0, c.id + ': tier S is vs* only');
    else if (c.tier === 'F') assert.ok(vs.length === 0 && vfn.length === 1, c.id + ': tier F is vf* only');
    else if (c.tier === 'P') assert.ok(vs.length === 1 && vfn.length === 1 && vs[0].slice(2) === vfn[0].slice(2), c.id + ': tier P pairs vsX and vfX');
    else assert.fail(c.id + ': unknown tier ' + c.tier);
    for (const file of [c.source, c.css].filter(Boolean)) assert.ok(existsSync(ROOT + file), c.id + ': ' + file);
    assert.ok(c.summary && c.summary.en && c.summary.ko, c.id + ': summary in both languages');
  }
});

test('the declaration file parses, declares every export and adds each one to Vf', () => {
  assert.doesNotThrow(() => transformSync(dts, { loader: 'ts', sourcefile: 'vfunc-ui.d.ts' }));
  const declared = Array.from(dts.matchAll(/^export declare function ([\w$]+)/gm)).map((m) => m[1]);
  const exported = Object.keys(named).filter((key) => key !== 'default');
  assert.deepEqual(sorted(declared), sorted(exported));
  const vfBlock = /interface Vf \{([\s\S]*?)\n {2}\}/.exec(dts);
  assert.ok(vfBlock, 'module augmentation of Vf');
  const members = Array.from(vfBlock[1].matchAll(/readonly ([\w$]+): typeof ([\w$]+);/g)).map((m) => {
    assert.equal(m[1], m[2]);
    return m[1];
  });
  assert.deepEqual(sorted(members), sorted(exported));
});

test('en and ko have the same message keys, and every key a component uses is in them', () => {
  assert.deepEqual(sorted(flatKeys(ko)), sorted(flatKeys(en)));
  const used = [];
  for (const c of catalog.components) {
    const source = readFileSync(ROOT + c.source, 'utf8');
    const inSource = Array.from(source.matchAll(/\bmsg\(\s*'([\w.]+)'/g)).map((m) => m[1]);
    assert.deepEqual(sorted(inSource), sorted(c.messages), c.id + ': catalog messages = msg() keys in the source');
    used.push(...inSource);
  }
  const known = flatKeys(en);
  for (const key of used) assert.ok(known.indexOf(key) >= 0, 'missing message ' + key);
});
