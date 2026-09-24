// SPDX-License-Identifier: Apache-2.0
// Every CDN example in the repository points at the current package version, and every SRI value
// matches the committed dist file (rule 20, 24). Run after a version bump and `npm run build` to
// find the examples that still need updating. History and the changelog are records, so skipped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const VERSION = JSON.parse(readFileSync(ROOT + 'package.json', 'utf8')).version;
const PLACEHOLDERS = ['@VERSION@', '<version>', '<버전>'];
const SKIP = /^(history\/|CHANGELOG\.md$|node_modules\/|build\/out\/)/;

const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && !SKIP.test(f) && /\.(md|txt|html|js|mjs|json)$/.test(f) && f !== 'build/versions.test.js');

const sri = (file) => 'sha384-' + createHash('sha384').update(readFileSync(ROOT + 'layer1/dist/' + file)).digest('base64');

/** Every `npm/vfunc@<version>/<path>` in the text, with the integrity that follows it (if any). */
function references(text) {
  const found = [];
  const re = /npm\/vfunc@([^/\s"'`]+)\/([^\s"'`)]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const after = text.slice(re.lastIndex, re.lastIndex + 200);
    const integrity = /^[^<>]*?integrity="(sha384-[^"]+)"/.exec(after);
    found.push({ version: m[1], path: m[2], integrity: integrity && integrity[1] });
  }
  return found;
}

test('CDN examples use the package version and the SRI of the committed dist file', () => {
  const wrong = [];
  let checked = 0;
  for (const file of files) {
    let text;
    try { text = readFileSync(ROOT + file, 'utf8'); } catch (err) { continue; }
    for (const ref of references(text)) {
      checked++;
      if (ref.version !== VERSION && PLACEHOLDERS.indexOf(ref.version) < 0) wrong.push(file + ': vfunc@' + ref.version + ' (package is ' + VERSION + ')');
      if (ref.integrity) {
        const dist = /^dist\/(.+)$/.exec(ref.path);
        if (!dist) wrong.push(file + ': integrity on a non-dist path ' + ref.path);
        else if (ref.integrity !== sri(dist[1])) wrong.push(file + ': integrity of ' + ref.path + ' does not match layer1/dist');
      }
    }
  }
  assert.ok(checked > 10, 'found the examples (' + checked + ')');
  assert.deepEqual(wrong, []);
});
