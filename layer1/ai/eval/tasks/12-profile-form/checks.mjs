// SPDX-License-Identifier: Apache-2.0
// Task 12 — profile form with vs* fields (layer 2).
import { assert, count, waitText, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const MSG = { name: 'Enter your name.', email: 'Enter a valid email address.' };

/** The texts of the elements the field's aria-describedby points to. */
const described = (page, id) => page.$eval('#' + id, (el) => (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)
  .map((ref) => { const n = document.getElementById(ref); return n ? n.textContent.trim() : ''; }).join(' | '));

const save = (page) => page.getByRole('button', { name: 'Save' }).click();

async function invalid(page, id, yes) {
  if (yes) {
    await waitAttr(page, '#' + id, 'aria-invalid', 'true');
    assert.ok((await described(page, id)).indexOf(MSG[id]) >= 0, id + ': its message is linked by aria-describedby');
  } else {
    await page.waitForFunction((sel) => document.querySelector(sel).getAttribute('aria-invalid') !== 'true', '#' + id);
    assert.ok((await described(page, id)).indexOf(MSG[id]) < 0, id + ': no message');
  }
}

export default [
  {
    name: 'the fields have their labels, hint, options and start values; no error before a submit',
    async run(page) {
      await page.waitForSelector('#name');
      // The accessible name (label[for] or a wrapping label; a required mark may follow the text).
      for (const [id, label] of [['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['newsletter', 'Newsletter']]) {
        assert.equal(await page.getByLabel(new RegExp('^' + label + '\\b')).first().getAttribute('id'), id, id + ' is labelled ' + label);
      }
      assert.equal(await page.getAttribute('#name', 'name'), 'name');
      assert.equal(await page.getAttribute('#email', 'type'), 'email');
      assert.ok((await described(page, 'email')).indexOf('We never share it.') >= 0, 'the email hint is linked');
      assert.equal(await page.inputValue('#role'), 'viewer');
      assert.deepEqual(await page.$$eval('#role option', (os) => os.filter((o) => o.value).map((o) => o.value + ':' + o.textContent.trim())),
        ['admin:Admin', 'editor:Editor', 'viewer:Viewer']);
      assert.equal(await page.isChecked('#newsletter'), false);
      assert.notEqual(await page.getAttribute('#name', 'aria-invalid'), 'true');
      assert.equal(await count(page, '#profile [type="submit"]'), 1, 'a submit button');
    }
  },
  {
    name: 'an empty submit shows both messages and focuses the name',
    async run(page) {
      await page.waitForSelector('#name');
      await save(page);
      await invalid(page, 'name', true);
      await invalid(page, 'email', true);
      await expectFocus(page, '#name', 'first invalid field');
    }
  },
  {
    name: 'typed values stay after the errors are shown; only the invalid field keeps its error',
    async run(page) {
      await page.waitForSelector('#name');
      await page.fill('#name', 'Kim');
      await page.fill('#email', 'kim@');
      await page.selectOption('#role', 'admin');
      // Like a user: a switch's input may be drawn by CSS, so press its label.
      await page.locator('label', { has: page.locator('#newsletter') }).or(page.locator('label[for="newsletter"]')).first().click();
      await page.waitForFunction(() => document.getElementById('newsletter').checked);
      await save(page);
      await invalid(page, 'email', true);
      await invalid(page, 'name', false);
      await expectFocus(page, '#email', 'email is the first invalid field');
      assert.equal(await page.inputValue('#name'), 'Kim');
      assert.equal(await page.inputValue('#email'), 'kim@');
      assert.equal(await page.inputValue('#role'), 'admin');
      assert.equal(await page.isChecked('#newsletter'), true);
    }
  },
  {
    name: 'a valid submit shows the saved line (as text) and the toast; the fields keep their values',
    async run(page) {
      await page.waitForSelector('#name');
      await save(page);
      await invalid(page, 'name', true);
      await page.fill('#name', '  <b>Kim</b> ');
      await page.fill('#email', ' kim@example.com ');
      await page.selectOption('#role', 'editor');
      await save(page);
      await waitText(page, '[data-ref="saved"]', 'Saved: <b>Kim</b> (editor)');
      assert.equal(await count(page, '[data-ref="saved"] b'), 0, 'the name is text');
      await page.getByText('Profile saved').first().waitFor({ state: 'visible' });
      await invalid(page, 'name', false);
      await invalid(page, 'email', false);
      assert.equal(await page.inputValue('#name'), '  <b>Kim</b> ');
      assert.equal(await page.inputValue('#role'), 'editor');
    }
  }
];
