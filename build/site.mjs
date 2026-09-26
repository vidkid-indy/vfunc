// SPDX-License-Identifier: Apache-2.0
//
// The website (D-020): static pages from site/content/{ko,en}/*.md, with vfunc "islands" for the
// parts that need behaviour (theme, copy buttons, navigation, search, the home demo). No build
// step for users; this is our deploy step for GitHub Pages.
//
//   node build/site.mjs              → build/out/site/
//   node build/site.mjs --out <dir>  → another folder (tests)
//
// The install snippet takes the version from package.json and the SRI hashes from layer1/dist,
// which equal the published CDN files once that version is on npm (checked after each publish).

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdown, esc } from './markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');

const read = (path) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');
const json = (path) => JSON.parse(read(path));

function sri(path) {
  return 'sha384-' + createHash('sha384').update(readFileSync(join(ROOT, path))).digest('base64');
}

function copyDir(from, to, skip) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (skip && skip(name, join(from, name))) continue;
    const source = join(from, name);
    if (statSync(source).isDirectory()) copyDir(source, join(to, name), skip);
    else copyFileSync(source, join(to, name));
  }
}

// ---- generated blocks ---------------------------------------------------------------------------

function installBlock(lang, version, t) {
  const cdn = 'https://cdn.jsdelivr.net/npm/vfunc@' + version + '/dist/';
  const html = [
    '<!-- ' + (lang === 'ko' ? '운영: 정확한 버전 + SRI' : 'Production: exact version + SRI') + ' -->',
    '<script src="' + cdn + 'vfunc.min.js"',
    '        integrity="' + sri('layer1/dist/vfunc.min.js') + '"',
    '        crossorigin="anonymous"></script>',
    '',
    '<!-- IE11 / Edge IE mode -->',
    '<script nomodule src="' + cdn + 'vfunc.legacy.min.js"',
    '        integrity="' + sri('layer1/dist/vfunc.legacy.min.js') + '"',
    '        crossorigin="anonymous"></script>'
  ].join('\n');
  const npm = 'npm i vfunc@' + version + '\n\nimport vf from \'vfunc\';';
  const code = (text, language) => '<div class="code" data-copy-root><button class="code__copy" type="button" data-action="copy">' +
    esc(t.copy) + '</button><pre data-lang="' + language + '"><code>' + esc(text) + '</code></pre></div>';
  return code(html, 'html') + '\n' + code(npm, 'js');
}

