// SPDX-License-Identifier: Apache-2.0
// The starter template (layer1/starter, plan K-5 and O-1): tools/release.mjs and the generated copies.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { release, rewriteIndex, appVersion, parseArgs } from '../starter/tools/release.mjs';

const STARTER = fileURLToPath(new URL('../starter/', import.meta.url));

function copyStarter() {
  const dir = mkdtempSync(join(tmpdir(), 'vf-starter-'));
  cpSync(STARTER, dir, { recursive: true, filter: (src) => !/[\\/]dist([\\/]|$)/.test(src.slice(STARTER.length)) });
  return dir;
}

function setVersion(dir, version) {
  const file = join(dir, 'config.js');
  writeFileSync(file, readFileSync(file, 'utf8').replace(/APP_VERSION = '[^']+'/, "APP_VERSION = '" + version + "'"));
}

test('rewriteIndex points relative src/href into the version folder only', () => {
  const html = '<link rel="icon" href="data:,"><link href="./styles/a.css"><link href="styles/b.css">' +
    '<script src="./app.js"></script><a href="#/x"></a><a href="https://cdn.example/x.js"></a><a href="/abs"></a><a href="//cdn/x"></a>';
  assert.equal(rewriteIndex(html, '1.2.3'),
    '<link rel="icon" href="data:,"><link href="./1.2.3/styles/a.css"><link href="./1.2.3/styles/b.css">' +
    '<script src="./1.2.3/app.js"></script><a href="#/x"></a><a href="https://cdn.example/x.js"></a><a href="/abs"></a><a href="//cdn/x"></a>');
});

test('parseArgs reads the version, --keep and --out', () => {
  assert.deepEqual(parseArgs(['1.0.1', '--keep', '3', '--out', 'www']), { version: '1.0.1', keep: 3, out: 'www' });
});

test('release refuses a version that does not match config.js or is malformed', () => {
  const dir = copyStarter();
  try {
    assert.equal(appVersion(dir), '1.0.0');
    assert.throws(() => release(dir, { version: '1.0.1' }), /APP_VERSION "1\.0\.0"/);
    assert.throws(() => release(dir, { version: 'latest' }), /give a version/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('release writes a version folder, a rewritten index.html and version.json, and prunes old folders', () => {
  const dir = copyStarter();
  try {
    for (const version of ['1.0.0', '1.0.1', '1.0.2', '1.0.10']) {
      setVersion(dir, version);
      release(dir, { version: version, keep: 3 });
    }
    const out = join(dir, 'dist');
    assert.deepEqual(readdirSync(out).filter((n) => /^\d/.test(n)).sort(), ['1.0.1', '1.0.10', '1.0.2'], 'numeric order, keep 3');
    assert.deepEqual(JSON.parse(readFileSync(join(out, 'version.json'), 'utf8')), { version: '1.0.10' });
    const index = readFileSync(join(out, 'index.html'), 'utf8');
    assert.match(index, /src="\.\/1\.0\.10\/app\.js"/);
    assert.match(index, /href="\.\/1\.0\.10\/styles\/tokens\.css"/);
    const folder = join(out, '1.0.10');
    for (const kept of ['app.js', 'config.js', 'lib/vfunc.esm.js', 'pages/home.js', 'locales/ko.json', 'data/items.json', 'styles/base.css']) {
      assert.ok(existsSync(join(folder, kept)), kept);
    }
    for (const left of ['index.html', 'version.json', 'tools', 'deploy', 'design', 'docs', 'AGENTS.md', 'README.md', 'dist']) {
      assert.equal(existsSync(join(folder, left)), false, left + ' is not part of a release');
    }
    assert.throws(() => release(dir, { version: '1.0.10' }), /already exists/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the starter carries current copies of vfunc and of the AI kit (npm run build)', () => {
  const pairs = [
    ['../dist/vfunc.esm.js', 'lib/vfunc.esm.js'],
    ['../dist/plugins/update.esm.js', 'lib/plugins/update.esm.js'],
    ['../css/vfunc.tokens.css', 'styles/tokens.css'],
    ['../ai/en/AGENTS.template.md', 'AGENTS.md'],
    ['../ai/ko/AGENTS.template.md', 'AGENTS.ko.md'],
    ['../ai/en/design/DESIGN.template.md', 'design/DESIGN.md'],
    ['../ai/llms.txt', 'docs/llms.txt']
  ];
  for (const [source, copy] of pairs) {
    assert.equal(readFileSync(join(STARTER, copy), 'utf8'), readFileSync(fileURLToPath(new URL(source, import.meta.url)), 'utf8'), copy);
  }
  assert.equal(JSON.parse(readFileSync(join(STARTER, 'version.json'), 'utf8')).version, appVersion(STARTER), 'version.json = APP_VERSION');
});
