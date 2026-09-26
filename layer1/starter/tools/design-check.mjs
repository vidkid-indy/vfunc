// SPDX-License-Identifier: Apache-2.0
//
// design-check: the design rules of a vfunc project, checked without a build or a dependency
// (plan K-7). Optional; run it before a commit or in CI.
//
//   node tools/design-check.mjs                   check this project (the folder above tools/)
//   node tools/design-check.mjs <dir>             check another folder
//   node tools/design-check.mjs --tokens <file>   the token file (default: styles/tokens.css)
//   node tools/design-check.mjs --json            print the findings as JSON
//
// Errors (exit code 1):
//   raw-color       a color value in CSS outside a custom property (--x: …), or in JS
//   class-selector  a JS selector that finds elements by class (use data-action, data-ref or id)
//   unsafe-html     vf.unsafeHtml without a comment on the same or the line above saying why it is safe
//   contrast        a token pair below WCAG AA (4.5:1 for text, 3:1 for the focus color), light and dark
// Notes (no failure): every vf.unsafeHtml that has its comment, and token pairs that could not be read.
// A line with "design-check-ignore" is skipped; a file with "design-check-ignore-file" is skipped
// (say why next to it, e.g. plain values for IE11).
//
// 디자인 규칙 검사입니다(빌드·의존성 없음, 선택 사항). 토큰 밖의 원시 색, 클래스에 건 JS 셀렉터,
// 사유 주석 없는 vf.unsafeHtml, 토큰 대비(WCAG AA, 라이트·다크)를 봅니다.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Never scanned: dependencies, copies of vfunc, generated and release folders. / 검사하지 않는 폴더 */
const SKIP_DIRS = ['node_modules', '.git', 'lib', 'dist', 'docs', 'deploy'];
const TOKEN_FILES = ['styles/tokens.css', 'css/vfunc.tokens.css', 'tokens.css'];
const IGNORE = 'design-check-ignore';

// ---- colors -------------------------------------------------------------------------------------

const COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?)\(\s*[\d.]/gi;

/** '#0f172a', 'rgb(1, 2, 3)', 'rgba(…)' → [r, g, b, a] (0–255, alpha 0–1), else null. */
export function parseColor(value) {
  const v = String(value).trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(v);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1);
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (m) {
    const a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [Number(m[1]), Number(m[2]), Number(m[3]), a];
  }
  return null;
}

function luminance(rgb) {
  const c = rgb.slice(0, 3).map((x) => {
    const s = x / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG contrast ratio of two opaque colors. */
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ---- tokens -------------------------------------------------------------------------------------

/** The custom properties of `:root { … }` (light) and `:root[data-theme="dark"] { … }` (dark). */
export function readTokens(css, into) {
  const out = into || { light: {}, dark: {} };
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /:root(\[data-theme="dark"\])?\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const target = m[1] ? out.dark : out.light;
    const decl = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = decl.exec(m[2]))) target[d[1]] = d[2].trim();
  }
  return out;
}

/** A token's color in a theme, following var(--x) references; null when it is not a plain color. */
function resolve(tokens, theme, name, depth) {
  const own = theme === 'dark' && tokens.dark[name] !== undefined ? tokens.dark[name] : tokens.light[name];
  if (own === undefined || (depth || 0) > 8) return null;
  const ref = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/.exec(own);
  if (ref) return resolve(tokens, theme, ref[1], (depth || 0) + 1);
  const rgb = parseColor(own);
  return rgb && rgb[3] === 1 ? rgb : null;
}

/** [foreground, background, minimum]: text 4.5:1, the focus color 3:1 (WCAG 1.4.3, 1.4.11). */
export const PAIRS = [
  ['--vf-color-text', '--vf-color-bg', 4.5],
  ['--vf-color-text', '--vf-color-surface', 4.5],
  ['--vf-color-text', '--vf-color-surface-muted', 4.5],
  ['--vf-color-text-muted', '--vf-color-bg', 4.5],
  ['--vf-color-text-muted', '--vf-color-surface', 4.5],
  ['--vf-color-primary', '--vf-color-bg', 4.5],
  ['--vf-color-primary', '--vf-color-surface', 4.5],
  ['--vf-color-on-primary', '--vf-color-primary', 4.5],
  ['--vf-color-success-text', '--vf-color-success-soft', 4.5],
  ['--vf-color-warning-text', '--vf-color-warning-soft', 4.5],
  ['--vf-color-danger-text', '--vf-color-danger-soft', 4.5],
  ['--vf-color-info-text', '--vf-color-info-soft', 4.5],
  ['--vf-color-focus', '--vf-color-bg', 3],
  ['--vf-color-focus', '--vf-color-surface', 3]
];

export function checkContrast(tokens, file) {
  const findings = [];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min] of PAIRS) {
      const a = resolve(tokens, theme, fg);
      const b = resolve(tokens, theme, bg);
      if (!a || !b) {
        findings.push({ level: 'note', rule: 'contrast', file, message: theme + ': ' + fg + ' on ' + bg + ' is not a plain color; not checked' });
        continue;
      }
      const ratio = contrast(a, b);
      if (ratio + 1e-9 < min) {
        findings.push({ level: 'error', rule: 'contrast', file,
          message: theme + ': ' + fg + ' on ' + bg + ' is ' + ratio.toFixed(2) + ':1, needs ' + min + ':1' });
      }
    }
  }
  return findings;
}

