// SPDX-License-Identifier: Apache-2.0
// vsButton (Tier S): markup, escaping, hooks, loading state, messages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureWarnings } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import ui, { vsButton } from '../src/index.js';
import '../src/locale.ko.js';

function parse(markup) {
  const holder = document.createElement('div');
  holder.innerHTML = String(markup);
  return holder.firstElementChild;
}

test('importing layer 2 adds its members to vf, read-only', () => {
  assert.equal(vf.vsButton, vsButton);
  assert.equal(ui.vsButton, vsButton);
  assert.throws(() => { 'use strict'; vf.vsButton = null; });
});

test('vsButton returns SafeHtml that vf.html inserts as markup', () => {
  const out = vsButton({ label: 'Save' });
  assert.ok(out instanceof vf.SafeHtml);
  const wrapped = String(vf.html`<p>${out}</p>`);
  assert.match(wrapped, /^<p><button /);
  const button = parse(out);
  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.getAttribute('type'), 'button');
  assert.equal(button.className, 'vf-button');
  assert.equal(button.getAttribute('data-variant'), 'secondary');
  assert.equal(button.getAttribute('data-size'), 'md');
  assert.equal(button.hasAttribute('id'), false, 'absent props leave the attribute out');
  assert.equal(button.hasAttribute('data-action'), false);
  assert.equal(button.hasAttribute('disabled'), false);
});

test('vsButton escapes the label and every attribute value', () => {
  const button = parse(vsButton({
    label: '<img src=x onerror=alert(1)>',
    id: '"><script>x</script>',
    action: 'save" onclick="alert(1)',
    ref: 'r',
    className: 'mine" onmouseover="x'
  }));
  assert.equal(button.querySelector('img'), null);
  assert.equal(button.textContent, '<img src=x onerror=alert(1)>');
  assert.equal(button.id, '"><script>x</script>');
  assert.equal(button.getAttribute('data-action'), 'save" onclick="alert(1)');
  assert.equal(button.getAttribute('onclick'), null);
  assert.equal(button.getAttribute('onmouseover'), null);
  assert.equal(button.getAttribute('data-ref'), 'r');
  assert.equal(button.className, 'vf-button mine" onmouseover="x');
});

test('vsButton takes vf.html markup as the label (icon + text), never a plain HTML string', () => {
  const withIcon = parse(vsButton({ label: vf.html`<svg aria-hidden="true"></svg> Add`, ariaLabel: 'Add item' }));
  assert.ok(withIcon.querySelector('svg'));
  assert.equal(withIcon.getAttribute('aria-label'), 'Add item');
});

test('variant, size and type are checked; unknown values fall back with a warning', () => {
  const button = parse(vsButton({ label: 'x', variant: 'primary', size: 'lg', type: 'submit' }));
  assert.equal(button.getAttribute('data-variant'), 'primary');
  assert.equal(button.getAttribute('data-size'), 'lg');
  assert.equal(button.getAttribute('type'), 'submit');
  let fallback;
  const warnings = captureWarnings(() => { fallback = parse(vsButton({ label: 'x', variant: 'huge', type: 'javascript' })); });
  assert.equal(fallback.getAttribute('data-variant'), 'secondary');
  assert.equal(fallback.getAttribute('type'), 'button');
  assert.equal(warnings.length, 2);
});

test('loading disables the button, sets aria-busy and adds a translated hidden status', async () => {
  const button = parse(vsButton({ label: 'Send', loading: true }));
  assert.equal(button.disabled, true);
  assert.equal(button.getAttribute('aria-busy'), 'true');
  assert.ok(button.querySelector('.vf-button__spinner[aria-hidden="true"]'));
  assert.equal(button.querySelector('.vf-visually-hidden').textContent, 'Loading');
  await vf.i18n.setup({ locale: 'ko', locales: ['en', 'ko'] });
  assert.equal(parse(vsButton({ label: 'Send', loading: true })).querySelector('.vf-visually-hidden').textContent, '불러오는 중',
    'the ko bundle is used when the app has no message');
  vf.i18n.add('ko', { common: { loading: '처리 중' } });
  assert.equal(parse(vsButton({ label: 'Send', loading: true })).querySelector('.vf-visually-hidden').textContent, '처리 중',
    'the app message wins over the built-in bundle');
  assert.equal(parse(vsButton({ label: 'Send', loading: true, loadingText: 'Wait' })).querySelector('.vf-visually-hidden').textContent, 'Wait',
    'the prop wins over every message');
  await vf.i18n.set('en');
});

test('a vf.vfunc component can render vsButton and delegate on its data-action', () => {
  const clicks = [];
  const c = vf.vfunc({
    render: () => vf.html`<div>${vf.vsButton({ label: 'Go', action: 'go' })}</div>`,
    delegates: [{ selector: '[data-action="go"]', eventType: 'click', onEvent: () => clicks.push(1) }]
  });
  c.$node.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.deepEqual(clicks, [1]);
});
