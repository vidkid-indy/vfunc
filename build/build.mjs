// SPDX-License-Identifier: Apache-2.0
//
// Release build of layers 1 and 2 (CLAUDE.md rule 15: users never build; we ship dist/).
//
//   node build/build.mjs           build layer1/dist, layer2/dist, license files and the npm package folder
//   node build/build.mjs --check   build in memory and fail when committed files are out of date
//
// Layer 2 outputs (layer2/dist/, D-029): vfunc-ui.{js,min.js,esm.js,esm.min.js,legacy.min.js}
// and the data file vfunc-ui-data.* (grid and charts, D-031, D-033; budgets 12 KB / 15 KB gzip),
// and the official adapters vfunc-<kind>-<vendor>.{js,min.js,esm.js} (D-034: no vendor inside, no
// legacy file because the vendors do not support IE11)
// (budgets 24 KB / 30 KB gzip), vfunc-ui.locale.ko.*, vfunc-all.{js,min.js,legacy.min.js}
// (layers 1 + 2), vfunc-ui.css (12 KB) and vfunc-ui.legacy.css (build/ui-css.mjs).
//
// Layer 1 outputs (layer1/dist/):
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
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { ROOT, readThirdParty, checkBundledInputs, writeLicenses, OUTPUTS } from './licenses.mjs';
import { writeLlms, generateLlmsFull, LLMS_FULL } from './llms.mjs';
import { writeComponents } from './components.mjs';
import { buildUiCss } from './ui-css.mjs';

const SOURCE = 'layer1/src/vfunc.js';
const IIFE_ENTRY = 'build/iife-entry.js';
const LEGACY_ENTRY = 'build/legacy-entry.js';
const DIST = 'layer1/dist';
const UI_SOURCE = 'layer2/src/index.js';
const UI_KO_SOURCE = 'layer2/src/locale.ko.js';
const UI_DATA_SOURCE = 'layer2/src/data.js';
const UI_DIST = 'layer2/dist';
const NPM_OUT = 'build/out/npm';
const TMP = 'build/out/tmp';

/**
 * Built-ins beyond ES5 that the legacy file may reference because it ships its own polyfill.
 * Anything else found by es-check --checkFeatures fails the build.
 */
const LEGACY_POLYFILLED = ['Promise', 'PromiseResolve'];

/** [source, path inside layer1/starter]. Sources under layer1/dist come from this build. */
const STARTER_COPIES = [
  ['layer1/dist/vfunc.esm.js', 'lib/vfunc.esm.js'],
  ['layer1/dist/vfunc.esm.js.map', 'lib/vfunc.esm.js.map'],
  ['layer1/dist/vfunc.esm.min.js', 'lib/vfunc.esm.min.js'],
  ['layer1/dist/vfunc.esm.min.js.map', 'lib/vfunc.esm.min.js.map'],
  ['layer1/dist/plugins/update.esm.js', 'lib/plugins/update.esm.js'],
  ['layer1/dist/plugins/update.esm.js.map', 'lib/plugins/update.esm.js.map'],
  ['layer1/css/vfunc.tokens.css', 'styles/tokens.css'],
  ['layer1/ai/en/AGENTS.template.md', 'AGENTS.md'],
  ['layer1/ai/ko/AGENTS.template.md', 'AGENTS.ko.md'],
  ['layer1/ai/en/design/DESIGN.template.md', 'design/DESIGN.md'],
  ['layer1/ai/llms.txt', 'docs/llms.txt'],
  ['layer1/ai/llms-full.txt', 'docs/llms-full.txt']
];

const check = process.argv.indexOf('--check') >= 0;
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

const banner = '/*! vfunc.js v' + version + ' | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */';

function pluginBanner(name) {
  return '/*! vfunc.js ' + name + ' plugin (vfunc v' + version + ') | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */';
}

const uiBanner = '/*! vfunc-ui (vfunc.js layer 2) v' + version + ' | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */';

function bannerOf(target) {
  if (target.plugin) return pluginBanner(target.plugin);
  return target.ui === undefined ? banner : uiBanner;
}

/**
 * How layer 2 reaches the engine (D-029): layer2/src/_internal/vf.js is replaced per output.
 * - 'global': <script> files read window.vf, put there by vfunc.js.
 * - 'esm' / 'esm.min': ES modules import the engine file next to them. In the repository that is
 *   ../../layer1/dist/; the npm package puts both in dist/ and rewrites the path (assembleNpmPackage).
 * - 'bundle' (vfunc-all): the engine source is bundled; no replacement.
 */
