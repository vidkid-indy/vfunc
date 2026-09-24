// SPDX-License-Identifier: Apache-2.0
// The official update plugin (layer1/plugins/update.js, D-013).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush } from './setup-dom.js';
import vf from '../src/vfunc.js';
import vfUpdate from '../plugins/update.js';

// A fake server for version.json.
const server = { version: '1.0.0', status: 200, requests: [] };

class FakeXHR {
  open(method, url) { this.method = method; this.url = url; }
  send() {
    server.requests.push(this.url);
    setTimeout(() => {
      this.readyState = 4;
      this.status = server.status;
      this.responseText = JSON.stringify({ version: server.version });
      this.onreadystatechange();
    }, 0);
  }
}
globalThis.XMLHttpRequest = FakeXHR;

const wait = () => new Promise((resolve) => setTimeout(resolve, 10));
const navigate = () => window.dispatchEvent(new window.Event('hashchange'));

let reloads = 0;
const installed = [];
function start(options) {
  const api = vfUpdate.install(vf, Object.assign({ interval: 0, minGap: 0, reload: () => { reloads++; } }, options));
  installed.push(api);
  return api;
}

beforeEach(() => {
  while (installed.length) installed.pop().stop();
  server.version = '1.0.0';
  server.status = 200;
  server.requests = [];
  reloads = 0;
});

test('installs through vf.use as vf.ext.update', async () => {
  const api = vf.use(vfUpdate, { interval: 0, reload: () => {} });
  installed.push(api);
  assert.equal(vf.ext.update, api);
  assert.equal(typeof api.check, 'function');
  await wait();
});

test('next-navigation: the first read is the baseline; a new version reloads on the next route change, once', async () => {
  const api = start();
  await wait();
  assert.deepEqual(api.status(), { current: '1.0.0', latest: '1.0.0', pending: false, policy: 'next-navigation' });
  server.version = '1.0.1';
  await api.check(true);
  assert.equal(api.status().pending, true);
  assert.equal(reloads, 0, 'no reload while the user stays on the screen');
  navigate();
  navigate();
  assert.equal(reloads, 1);
});

test('every request carries a cache-busting timestamp (IE caches GET)', async () => {
  start({ url: './version.json?app=1' });
  await wait();
  assert.match(server.requests[0], /^\.\/version\.json\?app=1&t=\d+$/);
});

test('prompt: onAvailable gets the versions and an apply function', async () => {
  const seen = [];
  start({ current: '1.0.0', policy: 'prompt', onAvailable: (info, apply) => seen.push([info, apply]) });
  server.version = '2.0.0';
  await wait();
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0][0], { current: '1.0.0', latest: '2.0.0', policy: 'prompt' });
  navigate();
  assert.equal(reloads, 0, 'prompt waits for the user');
  seen[0][1]();
  seen[0][1]();
  assert.equal(reloads, 1);
});

test('prompt without onAvailable falls back to next-navigation', async () => {
  const api = start({ policy: 'prompt' });
  await wait();
  assert.equal(api.status().policy, 'next-navigation');
});

test('immediate reloads as soon as a new version is seen', async () => {
  server.version = '1.2.0';
  start({ current: '1.0.0', policy: 'immediate' });
  await wait();
  assert.equal(reloads, 1);
});

test('read errors go to onError and never reload', async () => {
  const errors = [];
  server.status = 500;
  const api = start({ current: '1.0.0', onError: (err) => errors.push(err.message) });
  await wait();
  navigate();
  await wait();
  assert.equal(reloads, 0);
  assert.equal(api.status().pending, false);
  assert.match(errors[0], /answered 500/);
});

test('checks closer than minGap are skipped; a route change checks again', async () => {
  const api = start({ minGap: 60 });
  await wait();
  await api.check();
  assert.equal(server.requests.length, 1);
  await api.check(true);
  assert.equal(server.requests.length, 2);
});

test('a route change without a pending update triggers a check', async () => {
  start();
  await wait();
  server.version = '1.0.5';
  navigate();
  await wait();
  assert.equal(reloads, 0);
  navigate();
  assert.equal(reloads, 1);
});

test('stop removes the listeners', async () => {
  const api = start({ current: '1.0.0' });
  server.version = '9.9.9';
  await wait();
  api.stop();
  navigate();
  await flush();
  assert.equal(reloads, 0);
});
