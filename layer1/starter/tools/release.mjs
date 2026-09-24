// SPDX-License-Identifier: Apache-2.0
//
// Version-folder release (plan section O-1 ②, D-013). Copies only — no bundling, no build.
//
//   node tools/release.mjs 1.0.1            → dist/1.0.1/…, dist/index.html, dist/version.json
//   node tools/release.mjs 1.0.1 --keep 3   keep the 3 newest version folders (default 5)
//   node tools/release.mjs 1.0.1 --out www  write to another folder
//
// Why: without a build there are no hashed file names, and `?v=2` on app.js does not reach the
// modules it imports. Putting each release in its own folder makes every relative import load
// the new version. index.html and version.json stay at the top and must be served with
// Cache-Control: no-cache; everything under dist/<version>/ can be cached forever (see deploy/).
//
// 버전 폴더 배포입니다. 복사만 합니다. 릴리스마다 폴더를 나누면 상대 경로 import가 모두 새 버전을
// 불러옵니다. index.html과 version.json은 맨 위에 두고 no-cache로 서빙하세요.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Never copied into a release folder. / 릴리스에 넣지 않는 것 */
const EXCLUDE = ['index.html', 'version.json', 'tools', 'deploy', 'design', 'docs', 'node_modules', '.git',
  'AGENTS.md', 'AGENTS.ko.md', 'CLAUDE.md', 'README.md', '.gitignore', 'design-preview.html'];

const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

export function parseArgs(argv) {
  const args = { version: '', keep: 5, out: 'dist' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--keep') args.keep = Number(argv[++i]);
    else if (argv[i] === '--out') args.out = argv[++i];
    else if (!args.version) args.version = argv[i];
  }
  return args;
}

/** Reads APP_VERSION from config.js without executing it. */
export function appVersion(root) {
  const m = /APP_VERSION\s*=\s*['"]([^'"]+)['"]/.exec(readFileSync(join(root, 'config.js'), 'utf8'));
  return m ? m[1] : '';
}

/**
 * Points every relative src/href of index.html into the version folder.
 * Absolute URLs, protocol-relative URLs, `#…` and `data:` stay as they are.
 */
export function rewriteIndex(html, version) {
  return html.replace(/\b(src|href)="(?!https?:|\/\/|\/|#|data:|mailto:)(?:\.\/)?([^"]+)"/g,
    (all, attr, path) => attr + '="./' + version + '/' + path + '"');
}

/** Copies `from` into `to`; at the top level, skips EXCLUDE and the output folder itself. */
function copyTree(from, to, skip) {
  for (const name of readdirSync(from)) {
    if (skip && skip.indexOf(name) >= 0) continue;
    const source = join(from, name);
    const target = join(to, name);
    if (statSync(source).isDirectory()) {
      mkdirSync(target, { recursive: true });
      copyTree(source, target, null);
    } else {
      copyFileSync(source, target);
    }
  }
}

/** Newest first by semantic version (numeric parts), then by name. */
function byVersionDesc(a, b) {
  const pa = a.split(/[.-]/).map((p) => (/^\d+$/.test(p) ? Number(p) : p));
  const pb = b.split(/[.-]/).map((p) => (/^\d+$/.test(p) ? Number(p) : p));
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === pb[i]) continue;
    if (pa[i] === undefined) return -1;
    if (pb[i] === undefined) return 1;
    return pa[i] > pb[i] ? -1 : 1;
  }
  return 0;
}

/** Writes a release; returns { target, kept, removed }. Throws with a clear message on misuse. */
export function release(root, options) {
  const args = Object.assign(parseArgs([]), options);
  const version = args.version;
  if (!VERSION_PATTERN.test(version)) throw new Error('release: give a version like 1.0.1 (got "' + version + '")');
  const configured = appVersion(root);
  if (configured !== version) {
    throw new Error('release: config.js has APP_VERSION "' + configured + '"; set it to "' + version + '" first');
  }
  const out = join(root, args.out);
  const target = join(out, version);
  if (existsSync(target)) throw new Error('release: ' + relative(root, target) + ' already exists');
  mkdirSync(target, { recursive: true });
  copyTree(root, target, EXCLUDE.concat(args.out));
  writeFileSync(join(out, 'index.html'), rewriteIndex(readFileSync(join(root, 'index.html'), 'utf8'), version));
  writeFileSync(join(out, 'version.json'), JSON.stringify({ version: version }) + '\n');
  const folders = readdirSync(out).filter((name) => VERSION_PATTERN.test(name) && statSync(join(out, name)).isDirectory()).sort(byVersionDesc);
  const removed = folders.slice(Math.max(1, args.keep));
  for (const name of removed) rmSync(join(out, name), { recursive: true, force: true });
  return { target: target, out: args.out, kept: folders.slice(0, Math.max(1, args.keep)), removed: removed };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const result = release(ROOT, parseArgs(process.argv.slice(2)));
    console.log('released ' + relative(ROOT, result.target) + ' · kept: ' + result.kept.join(', ') +
      (result.removed.length ? ' · removed: ' + result.removed.join(', ') : ''));
    console.log('upload ' + result.out + '/ and serve index.html + version.json with Cache-Control: no-cache');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
