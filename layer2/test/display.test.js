// SPDX-License-Identifier: Apache-2.0
// Display components of Tier S: markup, aria, escaping, messages, formatting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import {
  vsButtonGroup, vsBadge, vsTag, vsAvatar, vsAlert, vsCard, vsDescriptions, vsStatCard, vsTimeline,
  vsEmptyState, vsSkeleton, vsSpinner, vsTooltip
} from '../src/index.js';
import '../src/locale.ko.js';

function parse(markup) {
  const holder = document.createElement('div');
  holder.innerHTML = String(markup);
  assert.equal(holder.children.length, 1, 'one root element');
  return holder.firstElementChild;
}

const EVIL = '"><img src=x onerror=alert(1)>';

test('every display function returns SafeHtml and escapes text props', () => {
  const markup = [
    vsButtonGroup({ label: EVIL, buttons: [{ label: EVIL }] }),
    vsBadge({ label: EVIL }),
    vsTag({ label: EVIL, value: EVIL, removable: true }),
    vsAvatar({ name: EVIL, src: EVIL }),
    vsAlert({ title: EVIL, message: EVIL, dismissible: true }),
    vsCard({ title: EVIL, subtitle: EVIL, body: EVIL, footer: EVIL, actions: EVIL }),
    vsDescriptions({ title: EVIL, items: [{ label: EVIL, value: EVIL }] }),
    vsStatCard({ label: EVIL, value: EVIL, deltaLabel: EVIL, delta: 0.1, description: EVIL }),
    vsTimeline({ items: [{ title: EVIL, time: EVIL, description: EVIL }] }),
    vsEmptyState({ title: EVIL, description: EVIL }),
    vsSkeleton({}),
    vsSpinner({ label: EVIL }),
    vsTooltip({ text: EVIL, trigger: EVIL })
  ];
  for (const m of markup) {
    assert.ok(m instanceof vf.SafeHtml);
    assert.equal(parse(m).querySelector('img:not(.vf-avatar__image)'), null, String(m));
  }
});

test('vsButtonGroup: role="group", label, shared size, own size wins', () => {
  const group = parse(vsButtonGroup({ label: 'View', size: 'sm', attached: true, buttons: [{ label: 'A', action: 'a' }, { label: 'B', size: 'lg' }] }));
  assert.equal(group.getAttribute('role'), 'group');
  assert.equal(group.getAttribute('aria-label'), 'View');
  assert.equal(group.getAttribute('data-attached'), 'true');
  const buttons = group.querySelectorAll('button');
  assert.equal(buttons[0].getAttribute('data-size'), 'sm');
  assert.equal(buttons[0].getAttribute('data-action'), 'a');
  assert.equal(buttons[1].getAttribute('data-size'), 'lg');
});

test('vsBadge and vsTag: tones, dot, a remove button with action, value and a translated label', async () => {
  const badge = parse(vsBadge({ label: 3, variant: 'danger', dot: true }));
  assert.equal(badge.getAttribute('data-variant'), 'danger');
  assert.ok(badge.querySelector('.vf-badge__dot[aria-hidden="true"]'));
  assert.equal(badge.textContent, '3');
  const tag = parse(vsTag({ label: 'urgent', value: 'u1', removable: true }));
  const remove = tag.querySelector('button');
  assert.equal(remove.getAttribute('data-action'), 'remove');
  assert.equal(remove.getAttribute('data-value'), 'u1');
  assert.equal(remove.getAttribute('aria-label'), 'Remove urgent');
  assert.equal(parse(vsTag({ label: 'x', removable: true, removeAction: 'drop' })).querySelector('button').getAttribute('data-action'), 'drop');
  assert.equal(parse(vsTag({ label: 'x' })).querySelector('button'), null);
  await vf.i18n.setup({ locale: 'ko', locales: ['en', 'ko'] });
  assert.equal(parse(vsTag({ label: '긴급', removable: true })).querySelector('button').getAttribute('aria-label'), '긴급 삭제');
  await vf.i18n.set('en');
});

test('vsAvatar: initials without src, a safe image URL, the accessible name', () => {
  const initials = parse(vsAvatar({ name: 'ada lovelace' }));
  assert.equal(initials.getAttribute('role'), 'img');
  assert.equal(initials.getAttribute('aria-label'), 'ada lovelace');
  assert.equal(initials.textContent, 'AL');
  assert.equal(parse(vsAvatar({ name: '홍길동' })).textContent, '홍');
  const image = parse(vsAvatar({ name: 'Ada', src: 'javascript:alert(1)' })).querySelector('img');
  assert.equal(image.getAttribute('src'), '#');
  assert.equal(image.getAttribute('alt'), '');
  assert.equal(parse(vsAvatar({})).hasAttribute('role'), false);
});

test('vsAlert: role by variant, dismiss button', () => {
  assert.equal(parse(vsAlert({ message: 'x' })).getAttribute('role'), 'status');
  assert.equal(parse(vsAlert({ message: 'x', variant: 'danger' })).getAttribute('role'), 'alert');
  const alert = parse(vsAlert({ title: 'T', message: vf.html`<b>bold</b>`, dismissible: true, dismissAction: 'close-alert' }));
  assert.ok(alert.querySelector('.vf-alert__message b'), 'vf.html markup is kept');
  const button = alert.querySelector('button');
  assert.equal(button.getAttribute('data-action'), 'close-alert');
  assert.equal(button.getAttribute('aria-label'), 'Dismiss');
});

