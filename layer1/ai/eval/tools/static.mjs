// SPDX-License-Identifier: Apache-2.0
//
// Static checks of an evaluated answer (maintainer decision D-024). Each finding is
// { rule, severity: 'error' | 'warn', file, line, text }. Errors fail the task; warnings are
// reported for the manual review. The checks are pattern based: they look at code with the
// comments removed, and know which template literals are tagged with vf.html.

const PUBLIC_TOKEN = /^--vf-(color-(primary(-hover|-active|-soft)?|on-primary|(success|warning|danger|info)(-soft|-text)?|bg|surface|surface-muted|overlay|text|text-muted|text-disabled|text-inverse|border|border-strong|focus)|focus-ring|chart-[1-8]|shadow-[1-3]|radius-(sm|md|lg|full)|space-[1-7]|font-(body|mono)|font-size-(xs|sm|md|lg|xl|2xl)|font-weight-(normal|strong)|line-height|duration-(fast|base)|easing|z-(dropdown|popover|drawer|modal|toast))$/;

const REGEX_BEFORE = '(,=:[!&|?{};+-*%<>~^';
const REGEX_KEYWORDS = /(?:^|[^\w$])(return|typeof|case|in|of|new|delete|void|throw|else|do)$/;

/**
 * Scans JavaScript source. Returns `code` (comments replaced by spaces, newlines kept),
 * `templates` ({ start, end, tag, quasi }) and `strings` ({ start, end, value }).
 */
export function scanJs(src) {
  const out = src.split('');
  const templates = [];
  const strings = [];
  const stack = []; // open template literals: { start, tag, quasi, depth }
  let i = 0;
  let last = ''; // last significant character outside strings and comments
  let lastEnd = 0;

  const blank = (from, to) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' ';
  };
  const readQuoted = (quote) => {
    const start = i;
    i++;
    let value = '';
    while (i < src.length && src[i] !== quote && src[i] !== '\n') {
      if (src[i] === '\\') { value += src[i + 1] || ''; i += 2; continue; }
      value += src[i++];
    }
    i++;
    strings.push({ start: start, end: i, value: value });
    last = quote;
    lastEnd = i;
  };
  const openTemplate = () => {
    const before = src.slice(0, i).replace(/\s+$/, '');
    const m = /([\w$.]+)$/.exec(before);
    stack.push({ start: i, tag: m && lastEnd === before.length ? m[1] : '', quasi: '', depth: 0 });
    i++;
    continueTemplate();
  };
  // Reads template text until its end or the next `${`.
  const continueTemplate = () => {
    const t = stack[stack.length - 1];
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') { t.quasi += src.slice(i, i + 2); i += 2; continue; }
      if (c === '`') {
        i++;
        stack.pop();
        templates.push({ start: t.start, end: i, tag: t.tag, quasi: t.quasi });
        last = '`';
        lastEnd = i;
        return;
      }
      if (c === '$' && src[i + 1] === '{') { t.quasi += '\u0000'; i += 2; t.depth = 1; last = '{'; return; }
      t.quasi += c;
      i++;
    }
    stack.pop();
  };

  while (i < src.length) {
    const c = src[i];
    const top = stack[stack.length - 1];
    if (top && top.depth > 0) {
      if (c === '{') top.depth++;
      else if (c === '}') {
        top.depth--;
        if (top.depth === 0) { i++; continueTemplate(); continue; }
      }
    }
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i);
      const to = end < 0 ? src.length : end;
      blank(i, to);
      i = to;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const to = end < 0 ? src.length : end + 2;
      blank(i, to);
      i = to;
      continue;
    }
    if (c === '/') {
      const before = src.slice(0, i).replace(/\s+$/, '');
      if (!before || REGEX_BEFORE.indexOf(before[before.length - 1]) >= 0 || REGEX_KEYWORDS.test(before)) {
        i++;
        let inClass = false;
        while (i < src.length && src[i] !== '\n') {
          if (src[i] === '\\') { i += 2; continue; }
          if (src[i] === '[') inClass = true;
          else if (src[i] === ']') inClass = false;
          else if (src[i] === '/' && !inClass) break;
          i++;
        }
        i++;
        last = '/';
        lastEnd = i;
        continue;
      }
    }
    if (c === '"' || c === "'") { readQuoted(c); continue; }
    if (c === '`') { openTemplate(); continue; }
    if (!/\s/.test(c)) { last = c; lastEnd = i + 1; }
    i++;
  }
  return { code: out.join(''), templates: templates, strings: strings };
}

