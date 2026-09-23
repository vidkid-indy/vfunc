// SPDX-License-Identifier: Apache-2.0
//
// Release build of layer 1 (CLAUDE.md rule 15: users never build; we ship dist/).
//
//   node build/build.mjs           build layer1/dist, license files and the npm package folder
//   node build/build.mjs --check   build in memory and fail when committed files are out of date
//
// Outputs (layer1/dist/):
//   vfunc.js         <script>, joins window.vf, development warnings
//   vfunc.min.js     <script>, joins window.vf, minified, no warnings   (budget: 10 KB gzip)
//   vfunc.esm.js     ES module, development warnings
//   vfunc.esm.min.js ES module, minified, no warnings
//   *.map            source maps
// The npm package is assembled in build/out/npm/ (not committed); publish from there.

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ROOT, readThirdParty, checkBundledInputs, writeLicenses, OUTPUTS } from './licenses.mjs';

const BUDGET_GZIP = 10 * 1024; // D-003
const SOURCE = 'layer1/src/vfunc.js';
const IIFE_ENTRY = 'build/iife-entry.js';
const DIST = 'layer1/dist';
const NPM_OUT = 'build/out/npm';

const check = process.argv.indexOf('--check') >= 0;
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

const banner = '/*! vfunc.js v' + version + ' | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */';

/** The source keeps its own header for readers; the build replaces it with the stamped banner. */
const stripSourceHeader = {
  name: 'vfunc-source-header',
  setup(build) {
    build.onLoad({ filter: /[\\/]layer1[\\/]src[\\/]vfunc\.js$/ }, (args) => {
      const text = readFileSync(args.path, 'utf8');
      // "/*!" -> "/* ": an ordinary comment, dropped from the output. Line numbers stay the same.
      return { contents: text.replace(/^\/\*!/, '/* '), loader: 'js' };
    });
  }
};

const TARGETS = [
  { file: 'vfunc.js', entry: IIFE_ENTRY, format: 'iife', minify: false },
  { file: 'vfunc.min.js', entry: IIFE_ENTRY, format: 'iife', minify: true },
  { file: 'vfunc.esm.js', entry: SOURCE, format: 'esm', minify: false },
  { file: 'vfunc.esm.min.js', entry: SOURCE, format: 'esm', minify: true }
];

async function buildTarget(target) {
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: [target.entry],
    outfile: join(DIST, target.file),
    bundle: true,
    format: target.format,
    platform: 'browser',
    target: ['es2017'],
    minify: target.minify,
    keepNames: true, // rule 15: never turn off
    legalComments: 'eof',
    charset: 'utf8',
    sourcemap: 'linked',
    sourcesContent: true,
    banner: { js: banner },
    define: {
      __VFUNC_VERSION__: JSON.stringify(version),
      __VFUNC_DEV__: target.minify ? 'false' : 'true'
    },
    plugins: [stripSourceHeader],
    metafile: true,
    write: false,
    logLevel: 'warning'
  });
  return result;
}

function gzipSize(text) {
  return gzipSync(Buffer.from(text), { level: 9 }).length;
}