test('vsCard: heading level, slots with markup and instances', () => {
  const child = vf.vfunc({ tag: 'span', innerHTML: 'inner' });
  const card = parse(vsCard({ title: 'Sales', headingLevel: 2, body: child, footer: vf.html`<button>ok</button>` }));
  assert.equal(card.querySelector('h2').textContent, 'Sales');
  assert.equal(card.querySelector('.vf-card__body span').textContent, 'inner');
  assert.ok(card.querySelector('.vf-card__footer button'));
  assert.ok(parse(vsCard({ title: 'x', headingLevel: 9 })).querySelector('h3'), 'out of range falls back to h3');
  assert.equal(parse(vsCard({ body: 'b' })).querySelector('.vf-card__header'), null);
});

test('vsDescriptions: a <dl> with dt/dd pairs and clamped columns', () => {
  const d = parse(vsDescriptions({ columns: 7, items: [{ label: 'Name', value: 'Ada' }, { label: 'Role', value: vf.html`<em>admin</em>` }] }));
  assert.equal(d.getAttribute('data-columns'), '4');
  assert.deepEqual(Array.from(d.querySelectorAll('dt')).map((n) => n.textContent), ['Name', 'Role']);
  assert.ok(d.querySelector('dd em'));
});

test('vsStatCard: vf.fmt number, signed percent change, trend and hidden words', async () => {
  const card = parse(vsStatCard({ label: 'Revenue', value: 1234567, delta: 0.125, deltaLabel: 'vs last month' }));
  assert.equal(card.querySelector('.vf-stat-card__value').textContent, '1,234,567');
  const delta = card.querySelector('.vf-stat-card__delta');
  assert.equal(delta.getAttribute('data-trend'), 'up');
  assert.equal(delta.querySelector('.vf-stat-card__change').textContent, '+12.5%');
  assert.equal(delta.querySelector('.vf-visually-hidden').textContent, 'Up ');
  const down = parse(vsStatCard({ label: 'x', value: 1, delta: -0.02 })).querySelector('.vf-stat-card__delta');
  assert.equal(down.getAttribute('data-trend'), 'down');
  assert.equal(parse(vsStatCard({ label: 'x', value: 1, delta: 0 })).querySelector('.vf-visually-hidden'), null);
  assert.equal(parse(vsStatCard({ label: 'x', value: 5 })).querySelector('.vf-stat-card__delta'), null);
  await vf.i18n.setup({ locale: 'ko', locales: ['en', 'ko'] });
  assert.equal(parse(vsStatCard({ label: 'x', value: 1, delta: 0.1 })).querySelector('.vf-visually-hidden').textContent, '증가 ');
  await vf.i18n.set('en');
});

test('vsTimeline: an <ol> of items with <time datetime> and a variant', () => {
  const list = parse(vsTimeline({ items: [{ title: 'Created', time: new Date(Date.UTC(2026, 0, 2)), variant: 'success' }, { title: 'Note', time: 'soon' }] }));
  assert.equal(list.tagName, 'OL');
  const items = list.querySelectorAll('li');
  assert.equal(items[0].getAttribute('data-variant'), 'success');
  assert.equal(items[0].querySelector('time').getAttribute('datetime'), '2026-01-02T00:00:00.000Z');
  assert.equal(items[1].querySelector('time').textContent, 'soon', 'an unparsable time is shown as given');
  assert.equal(items[1].getAttribute('data-variant'), 'neutral');
});

test('vsEmptyState, vsSkeleton and vsSpinner: messages and aria', () => {
  assert.equal(parse(vsEmptyState({})).querySelector('.vf-empty-state__title').textContent, 'No data');
  assert.equal(parse(vsEmptyState({ title: 'Nothing yet' })).querySelector('.vf-empty-state__title').textContent, 'Nothing yet');
  const skeleton = parse(vsSkeleton({ lines: 3 }));
  assert.equal(skeleton.getAttribute('aria-hidden'), 'true');
  assert.equal(skeleton.querySelectorAll('.vf-skeleton__line').length, 3);
  assert.equal(parse(vsSkeleton({ variant: 'circle', lines: 5 })).querySelectorAll('.vf-skeleton__line').length, 1);
  const spinner = parse(vsSpinner({}));
  assert.equal(spinner.getAttribute('role'), 'status');
  assert.equal(spinner.textContent, 'Loading');
});

test('vsTooltip: the trigger gets the bubble id for aria-describedby', () => {
  const tip = parse(vsTooltip({ text: 'Copy link', placement: 'bottom', trigger: (a) => vf.vsButton({ label: 'Copy', describedBy: a.describedBy }) }));
  const bubble = tip.querySelector('[role="tooltip"]');
  assert.match(bubble.id, /^vf-tooltip-\d+$/);
  assert.equal(tip.querySelector('button').getAttribute('aria-describedby'), bubble.id);
  assert.equal(tip.getAttribute('data-placement'), 'bottom');
  assert.equal(parse(vsTooltip({ text: 't', id: 'tip1', trigger: vf.html`<a href="#x">x</a>` })).querySelector('[role="tooltip"]').id, 'tip1');
});