const UI_ENGINE_ESM = { esm: '../../layer1/dist/vfunc.esm.js', 'esm.min': '../../layer1/dist/vfunc.esm.min.js' };

function uiEngine(mode) {
  return {
    name: 'vfunc-ui-engine',
    setup(build) {
      if (mode === 'bundle') return;
      build.onLoad({ filter: /[\\/]layer2[\\/]src[\\/]_internal[\\/]vf\.js$/ }, () => {
        if (mode === 'global') {
          return {
            loader: 'js',
            contents: 'var vf = typeof window !== "undefined" ? window.vf : undefined;\n' +
              'if (!vf || typeof vf.vfunc !== "function") throw new Error("[vfunc-ui] load vfunc.js before this file.");\n' +
              'export default vf;\n'
          };
        }
        return { loader: 'js', contents: 'export { default } from "vfunc-engine";\n' };
      });
      build.onResolve({ filter: /^vfunc-engine$/ }, () => ({ path: UI_ENGINE_ESM[mode], external: true }));
    }
  };
}

/**
 * How the data file reaches the core layer 2 (D-033): layer2/src/_internal/ui.js is replaced so the
 * core is never bundled twice.
 * - 'global': <script> files read window.vf, which vfunc-ui.js filled first.
 * - 'esm' / 'esm.min': import the core module next to the data file, then the engine.
 * - 'bundle' (vfunc-all): the source is bundled once; no replacement.
 */
const UI_CORE_ESM = { esm: './vfunc-ui.esm.js', 'esm.min': './vfunc-ui.esm.min.js' };

