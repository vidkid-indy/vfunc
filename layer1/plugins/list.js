// SPDX-License-Identifier: Apache-2.0
//
// vf.ext.list — the official keyed list plugin (D-044). A component render replaces its whole inside;
// for long lists where a few rows change (update, swap, remove) this plugin keeps one element per
// item and touches only what changed. Written in ES5 syntax so the same source serves IE11; only the
// final `export` is ES2015, and the build turns it into dist/plugins/list.min.js (<script>, global
// `vfList`) and dist/plugins/list.esm.js.
//
//   const list = vf.use(vfList);
//   const rows = list.create('#tbody', {
//     key: (item) => item.id,
//     render: (item) => vf.html`<tr><td>${item.label}</td></tr>`
//   });
//   rows.set(items);   // same key and same object: kept; new object: that row is drawn again;
//                      // new order: rows are moved; missing keys: removed
//
// The container belongs to the list: put nothing else in it. Inside a component, mark it with
// data-vf-keep (so the component's own render leaves it alone) or use a vf.attach target without render.
// Each row gets data-vf-key; delegated handlers find the item with closest('[data-vf-key]').
//
// 키가 있는 목록 공식 플러그인입니다. 항목마다 요소 하나를 유지하고 바뀐 행만 다시 그리며, 순서가
// 바뀌면 요소를 옮기기만 합니다. 컨테이너에는 목록 행만 둡니다.

var MARK = 'vf-list';

function warn(message) {
  if (typeof console !== 'undefined' && console.warn) console.warn('[vfunc] list: ' + message);
}

/** Indexes (into `seq`) of a longest increasing subsequence of `seq`; -1 entries are skipped. */
function increasing(seq) {
  var tails = [];      // index into seq of the smallest tail of each length
  var prev = [];
  for (var i = 0; i < seq.length; i++) {
    var v = seq[i];
    if (v < 0) continue;
    var lo = 0;
    var hi = tails.length;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (seq[tails[mid]] < v) lo = mid + 1;
      else hi = mid;
    }
    prev[i] = lo > 0 ? tails[lo - 1] : -1;
    tails[lo] = i;
  }
  var out = {};
  for (var k = tails.length ? tails[tails.length - 1] : -1; k >= 0; k = prev[k]) out[k] = true;
  return out;
}

