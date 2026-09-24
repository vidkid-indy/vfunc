// SPDX-License-Identifier: Apache-2.0
//
// The website in Chromium (npm run test:examples): every page of both languages opens with no
// console problem and a CSP, every internal link and anchor resolves, and the islands work.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer } from './serve.mjs';
import { buildSite } from '../../../build/site.mjs';

const config = JSON.parse(readFileSync(fileURLToPath(new URL('../../../site/pages.json', import.meta.url)), 'utf8'));

let browser;
let server;
let dir;

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'vf-site-'));
  buildSite(dir);
  server = await startServer(dir);
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

async function open(path, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  await page.goto(server.origin + path);
  return { page, context, problems };
}

test('every page opens cleanly, has a CSP, and every internal link and anchor resolves', async () => {
  const ids = {};       // absolute URL without hash -> Set of ids
  const links = [];     // { from, url }
  for (const lang of config.languages) {
    for (const p of config.pages) {
      const path = '/' + lang + '/' + p.slug + '.html';
      const { page, context, problems } = await open(path);
      try {
        assert.equal(await page.locator('meta[http-equiv="Content-Security-Policy"]').count(), 1, path + ' CSP');
        assert.equal(await page.getAttribute('html', 'lang'), lang);
        assert.equal(await page.locator('.sidenav [aria-current="page"]').count(), 1, path + ' current nav item');
        const external = await page.$$eval('script[src^="http"], link[rel="stylesheet"][href^="http"]', (els) => els.filter((e) => !e.integrity).length);
        assert.equal(external, 0, path + ' CDN files without integrity');
        ids[server.origin + path] = new Set(await page.$$eval('[id]', (els) => els.map((e) => e.id)));
        const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
        for (const url of hrefs) if (url.indexOf(server.origin) === 0) links.push({ from: path, url: url });
        await page.waitForTimeout(30);
        assert.deepEqual(problems, [], path);
      } finally {
        await context.close();
      }
    }
  }
  const broken = [];
  const checked = {};
  const request = (await browser.newContext()).request;
  for (const link of links) {
    const [base, hash] = link.url.split('#');
    if (!checked[base]) checked[base] = (await request.get(base)).status();
    if (checked[base] !== 200) broken.push(link.from + ' → ' + link.url + ' (' + checked[base] + ')');
    else if (hash && ids[base] && !ids[base].has(decodeURIComponent(hash))) broken.push(link.from + ' → ' + link.url + ' (missing anchor)');
  }
  assert.deepEqual(broken, []);
});

test('islands: theme, copy, search, navigation and the home demo', async () => {
  const { page, context, problems } = await open('/en/index.html', { permissions: ['clipboard-read', 'clipboard-write'] });
  try {
    // theme: system → light → dark
    await page.click('#theme-toggle');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
    await page.click('#theme-toggle');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
    await page.reload();
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark', 'remembered before paint');

    // home demo, escaping included
    await page.waitForSelector('#home-demo[data-state="live"]');
    await page.fill('#demo-name', '<b>Kim</b>');
    await page.waitForFunction(() => /Kim/.test(document.querySelector('[data-ref="greeting"]').textContent));
    assert.equal(await page.locator('[data-ref="greeting"] b').count(), 0);
    await page.click('#home-demo [data-action="add"]');
    await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '1');

    // copy button on the install snippet
    const copy = page.locator('[data-copy-root]', { hasText: 'integrity=' }).first().locator('[data-action="copy"]');
    await copy.click();
    await page.waitForFunction(() => document.querySelector('[data-action="copy"][data-state="copied"]'));
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /integrity="sha384-/);

    // search
    await page.fill('[data-ref="query"]', 'router');
    await page.waitForSelector('[data-ref="hit"]');
    assert.ok(await page.locator('[data-ref="hit"][href*="spa.html"]').count() >= 1, 'finds the SPA page');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-ref="hit"]'));
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }

  const mobile = await open('/ko/guide.html', { viewport: { width: 390, height: 800 } });
  try {
    assert.equal(await mobile.page.isVisible('#site-nav'), false, 'menu closed on phones');
    await mobile.page.click('#nav-toggle');
    assert.equal(await mobile.page.isVisible('#site-nav'), true);
    assert.equal(await mobile.page.getAttribute('#nav-toggle', 'aria-expanded'), 'true');
    assert.deepEqual(mobile.problems, []);
  } finally {
    await mobile.context.close();
  }
});

test('the root page sends readers to their language, and pages link to the other language', async () => {
  for (const [locale, lang] of [['ko-KR', 'ko'], ['en-US', 'en']]) {
    const { page, context, problems } = await open('/', { locale: locale });
    try {
      await page.waitForURL('**/' + lang + '/index.html');
      const other = page.locator('[data-ref="other-lang"]');
      assert.match(await other.getAttribute('href'), new RegExp('\\.\\./' + (lang === 'ko' ? 'en' : 'ko') + '/index\\.html$'));
      assert.deepEqual(problems, []);
    } finally {
      await context.close();
    }
  }
});

test('the install snippet uses the package version and the dist SRI', async () => {
  const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../../../package.json', import.meta.url)), 'utf8'));
  const html = readFileSync(join(dir, 'ko', 'getting-started.html'), 'utf8');
  assert.match(html, new RegExp('vfunc@' + pkg.version.replace(/\./g, '\\.') + '/dist/vfunc\\.min\\.js'));
  assert.doesNotMatch(html, /@VERSION@/);
  assert.match(html, /integrity=&quot;sha384-[A-Za-z0-9+/]{64}&quot;/);
});
