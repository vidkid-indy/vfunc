// SPDX-License-Identifier: Apache-2.0
// Static checks of the layer 2 sources (rules 16, 20, 21, 22; D-027).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const LAYER2 = fileURLToPath(new URL('..', import.meta.url));

function files(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full, ext));
    else if (name.endsWith(ext)) out.push(full);
  }
  return out;
}

const js = files(join(LAYER2, 'src'), '.js').map((path) => ({
  path: relative(LAYER2, path).split('\\').join('/'),
  // Comments are not code: drop them before looking for patterns.
  code: readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}));
const css = files(join(LAYER2, 'css'), '.css').map((path) => ({
  path: relative(LAYER2, path).split('\\').join('/'),
  code: readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}));

function offenders(list, pattern) {
  return list.filter((f) => pattern.test(f.code)).map((f) => f.path);
}

test('only _internal/vf.js imports layer 1, and layer 2 never touches internal engine members', () => {
  const importsLayer1 = js.filter((f) => /from\s+['"][^'"]*layer1\//.test(f.code)).map((f) => f.path);
  assert.deepEqual(importsLayer1, ['src/_internal/vf.js']);
  assert.deepEqual(offenders(js, /\bvf\._|\$node\._|\.\s*_(?:cfg|hook|listeners|mounted|destroyed|adopted|accessors)\b/), []);
});

test('no class selectors for behaviour: hooks are data-action, data-ref and id (rule 21)', () => {
  assert.deepEqual(offenders(js, /selector\s*:\s*['"`]\s*\./), []);
  assert.deepEqual(offenders(js, /querySelector(All)?\(\s*['"`]\s*\./), []);
  assert.deepEqual(offenders(js, /closest\(\s*['"`]\s*\./), []);
});

test('no design values in JS: colors, px sizes, inline styles (rule 21)', () => {
  assert.deepEqual(offenders(js, /['"`]#[0-9a-fA-F]{3,8}['"`]|\brgba?\(|\bhsla?\(/), []);
  assert.deepEqual(offenders(js, /\d+px\b/), []);
  assert.deepEqual(offenders(js, /\bstyle\s*=\s*\\?["']/), []);
});

test('markup is built with vf.html; vf.unsafeHtml only in the attribute builder (rule 20)', () => {
  assert.deepEqual(offenders(js, /\bunsafeHtml\(/), ['src/_internal/attrs.js']);
  assert.deepEqual(offenders(js, /\.innerHTML\s*=/), []);
  assert.deepEqual(offenders(js, /\beval\(|new Function\(|setTimeout\(\s*['"`]/), []);
});

test('CSS uses tokens only and logical properties (rule 21, RTL)', () => {
  assert.deepEqual(offenders(css, /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/), [], 'raw colors');
  const bigPx = css.filter((f) => /(?<![\w.-])(\d*\.?\d+)px\b/g.test(f.code) &&
    Array.from(f.code.matchAll(/(?<![\w.-])(\d*\.?\d+)px\b/g)).some((m) => Number(m[1]) > 2)).map((f) => f.path);
  assert.deepEqual(bigPx, [], 'px sizes above 2px (hairlines are allowed)');
  assert.deepEqual(offenders(css, /(^|[;{\s])(?:(?:margin|padding|border)-(?:left|right|top|bottom)[a-z-]*|left|right|(?:min-|max-)?(?:width|height))\s*:|text-align\s*:\s*(left|right)/m), [],
    'physical properties: use inline/block ones');
  assert.deepEqual(offenders(css, /@layer/), [], 'the build adds the layers');
});
