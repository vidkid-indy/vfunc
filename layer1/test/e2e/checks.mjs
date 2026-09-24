// SPDX-License-Identifier: Apache-2.0
//
// The behaviour each sample must show in a real browser (layer1/test/e2e/examples.e2e.js).
// Selectors use data-action / data-ref / id only, like the samples themselves (rule 21).
// Each entry: { open?: { context }, run(page, env) }. `env.problems` collects console output;
// a check may remove problems it expects on purpose (and must say why).

import assert from 'node:assert/strict';

const text = (page, selector) => page.locator(selector).first().innerText();

export const CHECKS = {
  '01-hello': {
    async run(page, env) {
      assert.equal(await text(page, '[data-ref="greeting"]'), 'Hello, vfunc!');
      await page.fill('#name', '<b>Kim</b>');
      await page.waitForFunction(() => document.querySelector('[data-ref="greeting"]').textContent.indexOf('Kim') >= 0);
      assert.equal(await text(page, '[data-ref="greeting"]'), 'Hello, <b>Kim</b>!', 'escaped, not bold');
      assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'name', 'focus kept');
      const esm = await env.openPage('/layer1/examples/01-hello/esm.html');
      try {
        assert.equal(await text(esm.page, '[data-ref="greeting"]'), 'Hello, vfunc!');
        assert.equal(await esm.page.evaluate(() => typeof window.vf), 'undefined', 'ES module creates no global');
        assert.deepEqual(esm.problems, []);
      } finally {
        await esm.context.close();
      }
    }
  },

  '02-counter': {
    async run(page) {
      const value = () => text(page, '[data-ref="value"]');
      const renders = async () => Number(await text(page, '[data-ref="renders"]'));
      for (let i = 0; i < 3; i++) await page.click('[data-action="inc"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="value"]').textContent === '3');
      await page.click('[data-action="dec"]');
      await page.click('[data-action="dec"]');
      await page.click('[data-action="dec"]');
      await page.click('[data-action="dec"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="value"]').textContent === '-1');
      assert.equal(await page.getAttribute('[data-ref="value"]', 'data-state'), 'negative');
      const before = await renders();
      await page.click('[data-action="add-ten"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="value"]').textContent === '9');
      assert.equal(await renders(), before + 1, 'ten changes, one render');
      await page.click('[data-action="reset"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="value"]').textContent === '0');
      assert.equal(await value(), '0');
    }
  },

  '03-todo': {
    async run(page) {
      const rows = () => page.locator('[data-ref="list"] [data-id]').count();
      assert.equal(await rows(), 2);
      await page.fill('[data-ref="input"]', '<img src=x onerror=alert(1)>');
      await page.press('[data-ref="input"]', 'Enter');
      await page.waitForFunction(() => document.querySelectorAll('[data-ref="list"] [data-id]').length === 3);
      assert.equal(await page.locator('[data-ref="list"] img').count(), 0, 'user text is not markup');
      assert.equal(await text(page, '[data-id="3"] span'), '<img src=x onerror=alert(1)>', 'shown as text');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-ref')), 'input', 'ready for the next item');
      await page.check('#todo-2');
      await page.waitForFunction(() => document.querySelector('[data-id="2"]').getAttribute('data-state') === 'done');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'todo-2', 'focus stays on the checkbox');
      await page.click('[data-id="1"] [data-action="remove"]');
      await page.waitForFunction(() => document.querySelectorAll('[data-ref="list"] [data-id]').length === 2);
      assert.equal(await text(page, '[data-ref="left"]'), '1');
    }
  },

  '04-methods-refs': {
    async run(page) {
      await page.click('[data-action="add-sample"]');
      await page.click('[data-action="add-sample"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '2');
      await page.click('[data-action="focus"]');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-ref')), 'input');
      await page.keyboard.type('typed note');
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '3');
      await page.click('[data-action="clear"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '0');
    }
  },

  '05-composition': {
    async run(page) {
      const firstInc = page.locator('#main [data-action="inc"]').first();
      await firstInc.click();
      await firstInc.click();
      await page.waitForFunction(() => document.querySelector('#main [data-ref="value"]').textContent === '2');
      await page.click('[data-action="rename"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="title"]').textContent === 'Overview');
      assert.equal(await text(page, '#main [data-ref="value"]'), '2', 'child state survives the parent render');
      assert.equal(await page.locator('#main .card').count(), 2, 'no duplicated children');
      await page.locator('#main [data-action="inc"]').first().click();
      await page.waitForFunction(() => document.querySelector('#main [data-ref="value"]').textContent === '3');
      await page.click('[data-action="collapse"]');
      await page.waitForFunction(() => document.querySelector('.layout').getAttribute('data-state') === 'collapsed');
      assert.equal(await page.locator('#side nav').count(), 1, 'menu child moved into the new side slot');
    }
  },

  '06-attach-published-html': {
    async run(page) {
      const staticText = await text(page, '.banner');
      await page.fill('#q', 'keyboard');
      await page.click('#product-search button[type="submit"]');
      await page.waitForFunction(() => document.querySelectorAll('[data-ref="grid"] li').length === 2);
      assert.match(await text(page, '[data-ref="summary"]'), /^2/);
      assert.equal(await page.inputValue('#q'), 'keyboard', 'the adopted form keeps its value');
      await page.selectOption('#category', 'display');
      await page.fill('#q', '');
      await page.press('#q', 'Enter');
      await page.waitForFunction(() => document.querySelectorAll('[data-ref="grid"] li').length === 2);
      assert.match(await text(page, '[data-ref="grid"]'), /monitor/);
      await page.fill('#q', 'zzz');
      await page.press('#q', 'Enter');
      await page.waitForSelector('[data-ref="empty"]');
      assert.equal(await text(page, '.banner'), staticText, 'the rest of the page is untouched');
    }
  },

  '07-form': {
    async run(page) {
      await page.click('#signup button[type="submit"]');
      assert.equal(await page.getAttribute('#email', 'aria-invalid'), 'true');
      assert.match(await text(page, '[data-ref="error-password"]'), /8/);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'name', 'focus goes to the first error');
      await page.fill('#name', 'Kim');
      await page.fill('#email', 'kim@example.com');
      await page.fill('#password', 'correct-horse');
      await page.selectOption('#plan', 'pro');
      await page.check('#agree');
      await page.click('#signup button[type="submit"]');
      assert.equal(await page.getAttribute('[data-ref="result"]', 'data-state'), 'success');
      assert.match(await text(page, '[data-ref="result"]'), /Kim \(pro\)/);
      assert.doesNotMatch(await text(page, '[data-ref="result"]'), /correct-horse/, 'no password on screen');
      assert.equal(await page.getAttribute('#email', 'aria-invalid'), 'false');
      await page.click('[data-action="reset"]');
      assert.equal(await page.inputValue('#name'), '');
      assert.equal(await page.inputValue('#plan'), 'free', 'back to user-default');
      assert.equal(await page.inputValue('#source'), 'example-07', 'hidden input kept');
      assert.equal(await page.isChecked('#agree'), false);
    }
  },

  '08-fetch-list': {
    async run(page, env) {
      await page.click('[data-action="load"]');
      await page.waitForSelector('[data-ref="status"][role="status"]');
      await page.waitForSelector('[data-ref="list"]');
      assert.equal(await page.locator('[data-ref="list"] [data-id]').count(), 4);
      assert.equal(await page.locator('[data-ref="list"] script').count(), 0, 'server text is escaped');
      await page.click('[data-action="load-broken"]');
      await page.waitForSelector('[role="alert"]');
      await page.click('[role="alert"] [data-action="load"]');
      await page.waitForSelector('[data-ref="list"]');
      await page.click('[data-action="load-empty"]');
      await page.waitForFunction(() => /No users/.test(document.querySelector('[data-ref="status"]').textContent));
      await page.click('[data-action="crash"]');
      await page.waitForFunction(() => !document.querySelector('[data-ref="recovered"]').hidden);
      // Expected: the engine reports the render error it was asked to throw. / 일부러 낸 렌더 오류
      const expected = env.problems.filter((p) => /render crashed on purpose/.test(p));
      assert.equal(expected.length, 1, 'the engine reports the render error once');
      env.problems.splice(0, env.problems.length, ...env.problems.filter((p) => expected.indexOf(p) < 0));
    }
  },

  '09-spa-hash-router': {
    async run(page) {
      const heading = () => text(page, '#view [data-ref="heading"]');
      assert.equal(await heading(), 'Home');
      await page.click('#tabs [href="#/users/2?tab=posts"]');
      await page.waitForFunction(() => location.hash === '#/users/2?tab=posts');
      assert.equal(await heading(), 'Lee Jiwoo');
      assert.equal(await page.locator('#view [data-ref="posts"] li').count(), 1);
      assert.equal(await page.getAttribute('#tabs [href="#/users/2?tab=posts"]', 'aria-current'), 'page');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'view', 'focus moved to the page');
      await page.click('#tabs [href="#/nowhere"]');
      await page.waitForFunction(() => /Not found/.test(document.querySelector('#view [data-ref="heading"]').textContent));
      await page.goBack();
      await page.waitForFunction(() => location.hash === '#/users/2?tab=posts');
      assert.equal(await heading(), 'Lee Jiwoo');
      await page.click('#tabs [href="#/about"]');
      await page.waitForFunction(() => document.querySelector('#route').textContent === '/about');
    }
  },

  '10-spa-app': {
    async run(page) {
      const heading = () => text(page, '#view [data-ref="heading"]');
      assert.match(await heading(), /Welcome/);
      await page.click('#view [data-link][href="#/products"]');
      await page.waitForSelector('#view [data-ref="list"] [data-id]');
      await page.click('#view [data-id="ms-02"] [data-action="add"]');
      await page.click('#view [data-id="ms-02"] [data-action="add"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '2');
      await page.click('#view [data-id="kb-01"] a[data-link]');
      await page.waitForFunction(() => /keyboard/i.test(document.querySelector('#view [data-ref="heading"]').textContent));
      await page.click('#view [data-action="add"]');
      await page.waitForSelector('#view [data-ref="added"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '3');
      await page.click('#top [href="#/cart"]');
      await page.waitForSelector('#view [data-ref="list"]');
      assert.equal(await page.getAttribute('#top [href="#/cart"]', 'aria-current'), 'page');
      assert.equal(await page.locator('#view [data-ref="list"] [data-id]').count(), 2);
      await page.click('#view [data-id="ms-02"] [data-action="remove"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '1');
      assert.equal(await page.locator('#view [data-ref="list"] [data-id]').count(), 1, 'the cart page follows the store');
      await page.evaluate(() => { location.hash = '#/nope'; });
      await page.waitForFunction(() => /Not found/.test(document.querySelector('#view [data-ref="heading"]').textContent));
    }
  },

  '11-css-tokens-theme': {
    async run(page, env) {
      const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const light = await bg();
      await page.check('#theme-dark');
      assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
      assert.equal(await bg(), 'rgb(15, 23, 42)', 'dark --vf-color-bg');
      assert.notEqual(light, await bg());
      await page.reload();
      assert.equal(await page.getAttribute('html', 'data-theme'), 'dark', 'the choice is remembered before paint');
      assert.equal(await page.isChecked('#theme-dark'), true);
      await page.check('#theme-system');
      assert.equal(await page.getAttribute('html', 'data-theme'), null);
      // With the OS in dark mode, "system" follows it. / OS가 다크면 system이 따라갑니다.
      const os = await env.openPage('/layer1/examples/11-css-tokens-theme/', { context: { colorScheme: 'dark' } });
      try {
        assert.equal(await os.page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(15, 23, 42)');
        assert.deepEqual(os.problems, []);
      } finally {
        await os.context.close();
      }
    }
  },

  '16-legacy-ie': {
    async run(page) {
      assert.match(await text(page, '#env'), /^vfunc \d+\.\d+\.\d+/);
      assert.equal(await page.locator('#view [data-id]').count(), 2);
      assert.equal(await page.locator('#view b').count(), 0, 'vf.tpl escapes the task text');
      await page.fill('#view [data-ref="input"]', 'Written in ES5');
      await page.press('#view [data-ref="input"]', 'Enter');
      await page.waitForFunction(() => document.querySelectorAll('#view [data-id]').length === 3);
      await page.click('#task-1');
      await page.waitForFunction(() => document.querySelector('[data-id="1"]').getAttribute('data-state') === 'done');
      assert.match(await text(page, '#view [data-ref="left"]'), /^2/);
      await page.click('#nav [href="#/about"]');
      await page.waitForSelector('#view [data-ref="heading"]');
      assert.equal(await page.getAttribute('#nav [href="#/about"]', 'aria-current'), 'page');
    }
  },

  '17-i18n': {
    open: { context: { locale: 'en-US' } }, // the browser language decides the first locale / 첫 로케일은 브라우저 언어
    async run(page) {
      await page.waitForSelector('#cart [data-ref="items"]');
      assert.equal(await text(page, 'h1'), '17 i18n');
      assert.equal(await text(page, '#cart [data-ref="items"]'), 'Your cart is empty.');
      await page.click('[data-action="add"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="items"]').textContent === '1 item in your cart');
      await page.click('[data-action="add"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="items"]').textContent === '2 items in your cart');
      await page.click('[data-locale="ko"]');
      await page.waitForFunction(() => document.documentElement.lang === 'ko');
      assert.equal(await text(page, 'h1'), '17 다국어');
      assert.equal(await text(page, '#cart [data-ref="items"]'), '장바구니에 2개');
      assert.equal(await page.getAttribute('#search', 'placeholder'), '상품 검색');
      assert.equal(await page.getAttribute('[data-locale="ko"]', 'aria-pressed'), 'true');
      assert.match(await text(page, '#cart [data-ref="total"]'), /25,800/);
      await page.reload();
      await page.waitForSelector('#cart [data-ref="items"]');
      assert.equal(await text(page, 'h1'), '17 다국어', 'the locale is remembered');
    }
  },

  '12-with-bootstrap': {
    async run(page) {
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('[data-action="subscribe"]')).borderRadius !== '0px'), true, 'Bootstrap CSS loaded');
      await page.fill('#email', 'nope');
      await page.click('[data-action="subscribe"]');
      assert.equal(await page.getAttribute('#email', 'aria-invalid'), 'true');
      assert.match(await text(page, '[data-ref="error"]'), /valid email/);
      await page.fill('#email', 'kim@example.com');
      await page.click('[data-action="subscribe"]');
      assert.equal(await page.isVisible('[data-ref="done"]'), true);
      assert.equal(await page.locator('#tasks [data-id]').count(), 2);
      await page.click('[data-action="filter"][data-filter="open"]');
      await page.waitForFunction(() => document.querySelectorAll('#tasks [data-id]').length === 1);
      await page.click('#task-2'); // the row leaves the "open" view, so click (not check) / 필터에서 사라지므로 click
      await page.waitForFunction(() => document.querySelectorAll('#tasks [data-id]').length === 0);
      await page.click('[data-action="filter"][data-filter="done"]');
      await page.waitForFunction(() => document.querySelectorAll('#tasks [data-id]').length === 2);
    }
  },

  '13-with-tailwind': {
    async run(page) {
      // Tailwind builds its CSS asynchronously in the browser. / Tailwind는 브라우저에서 비동기로 CSS를 만듭니다.
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-action="view"][aria-pressed="true"]')).backgroundColor !== 'rgba(0, 0, 0, 0)');
      const pressedBg = await page.evaluate(() => getComputedStyle(document.querySelector('[data-action="view"][aria-pressed="true"]')).backgroundColor);
      assert.equal(pressedBg, 'rgb(37, 99, 235)', 'aria-pressed:bg-primary reads --vf-color-primary');
      await page.check('#habit-2');
      await page.waitForFunction(() => document.querySelector('[data-id="2"]').getAttribute('data-state') === 'done');
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-id="2"] label')).textDecorationLine === 'line-through');
      await page.click('[data-action="view"][data-view="open"]');
      await page.waitForFunction(() => document.querySelectorAll('[data-ref="list"] [data-id]').length === 1);
      assert.match(await text(page, '[data-ref="summary"]'), /^2 \/ 3/);
    }
  },

  '15-with-chartjs': {
    async run(page) {
      await page.waitForFunction(() => window.Chart && window.Chart.getChart(document.querySelector('[data-ref="canvas"]')));
      // Mark the canvas to prove it is the same element after renders. / 렌더 뒤에도 같은 요소인지 표시
      await page.evaluate(() => { document.querySelector('[data-ref="canvas"]').__marker = 'kept'; });
      const points = () => page.evaluate(() => window.Chart.getChart(document.querySelector('[data-ref="canvas"]')).data.datasets[0].data.length);
      assert.equal(await points(), 6);
      await page.click('[data-action="add"]');
      await page.waitForFunction(() => /7 months/.test(document.querySelector('[data-ref="summary"]').textContent));
      assert.equal(await points(), 7);
      await page.click('[data-action="metric"][data-metric="orders"]');
      await page.waitForFunction(() => /Orders/.test(document.querySelector('[data-ref="summary"]').textContent));
      assert.equal(await page.evaluate(() => document.querySelector('[data-ref="canvas"]').__marker), 'kept', 'data-vf-keep kept the canvas');
      assert.equal(await page.getAttribute('[data-ref="canvas"]', 'aria-label'), 'Orders / 주문 chart');
      assert.equal(await page.evaluate(() => window.Chart.getChart(document.querySelector('[data-ref="canvas"]')).data.datasets[0].label), 'Orders / 주문');
      assert.equal(await page.evaluate(() => window.Chart.getChart(document.querySelector('[data-ref="canvas"]')).data.datasets[0].borderColor), '#2563eb', 'color from --vf-chart-1');
    }
  },

  '18-extend-plugin': {
    async run(page) {
      await page.waitForSelector('[data-action="saved"]');
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('[data-action="saved"]')).backgroundColor), 'rgb(124, 58, 237)', 'brand.css overrides the token');
      await page.click('[data-action="saved"]');
      await page.waitForSelector('[data-ref="toasts"] [data-state="success"]');
      assert.equal(await text(page, '[data-ref="toasts"] [data-state="success"] span'), 'Your changes are saved.', 'the app overrides the plugin message');
      await page.click('[data-action="custom"]');
      await page.waitForSelector('[data-ref="toasts"] [data-state="info"]');
      assert.equal(await page.locator('[data-ref="toasts"] b').count(), 0, 'toast text is escaped');
      await page.click('[data-ref="toasts"] [data-state="info"] [data-action="close-toast"]');
      assert.equal(await page.locator('[data-ref="toasts"] [data-state="info"]').count(), 0);
      assert.match(await text(page, '[data-ref="readonly"]'), /TypeError/);
      assert.match(await text(page, '[data-ref="strict"]'), /Error with vf.config/);
      assert.match(await text(page, '[data-ref="ext"]'), /company/);
    }
  },

  '19-design-apply': {
    async run(page, env) {
      const results = [];
      for (const skin of ['', '?skin=a', '?skin=b']) {
        const view = skin ? await env.openPage('/layer1/examples/19-design-apply/' + skin) : { page: page, problems: [], context: null };
        try {
          await view.page.click('[data-action="follow"]');
          await view.page.click('[data-action="post"]');
          await view.page.waitForFunction(() => document.querySelectorAll('[data-ref="feed"] li').length === 3);
          results.push({
            skin: skin || 'neutral',
            dom: await view.page.evaluate(() => document.getElementById('app').innerHTML),
            color: await view.page.evaluate(() => getComputedStyle(document.querySelector('[data-action="follow"]')).backgroundColor),
            bg: await view.page.evaluate(() => getComputedStyle(document.body).backgroundColor),
            current: await view.page.getAttribute('[aria-current="page"]', 'data-skin')
          });
          assert.deepEqual(view.problems, [], skin);
        } finally {
          if (view.context) await view.context.close();
        }
      }
      assert.equal(results[1].dom, results[0].dom, 'skin A renders the same DOM');
      assert.equal(results[2].dom, results[0].dom, 'skin B renders the same DOM');
      assert.equal(new Set(results.map((r) => r.bg)).size, 3, 'three different looks');
      assert.deepEqual(results.map((r) => r.current), ['neutral', 'a', 'b']);
    }
  },

  '20-merge-published': {
    async run(page, env) {
      async function scenario(p) {
        await p.click('#inc-kb');
        await p.waitForFunction(() => document.querySelector('[data-ref="qty-kb"]').textContent === '2');
        assert.equal(await p.evaluate(() => document.activeElement.id), 'inc-kb', 'focus stays on the button');
        await p.click('#dec-ms');
        await p.click('#dec-ms');
        await p.waitForFunction(() => !document.querySelector('[data-id="ms"]'));
        await p.fill('[data-ref="coupon"]', 'nope');
        await p.press('[data-ref="coupon"]', 'Enter');
        await p.waitForFunction(() => /Unknown/.test(document.querySelector('[data-ref="message"]').textContent));
        await p.fill('[data-ref="coupon"]', 'welcome10');
        await p.press('[data-ref="coupon"]', 'Enter');
        await p.waitForFunction(() => /applied/.test(document.querySelector('[data-ref="message"]').textContent));
        return p.locator('[data-ref="total"]').innerText();
      }
      const after = await scenario(page);
      const before = await env.openPage('/layer1/examples/20-merge-published/before.html');
      const source = await env.openPage('/layer1/examples/20-merge-published/published/order.html');
      try {
        assert.equal(await scenario(before.page), after, 'same logic, same result');
        assert.match(after, /106,200/);
        assert.deepEqual(before.problems, []);
        assert.deepEqual(source.problems, []);
      } finally {
        await before.context.close();
        await source.context.close();
      }
    }
  },

  '21-cache-update': {
    async run(page, env) {
      const path = '/layer1/examples/21-cache-update/version.json';
      const serve = (version) => { env.server.overrides[path] = { body: JSON.stringify({ version: version }) }; };
      try {
        serve('1.0.0');
        await page.reload();
        await page.waitForFunction(() => document.querySelector('[data-ref="latest"]').textContent === '1.0.0');
        assert.equal(await text(page, '[data-ref="policy"]'), 'next-navigation');
        serve('1.0.1');  // a new release is deployed / 새 버전 배포
        await page.click('[data-action="check"]');
        await page.waitForFunction(() => document.querySelector('[data-ref="state"]').getAttribute('data-state') === 'pending');
        await page.evaluate(() => { window.__beforeUpdate = true; });
        const reloaded = page.waitForEvent('load');
        await page.click('#nav [href="#/settings"]');
        await reloaded;
        assert.equal(await page.evaluate(() => window.__beforeUpdate), undefined, 'the page was replaced on navigation');

        // prompt: the app's toast, then apply() / prompt 정책: 앱의 토스트 → 적용
        serve('1.0.0');
        const prompt = await env.openPage('/layer1/examples/21-cache-update/?policy=prompt');
        try {
          await prompt.page.waitForFunction(() => document.querySelector('[data-ref="latest"]').textContent === '1.0.0');
          serve('1.0.2');
          await prompt.page.click('[data-action="check"]');
          await prompt.page.waitForSelector('[data-ref="box"]');
          assert.match(await prompt.page.locator('[data-ref="box"]').innerText(), /1\.0\.2/);
          await prompt.page.click('#nav [href="#/settings"]');
          await prompt.page.waitForSelector('[data-ref="heading"]');
          assert.equal(await prompt.page.locator('[data-ref="box"]').count(), 1, 'prompt does not reload on navigation');
          const replaced = prompt.page.waitForEvent('load');
          await prompt.page.click('[data-action="apply"]');
          await replaced;
          assert.deepEqual(prompt.problems, []);
        } finally {
          await prompt.context.close();
        }
      } finally {
        delete env.server.overrides[path];
      }
    }
  }
};
