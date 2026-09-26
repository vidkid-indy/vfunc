// SPDX-License-Identifier: Apache-2.0
//
// The base contract of every layer 2 component that wraps a widget (G-2): an instance with
// `.instance`, refresh() and destroy() (twice is safe), `lib` injection, callbacks with
// { sender, event, data }, no listener or timer left after destroy (100 create / mount / destroy
// cycles), survival of a parent refresh, and the locale change when a probe is given.
// Run with node:test + happy-dom (layer2/test/contract.test.js); Phase 4 adds a browser page.
//
// 모든 래퍼 컴포넌트의 기본 계약입니다. 어댑터를 넣으면 계약을 지키는지 자동으로 검사합니다.

/**
 * @param {Object} o
 * @param {string} o.name - e.g. 'vfGrid'
 * @param {function(Object): Object} o.factory - props → instance
 * @param {Object} o.props - props that make a working instance
 * @param {Object} o.vf - the engine
 * @param {function} o.test - node:test's test
 * @param {Object} o.assert - node:assert/strict
 * @param {Object} o.window - the DOM window (happy-dom)
 * @param {function(Object): string} [o.localeProbe] - text of the instance that follows the locale
 * @param {number} [o.leakWait=0] - ms to let a vendor's short timers finish before counting
 */
export function baseContract(o) {
  const { name, factory, props, vf, test, assert, window } = o;
  const document = window.document;
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  test(name + ' · base: an instance with $node, .instance, refresh() and destroy(), without errors', async () => {
    // The engine reports a throwing hook through console.error instead of throwing: catch that too.
    const errors = [];
    const original = console.error;
    console.error = function () { errors.push(Array.prototype.join.call(arguments, ' ')); };
    let inst;
    try {
      inst = factory(props);
      assert.ok(inst && inst.$node && inst.$node.nodeType === 1, 'a root element');
      assert.ok(inst.instance !== undefined, '.instance is readable (null until there is a vendor object)');
      assert.equal(typeof inst.refresh, 'function');
      assert.equal(typeof inst.destroy, 'function');
      await inst.mount(document.body);
      inst.refresh();
      inst.destroy();
    } finally {
      console.error = original;
    }
    assert.deepEqual(errors, [], 'errors while creating, mounting, refreshing or destroying');
    assert.doesNotThrow(() => inst.destroy(), 'destroy twice');
    assert.equal(document.body.contains(inst.$node), false, 'removed from the page');
  });

  test(name + ' · base: `lib` and `options` are accepted', async () => {
    const inst = factory(Object.assign({}, props, { lib: {}, options: {} }));
    await inst.mount(document.body);
    inst.destroy();
  });

  test(name + ' · base: no listener or timer is left after 100 create / mount / destroy cycles', async () => {
    // Listeners are matched by target, type and handler, so a leak report names them.
    const added = new Map();
    const targets = [['window', window], ['document', document], ['html', document.documentElement], ['body', document.body]];
    const originals = [];
    for (const [label, target] of targets) {
      const add = target.addEventListener;
      const remove = target.removeEventListener;
      originals.push([target, add, remove]);
      target.addEventListener = function (type, fn) {
        const key = label + ':' + type;
        const list = added.get(key) || [];
        list.push(fn);
        added.set(key, list);
        return add.apply(this, arguments);
      };
      target.removeEventListener = function (type, fn) {
        const list = added.get(label + ':' + type);
        if (list && list.indexOf(fn) >= 0) list.splice(list.indexOf(fn), 1);
        return remove.apply(this, arguments);
      };
    }
    const live = new Map();
    const setT = window.setTimeout;
    const clearT = window.clearTimeout;
    window.setTimeout = function (fn, ms) {
      const id = setT.call(window, function () { live.delete(id); if (typeof fn === 'function') fn(); }, ms);
      live.set(id, ms || 0);
      return id;
    };
    window.clearTimeout = function (id) { live.delete(id); return clearT.call(window, id); };
    try {
      for (let i = 0; i < 100; i++) {
        const inst = factory(props);
        await inst.mount(document.body);
        inst.destroy();
      }
      // Vendors may finish short timers after destroy; what is still pending later is a leak.
      await new Promise((resolve) => setTimeout(resolve, o.leakWait || 0));
      await flush();
    } finally {
      for (const [target, add, remove] of originals) {
        target.addEventListener = add;
        target.removeEventListener = remove;
      }
      window.setTimeout = setT;
      window.clearTimeout = clearT;
    }
    // A leak grows with the instances; a few listeners that a library or the test browser adds once
    // (e.g. Playwright's own) are not one.
    const leaked = [];
    added.forEach((list, key) => { if (list.length >= 10) leaked.push(key + ' ×' + list.length); });
    assert.deepEqual(leaked, [], 'listeners added by the instances and not removed');
    const pending = [];
    live.forEach((ms) => pending.push(ms));
    assert.deepEqual(pending, [], 'timers still pending (their delays in ms)');
  });

  test(name + ' · base: it stays in its parent when the parent refreshes', async () => {
    const inst = factory(props);
    const parent = vf.vfunc({ render: () => vf.html`<section><div id="slot"></div></section>`, childs: [{ targetId: 'slot', component: inst }] });
    await parent.mount(document.body);
    parent.refresh();
    assert.ok(parent.$node.contains(inst.$node), 'still inside the parent');
    parent.destroy();
  });

  if (o.localeProbe) {
    test(name + ' · base: its text follows the locale', async () => {
      const inst = factory(props);
      await inst.mount(document.body);
      const before = o.localeProbe(inst);
      await vf.i18n.set('ko');
      inst.refresh();
      const after = o.localeProbe(inst);
      await vf.i18n.set('en');
      inst.destroy();
      assert.notEqual(after, before);
    });
  }
}

/** Checks the { sender, event, data } shape of a callback call. */
export function assertEvent(assert, e, sender, keys) {
  assert.ok(e && typeof e === 'object', 'an event object');
  assert.equal(e.sender, sender, 'sender is the instance');
  assert.ok('event' in e, 'event (the native event or null)');
  assert.ok(e.data && typeof e.data === 'object', 'data');
  for (const key of keys || []) assert.ok(key in e.data, 'data.' + key);
}
