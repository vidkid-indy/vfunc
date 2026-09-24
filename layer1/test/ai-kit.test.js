// SPDX-License-Identifier: Apache-2.0
// The AI prompt kit (layer1/ai, D-019): both languages have the same files and sections, the
// DESIGN.md template matches css/vfunc.tokens.css, and llms-full.txt is generated and current.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLlmsFull } from '../../build/llms.mjs';

const AI = fileURLToPath(new URL('../ai/', import.meta.url));
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

function files(dir) {
  const out = [];
  (function walk(d) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(dir, full).split('\\').join('/'));
    }
  })(dir);
  return out.sort();
}

const en = files(join(AI, 'en'));
const ko = files(join(AI, 'ko'));

test('English and Korean kits have the same files', () => {
  assert.ok(en.length >= 11, 'kit files: ' + en.length);
  assert.deepEqual(ko, en);
});

test('each pair has the same sections', () => {
  for (const name of en) {
    const count = (text) => ({
      h2: (text.match(/^## /gm) || []).length,
      separators: (text.match(/^---$/gm) || []).length,
      checkboxes: (text.match(/^- \[ \]/gm) || []).length
    });
    assert.deepEqual(count(read(join(AI, 'ko', name))), count(read(join(AI, 'en', name))), name);
  }
});

function tokensOf(block) {
  const map = {};
  const re = /(--vf-[a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block)) !== null) map[m[1]] = m[2].trim();
  return map;
}

const css = read(fileURLToPath(new URL('../css/vfunc.tokens.css', import.meta.url))).replace(/\/\*[\s\S]*?\*\//g, '');
const lightCss = tokensOf(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))));
const darkStart = css.indexOf(':root[data-theme="dark"]');
const darkCss = tokensOf(css.slice(darkStart, css.indexOf('}', darkStart)));

function templateTokens(lang) {
  const text = read(join(AI, lang, 'design', 'DESIGN.template.md'));
  const m = /```tokens\n([\s\S]*?)\n```/.exec(text);
  assert.ok(m, lang + ' template has a tokens block');
  return { raw: m[1], data: JSON.parse(m[1]) };
}

test('the DESIGN.md template tokens block matches vfunc.tokens.css', () => {
  const { raw, data } = templateTokens('en');
  assert.equal(templateTokens('ko').raw, raw, 'both languages share the same block');
  assert.deepEqual(Object.keys(data.light).sort(), Object.keys(lightCss).sort(), 'every public token, nothing else');
  for (const name of Object.keys(lightCss)) assert.equal(data.light[name], lightCss[name], 'light ' + name);
  for (const name of Object.keys(data.dark)) assert.equal(data.dark[name], darkCss[name], 'dark ' + name);
});

test('llms-full.txt is generated from its sources and up to date', () => {
  const current = read(join(AI, 'llms-full.txt'));
  assert.equal(current, generateLlmsFull(), 'run npm run build');
  assert.match(current, /# Part 2 — Reference manual/);
  assert.match(current, /export declare const vfunc/);
});