const lineOf = (src, index) => src.slice(0, index).split('\n').length;
const snippet = (src, index) => {
  const from = src.lastIndexOf('\n', index) + 1;
  const to = src.indexOf('\n', index);
  return src.slice(from, to < 0 ? src.length : to).trim().slice(0, 160);
};

/**
 * True when a CSS selector string selects by class (attribute values, strings and the ${…}
 * expressions of a template literal ignored: `#delete-${file.id}` is an id selector).
 */
export function selectsByClass(selector) {
  const bare = selector.replace(/\$\{[^}]*\}/g, 'x').replace(/\[[^\]]*\]/g, '').replace(/(["'])(?:\\.|(?!\1).)*\1/g, '');
  return /\.[A-Za-z_-]/.test(bare);
}

function checkJs(file, src, add) {
  const { code, templates, strings } = scanJs(src);
  const at = (rule, severity, index, text) => add(rule, severity, file, lineOf(src, index), text || snippet(src, index));
  const each = (re, fn) => { re.lastIndex = 0; let m; while ((m = re.exec(code))) fn(m); };

  each(/\beval\s*\(|\bnew\s+Function\s*\(|\bset(?:Timeout|Interval)\s*\(\s*['"`]/g, (m) => at('eval', 'error', m.index));
  each(/javascript:/gi, (m) => at('javascript-url', 'error', m.index));
  each(/\.(?:innerHTML|outerHTML)\s*\+?=(?!=)\s*(['"`]?)/g, (m) => {
    const rest = code.slice(m.index + m[0].length - m[1].length, m.index + m[0].length + 2);
    if (/^(''|""|``)/.test(rest)) return; // clearing is harmless
    // Markup escaped by vf.html is safe, only not the idiom (render or vf.frag): a warning.
    const value = code.slice(m.index + m[0].length - m[1].length, m.index + m[0].length + 40).replace(/\s+/g, '');
    if (/^(String\()?(vf\.)?html`/.test(value)) {
      at('html-string', 'warn', m.index, 'innerHTML from vf.html (safe; prefer render or vf.frag)');
      return;
    }
    at('html-string', 'error', m.index);
  });
  each(/\binsertAdjacentHTML\s*\(|\bdocument\.write(?:ln)?\s*\(|\.createContextualFragment\s*\(/g, (m) => at('html-string', 'error', m.index));
  each(/\bvf\.unsafeHtml\s*\(/g, (m) => at('unsafe-html', 'warn', m.index));
  each(/\bvf\.(?!ext\b)[A-Za-z_$][\w$]*\s*=(?!=)|\.prototype\.[\w$]+\s*=(?!=)|\bObject\.(?:assign|defineProperty)\(\s*vf\b/g, (m) => at('vf-mutation', 'error', m.index));
  // Own properties on a component instance (llms.txt: names starting with `_` belong to the engine).
  each(/([\w$]+)\.\_[A-Za-z$][\w$]*\s*=(?!=)/g, (m) => {
    at('instance-property', /^(inst|instance|sender|self|this|component|comp)$/.test(m[1]) ? 'error' : 'warn', m.index);
  });
  each(/\bgetElementsByClassName\s*\(/g, (m) => at('class-selector', 'error', m.index));
  each(/\.style\.(?:color|background\w*|font\w*|margin\w*|padding\w*|border\w*|boxShadow|outline\w*)\s*=(?!=)/g, (m) => at('design-in-js', 'error', m.index));

  // Selectors given as string literals to query functions and to `delegates`.
  each(/(?:querySelector(?:All)?|closest|matches|\bvf\.\$\$?|\$\$?)\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1|\bselector\s*:\s*(['"`])((?:\\.|(?!\3).)*)\3/g, (m) => {
    const selector = m[2] !== undefined ? m[2] : m[4];
    if (selectsByClass(selector)) at('class-selector', 'error', m.index);
  });

  for (const t of templates) {
    const tagged = /(^|\.)html$/.test(t.tag);
    if (!tagged && /<\/?[A-Za-z!]/.test(t.quasi)) at('html-string', 'error', t.start, 'markup in a template literal not tagged with vf.html');
    if (/\saria-[a-z]+=""/.test(t.quasi)) at('aria-value', 'error', t.start, 'empty aria-* value');
  }
  each(/aria-[a-z]+="\$\{[^}]*\?\s*(['"])true\1\s*:\s*(['"])\2\s*\}"/g, (m) => at('aria-value', 'error', m.index));
  each(/setAttribute\(\s*['"]aria-[a-z]+['"]\s*,\s*(['"])\1\s*\)/g, (m) => at('aria-value', 'error', m.index));

  for (const s of strings) {
    // A whole string that is a color (#rgb, #rrggbb, #rrggbbaa, rgb(…), hsl(…)); "#1042" is an order number.
    if (/^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|rgba?\(|hsla?\()/.test(s.value.trim())) at('design-in-js', 'error', s.start);
    if (/\saria-[a-z]+=""/.test(s.value)) at('aria-value', 'error', s.start);
    if (!/<\/?[A-Za-z]/.test(s.value)) continue;
    const before = code.slice(0, s.start).replace(/\s+$/, '');
    const after = code.slice(s.end).replace(/^\s+/, '');
    if (before.endsWith('+') || after.startsWith('+')) at('html-string', 'error', s.start, 'markup built by string concatenation');
  }
}

function checkHtml(file, src, add) {
  const html = src.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
  const at = (rule, severity, index, text) => add(rule, severity, file, lineOf(src, index), text || snippet(src, index));
  const each = (re, fn) => { re.lastIndex = 0; let m; while ((m = re.exec(html))) fn(m); };

  each(/<[A-Za-z][^>]*?\son[a-z]+\s*=/gi, (m) => at('inline-handler', 'error', m.index));
  each(/javascript:/gi, (m) => at('javascript-url', 'error', m.index));
  each(/<[A-Za-z][^>]*?\sstyle\s*=/gi, (m) => at('csp', 'error', m.index, 'inline style attribute (blocked by the CSP)'));
  each(/<style\b/gi, (m) => at('csp', 'error', m.index, '<style> element (styles belong in a CSS file)'));
  each(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m) => {
    if (!/\bsrc\s*=/.test(m[1]) && m[2].trim()) at('csp', 'error', m.index, 'inline <script> (scripts belong in files)');
  });
  each(/\saria-[a-z]+=""/g, (m) => at('aria-value', 'error', m.index));

  const meta = /<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/i.exec(html);
  if (!meta) at('csp', 'error', 0, 'no Content-Security-Policy meta tag');
  else {
    const content = (/\scontent\s*=\s*"([^"]*)"|\scontent\s*=\s*'([^']*)'/i.exec(meta[0]) || []);
    const policy = content[1] || content[2] || '';
    const directive = (name) => (policy.split(';').map((d) => d.trim()).filter((d) => d.indexOf(name + ' ') === 0)[0] || '');
    const scripts = directive('script-src') || directive('default-src');
    if (!scripts) at('csp', 'error', meta.index, 'CSP without script-src or default-src');
    else if (/'unsafe-inline'|'unsafe-eval'/.test(scripts)) at('csp', 'error', meta.index, "CSP allows 'unsafe-inline' or 'unsafe-eval' for scripts");
  }

  each(/<(script|link)\b[^>]*>/gi, (m) => {
    const tag = m[0];
    const url = (/\s(?:src|href)\s*=\s*["'](https?:)?\/\/([^"']+)["']/i.exec(tag) || [])[2];
    if (!url) return;
    if (m[1].toLowerCase() === 'link' && !/rel\s*=\s*["']stylesheet/i.test(tag)) return;
    if (!/\sintegrity\s*=/.test(tag) || !/\scrossorigin\b/.test(tag)) at('cdn-sri', 'error', m.index, 'file from another domain without integrity and crossorigin');
    if (/(jsdelivr|unpkg)/.test(url) && !/@\d+\.\d+\.\d+/.test(url)) at('cdn-sri', 'error', m.index, 'file from a CDN without an exact version');
  });
}

function checkCss(file, src, add, strict) {
  const css = src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const at = (rule, severity, index, text) => add(rule, severity, file, lineOf(src, index), text || snippet(src, index));
  const each = (re, fn) => { re.lastIndex = 0; let m; while ((m = re.exec(css))) fn(m); };
  if (/(^|\/)[^/]*tokens[^/]*\.css$/.test(file)) {
    each(/(--vf-[\w-]+)\s*:/g, (m) => { if (!PUBLIC_TOKEN.test(m[1])) at('unknown-token', 'warn', m.index, m[1] + ' is not a public token name'); });
    return;
  }
  each(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g, (m) => at('css-raw', 'error', m.index, 'raw color outside tokens.css'));
  each(/(?<![\w.-])(\d*\.?\d+)px\b/g, (m) => {
    if (Number(m[1]) <= 2) return; // hairlines and outline widths have no token
    at('css-raw', strict ? 'error' : 'warn', m.index, 'raw size outside tokens.css');
  });
}

/** vf.t('a.b') looks up nested objects, so a top-level key with a dot is never found. */
function checkLocale(file, src, add) {
  let data;
  try {
    data = JSON.parse(src);
  } catch (err) {
    add('locale-file', 'error', file, 1, 'not valid JSON');
    return;
  }
  const dotted = Object.keys(data || {}).filter((k) => k.indexOf('.') >= 0);
  if (dotted.length) add('locale-file', 'error', file, lineOf(src, src.indexOf(JSON.stringify(dotted[0]))), 'dotted top-level keys (' + dotted.slice(0, 3).join(', ') + '…): vf.t reads "a.b" as nested objects');
}

/**
 * Checks `files` ({ path, content }[]). `options.cssStrict` makes raw CSS sizes errors;
 * `options.forbid` adds task rules ({ pattern, files?, message }); `options.skip` lists files
 * that are not the model's to change (the task's "must stay the same" files).
 * The same finding in one file is reported once, with every line in `lines`.
 */
export function staticCheck(files, options) {
  const opts = options || {};
  const findings = [];
  const seen = {};
  const add = (rule, severity, file, line, text) => {
    const key = [rule, severity, file].join('|');
    if (seen[key]) { seen[key].lines.push(line); return; }
    seen[key] = { rule: rule, severity: severity, file: file, line: line, lines: [line], text: text };
    findings.push(seen[key]);
  };
  for (const f of files) {
    if (/^lib\//.test(f.path) || (opts.skip || []).indexOf(f.path) >= 0) continue;
    if (/\.(js|mjs)$/.test(f.path)) checkJs(f.path, f.content, add);
    else if (/\.html?$/.test(f.path)) checkHtml(f.path, f.content, add);
    else if (/\.css$/.test(f.path)) checkCss(f.path, f.content, add, opts.cssStrict);
    else if (/(^|\/)locales\/[^/]+\.json$/.test(f.path)) checkLocale(f.path, f.content, add);
    for (const rule of opts.forbid || []) {
      if (rule.files && !new RegExp(rule.files).test(f.path)) continue;
      const re = new RegExp(rule.pattern, 'g');
      let m;
      while ((m = re.exec(f.content))) add('task-rule', 'error', f.path, lineOf(f.content, m.index), rule.message);
    }
  }
  return findings;
}
