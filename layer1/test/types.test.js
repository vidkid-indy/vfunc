// SPDX-License-Identifier: Apache-2.0
// types/vfunc.d.ts is the public API boundary (D-009): it must declare exactly what the engine exports.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import './setup-dom.js';
import vf, * as named from '../src/vfunc.js';

const dts = readFileSync(new URL('../types/vfunc.d.ts', import.meta.url), 'utf8');
const globalDts = readFileSync(new URL('../types/global.d.ts', import.meta.url), 'utf8');

function sorted(list) {
  return Array.from(new Set(list)).sort();
}

test('the declaration files parse as TypeScript', () => {
  for (const [name, text] of [['vfunc.d.ts', dts], ['global.d.ts', globalDts]]) {
    assert.doesNotThrow(() => transformSync(text, { loader: 'ts', sourcefile: name }), name);
  }
});

test('every export of the engine is declared, and nothing more', () => {
  const declared = [];
  const pattern = /^export declare (?:function|const) ([\w$]+)/gm;
  let m;
  while ((m = pattern.exec(dts)) !== null) declared.push(m[1]);
  const exported = Object.keys(named).filter((key) => key !== 'default');
  assert.deepEqual(sorted(declared), sorted(exported));
});

test('the Vf interface lists every member of the vf object', () => {
  const body = /export interface Vf \{([\s\S]*?)\n\}/.exec(dts);
  assert.ok(body, 'interface Vf');
  const members = [];
  const pattern = /readonly ([\w$]+): typeof ([\w$]+);/g;
  let m;
  while ((m = pattern.exec(body[1])) !== null) {
    assert.equal(m[1], m[2], 'member ' + m[1]);
    members.push(m[1]);
  }
  assert.deepEqual(sorted(members), sorted(Object.keys(vf)));
});

test('no internal member is declared', () => {
  assert.doesNotMatch(dts.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''), /\b_[a-zA-Z]\w*\s*[:(]/);
});
