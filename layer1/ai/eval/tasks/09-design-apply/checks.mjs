// SPDX-License-Identifier: Apache-2.0
// Task 09 — apply the "Pine" DESIGN.md with tokens and CSS only (app.js must not change).
import { assert, count, waitText, waitAttr } from '../../tools/helpers.mjs';

const SAVE = '[data-action="save"]';
const TOGGLE = '[data-action="notify"]';

/** Computed styles of the parts the design talks about. */
const styles = (page) => page.evaluate(() => {
  const cs = (s) => getComputedStyle(document.querySelector(s));
  const probe = document.createElement('div');
  probe.style.boxShadow = 'var(--vf-shadow-2)';
  document.body.appendChild(probe);
  const shadow2 = getComputedStyle(probe).boxShadow;
  probe.remove();
  const body = cs('body');
  const save = cs('[data-action="save"]');
  const toggle = cs('[data-action="notify"]');
  const card = cs('#settings');
  return {
    bg: body.backgroundColor,
    text: body.color,
    font: body.fontFamily,
    saveBg: save.backgroundColor,
    saveText: save.color,
    saveRadius: save.borderTopLeftRadius,
    toggleBg: toggle.backgroundColor,
    toggleRadius: toggle.borderTopLeftRadius,
    cardBg: card.backgroundColor,
    cardRadius: card.borderTopLeftRadius,
    cardShadow: card.boxShadow,
    cardPadding: card.paddingTop,
    shadow2: shadow2
  };
});

function expectLight(s) {
  assert.equal(s.bg, 'rgb(246, 247, 244)', 'body background = --vf-color-bg');
  assert.equal(s.text, 'rgb(28, 37, 33)', 'body text = --vf-color-text');
  assert.match(s.font, /^"?Source Sans 3"?,/, 'body font = --vf-font-body');
  assert.equal(s.saveBg, 'rgb(15, 118, 110)', 'primary button = --vf-color-primary');
  assert.equal(s.saveText, 'rgb(255, 255, 255)', 'primary button text = --vf-color-on-primary');
  assert.equal(s.cardBg, 'rgb(255, 255, 255)', 'card = --vf-color-surface');
}

function expectDark(s, where) {
  assert.equal(s.bg, 'rgb(12, 20, 17)', where + ': body background');
  assert.equal(s.text, 'rgb(230, 237, 233)', where + ': body text');
  assert.equal(s.saveBg, 'rgb(45, 212, 191)', where + ': primary button');
  assert.equal(s.saveText, 'rgb(4, 47, 46)', where + ': primary button text');
  assert.equal(s.cardBg, 'rgb(21, 32, 27)', where + ': card');
}

export default [
  {
    name: 'the app still works (toggle, save, cancel)',
    async run(page) {
      await waitAttr(page, TOGGLE, 'aria-pressed', 'true');
      await page.click(TOGGLE);
      await waitAttr(page, TOGGLE, 'aria-pressed', 'false');
      await page.click(SAVE);
      await waitText(page, '[data-ref="notice"]', 'Saved.');
      await page.click('[data-action="cancel"]');
      await waitAttr(page, TOGGLE, 'aria-pressed', 'true');
      assert.equal(await count(page, '[data-ref="notice"]'), 0);
    }
  },
  {
    name: 'light theme: colors and font of the design',
    context: { colorScheme: 'light' },
    async run(page) {
      await page.waitForSelector(SAVE);
      expectLight(await styles(page));
    }
  },
  {
    name: 'component rules: pill buttons and toggle, raised card, card padding',
    context: { colorScheme: 'light' },
    async run(page) {
      await page.waitForSelector(SAVE);
      const s = await styles(page);
      assert.equal(s.saveRadius, '9999px', 'buttons are pills');
      assert.equal(s.toggleRadius, '9999px', 'the toggle is a pill');
      assert.equal(s.cardRadius, '16px', 'card corners = --vf-radius-lg');
      assert.equal(s.cardShadow, s.shadow2, 'card shadow = --vf-shadow-2');
      assert.equal(s.cardPadding, '24px', 'card padding = --vf-space-5');
    }
  },
  {
    name: 'states use tokens: pressed toggle, hover, success notice',
    context: { colorScheme: 'light' },
    async run(page) {
      await waitAttr(page, TOGGLE, 'aria-pressed', 'true');
      assert.equal((await styles(page)).toggleBg, 'rgb(15, 118, 110)', 'pressed toggle = --vf-color-primary');
      await page.hover(SAVE);
      await page.waitForTimeout(400);
      assert.equal(await page.$eval(SAVE, (el) => getComputedStyle(el).backgroundColor), 'rgb(17, 94, 89)', 'hover = --vf-color-primary-hover');
      await page.click(SAVE);
      await waitText(page, '[data-ref="notice"]', 'Saved.');
      const notice = await page.$eval('[data-ref="notice"]', (el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
      assert.deepEqual(notice, ['rgb(231, 246, 238)', 'rgb(31, 111, 67)'], 'notice = success-soft / success-text');
    }
  },
  {
    name: 'OS dark theme uses the dark tokens',
    context: { colorScheme: 'dark' },
    async run(page) {
      await page.waitForSelector(SAVE);
      expectDark(await styles(page), 'prefers-color-scheme: dark');
    }
  },
  {
    name: 'data-theme="dark" uses the same dark tokens; data-theme="light" wins over the OS',
    context: { colorScheme: 'light' },
    async run(page) {
      await page.waitForSelector(SAVE);
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      expectDark(await styles(page), 'data-theme="dark"');
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      expectLight(await styles(page));
    }
  }
];