function uiCore(mode) {
  return {
    name: 'vfunc-ui-core',
    setup(build) {
      if (mode === 'bundle') return;
      build.onLoad({ filter: /[\\/]layer2[\\/]src[\\/]_internal[\\/]ui\.js$/ }, () => {
        if (mode === 'global') {
          return {
            loader: 'js',
            contents: 'var vf = typeof window !== "undefined" ? window.vf : undefined;\n' +
              'if (!vf || typeof vf.vsTable !== "function") throw new Error("[vfunc-ui-data] load vfunc-ui.js before this file.");\n' +
              'export default vf;\n'
          };
        }
        return { loader: 'js', contents: 'import "vfunc-ui-core";\nexport { default } from "vfunc-engine";\n' };
      });
      build.onResolve({ filter: /^vfunc-ui-core$/ }, () => ({ path: UI_CORE_ESM[mode], external: true }));
    }
  };
}

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
  { file: 'vfunc.legacy.min.js', entry: LEGACY_ENTRY, format: 'iife', minify: true, legacy: true, budget: 14 * 1024 },
  // Official plugins (D-013): outside the engine budget. The <script> file goes through the
  // legacy pipeline so it runs in IE11 and keeps names (esbuild refuses keep_names for es5).
  { file: 'plugins/update.esm.js', entry: 'layer1/plugins/update.js', format: 'esm', minify: false, plugin: 'update' },
  { file: 'plugins/update.min.js', entry: 'build/plugin-update-entry.js', format: 'iife', minify: true, plugin: 'update', legacy: true },
  { file: 'plugins/shortcut.esm.js', entry: 'layer1/plugins/shortcut.js', format: 'esm', minify: false, plugin: 'shortcut' },
  { file: 'plugins/shortcut.min.js', entry: 'build/plugin-shortcut-entry.js', format: 'iife', minify: true, plugin: 'shortcut', legacy: true },
  // Layer 2 (D-029). `ui` says how it reaches the engine (see uiEngine).
  { dist: UI_DIST, file: 'vfunc-ui.js', entry: UI_SOURCE, format: 'iife', minify: false, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-ui.min.js', entry: UI_SOURCE, format: 'iife', minify: true, ui: 'global', budget: 24 * 1024 },
  { dist: UI_DIST, file: 'vfunc-ui.esm.js', entry: UI_SOURCE, format: 'esm', minify: false, ui: 'esm' },
  { dist: UI_DIST, file: 'vfunc-ui.esm.min.js', entry: UI_SOURCE, format: 'esm', minify: true, ui: 'esm.min' },
  { dist: UI_DIST, file: 'vfunc-ui.legacy.min.js', entry: UI_SOURCE, format: 'iife', minify: true, legacy: true, ui: 'global', budget: 30 * 1024 },
  { dist: UI_DIST, file: 'vfunc-ui-data.js', entry: UI_DATA_SOURCE, format: 'iife', minify: false, ui: 'global', data: true },
  { dist: UI_DIST, file: 'vfunc-ui-data.min.js', entry: UI_DATA_SOURCE, format: 'iife', minify: true, ui: 'global', data: true, budget: 12 * 1024 },
  { dist: UI_DIST, file: 'vfunc-ui-data.esm.js', entry: UI_DATA_SOURCE, format: 'esm', minify: false, ui: 'esm', data: true },
  { dist: UI_DIST, file: 'vfunc-ui-data.esm.min.js', entry: UI_DATA_SOURCE, format: 'esm', minify: true, ui: 'esm.min', data: true },
  { dist: UI_DIST, file: 'vfunc-ui-data.legacy.min.js', entry: UI_DATA_SOURCE, format: 'iife', minify: true, legacy: true, ui: 'global', data: true, budget: 15 * 1024 },
  // Official adapters (D-034): they need vfunc.js only; the vendor library is the app's.
  { dist: UI_DIST, file: 'vfunc-grid-ag.js', entry: 'layer2/adapters/grid-ag/index.js', format: 'iife', minify: false, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-grid-ag.min.js', entry: 'layer2/adapters/grid-ag/index.js', format: 'iife', minify: true, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-grid-ag.esm.js', entry: 'layer2/adapters/grid-ag/index.js', format: 'esm', minify: false, ui: 'esm' },
  { dist: UI_DIST, file: 'vfunc-grid-tabulator.js', entry: 'layer2/adapters/grid-tabulator/index.js', format: 'iife', minify: false, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-grid-tabulator.min.js', entry: 'layer2/adapters/grid-tabulator/index.js', format: 'iife', minify: true, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-grid-tabulator.esm.js', entry: 'layer2/adapters/grid-tabulator/index.js', format: 'esm', minify: false, ui: 'esm' },
  { dist: UI_DIST, file: 'vfunc-chart-chartjs.js', entry: 'layer2/adapters/chart-chartjs/index.js', format: 'iife', minify: false, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-chart-chartjs.min.js', entry: 'layer2/adapters/chart-chartjs/index.js', format: 'iife', minify: true, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-chart-chartjs.esm.js', entry: 'layer2/adapters/chart-chartjs/index.js', format: 'esm', minify: false, ui: 'esm' },
  { dist: UI_DIST, file: 'vfunc-chart-echarts.js', entry: 'layer2/adapters/chart-echarts/index.js', format: 'iife', minify: false, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-chart-echarts.min.js', entry: 'layer2/adapters/chart-echarts/index.js', format: 'iife', minify: true, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-chart-echarts.esm.js', entry: 'layer2/adapters/chart-echarts/index.js', format: 'esm', minify: false, ui: 'esm' },
  { dist: UI_DIST, file: 'vfunc-ui.locale.ko.js', entry: UI_KO_SOURCE, format: 'iife', minify: true, legacy: true, ui: 'global' },
  { dist: UI_DIST, file: 'vfunc-ui.locale.ko.esm.js', entry: UI_KO_SOURCE, format: 'esm', minify: false, ui: 'esm' },
  { dist: UI_DIST, file: 'vfunc-ui.locale.ko.esm.min.js', entry: UI_KO_SOURCE, format: 'esm', minify: true, ui: 'esm.min' },
  { dist: UI_DIST, file: 'vfunc-all.js', entry: 'build/all-entry.js', format: 'iife', minify: false, ui: 'bundle' },
  { dist: UI_DIST, file: 'vfunc-all.min.js', entry: 'build/all-entry.js', format: 'iife', minify: true, ui: 'bundle' },
  { dist: UI_DIST, file: 'vfunc-all.legacy.min.js', entry: 'build/all-legacy-entry.js', format: 'iife', minify: true, legacy: true, ui: 'bundle' }
];

const distOf = (target) => target.dist || DIST;

/** esbuild plugins for a target: the engine header, and for layer 2 how it reaches the engine. */
function pluginsOf(target) {
  if (target.ui === undefined) return [stripSourceHeader];
  return target.data ? [stripSourceHeader, uiEngine(target.ui), uiCore(target.ui)] : [stripSourceHeader, uiEngine(target.ui)];
}

/** Returns { files: [{ path, text }], inputs: [path] } without writing anything. */
async function buildTarget(target) {
  if (target.legacy) return buildLegacy(target);
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: [target.entry],
    outfile: join(distOf(target), target.file),
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
    banner: { js: bannerOf(target) },
    define: {
      __VFUNC_VERSION__: JSON.stringify(version),
      __VFUNC_DEV__: target.minify ? 'false' : 'true'
    },
    plugins: pluginsOf(target),
    metafile: true,
    write: false,
    logLevel: 'warning'
  });
  return { files: result.outputFiles.map((f) => ({ path: f.path, text: f.text })), inputs: Object.keys(result.metafile.inputs) };
}