function kb(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

async function main() {
  const failures = [];
  const outputs = {}; // relative path -> text
  const thirdParty = readThirdParty();
  const inputs = {};

  for (const target of TARGETS) {
    const result = await buildTarget(target);
    for (const file of result.outputFiles) {
      outputs[relative(ROOT, file.path).split('\\').join('/')] = file.text;
    }
    for (const input of Object.keys(result.metafile.inputs)) inputs[input] = true;
  }

  // D-010: everything bundled must be ours or listed in third-party.json.
  failures.push(...checkBundledInputs(Object.keys(inputs), thirdParty));

  // D-003: size budget of the modern <script> build.
  const sizes = TARGETS.map((target) => {
    const text = outputs[DIST + '/' + target.file];
    return { file: target.file, raw: Buffer.byteLength(text), gzip: gzipSize(text) };
  });
  const min = sizes.find((s) => s.file === 'vfunc.min.js');
  if (min.gzip > BUDGET_GZIP) {
    failures.push('vfunc.min.js is ' + kb(min.gzip) + ' gzip; the budget is ' + kb(BUDGET_GZIP) + ' (D-003).');
  }

  // Minified builds must not carry development warnings (D-003, round 14).
  for (const file of ['vfunc.min.js', 'vfunc.esm.min.js']) {
    if (/is a reserved name|must be a function; string handlers/.test(outputs[DIST + '/' + file])) {
      failures.push(file + ' still contains development warnings; guard them with `if (DEV)`.');
    }
  }

  // Compare with or write the committed files.
  const stale = [];
  for (const path of Object.keys(outputs)) {
    const full = join(ROOT, path);
    const current = existsSync(full) ? readFileSync(full, 'utf8') : null;
    if (current === outputs[path]) continue;
    stale.push(path);
    if (!check) {
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, outputs[path]);
    }
  }
  const staleLicenses = writeLicenses({ check: check });
  if (check && (stale.length || staleLicenses.length)) {
    failures.push('out of date (run npm run build): ' + stale.concat(staleLicenses).join(', '));
  }

  console.log('vfunc.js v' + version + (check ? ' (check)' : ''));
  for (const s of sizes) {
    console.log('  ' + s.file.padEnd(18) + kb(s.raw).padStart(10) + '   gzip ' + kb(s.gzip).padStart(9));
  }
  console.log('  budget: vfunc.min.js gzip ' + kb(min.gzip) + ' / ' + kb(BUDGET_GZIP));

  if (failures.length) {
    console.error('\nBuild failed:\n  - ' + failures.join('\n  - '));
    process.exit(1);
  }
  if (!check) assembleNpmPackage();
}

/**
 * Collects the npm package in build/out/npm/ (decision D-016): the repository layout stays as it
 * is, and the published paths are short (vfunc@x/dist/vfunc.min.js).
 */
function assembleNpmPackage() {
  const out = join(ROOT, NPM_OUT);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'dist'), { recursive: true });
  mkdirSync(join(out, 'types'), { recursive: true });
  for (const target of TARGETS) {
    for (const file of [target.file, target.file + '.map']) copyFileSync(join(ROOT, DIST, file), join(out, 'dist', file));
  }
  for (const file of ['vfunc.d.ts', 'global.d.ts']) copyFileSync(join(ROOT, 'layer1/types', file), join(out, 'types', file));
  for (const file of ['README.md', 'README.ko.md', 'LICENSE', 'NOTICE', 'CHANGELOG.md', OUTPUTS.text]) {
    copyFileSync(join(ROOT, file), join(out, file));
  }

  const manifest = {
    name: pkg.name,
    version: version,
    description: pkg.description,
    license: pkg.license,
    author: pkg.author,
    homepage: pkg.homepage,
    repository: pkg.repository,
    bugs: pkg.bugs,
    keywords: pkg.keywords,
    type: 'module',
    main: './dist/vfunc.esm.js',
    module: './dist/vfunc.esm.js',
    types: './types/vfunc.d.ts',
    unpkg: './dist/vfunc.min.js',
    jsdelivr: './dist/vfunc.min.js',
    exports: {
      '.': {
        types: './types/vfunc.d.ts',
        production: './dist/vfunc.esm.min.js',
        default: './dist/vfunc.esm.js'
      },
      './dist/*': './dist/*',
      './types/*': './types/*',
      './package.json': './package.json'
    },
    // The <script> builds write window.vf; the ES modules have no side effects.
    sideEffects: ['./dist/vfunc.js', './dist/vfunc.min.js'],
    files: ['dist/', 'types/', 'README.md', 'README.ko.md', 'LICENSE', 'NOTICE', 'CHANGELOG.md', OUTPUTS.text]
  };
  writeFileSync(join(out, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('  npm package: ' + NPM_OUT + '/ (publish only after the maintainer confirms)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
