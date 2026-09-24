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
//   vfunc.legacy.min.js  <script> for IE11 / Edge IE mode: ES5 + Promise polyfill (budget: 14 KB gzip)
//   *.map            source maps
// The npm package is assembled in build/out/npm/ (not committed); publish from there.
//
// Legacy pipeline (D-004, D-017): esbuild bundle (keep_names, no warnings) -> Babel preset-env
// (ie 11) -> esbuild ES5 minify -> es-check es5 --checkFeatures. Names are already pinned by the
// first step's keep_names code, so the last step only minifies.

import * as esbuild from 'esbuild';
import { transformAsync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { ROOT, readThirdParty, checkBundledInputs, writeLicenses, OUTPUTS } from './licenses.mjs';

const SOURCE = 'layer1/src/vfunc.js';
const IIFE_ENTRY = 'build/iife-entry.js';
const LEGACY_ENTRY = 'build/legacy-entry.js';
const DIST = 'layer1/dist';
const NPM_OUT = 'build/out/npm';
const TMP = 'build/out/tmp';

/**
 * Built-ins beyond ES5 that the legacy file may reference because it ships its own polyfill.
 * Anything else found by es-check --checkFeatures fails the build.
 */
const LEGACY_POLYFILLED = ['Promise', 'PromiseResolve'];

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
  { file: 'vfunc.min.js', entry: IIFE_ENTRY, format: 'iife', minify: true, budget: 10 * 1024 }, // D-003
  { file: 'vfunc.esm.js', entry: SOURCE, format: 'esm', minify: false },
  { file: 'vfunc.esm.min.js', entry: SOURCE, format: 'esm', minify: true },
  { file: 'vfunc.legacy.min.js', entry: LEGACY_ENTRY, format: 'iife', minify: true, legacy: true, budget: 14 * 1024 }
];

/** Returns { files: [{ path, text }], inputs: [path] } without writing anything. */
async function buildTarget(target) {
  if (target.legacy) return buildLegacy(target);
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
  return { files: result.outputFiles.map((f) => ({ path: f.path, text: f.text })), inputs: Object.keys(result.metafile.inputs) };
}

async function buildLegacy(target) {
  const outfile = join(ROOT, DIST, target.file);
  // 1. Bundle as modern code with names pinned and warnings removed.
  const bundled = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: [target.entry],
    outfile: outfile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2017'],
    keepNames: true, // rule 15: names are fixed here and survive the later steps
    minifySyntax: true, // folds DEV=false so `if (DEV) warn(...)` and its message are removed
    charset: 'utf8',
    sourcemap: 'external',
    sourcesContent: true,
    define: { __VFUNC_VERSION__: JSON.stringify(version), __VFUNC_DEV__: 'false' },
    plugins: [stripSourceHeader],
    metafile: true,
    write: false,
    logLevel: 'warning'
  });
  const code = bundled.outputFiles.find((f) => f.path.endsWith('.js')).text;
  const map = JSON.parse(bundled.outputFiles.find((f) => f.path.endsWith('.map')).text);

  // 2. Transpile to ES5. No automatic polyfills: the ones we need are written by hand (D-017).
  const es5 = await transformAsync(code, {
    babelrc: false,
    configFile: false,
    sourceType: 'script',
    compact: false,
    // typeof-symbol would add a global _typeof helper outside the IIFE; IE11 has no Symbol and
    // the engine never uses one.
    presets: [[presetEnv, { targets: { ie: '11' }, modules: false, exclude: ['transform-typeof-symbol'] }]],
    inputSourceMap: map,
    sourceMaps: true
  });

  // 3. Minify as ES5, chaining the source map through an inline comment.
  const withMap = es5.code + '\n//# sourceMappingURL=data:application/json;base64,' +
    Buffer.from(JSON.stringify(es5.map)).toString('base64');
  const minified = await esbuild.build({
    absWorkingDir: ROOT,
    stdin: { contents: withMap, sourcefile: join(DIST, 'vfunc.legacy.js'), resolveDir: join(ROOT, DIST), loader: 'js' },
    outfile: outfile,
    bundle: false,
    minify: true,
    target: ['es5'],
    legalComments: 'eof',
    charset: 'utf8',
    sourcemap: 'linked',
    sourcesContent: true,
    banner: { js: banner },
    write: false,
    logLevel: 'warning'
  });
  return {
    files: minified.outputFiles.map((f) => ({ path: f.path, text: f.text })),
    inputs: Object.keys(bundled.metafile.inputs)
  };
}

