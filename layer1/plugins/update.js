// SPDX-License-Identifier: Apache-2.0
//
// vf.ext.update — the official update plugin (D-013, plan section O). Written in ES5 syntax so
// the same source serves IE11; only the final `export` is ES2015, and the build turns it into
// dist/plugins/update.min.js (<script>, global `vfUpdate`) and dist/plugins/update.esm.js.
//
// Apps without a reload button (web views, kiosks, installed PWAs, in-app browsers) never pick
// up a new release by themselves. This plugin reads version.json and replaces the page:
//   policy 'next-navigation' (default): on the next route change, so no work in progress is lost
//   policy 'prompt': calls onAvailable(info, apply) so the app can show its own toast
//   policy 'immediate': at once (for example a security fix)
// It checks when installed, when the tab becomes visible again, every `interval` minutes, and on
// route changes (hashchange, popstate, or a call to vf.ext.update.navigated()).
//
// 새로고침 버튼이 없는 환경(앱 웹뷰, 키오스크, PWA, 인앱 브라우저)에서 새 버전을 반영하는 공식
// 플러그인입니다. version.json을 확인해 정책에 따라 페이지를 교체합니다. 화면(UI)은 그리지 않고,
// prompt 정책의 안내는 앱이 onAvailable에서 직접 그립니다(디자인 분리).
//
// version.json: { "version": "1.0.3" }   Serve it (and index.html) with Cache-Control: no-cache.

var DEFAULTS = {
  url: './version.json',
  current: '',               // the running version; empty = the first version read becomes the baseline
  policy: 'next-navigation', // 'next-navigation' | 'prompt' | 'immediate'
  interval: 10,              // minutes between periodic checks; 0 turns them off
  minGap: 30,                // seconds; checks closer together than this are skipped
  onAvailable: null,         // function (info, apply) for the 'prompt' policy
  onError: null              // function (error) when version.json cannot be read
};

var POLICIES = { 'next-navigation': 1, prompt: 1, immediate: 1 };

function readVersion(url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    // IE caches GET responses even with no-cache headers, so the timestamp is always added.
    var separator = url.indexOf('?') >= 0 ? '&' : '?';
    request.open('GET', url + separator + 't=' + new Date().getTime(), true);
    request.onreadystatechange = function () {
      if (request.readyState !== 4) return;
      if (request.status < 200 || request.status >= 300) {
        reject(new Error('update: ' + url + ' answered ' + request.status));
        return;
      }
      try {
        var data = JSON.parse(request.responseText);
        var version = data && typeof data.version === 'string' ? data.version : '';
        if (!version) throw new Error('update: ' + url + ' has no "version" string');
        resolve(version);
      } catch (err) {
        reject(err);
      }
    };
    request.send(null);
  });
}

function install(vf, options) {
  var o = {};
  var key;
  for (key in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) o[key] = DEFAULTS[key];
  for (key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key) && Object.prototype.hasOwnProperty.call(DEFAULTS, key)) o[key] = options[key];
  }
  if (!Object.prototype.hasOwnProperty.call(POLICIES, o.policy)) o.policy = DEFAULTS.policy;
  if (o.policy === 'prompt' && typeof o.onAvailable !== 'function') o.policy = 'next-navigation';

  var reload = typeof options.reload === 'function' ? options.reload : function () { window.location.reload(); };
  var state = { current: o.current || '', latest: '', pending: false, lastCheck: 0, checking: null, reloading: false };
  var timer = null;

  function apply() {
    if (state.reloading) return;
    state.reloading = true;
    reload();
  }

  function found(latest) {
    state.latest = latest;
    if (!state.current) { state.current = latest; return; }
    if (latest === state.current || state.pending) return;
    state.pending = true;
    var info = { current: state.current, latest: latest, policy: o.policy };
    if (o.policy === 'immediate') apply();
    else if (o.policy === 'prompt') o.onAvailable(info, apply);
  }

  /** Reads version.json now (unless a check ran within minGap seconds, or force is true). */
  function check(force) {
    var now = new Date().getTime();
    if (state.checking) return state.checking;
    if (!force && state.lastCheck && now - state.lastCheck < o.minGap * 1000) return Promise.resolve(status());
    state.lastCheck = now;
    state.checking = readVersion(o.url).then(function (latest) {
      state.checking = null;
      found(latest);
      return status();
    }, function (err) {
      state.checking = null;
      if (typeof o.onError === 'function') o.onError(err);
      return status();
    });
    return state.checking;
  }

  /** Call from your router's onChange (history mode); hashchange and popstate are handled already. */
  function navigated() {
    if (state.pending && o.policy === 'next-navigation') apply();
    else check(false);
  }

  function onVisibility() {
    if (document.visibilityState === 'visible') check(false);
  }

  function status() {
    return { current: state.current, latest: state.latest, pending: state.pending, policy: o.policy };
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    window.removeEventListener('hashchange', navigated);
    window.removeEventListener('popstate', navigated);
    document.removeEventListener('visibilitychange', onVisibility);
  }

  window.addEventListener('hashchange', navigated);
  window.addEventListener('popstate', navigated);
  document.addEventListener('visibilitychange', onVisibility);
  if (o.interval > 0) timer = setInterval(function () { check(false); }, o.interval * 60 * 1000);
  check(true);

  return { check: check, navigated: navigated, apply: apply, status: status, stop: stop };
}

var vfUpdate = { name: 'update', version: '1.0.0', requires: '^1.0.0', install: install };

export default vfUpdate;