// ---- source files -------------------------------------------------------------------------------

const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const ignored = (lines, line) => lines[line - 1] && lines[line - 1].indexOf(IGNORE) >= 0;

/** Raw colors in CSS outside custom property declarations. */
export function checkCss(text, file) {
  const findings = [];
  const lines = text.split('\n');
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const decl = /([\w-]+)\s*:\s*([^;{}]+)/g;
  let d;
  while ((d = decl.exec(clean))) {
    if (d[1].indexOf('--') === 0) continue; // defining a token is where values belong
    let m;
    COLOR.lastIndex = 0;
    while ((m = COLOR.exec(d[2]))) {
      const line = lineOf(clean, d.index);
      if (ignored(lines, line)) continue;
      findings.push({ level: 'error', rule: 'raw-color', file, line, message: d[1] + ': ' + d[2].trim() + ' — use a var(--vf-*) token' });
      break;
    }
  }
  return findings;
}

/** A selector string that finds by class (outside [attribute] parts). */
function hasClass(selector) {
  return /(^|[\s>+~,(])\.[A-Za-z_-]|^[A-Za-z*]+\.[A-Za-z_-]/.test(selector.replace(/\[[^\]]*\]/g, '[]'));
}

/** Class selectors, raw colors and vf.unsafeHtml without a reason in JS. */
export function checkJs(text, file) {
  const findings = [];
  const lines = text.split('\n');
  const push = (level, rule, index, message) => {
    const line = lineOf(text, index);
    if (!ignored(lines, line)) findings.push({ level, rule, file, line, message });
  };
  const selectorCalls = /(?:\bselector\s*:|\b(?:querySelector(?:All)?|closest|matches)\s*\(|\bvf\.\$\$?\s*\()\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
  let m;
  while ((m = selectorCalls.exec(text))) {
    if (hasClass(m[2])) push('error', 'class-selector', m.index, m[2] + ' — select with data-action, data-ref or id');
  }
  const strings = /(['"`])((?:\\.|(?!\1)[^\n])*)\1/g;
  while ((m = strings.exec(text))) {
    COLOR.lastIndex = 0;
    const c = COLOR.exec(m[2]);
    if (c) push('error', 'raw-color', m.index, c[0] + ' in JS — colors belong in CSS tokens (read one with getComputedStyle if a library needs it)');
  }
  const unsafe = /\bvf\.unsafeHtml\s*\(/g;
  while ((m = unsafe.exec(text))) {
    const line = lineOf(text, m.index);
    const reason = /\/\/|\/\*/.test(lines[line - 1]) || /^\s*(\/\/|\/\*|\*)/.test(lines[line - 2] || '');
    push(reason ? 'note' : 'error', 'unsafe-html', m.index, reason ? 'vf.unsafeHtml (reason given)' : 'vf.unsafeHtml without a comment saying why the markup is safe');
  }
  return findings;
}

function walk(dir, root, out) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.indexOf(name) < 0 && name[0] !== '.') walk(full, root, out);
    } else if (/\.(css|m?js)$/.test(name) && !/\.min\.(css|m?js)$/.test(name)) {
      out.push(relative(root, full).split('\\').join('/'));
    }
  }
  return out;
}

/** Checks a project folder. Returns { findings, errors, files }. */
export function designCheck(root, options) {
  const o = options || {};
  const tokenFile = o.tokens || TOKEN_FILES.find((f) => existsSync(join(root, f)));
  const files = walk(root, root, []);
  const findings = [];
  const tokens = { light: {}, dark: {} };
  if (tokenFile) readTokens(readFileSync(join(root, tokenFile), 'utf8'), tokens);
  for (const file of files) {
    if (file === tokenFile || file === 'tools/design-check.mjs') continue;
    const text = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
    if (text.indexOf(IGNORE + '-file') >= 0) {
      findings.push({ level: 'note', rule: 'ignored', file, message: 'skipped (' + IGNORE + '-file)' });
      continue;
    }
    if (extname(file) === '.css') {
      readTokens(text, tokens); // C1: the app's own :root overrides count for the contrast check
      findings.push(...checkCss(text, file));
    } else {
      findings.push(...checkJs(text, file));
    }
  }
  if (tokenFile) findings.push(...checkContrast(tokens, tokenFile));
  else findings.push({ level: 'note', rule: 'contrast', file: '', message: 'no token file found (' + TOKEN_FILES.join(', ') + '); contrast not checked' });
  return { findings, errors: findings.filter((f) => f.level === 'error').length, files: files.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  const opts = {};
  let root = join(dirname(fileURLToPath(import.meta.url)), '..');
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tokens') opts.tokens = argv[++i];
    else if (argv[i] === '--json') opts.json = true;
    else root = argv[i];
  }
  const result = designCheck(root, opts);
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const f of result.findings) {
      console.log((f.level === 'error' ? 'error' : 'note ').padEnd(6) + (f.file + (f.line ? ':' + f.line : '')).padEnd(34) + ' ' + f.rule.padEnd(15) + ' ' + f.message);
    }
    console.log('design-check: ' + result.files + ' files, ' + result.errors + ' error' + (result.errors === 1 ? '' : 's'));
  }
  process.exit(result.errors ? 1 : 0);
}