/** es-check es5 with feature detection; returns a list of problems. */
function esCheck(file, text) {
  const tmp = join(ROOT, TMP, file);
  mkdirSync(dirname(tmp), { recursive: true });
  writeFileSync(tmp, text);
  const cli = join(ROOT, 'node_modules', 'es-check', 'lib', 'cli', 'index.js');
  const run = spawnSync(process.execPath, [cli, 'es5', tmp.split('\\').join('/'), '--checkFeatures',
    '--allowList', LEGACY_POLYFILLED.join(',')], { encoding: 'utf8' });
  rmSync(tmp, { force: true });
  if (run.status === 0) return [];
  const detail = (run.stderr || run.stdout || '').split('\n').filter((line) => /error/i.test(line)).slice(0, 3).join(' / ');
  return [file + ' is not ES5 (es-check): ' + detail.trim()];
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
    for (const file of result.files) {
      outputs[relative(ROOT, file.path).split('\\').join('/')] = file.text;
    }
    for (const input of result.inputs) inputs[input] = true;
  }

  // D-010: everything bundled must be ours or listed in third-party.json.
  failures.push(...checkBundledInputs(Object.keys(inputs), thirdParty));

  // D-003: size budgets.
  const sizes = TARGETS.map((target) => {
    const text = outputs[DIST + '/' + target.file];
    return { file: target.file, raw: Buffer.byteLength(text), gzip: gzipSize(text), budget: target.budget };
  });
  for (const s of sizes) {
    if (s.budget && s.gzip > s.budget) {
      failures.push(s.file + ' is ' + kb(s.gzip) + ' gzip; the budget is ' + kb(s.budget) + ' (D-003).');
    }
  }

  // Minified builds must not carry development warnings (D-003, round 14).
  for (const target of TARGETS.filter((t) => t.minify)) {
    if (/is a reserved name|must be a function; string handlers/.test(outputs[DIST + '/' + target.file])) {
      failures.push(target.file + ' still contains development warnings; guard them with `if (DEV)`.');
    }
  }

  // The legacy file must be ES5 and use no post-ES5 built-in except the polyfilled ones.
  for (const target of TARGETS.filter((t) => t.legacy)) {
    const text = outputs[DIST + '/' + target.file];
    failures.push(...esCheck(target.file, text));
    // Everything must stay inside one IIFE: transpiler helpers must not become globals.
    const body = text.slice(banner.length).replace(/^\s+/, '');
    if (!/^(\(function\s*\(|!function\s*\()/.test(body)) {
      failures.push(target.file + ' has code outside its IIFE (a global helper?): ' + body.slice(0, 60));
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
    console.log('  ' + s.file.padEnd(20) + kb(s.raw).padStart(10) + '   gzip ' + kb(s.gzip).padStart(9) +
      (s.budget ? '  (budget ' + kb(s.budget) + ')' : ''));
  }

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
    sideEffects: ['./dist/vfunc.js', './dist/vfunc.min.js', './dist/vfunc.legacy.min.js'],
    files: ['dist/', 'types/', 'README.md', 'README.ko.md', 'LICENSE', 'NOTICE', 'CHANGELOG.md', OUTPUTS.text]
  };
  writeFileSync(join(out, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('  npm package: ' + NPM_OUT + '/ (publish only after the maintainer confirms)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
