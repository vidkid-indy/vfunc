// SPDX-License-Identifier: Apache-2.0
// Task 04 — sign-up form validation.
import { assert, count, visible, waitText, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const MSG = {
  email: 'Enter a valid email address.',
  password: 'Use at least 8 characters, including a number.',
  confirm: 'Passwords do not match.',
  terms: 'Accept the terms to continue.'
};

async function blur(page, id) {
  await page.focus('#' + id);
  await page.$eval('#' + id, (el) => el.blur());
}

async function invalid(page, id, yes) {
  await waitAttr(page, '#' + id, 'aria-invalid', yes ? 'true' : 'false');
  await waitText(page, '#' + id + '-error', yes ? MSG[id] : '');
}

const submit = (page) => page.getByRole('button', { name: 'Sign up' }).click();

export default [
  {
    name: 'an empty email shows its message on blur (aria-invalid, aria-describedby)',
    async run(page) {
      const before = await page.getAttribute('#email', 'aria-invalid');
      assert.ok(before === null || before === 'false', 'no aria-invalid="true" before validation');
      await blur(page, 'email');
      await invalid(page, 'email', true);
      const describedby = (await page.getAttribute('#email', 'aria-describedby')) || '';
      assert.ok(describedby.split(/\s+/).indexOf('email-error') >= 0, 'aria-describedby contains email-error');
    }
  },
  {
    name: 'a field with an error is checked again while typing',
    async run(page) {
      await page.fill('#email', 'kim@');
      await blur(page, 'email');
      await invalid(page, 'email', true);
      await page.click('#email');
      await page.keyboard.type('example.com');
      await invalid(page, 'email', false);
      await expectFocus(page, '#email', 'typing');
    }
  },
  {
    name: 'submitting an empty form shows every message and focuses the email',
    async run(page) {
      await submit(page);
      for (const id of ['email', 'password', 'confirm', 'terms']) await invalid(page, id, true);
      await expectFocus(page, '#email', 'first invalid field');
      assert.equal(await visible(page, '#signup'), 1, 'the form stays');
    }
  },
  {
    name: 'password needs 8 characters and a digit',
    async run(page) {
      await page.fill('#password', 'abcdefgh');
      await blur(page, 'password');
      await invalid(page, 'password', true);
      await page.fill('#password', 'abc1');
      await page.dispatchEvent('#password', 'input');
      await invalid(page, 'password', true);
      await page.fill('#password', 'abcdefg1');
      await page.dispatchEvent('#password', 'input');
      await invalid(page, 'password', false);
    }
  },
  {
    name: 'confirm must match the password; terms must be checked',
    async run(page) {
      await page.fill('#password', 'secret123');
      await page.fill('#confirm', 'secret12');
      await blur(page, 'confirm');
      await invalid(page, 'confirm', true);
      await page.fill('#confirm', 'secret123');
      await page.dispatchEvent('#confirm', 'input');
      await invalid(page, 'confirm', false);
      await page.fill('#email', 'kim@example.com');
      await submit(page);
      await invalid(page, 'terms', true);
      await expectFocus(page, '#terms', 'terms is the first invalid field');
      await page.check('#terms');
      await invalid(page, 'terms', false);
    }
  },
  {
    name: 'a valid submit hides the form and welcomes; the password is never shown or logged',
    async run(page) {
      const logged = [];
      page.on('console', (msg) => logged.push(msg.text()));
      const password = 'Tiger2026pw';
      await page.fill('#email', '  <i>me</i>@example.com ');
      await page.fill('#password', password);
      await page.fill('#confirm', password);
      await page.check('#terms');
      await submit(page);
      await waitText(page, '[data-ref="done"]', 'Welcome, <i>me</i>@example.com!');
      assert.equal(await count(page, '[data-ref="done"] i'), 0, 'the email is text');
      assert.equal(await page.$eval('#signup', (el) => el.hidden), true, 'the form is hidden');
      assert.equal(await visible(page, '[data-ref="done"]'), 1);
      const html = await page.evaluate(() => document.documentElement.outerHTML);
      assert.ok(html.indexOf(password) < 0, 'the password is not in the page');
      assert.ok(logged.every((m) => m.indexOf(password) < 0), 'the password is not logged');
    }
  }
];
