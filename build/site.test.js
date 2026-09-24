// SPDX-License-Identifier: Apache-2.0
// The site builder (build/site.mjs, build/markdown.mjs, D-020): safe Markdown, complete content.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { markdown, safeHref, slug } from './markdown.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(ROOT + path, 'utf8').replace(/\r\n/g, '\n');

test('raw HTML and scripts in Markdown are shown as text', () => {
  const { html } = markdown('Hello <script>alert(1)</script> <img src=x onerror=alert(1)>\n\n# Title <b>x</b>');
  assert.doesNotMatch(html, /<script>|<img|<b>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('links pass a scheme allow-list and .md links become .html', () => {
  assert.equal(safeHref('javascript:alert(1)'), '#');
  assert.equal(safeHref('java\tscript:alert(1)'), '#');
  assert.equal(safeHref('data:text/html,x'), '#');
  assert.equal(safeHref('https://example.com'), 'https://example.com');
  const { html } = markdown('[a](javascript:alert(1)) [b](guide.md#x) [c](https://example.com)',
    { link: (href) => href.replace(/^([\w-]+)\.md(#.*)?$/, './$1.html$2') });
  assert.match(html, /<a href="#">a<\/a>/);
  assert.match(html, /<a href="\.\/guide\.html#x">b<\/a>/);
  assert.match(html, /<a href="https:\/\/example\.com" rel="noopener">c<\/a>/);
});

test('fences, tables, lists, quotes and directives', () => {
  const src = '```js\nconst a = "<b>";\n```\n\n| A | B |\n|---|---|\n| `x` | **y** |\n\n- one\n  - nested\n- two\n\n1. first\n\n> note\n\n{{demo}}';
  const { html } = markdown(src, { blocks: { demo: '<div id="demo"></div>' }, copyLabel: 'Copy' });
  assert.match(html, /<pre data-lang="js"><code>const a = &quot;&lt;b&gt;&quot;;<\/code><\/pre>/);
  assert.match(html, /data-action="copy">Copy<\/button>/);
  assert.match(html, /<td><code>x<\/code><\/td><td><strong>y<\/strong><\/td>/);
  assert.match(html, /<ul><li>one<ul><li>nested<\/li><\/ul><\/li><li>two<\/li><\/ul>/);
  assert.match(html, /<ol><li>first<\/li><\/ol>/);
  assert.match(html, /<blockquote><p>note<\/p><\/blockquote>/);
  assert.match(html, /<div id="demo"><\/div>/);
  assert.throws(() => markdown('{{unknown}}', { blocks: {} }), /unknown block/);
});

test('heading ids work for English and Korean', () => {
  assert.equal(slug('Official plugin — `vf.ext.update`'), 'official-plugin-vfextupdate');
  assert.equal(slug('IE11·Edge IE 모드'), 'ie11edge-ie-모드');
  assert.equal(slug('스타터로 시작하기'), '스타터로-시작하기');
  const { headings } = markdown('## A\n## A');
  assert.deepEqual(headings.map((h) => h.id), ['a', 'a-1']);
});

const config = JSON.parse(read('site/pages.json'));

test('every page exists in every language, with the same sections', () => {
  for (const page of config.pages) {
    const counts = config.languages.map((lang) => {
      const path = 'site/content/' + lang + '/' + page.slug + '.md';
      assert.ok(existsSync(ROOT + path), path);
      const text = read(path);
      return { h2: (text.match(/^## /gm) || []).length, blocks: (text.match(/^\{\{[a-z-]+\}\}$/gm) || []).sort().join(',') };
    });
    assert.deepEqual(counts[1], counts[0], page.slug);
  }
});

test('the API page documents every public export in both languages', () => {
  const dts = read('layer1/types/vfunc.d.ts');
  const names = [];
  const re = /^export declare (?:function|const) ([\w$]+)/gm;
  let m;
  while ((m = re.exec(dts)) !== null) if (names.indexOf(m[1]) < 0) names.push(m[1]);
  assert.ok(names.length >= 25);
  for (const lang of config.languages) {
    const api = read('site/content/' + lang + '/api.md');
    const missing = names.filter((name) => api.indexOf('### `vf.' + name) < 0);
    assert.deepEqual(missing, [], lang);
  }
});
