// SPDX-License-Identifier: Apache-2.0
// The starter download (build/zip.mjs, D-048): read the archive back and compare it with the starter folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { zip, zipFolder, listFiles, crc32 } from './zip.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

/** Reads a zip through its central directory: { name: Buffer }. */
function unzip(buffer) {
  const end = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buffer.readUInt16LE(end + 10);
  let at = buffer.readUInt32LE(end + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    assert.equal(buffer.readUInt32LE(at), 0x02014b50);
    const size = buffer.readUInt32LE(at + 20);
    const nameLength = buffer.readUInt16LE(at + 28);
    const local = buffer.readUInt32LE(at + 42);
    const name = buffer.toString('utf8', at + 46, at + 46 + nameLength);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const data = inflateRawSync(buffer.subarray(start, start + size));
    assert.equal(crc32(data), buffer.readUInt32LE(at + 16), name + ' CRC');
    files[name] = data;
    at += 46 + nameLength;
  }
  return files;
}

test('crc32 matches the standard check value', () => {
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
});

test('a zip reads back the same bytes, and the same input gives the same archive', () => {
  const entries = [{ name: 'a/한글.txt', data: Buffer.from('안녕\n') }, { name: 'b.bin', data: Buffer.alloc(5000, 7) }];
  const files = unzip(zip(entries));
  assert.deepEqual(Object.keys(files), ['a/한글.txt', 'b.bin']);
  assert.equal(files['b.bin'].length, 5000);
  assert.deepEqual(zip(entries), zip(entries));
});

test('the starter download holds every starter file unchanged', () => {
  const dir = join(ROOT, 'layer1/starter');
  const files = unzip(zipFolder(dir, 'vfunc-starter'));
  const expected = listFiles(dir);
  assert.ok(expected.indexOf('AGENTS.md') >= 0 && expected.indexOf('lib/vfunc.esm.js') >= 0);
  assert.deepEqual(Object.keys(files), expected.map((p) => 'vfunc-starter/' + p));
  for (const p of expected) assert.ok(files['vfunc-starter/' + p].equals(readFileSync(join(dir, p))), p);
});