/** The examples of layer 1 (numbered folders) and layer 2 (every folder with a README), one table each. */
function examplesBlock(lang) {
  const table = (base, names) => {
    const dir = join(ROOT, base);
    const rows = names.map((name) => {
      const readme = existsSync(join(dir, name, 'README.md')) ? readFileSync(join(dir, name, 'README.md'), 'utf8').replace(/\r\n/g, '\n') : '';
      const lead = (readme.split('\n').find((line, i) => i > 0 && line.trim() && !/^[#|`-]/.test(line)) || '').trim();
      const parts = lead.split(' / ');
      const text = lang === 'ko' && parts.length > 1 ? parts.slice(1).join(' / ') : parts[0];
      return '<tr><td><a href="../' + base + '/' + esc(name) + '/">' + esc(name) + '</a></td><td>' +
        esc(text.replace(/[`*]/g, '')) + '</td><td><a href="https://github.com/vidkid-indy/vfunc/tree/main/' + base + '/' +
        esc(name) + '" rel="noopener">source</a></td></tr>';
    });
    return '<div class="table"><table><thead><tr><th>' + esc(base) + '</th><th>' + (lang === 'ko' ? '보여 주는 것' : 'What it shows') +
      '</th><th></th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  };
  const l1 = readdirSync(join(ROOT, 'layer1/examples')).filter((name) => /^\d\d-/.test(name)).sort();
  const l2dir = join(ROOT, 'layer2/examples');
  const l2 = readdirSync(l2dir).filter((name) => existsSync(join(l2dir, name, 'README.md'))).sort();
  return table('layer1/examples', l1) + '\n' + table('layer2/examples', l2);
}

function promptsBlock(lang, t) {
  // Layer 1's kit, then layer 2's (published in the same /ai/<lang>/ folder). The generated
  // component list is a reference, linked from the components page instead.
  const files = [];
  for (const base of [join(ROOT, 'layer1/ai', lang), join(ROOT, 'layer2/ai', lang)]) {
    (function walk(dir) {
      for (const name of readdirSync(dir).sort()) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (name !== 'components.md') files.push({ base: base, file: relative(base, full).split('\\').join('/') });
      }
    })(base);
  }
  return files.map(({ base, file }) => {
    const text = readFileSync(join(base, file), 'utf8').replace(/\r\n/g, '\n');
    const heading = (/^# (.+)$/m.exec(text) || [])[1] || file;
    const cut = text.indexOf('\n---\n');
    const body = cut >= 0 ? text.slice(cut + 5).trim() : text.trim();
    return '<details class="prompt"><summary><strong>' + esc(heading.replace(/`/g, '')) + '</strong> <span class="muted">' +
      esc(file) + '</span></summary><p><a href="../ai/' + lang + '/' + esc(file) + '">' + esc(t.file) + '</a></p>' +
      '<div class="code" data-copy-root><button class="code__copy" type="button" data-action="copy">' + esc(t.copy) +
      '</button><pre data-lang="md"><code>' + esc(body) + '</code></pre></div></details>';
  }).join('\n');
}

function licensesBlock(lang) {
  const data = json('site/data/licenses.json');
  const head = lang === 'ko' ? ['이름', '버전', '라이선스', '저작권', '쓰임', '번들'] : ['Name', 'Version', 'License', 'Copyright', 'Used in', 'Bundled'];
  const rows = data.entries.map((e) => '<tr><td><a href="' + esc(e.url) + '" rel="noopener">' + esc(e.name) + '</a></td><td>' +
    esc(e.version) + '</td><td>' + esc(e.license) + '</td><td>' + esc(e.copyright) + '</td><td>' + esc(e.usedIn.join(', ')) +
    '</td><td>' + (e.bundled ? (lang === 'ko' ? '예' : 'yes') : (lang === 'ko' ? '아니요' : 'no')) + '</td></tr>');
  return '<div class="table"><table><thead><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.join('') + '</tbody></table></div>';
}

/** Results of the LLM evaluation set (layer1/ai/eval/results/<run>/, D-024), newest first. */
function evalBlock(lang) {
  const dir = join(ROOT, 'layer1/ai/eval/results');
  const runs = existsSync(dir) ? readdirSync(dir).filter((name) => existsSync(join(dir, name, 'results.json'))).sort().reverse() : [];
  if (!runs.length) return '<p class="muted">' + (lang === 'ko' ? '아직 공개한 결과가 없습니다.' : 'No results published yet.') + '</p>';
  const head = lang === 'ko'
    ? ['모델', '실행 방식', '날짜', '킷 버전', '언어', '통과한 과제', '통과한 검사', '추가 질문', '']
    : ['Model', 'How it ran', 'Date', 'Kit version', 'Language', 'Tasks passed', 'Checks passed', 'Follow-ups', ''];
  const rows = runs.map((name) => {
    const results = json('layer1/ai/eval/results/' + name + '/results.json');
    const run = json('layer1/ai/eval/results/' + name + '/run.json');
    const followUps = Object.keys(run.tasks || {}).reduce((n, k) => n + (run.tasks[k].followUps || 0), 0);
    const s = results.summary;
    return '<tr><td>' + esc(run.model + (run.modelVersion ? ' (' + run.modelVersion + ')' : '')) + '</td><td>' + esc(run.service) +
      '</td><td>' + esc(run.date) + '</td><td>' + esc(run.kit) + '</td><td>' + esc(run.lang) + '</td><td>' + s.tasksPassed + ' / ' + s.tasks +
      '</td><td>' + s.checksPassed + ' / ' + s.checks + '</td><td>' + followUps + '</td><td><a href="https://github.com/vidkid-indy/vfunc/blob/main/layer1/ai/eval/results/' +
      esc(name) + '/results.md" rel="noopener">' + (lang === 'ko' ? '자세히' : 'details') + '</a></td></tr>';
  });
  return '<div class="table"><table><thead><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.join('') + '</tbody></table></div>';
}

/** The layer 2 component list from layer2/catalog.json (D-036): one table, a row per category. */
export function componentsBlock(lang) {
  const catalog = json('layer2/catalog.json');
  const categories = lang === 'ko'
    ? { input: '입력', display: '표시', navigation: '내비게이션', overlay: '오버레이', data: '데이터' }
    : { input: 'Input', display: 'Display', navigation: 'Navigation', overlay: 'Overlay', data: 'Data' };
  const head = lang === 'ko' ? ['이름', 'Tier', '설명', '예시'] : ['Name', 'Tier', 'What it is', 'Example'];
  const dataNote = ' (vfunc-ui-data.js)';
  const rows = [];
  for (const category of catalog.categories) {
    rows.push('<tr><th colspan="4" scope="colgroup">' + esc(categories[category]) + '</th></tr>');
    for (const c of catalog.components.filter((x) => x.category === category)) {
      rows.push('<tr><td>' + c.names.map((n) => '<code>' + esc(n) + '</code>').join('<br>') + '</td><td>' + esc(c.tier) + '</td><td>' +
        esc(c.summary[lang]) + (c.file === 'data' ? '<span class="muted">' + esc(dataNote) + '</span>' : '') + '</td><td><code>' +
        esc(c.example) + '</code></td></tr>');
    }
  }
  return '<div class="table"><table><thead><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.join('') + '</tbody></table></div>';
}

function demoBlock(lang) {
  return '<div class="demo" id="home-demo" data-state="static"><p class="muted">' +
    (lang === 'ko' ? '이 데모는 JavaScript가 켜져 있을 때 동작합니다.' : 'This demo runs with JavaScript enabled.') + '</p></div>';
}

// ---- pages --------------------------------------------------------------------------------------

function navHtml(pages, lang, current, titles, t) {
  const groups = [];
  for (const page of pages) {
    let group = groups.find((g) => g.name === page.group);
    if (!group) groups.push(group = { name: page.group, items: [] });
    group.items.push(page);
  }
  return groups.map((g) => '      <p class="sidenav__group">' + esc(t.groups[g.name]) + '</p>\n      <ul class="sidenav__list">' +
    g.items.map((p) => '<li><a class="sidenav__link" href="./' + p.slug + '.html"' + (p.slug === current ? ' aria-current="page"' : '') +
      '>' + esc((p.nav && p.nav[lang]) || titles[p.slug]) + '</a></li>').join('') + '</ul>').join('\n');
}

function tocHtml(headings, t) {
  const items = headings.filter((h) => h.level === 2);
  if (!items.length) return '';
  return '      <p class="toc__title">' + esc(t.onThisPage) + '</p>\n      <ul class="toc__list">' +
    items.map((h) => '<li><a href="#' + esc(h.id) + '">' + esc(h.text.replace(/`/g, '')) + '</a></li>').join('') + '</ul>';
}

function fill(template, values) {
  return template.replace(/\{\{([a-zA-Z]+)\}\}/g, (all, key) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) throw new Error('site: template value missing: ' + key);
    return values[key];
  });
}

export function buildSite(outDir) {
  const out = outDir || join(ROOT, 'build/out/site');
  const config = json('site/pages.json');
  const texts = json('site/i18n.json');
  const version = json('package.json').version;
  const template = read('site/templates/page.html');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const report = { pages: [], search: {} };
  for (const lang of config.languages) {
    const t = texts[lang];
    const other = config.languages.find((l) => l !== lang);
    const sources = {};
    const titles = {};
    for (const page of config.pages) {
      const file = 'site/content/' + lang + '/' + page.slug + '.md';
      if (!existsSync(join(ROOT, file))) throw new Error('site: missing ' + file);
      // @VERSION@ in the text becomes the package version (exact versions in every example).
      sources[page.slug] = read(file).replace(/@VERSION@/g, version);
      titles[page.slug] = (/^# (.+)$/m.exec(sources[page.slug]) || [])[1] || page.slug;
    }
    const blocks = {
      install: installBlock(lang, version, t),
      examples: examplesBlock(lang),
      prompts: promptsBlock(lang, t),
      licenses: licensesBlock(lang),
      eval: evalBlock(lang),
      components: componentsBlock(lang),
      demo: demoBlock(lang)
    };
    const search = [];
    mkdirSync(join(out, lang), { recursive: true });
    for (const page of config.pages) {
      const doc = markdown(sources[page.slug], {
        blocks: blocks,
        copyLabel: t.copy,
        link: (href) => href.replace(/^([\w-]+)\.md(#.*)?$/, './$1.html$2')
      });
      const firstPara = (/<p>([\s\S]*?)<\/p>/.exec(doc.html) || [])[1] || '';
      const description = firstPara.replace(/<[^>]+>/g, '').slice(0, 160);
      const html = fill(template, {
        lang: lang,
        otherLang: other,
        otherHref: '../' + other + '/' + page.slug + '.html',
        other: esc(texts[other].lang),
        root: '../',
        title: esc(doc.title || titles[page.slug]),
        description: description,
        copiedLabel: esc(t.copied),
        skip: esc(t.skip),
        search: esc(t.search),
        searchPlaceholder: esc(t.searchPlaceholder),
        source: esc(t.source),
        theme: esc(t.theme),
        menu: esc(t.menu),
        onThisPage: esc(t.onThisPage),
        nav: navHtml(config.pages, lang, page.slug, titles, t),
        content: doc.html,
        toc: tocHtml(doc.headings, t),
        footer: esc(t.footer),
        version: esc(version)
      });
      writeFileSync(join(out, lang, page.slug + '.html'), html);
      report.pages.push(lang + '/' + page.slug + '.html');
      search.push({ url: page.slug + '.html', title: titles[page.slug], headings: doc.headings.filter((h) => h.level <= 3).map((h) => ({ id: h.id, text: h.text.replace(/`/g, '') })) });
    }
    mkdirSync(join(out, 'assets'), { recursive: true });
    writeFileSync(join(out, 'assets', 'search-' + lang + '.json'), JSON.stringify({ noResults: t.noResults, pages: search }) + '\n');
    report.search[lang] = search.length;
  }

  // Language chooser at the root (no inline script: CSP). / 루트는 언어 선택
  const chooser = fill(read('site/templates/root.html'), { version: esc(version) });
  writeFileSync(join(out, 'index.html'), chooser);
  writeFileSync(join(out, '404.html'), fill(read('site/templates/404.html'), { version: esc(version) }));

  // Assets, the files the islands and examples need, and the AI references at the root.
  copyDir(join(SITE, 'assets'), join(out, 'assets'));
  for (const file of ['vfunc.esm.min.js', 'vfunc.esm.min.js.map']) {
    mkdirSync(join(out, 'lib'), { recursive: true });
    copyFileSync(join(ROOT, 'layer1/dist', file), join(out, 'lib', file));
  }
  copyDir(join(ROOT, 'layer1/dist'), join(out, 'layer1/dist'));
  copyDir(join(ROOT, 'layer1/css'), join(out, 'layer1/css'));
  copyDir(join(ROOT, 'layer1/examples'), join(out, 'layer1/examples'));
  // Layer 2: the built files and the examples with their relative paths (gallery, D-036).
  copyDir(join(ROOT, 'layer2/dist'), join(out, 'layer2/dist'));
  copyDir(join(ROOT, 'layer2/examples'), join(out, 'layer2/examples'));
  // The evaluation set is repository tooling: the site shows its results table only (D-024).
  copyDir(join(ROOT, 'layer1/ai'), join(out, 'ai'), (name, path) => name === 'eval' && dirname(path) === join(ROOT, 'layer1/ai'));
  // The layer 2 kit joins the same language folders, as in the npm package (D-034 9).
  copyDir(join(ROOT, 'layer2/ai'), join(out, 'ai'));
  for (const file of ['llms.txt', 'llms.ko.txt', 'llms-full.txt']) copyFileSync(join(ROOT, 'layer1/ai', file), join(out, file));
  writeFileSync(join(out, '.nojekyll'), '');
  return { out: out, pages: report.pages, version: version };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const i = process.argv.indexOf('--out');
  try {
    const result = buildSite(i > 0 ? process.argv[i + 1] : undefined);
    console.log('site: ' + result.pages.length + ' pages → ' + relative(ROOT, result.out) + ' (v' + result.version + ')');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
