// SPDX-License-Identifier: Apache-2.0
// Task 06 — SPA scaffold: hash router, store, en/ko.
import { assert, text, count, waitText, waitCount, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const H1 = '#view h1';
const NAV_HOME = 'a[data-link][href$="#/"]';
const NAV_SERVERS = 'a[data-link][href$="#/servers"]';
const FAV = '[data-action="favorite"]';

const go = (page, hash) => page.evaluate((h) => { location.hash = h; }, hash);

/** The current nav link has aria-current="page"; the other has none or "false". */
async function current(page, home) {
  const state = () => page.evaluate(([a, b]) => [a, b].map((s) => {
    const el = document.querySelector(s);
    return el ? el.getAttribute('aria-current') : '(no link)';
  }), [NAV_HOME, NAV_SERVERS]);
  const ok = (v, on) => (on ? v === 'page' : v === null || v === 'false');
  for (let i = 0; i < 40; i++) {
    const [h, s] = await state();
    if (ok(h, home) && ok(s, !home)) return;
    await page.waitForTimeout(50);
  }
  assert.fail('aria-current of home/servers links: ' + JSON.stringify(await state()) + ', expected ' + (home ? 'home' : 'servers') + ' = "page"');
}

export default [
  {
    name: 'home: title, intro and the current nav link',
    async run(page) {
      await waitText(page, H1, 'Status board');
      assert.ok((await text(page, '#view')).indexOf('Watch your servers in one place.') >= 0, 'home.intro');
      await current(page, true);
      await waitText(page, '[data-ref="fav-count"]', '0');
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
    }
  },
  {
    name: 'a nav link opens the server list and moves the focus to #view',
    async run(page) {
      await waitText(page, H1, 'Status board');
      await page.click(NAV_SERVERS);
      await waitText(page, H1, 'Servers');
      await waitCount(page, '#view [data-id]', 4);
      await current(page, false);
      await expectFocus(page, '#view', 'after navigation');
      assert.match(page.url(), /#\/servers$/);
      await page.click('#view [data-id="s3"] a[data-link]');
      await waitText(page, H1, 'Frankfurt API');
      await current(page, false);
    }
  },
  {
    name: 'server pages open by URL; unknown ids and routes show their messages',
    path: '#/servers/s4',
    async run(page) {
      await waitText(page, H1, 'Oregon batch');
      await go(page, '#/servers/zzz');
      await waitText(page, H1, 'Server not found');
      await go(page, '#/no/such/page');
      await waitText(page, H1, 'Page not found');
      await page.goBack();
      await waitText(page, H1, 'Server not found');
    }
  },
  {
    name: 'favorites are shared state that survives navigation',
    path: '#/servers/s1',
    async run(page) {
      await waitText(page, FAV, 'Add to favorites');
      await waitAttr(page, FAV, 'aria-pressed', 'false');
      await page.click(FAV);
      await waitText(page, FAV, 'Remove from favorites');
      await waitAttr(page, FAV, 'aria-pressed', 'true');
      await waitText(page, '[data-ref="fav-count"]', '1');
      for (const hash of ['#/', '#/servers', '#/servers/s2', '#/', '#/servers/s2']) await go(page, hash);
      await waitText(page, H1, 'Seoul web 2');
      await page.click(FAV);
      await waitText(page, '[data-ref="fav-count"]', '2');
      await page.goBack();
      await waitText(page, H1, 'Status board');
      await page.goForward();
      await waitText(page, FAV, 'Remove from favorites');
      await go(page, '#/servers/s1');
      await waitText(page, FAV, 'Remove from favorites');
      await page.click(FAV);
      await waitText(page, '[data-ref="fav-count"]', '1');
    }
  },
  {
    name: 'switching to Korean translates everything, sets <html lang> and survives a reload',
    async run(page) {
      await waitText(page, H1, 'Status board');
      await page.click('[data-action="locale"][data-locale="ko"]');
      await waitText(page, H1, '상태 보드');
      await waitText(page, NAV_HOME, '홈');
      await waitAttr(page, '[data-action="locale"][data-locale="ko"]', 'aria-pressed', 'true');
      await waitAttr(page, '[data-action="locale"][data-locale="en"]', 'aria-pressed', 'false');
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'ko');
      await page.reload();
      await waitText(page, H1, '상태 보드');
      await page.click(NAV_SERVERS);
      await waitText(page, H1, '서버 목록');
      await go(page, '#/nowhere');
      await waitText(page, H1, '페이지를 찾을 수 없습니다');
    }
  },
  {
    name: 'a language switch keeps the favorites (partial store update)',
    path: '#/servers/s3',
    async run(page) {
      await waitText(page, H1, 'Frankfurt API');
      await page.click(FAV);
      await waitText(page, '[data-ref="fav-count"]', '1');
      await page.click('[data-action="locale"][data-locale="ko"]');
      await waitText(page, FAV, '즐겨찾기에서 빼기');
      await waitText(page, '[data-ref="fav-count"]', '1');
      await page.click('[data-action="locale"][data-locale="en"]');
      await waitText(page, FAV, 'Remove from favorites');
      await waitText(page, '[data-ref="fav-count"]', '1');
      assert.equal(await count(page, FAV), 1);
    }
  }
];
