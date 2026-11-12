// SPDX-License-Identifier: Apache-2.0
// The site builder (build/site.mjs, build/markdown.mjs, D-020): safe Markdown, complete content.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { markdown, safeHref, slug } from './markdown.mjs';
import { tutorialBlocks } from './site.mjs';
import { readTokens, checkContrast } from '../layer1/starter/tools/design-check.mjs';

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

// The shape of a landing JSON: every key path, with array lengths. / 랜딩 JSON의 모양(키와 배열 길이)
const shape = (value, path) => Array.isArray(value) ? [path + '[' + value.length + ']'].concat(...value.map((v, i) => shape(v, path + '.' + i)))
  : value && typeof value === 'object' ? [].concat(...Object.keys(value).sort().map((k) => shape(value[k], path + '.' + k))) : [path];

test('landing pages have the same keys in every language (D-048)', () => {
  const landing = config.pages.filter((p) => p.landing);
  assert.ok(landing.length >= 1);
  const shapes = config.languages.map((lang) => shape(JSON.parse(read('site/landing/' + lang + '.json')), ''));
  assert.deepEqual(shapes[1], shapes[0]);
});

test('every page exists in every language, with the same sections', () => {
  for (const page of config.pages.filter((p) => !p.landing)) {
    const counts = config.languages.map((lang) => {
      const path = 'site/content/' + lang + '/' + page.slug + '.md';
      assert.ok(existsSync(ROOT + path), path);
      const text = read(path);
      return { h2: (text.match(/^## /gm) || []).length, blocks: (text.match(/^\{\{[a-z0-9-]+\}\}$/gm) || []).sort().join(',') };
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

test('images: a line of its own, relative image paths only, alt escaped', () => {
  const { html } = markdown('![A <b>step</b>](../tutorial/img/ko/01-hello.png)');
  assert.equal(html, '<figure class="figure"><img src="../tutorial/img/ko/01-hello.png" alt="A &lt;b&gt;step&lt;/b&gt;" loading="lazy" decoding="async">' +
    '<figcaption>A &lt;b&gt;step&lt;/b&gt;</figcaption></figure>');
  for (const bad of ['https://example.com/x.png', '//example.com/x.png', 'javascript:x.png', 'data:image/png,x', 'x.html', '/abs/x.png']) {
    assert.throws(() => markdown('![x](' + bad + ')'), /images must be relative/, bad);
  }
});

test('tutorial: every step of both languages becomes CDN code with SRI, the same blocks in both', () => {
  const t = { copy: 'Copy' };
  const ko = tutorialBlocks('ko', '9.9.9', t);
  const en = tutorialBlocks('en', '9.9.9', t);
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort());
  assert.ok(ko['tutorial-01-html'] && ko['tutorial-01-js'] && ko['tutorial-01-css'] && ko['tutorial-05-html-min']);
  for (const [name, html] of Object.entries(ko).concat(Object.entries(en))) {
    assert.doesNotMatch(html, /\.\.\/\.\.\/\.\.\//, name + ' still loads a site path');
    if (/-html/.test(name)) {
      assert.match(html, /https:\/\/cdn\.jsdelivr\.net\/npm\/vfunc@9\.9\.9\/dist\/vfunc(\.min)?\.js&quot;\n\s+integrity=&quot;sha384-/, name);
      assert.match(html, /script-src &#39;self&#39; https:\/\/cdn\.jsdelivr\.net/, name);
    }
  }
  assert.match(ko['tutorial-05-html'], /vfunc@9\.9\.9\/css\/vfunc-ui\.css/);
  assert.match(ko['tutorial-05-html-min'], /vfunc@9\.9\.9\/dist\/vfunc-ui\.min\.js/);
  assert.doesNotMatch(ko['tutorial-05-html-min'], /vfunc\.js&quot;/);
});

test('tutorial: every screenshot the pages show exists', () => {
  for (const lang of config.languages) {
    const text = read('site/content/' + lang + '/tutorial.md');
    const images = text.match(/^!\[[^\]]*\]\(\.\.\/([^)]+)\)$/gm) || [];
    assert.ok(images.length >= 8, lang);
    for (const line of images) {
      const path = 'site/' + /\(\.\.\/([^)]+)\)/.exec(line)[1];
      assert.ok(existsSync(ROOT + path), path);
    }
  }
});

test('the site palette over the library tokens meets WCAG AA in light and dark (D-048)', () => {
  const tokens = readTokens(read('layer1/css/vfunc.tokens.css'));
  readTokens(read('site/assets/site-tokens.css'), tokens);
  assert.deepEqual(checkContrast(tokens, 'site-tokens.css').filter((f) => f.level === 'error'), []);
});

test('site pages use SVG icons, not symbol characters (D-048)', () => {
  const files = ['site/templates/page.html', 'site/templates/root.html'].concat(
    config.languages.flatMap((lang) => config.pages.filter((p) => !p.landing).map((p) => 'site/content/' + lang + '/' + p.slug + '.md')).concat(config.languages.map((lang) => 'site/landing/' + lang + '.json')));
  for (const file of files) assert.doesNotMatch(read(file), /[①-⓿■-◿☀-➿⭐⭕]|[\ud83c-\ud83e][\udc00-\udfff]/u, file);
});
