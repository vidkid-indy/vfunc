// SPDX-License-Identifier: Apache-2.0
//
// Small helpers for the task checks (tasks/*/checks.mjs). Selectors use id, data-action,
// data-ref and other data-* attributes only, like the task texts (rule 21).

import assert from 'node:assert/strict';

export { assert };

/** innerText of the first match, trimmed. */
export const text = async (page, selector) => (await page.locator(selector).first().innerText()).trim();

/** Number of matches. */
export const count = (page, selector) => page.locator(selector).count();

/** Number of matches that are visible. */
export const visible = (page, selector) => page.$$eval(selector, (els) => els.filter((el) => {
  const box = el.getBoundingClientRect();
  return !el.closest('[hidden]') && (box.width > 0 || box.height > 0);
}).length);

/** Waits until the text of `selector` (trimmed) equals `expected`. */
export async function waitText(page, selector, expected) {
  try {
    await page.waitForFunction(([s, e]) => {
      const el = document.querySelector(s);
      return !!el && el.textContent.replace(/\s+/g, ' ').trim() === e;
    }, [selector, expected]);
  } catch (err) {
    const actual = await page.$eval(selector, (el) => el.textContent.replace(/\s+/g, ' ').trim()).catch(() => '(no element)');
    assert.fail(selector + ': expected "' + expected + '", got "' + actual + '"');
  }
}

/** Waits until `selector` has `count` matches. */
export async function waitCount(page, selector, expected) {
  try {
    await page.waitForFunction(([s, n]) => document.querySelectorAll(s).length === n, [selector, expected]);
  } catch (err) {
    assert.fail(selector + ': expected ' + expected + ' elements, got ' + (await count(page, selector)));
  }
}

/** Waits until the attribute of `selector` equals `expected` (null = absent). */
export async function waitAttr(page, selector, name, expected) {
  try {
    await page.waitForFunction(([s, n, e]) => {
      const el = document.querySelector(s);
      return !!el && el.getAttribute(n) === e;
    }, [selector, name, expected]);
  } catch (err) {
    const actual = await page.$eval(selector, (el, n) => el.getAttribute(n), name).catch(() => '(no element)');
    assert.fail(selector + ' ' + name + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}

/** Asserts that the focused element matches `selector`. */
export async function expectFocus(page, selector, message) {
  const ok = await page.evaluate((s) => !!document.activeElement && document.activeElement.matches(s), selector);
  if (!ok) {
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') : 'nothing';
    });
    assert.fail((message || 'focus') + ': expected ' + selector + ', focus is on ' + where);
  }
}

/** Marks the element so that `sameElement` can tell whether it was replaced. */
export const mark = (page, selector, name) => page.$eval(selector, (el, n) => { el.setAttribute('data-eval-mark', n); }, name);

/** Asserts that the marked element is still in the page (it was kept, not rebuilt). */
export async function sameElement(page, name, message) {
  const n = await page.locator('[data-eval-mark="' + name + '"]').count();
  assert.equal(n, 1, message || 'the element "' + name + '" was replaced instead of kept');
}

/** Fulfils requests to `glob` with JSON (after `delay` ms) or an HTTP status. */
export function routeJson(page, glob, handler) {
  let calls = 0;
  return page.route(glob, async (route) => {
    const r = handler(calls++);
    if (r.delay) await new Promise((done) => setTimeout(done, r.delay));
    if (r.status && r.status >= 400) return route.fulfill({ status: r.status, contentType: 'text/plain', body: 'error' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(r.body) });
  });
}
