// SPDX-License-Identifier: Apache-2.0
//
// Layer 2 CSS (maintainer decisions D-029):
//   dist/vfunc-ui.css         base.css + components/*.css in @layer vf.base, vf.components
//   dist/vfunc-ui.legacy.css  the same for IE11: no @layer, var(--vf-*) replaced by the light
//                             theme values of vfunc.tokens.css, logical properties turned into
//                             physical ones (left-to-right)
// The legacy conversion is written here instead of using postcss plugins: their MIT-0
// dependencies are outside the allowed licenses (rule 23). It only has to understand our own
// CSS, which uses tokens and simple declarations; anything it cannot convert fails the build.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LAYERS = '@layer vf.base, vf.components;';

/** @returns {{ modern: string, legacy: string, problems: string[] }} */
export function buildUiCss(root, banner) {
  const base = readFileSync(join(root, 'layer2/css/base.css'), 'utf8');
  const componentDir = join(root, 'layer2/css/components');
  const components = readdirSync(componentDir).filter((name) => name.endsWith('.css')).sort()
    .map((name) => readFileSync(join(componentDir, name), 'utf8'));

  const modern = banner + '\n' + LAYERS + '\n\n@layer vf.base {\n' + base.trim() + '\n}\n\n@layer vf.components {\n' +
    components.map((text) => text.trim()).join('\n\n') + '\n}\n';

  const tokens = lightTokens(readFileSync(join(root, 'layer1/css/vfunc.tokens.css'), 'utf8'));
  const problems = [];
  const legacy = banner + '\n/* IE11: fixed light theme values (no dark theme, no token overrides), left to right.\n   Customize with rules in your own CSS loaded after this file. */\n\n' +
    toLegacy([base].concat(components).map((text) => text.trim()).join('\n\n'), tokens, problems) + '\n';
  return { modern: modern, legacy: legacy, problems: problems };
}

/** The custom properties of the first `:root { … }` block (the light theme). */
export function lightTokens(css) {
  const block = /:root\s*\{([^}]*)\}/.exec(css);
  const tokens = {};
  if (!block) return tokens;
  const pattern = /(--vf-[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = pattern.exec(block[1])) !== null) tokens[m[1]] = m[2].trim();
  return tokens;
}

const LOGICAL = {
  'inline-size': ['width'],
  'block-size': ['height'],
  'min-inline-size': ['min-width'],
  'min-block-size': ['min-height'],
  'max-inline-size': ['max-width'],
  'max-block-size': ['max-height'],
  'margin-inline-start': ['margin-left'],
  'margin-inline-end': ['margin-right'],
  'margin-block-start': ['margin-top'],
  'margin-block-end': ['margin-bottom'],
  'padding-inline-start': ['padding-left'],
  'padding-inline-end': ['padding-right'],
  'padding-block-start': ['padding-top'],
  'padding-block-end': ['padding-bottom'],
  'inset-inline-start': ['left'],
  'inset-inline-end': ['right'],
  'inset-block-start': ['top'],
  'inset-block-end': ['bottom'],
  'border-inline-start': ['border-left'],
  'border-inline-end': ['border-right'],
  'border-block-start': ['border-top'],
  'border-block-end': ['border-bottom'],
  'border-inline-start-color': ['border-left-color'],
  'border-inline-end-color': ['border-right-color'],
  'border-block-start-color': ['border-top-color'],
  'border-block-end-color': ['border-bottom-color'],
  'border-inline-start-width': ['border-left-width'],
  'border-inline-end-width': ['border-right-width'],
  'border-start-start-radius': ['border-top-left-radius'],
  'border-start-end-radius': ['border-top-right-radius'],
  'border-end-start-radius': ['border-bottom-left-radius'],
  'border-end-end-radius': ['border-bottom-right-radius'],
  // Two-value shorthands: "a" or "a b" → start, end.
  'margin-inline': ['margin-left', 'margin-right'],
  'margin-block': ['margin-top', 'margin-bottom'],
  'padding-inline': ['padding-left', 'padding-right'],
  'padding-block': ['padding-top', 'padding-bottom'],
  'inset-inline': ['left', 'right'],
  'inset-block': ['top', 'bottom'],
  'border-inline': ['border-left', 'border-right'],
  'border-block': ['border-top', 'border-bottom']
};

/** Splits "a b" on top-level spaces (not inside parentheses). */
function splitValues(value) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const c of value) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (/\s/.test(c) && depth === 0) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function toLegacy(css, tokens, problems) {
  // 0. Comments go (they may mention @layer or var()); the banner keeps the license line.
  let out = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n{3,}/g, '\n\n').trim();
  // 1. Unwrap @layer: drop the order statement, keep the rules of each block.
  out = out.replace(/@layer[^{;]*;/g, '');
  out = unwrapAtRule(out, 'layer');

  // 2. Tokens → values (with the fallback of var(--x, fallback) when the token is unknown).
  out = out.replace(/var\(\s*(--vf-[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (all, name, fallback) => {
    if (Object.prototype.hasOwnProperty.call(tokens, name)) return tokens[name];
    if (fallback !== undefined) return fallback.trim();
    problems.push('vfunc-ui.legacy.css: unknown token ' + name);
    return all;
  });

  // 3. Logical properties and values → physical, left to right.
  out = out.replace(/(^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+?)\s*(?=;|\})/g, (all, lead, prop, value) => {
    if (prop === 'text-align' || prop === 'float' || prop === 'clear') {
      const physical = value.replace(/\bstart\b/, 'left').replace(/\bend\b/, 'right')
        .replace(/\binline-start\b/, 'left').replace(/\binline-end\b/, 'right');
      return lead + prop + ': ' + physical;
    }
    if (!Object.prototype.hasOwnProperty.call(LOGICAL, prop)) return all;
    const targets = LOGICAL[prop];
    if (targets.length === 1) return lead + targets[0] + ': ' + value;
    const parts = /^border-/.test(prop) ? [value, value] : splitValues(value);
    if (parts.length > 2) {
      problems.push('vfunc-ui.legacy.css: cannot convert "' + prop + ': ' + value + '"');
      return all;
    }
    return lead + targets[0] + ': ' + parts[0] + '; ' + targets[1] + ': ' + (parts[1] || parts[0]);
  });

  // 4. Nothing modern may be left.
  if (/var\(/.test(out)) problems.push('vfunc-ui.legacy.css: a var() is left');
  if (/@layer/.test(out)) problems.push('vfunc-ui.legacy.css: an @layer is left');
  const leftover = /(^|[;{\s])([a-z-]*-(?:inline|block)(?:-[a-z-]+)?|(?:inline|block)-size)\s*:/m.exec(out);
  if (leftover) problems.push('vfunc-ui.legacy.css: logical property left: ' + leftover[2]);
  return out;
}

/** Replaces `@name … { body }` with `body`, matching braces. */
function unwrapAtRule(css, name) {
  const pattern = new RegExp('@' + name + '\\b[^{;]*\\{', 'g');
  let result = '';
  let last = 0;
  let m;
  while ((m = pattern.exec(css)) !== null) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    result += css.slice(last, m.index) + unwrapAtRule(css.slice(m.index + m[0].length, i - 1), name);
    last = i;
    pattern.lastIndex = i;
  }
  return result + css.slice(last);
}
