// SPDX-License-Identifier: Apache-2.0
//
// Browser tests of layer1/dist, written in ES5 so they run in IE11 / Edge IE mode as they are.
// No test framework: a tiny runner with sequential, optionally asynchronous tests.
// Results go to the page (text only) and to document.title ("PASS 30/30" or "FAIL …").

(function () {
  'use strict';

  var FILES = { 'vfunc.legacy.min.js': 1, 'vfunc.min.js': 1, 'vfunc.js': 1 };
  var TIMEOUT = 3000;
  var tests = [];
  var file = readFile();

  function readFile() {
    var match = /[?&]file=([^&#]+)/.exec(window.location.search);
    var name = match ? decodeURIComponent(match[1]) : 'vfunc.legacy.min.js';
    return FILES.hasOwnProperty(name) ? name : 'vfunc.legacy.min.js';
  }

  function test(name, fn) {
    tests.push({ name: name, fn: fn });
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed');
  }

  function equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error((message ? message + ': ' : '') + 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    }
  }

  function sandbox() {
    var box = document.getElementById('sandbox');
    while (box.firstChild) box.removeChild(box.firstChild);
    return box;
  }

  function click(element) {
    var event;
    if (typeof window.MouseEvent === 'function') {
      event = new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    } else { // IE11
      event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    element.dispatchEvent(event);
  }

  function later(fn, ms) {
    setTimeout(fn, ms || 30);
  }

  function addResult(name, ok, detail) {
    var item = document.createElement('li');
    item.setAttribute('data-state', ok ? 'pass' : 'fail');
    item.appendChild(document.createTextNode((ok ? 'PASS ' : 'FAIL ') + name));
    if (detail) {
      var span = document.createElement('span');
      span.className = 'detail';
      span.appendChild(document.createTextNode(detail));
      item.appendChild(span);
    }
    document.getElementById('results').appendChild(item);
  }

  function run() {
    var passed = 0;
    var index = 0;
    function next() {
      if (index >= tests.length) return finish();
      var current = tests[index++];
      var finished = false;
      var timer = null;
      function done(err) {
        if (finished) return;
        finished = true;
        if (timer) clearTimeout(timer);
        if (err) addResult(current.name, false, err && err.message ? err.message : String(err));
        else { passed++; addResult(current.name, true); }
        later(next, 0);
      }
      try {
        if (current.fn.length > 0) {
          timer = setTimeout(function () { done(new Error('timed out after ' + TIMEOUT + ' ms')); }, TIMEOUT);
          current.fn(function (err) { done(err); });
        } else {
          current.fn();
          done();
        }
      } catch (err) {
        done(err);
      }
    }
    function finish() {
      var ok = passed === tests.length;
      var summary = document.getElementById('summary');
      summary.setAttribute('data-state', ok ? 'pass' : 'fail');
      summary.textContent = (ok ? 'PASS ' : 'FAIL ') + passed + '/' + tests.length + ' — ' + file;
      document.title = (ok ? 'PASS ' : 'FAIL ') + passed + '/' + tests.length;
    }
    next();
  }

  /** Wraps an async step so that exceptions fail the test instead of being lost. */
  function step(done, fn) {
    return function (value) {
      try { fn(value); } catch (err) { done(err); }
    };
  }

  // ---- tests --------------------------------------------------------------------------------

  var globalsBefore = {};
  for (var key in window) globalsBefore[key] = true;
  var hadPromise = typeof window.Promise === 'function';

  test('the file loaded and window.vf is ready', function () {
    assert(window.vf && typeof vf.vfunc === 'function', 'window.vf is missing');
    assert(/^\d+\.\d+\.\d+/.test(vf.version), 'version ' + vf.version);
  });

  test('official members are read-only', function () {
    var original = vf.html;
    try { vf.html = null; } catch (e) { /* strict mode in some engines */ }
    equal(vf.html, original);
  });

  test('Promise exists (native or the legacy polyfill)', function (done) {
    assert(typeof window.Promise === 'function', 'no Promise');
    if (!hadPromise) assert(file === 'vfunc.legacy.min.js', 'only the legacy file installs Promise');
    Promise.resolve(1).then(step(done, function (v) { equal(v, 1); done(); }));
  });

  test('only expected globals were added', function () {
    var added = [];
    for (var name in window) if (!globalsBefore[name]) added.push(name);
    // "vf" is added after this script's snapshot, so it is expected; Promise only without a native one.
    for (var i = 0; i < added.length; i++) {
      assert(added[i] === 'vf' || added[i] === 'Promise', 'unexpected global: ' + added[i]);
    }
  });

  test('vf.tpl escapes text and attributes', function () {
    var out = String(vf.tpl('<a title="{t}">{t}</a>', { t: '<b>"x" & \'y\'</b>' }));
    equal(out, '<a title="&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;">&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;</a>');
  });

  test('vf.tpl blocks javascript: URLs and event handler attributes', function () {
    equal(String(vf.tpl('<a href="{u}">x</a>', { u: 'javascript:alert(1)' })), '<a href="#">x</a>');
    equal(String(vf.tpl('<a href="{u}">x</a>', { u: 'java\tscript:alert(1)' })), '<a href="#">x</a>');
    equal(String(vf.tpl('<div onclick="{x}"></div>', { x: 'alert(1)' })), '<div onclick=""></div>');
  });

  test('vf.html can be called as a function (ES5)', function () {
    equal(String(vf.html(['<p>', '</p>'], '<i>')), '<p>&lt;i&gt;</p>');
  });

  test('vf.el refuses innerHTML and string handlers', function () {
    var el = vf.el('div', { innerHTML: '<img src=x>', onclick: 'alert(1)', title: 'ok' });
    equal(el.innerHTML, '');
    equal(el.title, 'ok');
    assert(!el.onclick, 'string handler was assigned');
  });

  test('component renders, mounts and resolves mount() with the instance', function (done) {
    var box = vf.vfunc({
      state: { name: 'IE' },
      render: function (s) { return vf.tpl('<p data-ref="out">Hello {name}</p>', s); }
    });
    box.mount(sandbox()).then(step(done, function (inst) {
      equal(inst, box);
      equal(box.refs.out.innerText || box.refs.out.textContent, 'Hello IE');
      done();
    }));
  });

  test('state accessors and batched setState render once', function (done) {
    var renders = 0;
    var box = vf.vfunc({
      state: { count: 0 },
      render: function (s) { renders++; return vf.tpl('<b data-ref="n">{count}</b>', s); }
    });
    box.mount(sandbox());
    renders = 0;
    box.setState({ count: 1 });
    box.setState({ count: 2 });
    box.count = 3;
    later(step(done, function () {
      equal(renders, 1, 'renders');
      equal(box.refs.n.textContent, '3');
      done();
    }), 50);
  });

  test('delegates match with the closest() fallback (click on an inner element)', function () {
    var seen = [];
    var box = vf.vfunc({
      innerHTML: '<button type="button" data-action="save"><span id="icon">*</span></button><p id="out"></p>',
      delegates: [{ selector: '[data-action="save"]', eventType: 'click', onEvent: function (e) {
        seen.push(e.target.getAttribute('data-action') + ':' + e.sender.isvfunc);
      } }]
    });
    box.mount(sandbox());
    click(box.ids.icon);
    click(box.ids.out);
    equal(seen.join(','), 'save:true');
  });

  test('events on ids and the event object', function () {
    var got = null;
    var box = vf.vfunc({
      innerHTML: '<button type="button" id="btn"><i>x</i></button>',
      events: [{ id: 'btn', eventType: 'click', onEvent: function (e) { got = e; } }]
    });
    box.mount(sandbox());
    click(box.$node.getElementsByTagName('i')[0]);
    assert(got, 'handler not called');
    equal(got.id, 'btn');
    equal(got.target, box.ids.btn);
    equal(got.eventType, 'click');
  });

  test('childs and slots are kept across refresh', function () {
    var child = vf.vfunc({ state: { n: 1 }, render: function (s) { return vf.tpl('<em>{n}</em>', s); } });
    var parent = vf.vfunc({
      state: { title: 'a' },
      render: function (s) { return vf.tpl('<h2>{title}</h2><div id="slot"></div>', s); },
      childs: [{ targetId: 'slot', component: child }]
    });
    parent.mount(sandbox());
    parent.title = 'b';
    parent.refresh();
    equal(parent.ids.slot.firstChild, child.$node);
    equal(child.$node.textContent, '1');
  });

  test('data-vf-keep keeps a third-party element', function () {
    var box = vf.vfunc({
      state: { label: 'a' },
      render: function (s) { return vf.tpl('<p>{label}</p><div data-vf-keep="chart"></div>', s); }
    });
    box.mount(sandbox());
    var kept = box.$node.querySelector('[data-vf-keep]');
    kept.appendChild(document.createTextNode('widget'));
    box.label = 'b';
    box.refresh();
    equal(box.$node.querySelector('[data-vf-keep]'), kept);
    equal(kept.textContent, 'widget');
  });

  test('focus and caret are restored after refresh', function () {
    var box = vf.vfunc({
      state: { v: 'hello' },
      render: function (s) { return vf.tpl('<input id="field" value="{v}">', s); }
    });
    box.mount(sandbox());
    var input = box.ids.field;
    input.focus();
    input.setSelectionRange(2, 2);
    box.refresh();
    assert(box.ids.field !== input, 'input should be a new element');
    equal(document.activeElement, box.ids.field, 'focus');
    equal(box.ids.field.selectionStart, 2, 'caret');
  });

  test('lifecycle hooks run in order', function () {
    var log = [];
    var box = vf.vfunc({
      render: function () { return vf.tpl('<i>x</i>', {}); },
      onMount: function () { log.push('mount'); },
      onUpdate: function () { log.push('update'); },
      onDestroy: function () { log.push('destroy'); }
    });
    box.mount(sandbox());
    box.refresh();
    box.destroy();
    equal(log.join(','), 'mount,update,destroy');
    assert(!box.$node.parentNode, 'root not removed');
  });

  test('vf.attach adopts published markup and keeps input values', function () {
    var box = sandbox();
    box.appendChild(vf.node('<form id="f"><input id="name" value="Kim"><input id="agree" type="checkbox">' +
      '<button type="button" data-action="save">save</button></form>'));
    var form = document.getElementById('f');
    document.getElementById('name').value = 'Lee';
    var values = null;
    var inst = vf.attach('#f', { delegates: [{ selector: '[data-action="save"]', eventType: 'click',
      onEvent: function (e) { values = vf.form.values(e.sender.$node); } }] });
    equal(inst.$node, form);
    click(form.getElementsByTagName('button')[0]);
    equal(JSON.stringify(values), '{"name":"Lee","agree":false}');
    vf.form.reset(form);
    equal(document.getElementById('name').value, '');
  });

  test('hash router: params, query, link interception, refusal of outside URLs', function (done) {
    var start = window.location.hash;
    var seen = [];
    var r = vf.router({
      routes: {
        '/': function () { seen.push('home'); },
        '/users/:id': function (ctx) { seen.push('user ' + ctx.params.id + ' ' + (ctx.query.tab || '')); }
      },
      notFound: function (ctx) { seen.push('404 ' + ctx.path); }
    });
    window.location.hash = '#/';
    later(function () {
      r.start();
      r.go('/users/7?tab=posts');
      later(step(done, function () {
        var box = sandbox();
        box.appendChild(vf.node('<a data-link href="#/users/8"><b id="lnk">go</b></a>'));
        click(document.getElementById('lnk'));
        later(step(done, function () {
          r.go('javascript:alert(1)');
          r.go('https://example.com/');
          r.stop();
          window.location.hash = start;
          equal(seen.join(' | '), 'home | user 7 posts | user 8 ');
          done();
        }));
      }));
    });
  });

  test('store notifies once per tick', function (done) {
    var s = vf.store({ items: [] });
    var calls = 0;
    var off = s.subscribe(function () { calls++; });
    s.set({ items: ['a'] });
    s.set(function (st) { return { items: st.items.concat('b') }; });
    later(step(done, function () {
      equal(calls, 1);
      equal(s.get('items').join(','), 'a,b');
      off();
      done();
    }), 50);
  });

  test('i18n: setup, t with plural, apply as text only', function (done) {
    vf.i18n.setup({
      locales: ['ko', 'en'],
      locale: 'ko',
      messages: {
        ko: { hi: '안녕하세요, {name}님', items: { one: '{count}개', other: '{count}개들' }, bold: '<b>x</b>' },
        en: { hi: 'Hi {name}' }
      }
    }).then(step(done, function (locale) {
      equal(locale, 'ko');
      equal(document.documentElement.lang, 'ko');
      equal(vf.t('hi', { name: '민수' }), '안녕하세요, 민수님');
      var box = sandbox();
      box.appendChild(vf.node('<p><span id="t1" data-i18n="bold"></span><input id="t2" data-i18n-attr="placeholder:hi"></p>'));
      vf.i18n.apply(box);
      equal(document.getElementById('t1').textContent, '<b>x</b>');
      equal(document.getElementById('t1').getElementsByTagName('b').length, 0);
      vf.i18n.set('en').then(step(done, function () {
        equal(vf.t('hi', { name: 'Min' }), 'Hi Min');
        done();
      }));
    }));
  });

  test('fmt works with or without full Intl', function () {
    assert(vf.fmt.number(1234.5).length > 0, 'number');
    assert(vf.fmt.currency(1000, 'KRW').length > 0, 'currency');
    assert(vf.fmt.date(new Date(2026, 0, 2)).length > 0, 'date');
    assert(vf.fmt.relative(-3, 'day').length > 0, 'relative');
  });

  test('vf.use installs into vf.ext', function () {
    var name = 'browserTest' + new Date().getTime();
    var api = vf.use({ name: name, install: function (v, o) { return { twice: function (n) { return n * o.k; } }; } }, { k: 2 });
    equal(api.twice(4), 8);
    equal(vf.ext[name], api);
  });

  // ---- load the file under test, then run --------------------------------------------------

  document.getElementById('env').textContent = 'File: ' + file + ' · documentMode: ' +
    (document.documentMode || '-') + ' · ' + navigator.userAgent;

  var script = document.createElement('script');
  script.src = '../dist/' + file;
  script.onload = run;
  script.onerror = function () {
    addResult('load ../dist/' + file, false, 'the file could not be loaded (serve the repository root over http)');
    document.title = 'FAIL load';
  };
  document.getElementsByTagName('head')[0].appendChild(script);
})();
