// SPDX-License-Identifier: Apache-2.0
//
// A small, safe Markdown converter for the site (build/site.mjs, D-020). No dependencies.
// Everything is escaped; raw HTML in Markdown is shown as text. Links pass a scheme allow-list.
// Supported: # headings (1-4), paragraphs, **bold**, *italic*, `code`, [links](url), - and 1. lists
// (one nested level), > quotes, ``` fences, | tables |, --- rules, and {{block}} directives that
// the caller fills with trusted, generated HTML.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Relative paths, #anchors, http(s) and mailto only. Anything else becomes '#'. */
export function safeHref(url) {
  const value = String(url).trim();
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value.replace(/[\s\u0000-\u001f]/g, ''))) return '#';
  return value;
}

/** Heading id: lowercase ASCII letters, digits, Hangul; spaces to "-". */
export function slug(text) {
  return String(text).toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_~()[\]{}.,:;!?'"/\\|#@$%^&+=<>—–·]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'section';
}

function inline(text, options) {
  const codes = [];
  let out = String(text).replace(/`([^`]+)`/g, (all, code) => {
    codes.push('<code>' + esc(code) + '</code>');
    return '\u0000' + (codes.length - 1) + '\u0000';
  });
  out = esc(out);
  // [label](url) — the label is already escaped; the url is checked and escaped.
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
    const decoded = url.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    let href = safeHref(decoded);
    if (options.link) href = options.link(href);
    const external = /^https?:/i.test(href);
    return '<a href="' + esc(href) + '"' + (external ? ' rel="noopener"' : '') + '>' + label + '</a>';
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,:;!?]|$)/g, '$1<em>$2</em>');
  return out.replace(/\u0000(\d+)\u0000/g, (all, i) => codes[Number(i)]);
}

function splitRow(line) {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

/**
 * Converts Markdown to HTML.
 * @param {string} source
 * @param {{ link?: (href: string) => string, blocks?: Object<string, string>, copyLabel?: string }} [options]
 * @returns {{ html: string, headings: Array<{ level: number, text: string, id: string }>, title: string }}
 */
export function markdown(source, options) {
  const o = options || {};
  const lines = String(source).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  const ids = {};
  let title = '';
  let i = 0;

  const para = [];
  function flushPara() {
    if (para.length) out.push('<p>' + inline(para.join(' '), o) + '</p>');
    para.length = 0;
  }

  while (i < lines.length) {
    const line = lines[i];

    const directive = /^\{\{([a-z0-9-]+)\}\}$/.exec(line.trim());
    if (directive) {
      flushPara();
      if (!o.blocks || !Object.prototype.hasOwnProperty.call(o.blocks, directive[1])) {
        throw new Error('markdown: unknown block {{' + directive[1] + '}}');
      }
      out.push(o.blocks[directive[1]]);
      i++;
      continue;
    }

    const fence = /^```([\w-]*)\s*$/.exec(line);
    if (fence) {
      flushPara();
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push('<div class="code" data-copy-root><button class="code__copy" type="button" data-action="copy">' + esc(o.copyLabel || 'Copy') +
        '</button><pre' + (fence[1] ? ' data-lang="' + esc(fence[1]) + '"' : '') + '><code>' + esc(code.join('\n')) + '</code></pre></div>');
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushPara();
      const level = heading[1].length;
      const text = heading[2].trim();
      let id = slug(text);
      while (ids[id]) id += '-' + (ids[id]++);
      ids[id] = 1;
      if (level === 1 && !title) title = text.replace(/`/g, '');
      headings.push({ level: level, text: text, id: id });
      out.push('<h' + level + ' id="' + esc(id) + '">' + inline(text, o) + '</h' + level + '>');
      i++;
      continue;
    }

    if (/^---\s*$/.test(line)) {
      flushPara();
      out.push('<hr>');
      i++;
      continue;
    }

    if (/^\|/.test(line) && i + 1 < lines.length && /^\|\s*:?-{3,}/.test(lines[i + 1])) {
      flushPara();
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      out.push('<div class="table"><table><thead><tr>' + head.map((c) => '<th>' + inline(c, o) + '</th>').join('') +
        '</tr></thead><tbody>' + rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c, o) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushPara();
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      out.push('<blockquote><p>' + inline(quote.join(' '), o) + '</p></blockquote>');
      continue;
    }

    const item = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (item) {
      flushPara();
      const ordered = /\d/.test(item[2]);
      const html = [];
      let current = null;
      let nested = null;
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m && m[1].length >= 2 && current) {
          if (!nested) nested = { ordered: /\d/.test(m[2]), items: [] };
          nested.items.push(m[3]);
          i++;
          continue;
        }
        if (m && m[1].length < 2) {
          if (current) html.push(renderItem(current, nested, o));
          current = m[3];
          nested = null;
          i++;
          continue;
        }
        if (current && /^\s{2,}\S/.test(lines[i]) && !m) {
          if (nested) nested.items[nested.items.length - 1] += ' ' + lines[i].trim();
          else current += ' ' + lines[i].trim();
          i++;
          continue;
        }
        break;
      }
      if (current !== null) html.push(renderItem(current, nested, o));
      out.push((ordered ? '<ol>' : '<ul>') + html.join('') + (ordered ? '</ol>' : '</ul>'));
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushPara();
      i++;
      continue;
    }

    para.push(line.trim());
    i++;
  }
  flushPara();
  return { html: out.join('\n'), headings: headings, title: title };
}

function renderItem(text, nested, o) {
  let html = '<li>' + inline(text, o);
  if (nested) {
    const tag = nested.ordered ? 'ol' : 'ul';
    html += '<' + tag + '>' + nested.items.map((t) => '<li>' + inline(t, o) + '</li>').join('') + '</' + tag + '>';
  }
  return html + '</li>';
}