function install(vf) {
  /**
   * @param {Element|string} target - the container (the direct parent of the rows: tbody, ul, div …)
   * @param {{ key: function(*): (string|number), render: function(*): *, items?: Array }} options
   */
  function create(target, options) {
    var container = typeof target === 'string' ? vf.$(target) : target;
    if (!container || container.nodeType !== 1) {
      warn('container not found: ' + target);
      return null;
    }
    if (!options || typeof options.key !== 'function' || typeof options.render !== 'function') {
      throw new TypeError('vf.ext.list.create: options.key and options.render must be functions');
    }
    var keyOf = options.key;
    var render = options.render;
    var entries = [];            // { key, item, el } in display order
    var byKey = Object.create(null);
    var destroyed = false;

    /** Draws `list` (entries) in one parse; sets .el on each. Entries whose markup is not one element are dropped. */
    function draw(list) {
      if (!list.length) return list;
      var parts = [];
      for (var i = 0; i < list.length; i++) {
        // A vf.html result is markup; anything else is escaped as text (rule 20).
        var markup = render(list[i].item);
        parts.push(markup instanceof vf.SafeHtml ? String(markup) : vf.esc(markup));
      }
      var holder = document.createElement(container.tagName);
      holder.innerHTML = parts.join('<!--' + MARK + '-->');
      var drawn = [];
      var n = 0;
      var found = null;
      var count = 0;
      // Take the nodes off the front: detaching from the front is many times faster than from the middle.
      for (var node = holder.firstChild; ; node = holder.firstChild) {
        if (node) holder.removeChild(node);
        if (!node || (node.nodeType === 8 && node.nodeValue === MARK)) {
          var entry = list[n++];
          if (count === 1) {
            found.setAttribute('data-vf-key', entry.key);
            entry.el = found;
            drawn.push(entry);
          } else if (entry) {
            warn('render must return exactly one element (key ' + entry.key + ')');
          }
          found = null;
          count = 0;
          if (!node) break;
        } else if (node.nodeType === 1) {
          found = node;
          count++;
        }
      }
      return drawn;
    }

    /** Replaces an element in place, keeping focus on the same data-action inside the row. */
    function replace(oldEl, newEl) {
      var active = typeof document !== 'undefined' ? document.activeElement : null;
      var action = active && oldEl.contains(active) ? active.getAttribute('data-action') : null;
      oldEl.parentNode.replaceChild(newEl, oldEl);
      if (action) {
        var list = newEl.querySelectorAll('[data-action]');
        for (var i = 0; i < list.length; i++) {
          if (list[i].getAttribute('data-action') === action) { list[i].focus(); break; }
        }
      }
    }

    /**
     * Shows `items` in this order, reusing the element of every key whose item is the same object.
     * `force`: true draws every kept item again.
     */
    function update(items, force) {
      if (destroyed) return;
      items = items || [];
      var next = [];
      var nextByKey = Object.create(null);
      var redraw = [];
      var fresh = [];
      var i;
      for (i = 0; i < items.length; i++) {
        var k = keyOf(items[i]);
        if (k == null || k === '') { warn('item without a key at index ' + i); continue; }
        k = String(k);
        if (nextByKey[k]) { warn('duplicate key ' + k + '; only the first item is shown'); continue; }
        var old = byKey[k];
        var entry = { key: k, item: items[i], el: old ? old.el : null, old: old ? old.index : -1 };
        nextByKey[k] = entry;
        next.push(entry);
        if (!old) fresh.push(entry);
        else if (force || old.item !== items[i]) redraw.push(entry);
      }

      // Nothing kept: start from an empty container (the fast path for create and clear).
      if (next.length === fresh.length) {
        container.textContent = '';
        var drawnAll = draw(next);
        var frag = document.createDocumentFragment();
        for (i = 0; i < drawnAll.length; i++) frag.appendChild(drawnAll[i].el);
        container.appendChild(frag);
        commit(drawnAll);
        return;
      }

      for (i = 0; i < entries.length; i++) {
        if (!nextByKey[entries[i].key]) container.removeChild(entries[i].el);
      }
      // A changed item takes the place of its old element, so it keeps its old position.
      var changed = draw(redraw);
      for (i = 0; i < changed.length; i++) replace(byKey[changed[i].key].el, changed[i].el);
      draw(fresh);

      var kept = [];
      for (i = 0; i < next.length; i++) kept.push(next[i].el ? next[i].old : -1);
      var stay = increasing(kept);
      var ref = null;
      for (i = next.length - 1; i >= 0; i--) {
        var e = next[i];
        if (!e.el) continue;                       // render failed: skipped
        if (!stay[i] || e.el.parentNode !== container) container.insertBefore(e.el, ref);
        ref = e.el;
      }
      var shown = [];
      for (i = 0; i < next.length; i++) if (next[i].el && next[i].el.parentNode === container) shown.push(next[i]);
      commit(shown);
    }

    function commit(list) {
      entries = list;
      byKey = Object.create(null);
      for (var i = 0; i < list.length; i++) {
        list[i].index = i;
        byKey[list[i].key] = list[i];
      }
    }

    /** Draws one item again (its data changed in place), or every item without a key. */
    function refresh(key) {
      if (destroyed) return;
      if (!arguments.length) {
        update(items(), true);
        return;
      }
      // One row: draw it and put it in place, without walking the whole list.
      var entry = byKey[String(key)];
      if (!entry) return;
      var next = { key: entry.key, item: entry.item, el: null };
      if (draw([next]).length) {
        replace(entry.el, next.el);
        entry.el = next.el;
      }
    }

    function items() {
      var out = [];
      for (var i = 0; i < entries.length; i++) out.push(entries[i].item);
      return out;
    }

    function element(key) {
      var e = byKey[String(key)];
      return e ? e.el : null;
    }

    /** Removes the rows this list drew; later calls do nothing. */
    function destroy() {
      if (destroyed) return;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].el.parentNode === container) container.removeChild(entries[i].el);
      }
      entries = [];
      byKey = Object.create(null);
      destroyed = true;
    }

    if (options.items) update(options.items, null);
    return {
      set: function (list) { update(list, null); },
      refresh: refresh,
      items: items,
      element: element,
      destroy: destroy
    };
  }

  return { create: create };
}

var vfList = { name: 'list', version: '1.0.0', requires: '^1.0.0', install: install };

export default vfList;