async function buildLegacy(target) {
  const outfile = join(ROOT, distOf(target), target.file);
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
    // Layer 2 uses vf.html tagged templates: esbuild lowers them here, inside the IIFE, because
    // Babel would put its _taggedTemplateLiteral helper outside it as a global.
    supported: target.ui === undefined ? {} : { 'template-literal': false },
    charset: 'utf8',
    sourcemap: 'external',
    sourcesContent: true,
    define: { __VFUNC_VERSION__: JSON.stringify(version), __VFUNC_DEV__: 'false' },
    plugins: pluginsOf(target),
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
    stdin: { contents: withMap, sourcefile: join(distOf(target), target.file.replace(/\.min\.js$/, '.js')), resolveDir: join(ROOT, distOf(target)), loader: 'js' },
    outfile: outfile,
    bundle: false,
    minify: true,
    target: ['es5'],
    legalComments: 'eof',
    charset: 'utf8',
    sourcemap: 'linked',
    sourcesContent: true,
    banner: { js: bannerOf(target) },
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
  const outputOf = (target) => outputs[distOf(target) + '/' + target.file];
  const sizes = TARGETS.map((target) => {
    const text = outputOf(target);
    return { file: target.file, raw: Buffer.byteLength(text), gzip: gzipSize(text), budget: target.budget };
  });

  // Layer 2 CSS (D-029): the modern file with @layer, and the IE11 file converted from it.
  const css = buildUiCss(ROOT, uiBanner);
  failures.push(...css.problems);
  outputs[UI_DIST + '/vfunc-ui.css'] = css.modern;
  outputs[UI_DIST + '/vfunc-ui.legacy.css'] = css.legacy;
  sizes.push({ file: 'vfunc-ui.css', raw: Buffer.byteLength(css.modern), gzip: gzipSize(css.modern), budget: 12 * 1024 });
  sizes.push({ file: 'vfunc-ui.legacy.css', raw: Buffer.byteLength(css.legacy), gzip: gzipSize(css.legacy) });
  for (const s of sizes) {
    if (s.budget && s.gzip > s.budget) {
      failures.push(s.file + ' is ' + kb(s.gzip) + ' gzip; the budget is ' + kb(s.budget) + ' (D-003, D-029).');
    }
  }

  // Minified builds must not carry development warnings (D-003, round 14).
  for (const target of TARGETS.filter((t) => t.minify)) {
    if (/is a reserved name|must be a function; string handlers|is not one of|is not allowed in component markup/.test(outputOf(target))) {
      failures.push(target.file + ' still contains development warnings; guard them with `if (DEV)`.');
    }
  }

  // The legacy file and the ES5 plugin files must be ES5 and use no post-ES5 built-in except the
  // polyfilled ones, and keep everything inside one IIFE.
  for (const target of TARGETS.filter((t) => t.legacy)) {
    const text = outputOf(target);
    failures.push(...esCheck(target.file, text));
    // Everything must stay inside one IIFE: transpiler helpers must not become globals.
    const body = text.slice(text.indexOf('*/') + 2).replace(/^\s+/, '');
    if (!/^(\(function\s*\(|!function\s*\()/.test(body)) {
      failures.push(target.file + ' has code outside its IIFE (a global helper?): ' + body.slice(0, 60));
    }
  }

  // components.md before anything reads it: llms-full.txt (and the starter's copy) include the English one.
  const staleComponents = writeComponents({ check: check });

  // The starter template carries copies of vfunc and of the AI kit (D-019): generated here, never edited.
  for (const [from, to] of STARTER_COPIES) {
    outputs['layer1/starter/' + to] = outputs[from] !== undefined ? outputs[from]
      : from === LLMS_FULL ? generateLlmsFull() : readFileSync(join(ROOT, from), 'utf8');
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
  const staleLicenses = writeLicenses({ check: check }).concat(staleComponents);
  if (writeLlms({ check: check })) staleLicenses.push(LLMS_FULL);
  if (check && (stale.length || staleLicenses.length)) {
    failures.push('out of date (run npm run build): ' + stale.concat(staleLicenses).join(', '));
  }

  console.log('vfunc.js v' + version + (check ? ' (check)' : ''));
  for (const s of sizes) {
    console.log('  ' + s.file.padEnd(30) + kb(s.raw).padStart(10) + '   gzip ' + kb(s.gzip).padStart(9) +
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
  const copy = (from, to) => {
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
  };
  // Layer 2 files sit next to the engine in dist/ (D-029): their paths to layer 1 become ./
  const flatten = (text) => text.split('../../layer1/dist/').join('./').split('../../layer1/types/').join('./');
  const copyFlat = (from, to) => {
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, flatten(readFileSync(from, 'utf8')));
  };
  for (const target of TARGETS) {
    for (const file of [target.file, target.file + '.map']) {
      const from = join(ROOT, distOf(target), file);
      if (target.ui === undefined) copy(from, join(out, 'dist', file));
      else copyFlat(from, join(out, 'dist', file));
    }
  }
  for (const file of ['vfunc-ui.d.ts', 'vfunc-ui-data.d.ts']) copyFlat(join(ROOT, 'layer2/types', file), join(out, 'types', file));
  for (const file of readdirSync(join(ROOT, 'layer2/types/adapters'))) copyFlat(join(ROOT, 'layer2/types/adapters', file), join(out, 'types/adapters', file));
  for (const file of ['vfunc-ui.css', 'vfunc-ui.legacy.css']) copy(join(ROOT, UI_DIST, file), join(out, 'css', file));
  for (const file of ['vfunc.d.ts', 'global.d.ts', 'plugins/update.d.ts', 'plugins/shortcut.d.ts']) copy(join(ROOT, 'layer1/types', file), join(out, 'types', file));
  // Optional design tokens (D-011). Not generated: the file in layer1/css is the source.
  copy(join(ROOT, 'layer1/css/vfunc.tokens.css'), join(out, 'css', 'vfunc.tokens.css'));
  // The AI kit (D-019): llms*.txt, AGENTS templates, prompts and design kit in en/ and ko/.
  // Not the evaluation set (ai/eval, D-024): it is repository tooling and results.
  // The layer 2 kit (layer2/ai/{en,ko}, D-034 9) joins the same language folders; a name used by
  // both layers fails the build instead of overwriting.
  const copyDir = (from, to, noOverwrite) => {
    for (const name of readdirSync(from)) {
      const source = join(from, name);
      if (source === join(ROOT, 'layer1/ai/eval')) continue;
      if (statSync(source).isDirectory()) copyDir(source, join(to, name), noOverwrite);
      else if (noOverwrite && existsSync(join(to, name))) throw new Error('layer2/ai and layer1/ai both have ' + join(to, name).slice(out.length + 1));
      else copy(source, join(to, name));
    }
  };
  copyDir(join(ROOT, 'layer1/ai'), join(out, 'ai'), false);
  copyDir(join(ROOT, 'layer2/ai'), join(out, 'ai'), true);
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
      './ui': {
        types: './types/vfunc-ui.d.ts',
        production: './dist/vfunc-ui.esm.min.js',
        default: './dist/vfunc-ui.esm.js'
      },
      './ui/data': {
        types: './types/vfunc-ui-data.d.ts',
        production: './dist/vfunc-ui-data.esm.min.js',
        default: './dist/vfunc-ui-data.esm.js'
      },
      './adapters/*': {
        types: './types/adapters/*.d.ts',
        default: './dist/vfunc-*.esm.js'
      },
      './ui/locale/ko': {
        production: './dist/vfunc-ui.locale.ko.esm.min.js',
        default: './dist/vfunc-ui.locale.ko.esm.js'
      },
      './plugins/update': {
        types: './types/plugins/update.d.ts',
        default: './dist/plugins/update.esm.js'
      },
      './plugins/shortcut': {
        types: './types/plugins/shortcut.d.ts',
        default: './dist/plugins/shortcut.esm.js'
      },
      './css/*': './css/*',
      './ai/*': './ai/*',
      './dist/*': './dist/*',
      './types/*': './types/*',
      './package.json': './package.json'
    },
    // The <script> builds write window.vf / window.vfUpdate / window.vfShortcut. The engine module has no side effects;
    // the layer 2 modules add their members to the engine's vf object when imported.
    sideEffects: ['./dist/vfunc.js', './dist/vfunc.min.js', './dist/vfunc.legacy.min.js', './dist/plugins/update.min.js',
      './dist/plugins/shortcut.min.js', './dist/vfunc-ui*.js', './dist/vfunc-all*.js', './css/*.css'],
    files: ['dist/', 'types/', 'css/', 'ai/', 'README.md', 'README.ko.md', 'LICENSE', 'NOTICE', 'CHANGELOG.md', OUTPUTS.text]
  };
  writeFileSync(join(out, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('  npm package: ' + NPM_OUT + '/ (publish only after the maintainer confirms)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
