// SPDX-License-Identifier: Apache-2.0
//
// Smoke test of the benchmark pages (layer1/bench) in the VF_BROWSER engine: with 100 rows, every
// operation runs with no console problems and the four variants end with the same table.
// The timings themselves are not checked (they depend on the machine; see layer1/bench/README.md).

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launchBrowser } from './browser.mjs';
import { startServer } from './serve.mjs';

let browser;
let server;

before(async () => {
  server = await startServer();
  browser = await launchBrowser();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
});

const snapshot = (page) => page.evaluate(() => Array.from(document.querySelectorAll('#tbody tr')).map((tr) =>
  [Number(tr.getAttribute('data-id')), tr.querySelector('[data-action="select"]').textContent, tr.getAttribute('data-state') === 'selected']));

const rowCount = (page, n) => page.waitForFunction((count) => document.querySelectorAll('#tbody tr').length === count, n);

async function runAll(variant) {
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  const states = {};
  try {
    await page.goto(server.origin + '/layer1/bench/pages/' + variant + '/?n=100');
    await page.waitForFunction(() => window.benchData && window.benchData.readyAt > 0);
    await page.click('#run');
    await rowCount(page, 100);
    await page.click('#add');
    await rowCount(page, 200);
    await page.click('#update');
    await page.waitForFunction(() => / !!!$/.test(document.querySelector('#tbody tr:nth-child(11) [data-action="select"]').textContent));
    await page.click('#tbody tr:nth-child(3) [data-action="select"]');
    await page.waitForSelector('#tbody tr:nth-child(3)[data-state="selected"]');
    await page.click('#swaprows');
    await page.waitForFunction(() => document.querySelector('#tbody tr:nth-child(2)').getAttribute('data-id') === '99');
    await page.click('#tbody tr:nth-child(5) [data-action="remove"]');
    await rowCount(page, 199);
    states.edited = await snapshot(page);
    await page.click('#runlots');
    await rowCount(page, 1000);
    states.lots = (await snapshot(page)).length;
    await page.click('#clear');
    await rowCount(page, 0);
    return { states, problems };
  } finally {
    await context.close();
  }
}

test('bench pages: every operation works and the four variants draw the same table', async () => {
  const naive = await runAll('naive');
  const recommended = await runAll('recommended');
  const keyed = await runAll('keyed');
  const vanilla = await runAll('vanilla');
  for (const [name, r] of [['naive', naive], ['recommended', recommended], ['keyed', keyed], ['vanilla', vanilla]]) assert.deepEqual(r.problems, [], name);
  const edited = vanilla.states.edited;
  assert.equal(edited.length, 199);
  assert.equal(edited.filter((row) => row[2]).length, 1, 'one selected row');
  assert.equal(edited[0][1].endsWith(' !!!'), true, 'row 1 updated');
  assert.equal(edited[1][0], 99, 'row 2 swapped with row 99');
  assert.deepEqual(naive.states, vanilla.states);
  assert.deepEqual(recommended.states, vanilla.states);
  assert.deepEqual(keyed.states, vanilla.states);
});
