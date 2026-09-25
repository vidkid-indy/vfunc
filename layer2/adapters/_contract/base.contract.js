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
 */
export function baseContract(o) {
  const { name, factory, props, vf, test, assert, window } = o;
  const document = window.document;
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  test(name + ' · base: an instance with $node, .instance, refresh() and destroy()', async () => {
    const inst = factory(props);
    assert.ok(inst && inst.$node && inst.$node.nodeType === 1, 'a root element');
    assert.ok('instance' in inst || inst.instance !== undefined, '.instance is readable');
    assert.equal(typeof inst.refresh, 'function');
    assert.equal(typeof inst.destroy, 'function');
    await inst.mount(document.body);
    inst.refresh();
    inst.destroy();
    assert.doesNotThrow(() => inst.destroy(), 'destroy twice');
    assert.equal(document.body.contains(inst.$node), false, 'removed from the page');
  });

  test(name + ' · base: `lib` and `options` are accepted', async () => {
    const inst = factory(Object.assign({}, props, { lib: {}, options: {} }));
    await inst.mount(document.body);
    inst.destroy();
  });

  test(name + ' · base: no listener or timer is left after 100 create / mount / destroy cycles', async () => {
    const counts = { listeners: 0, timers: 0 };
    const targets = [window, document, document.documentElement, document.body];
    const originals = [];
    for (const target of targets) {
      const add = target.addEventListener;
      const remove = target.removeEventListener;
      originals.push([target, add, remove]);
      target.addEventListener = function () { counts.listeners++; return add.apply(this, arguments); };
      target.removeEventListener = function () { counts.listeners--; return remove.apply(this, arguments); };
    }
    const live = new Set();
    const setT = window.setTimeout;
    const clearT = window.clearTimeout;
    window.setTimeout = function (fn, ms) {
      const id = setT.call(window, function () { live.delete(id); fn(); }, ms);
      live.add(id);
      return id;
    };
    window.clearTimeout = function (id) { live.delete(id); return clearT.call(window, id); };
    try {
      for (let i = 0; i < 100; i++) {
        const inst = factory(props);
        await inst.mount(document.body);
        inst.destroy();
      }
      await flush();
    } finally {
      for (const [target, add, remove] of originals) {
        target.addEventListener = add;
        target.removeEventListener = remove;
      }
      window.setTimeout = setT;
      window.clearTimeout = clearT;
    }
    assert.ok(counts.listeners <= 0, 'listeners added and not removed: ' + counts.listeners);
    assert.equal(live.size, 0, 'timers still pending');
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
