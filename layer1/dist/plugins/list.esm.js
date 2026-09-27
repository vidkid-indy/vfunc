/*! vfunc.js list plugin (vfunc v1.2.0) | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// layer1/plugins/list.js
var MARK = "vf-list";
function warn(message) {
  if (typeof console !== "undefined" && console.warn) console.warn("[vfunc] list: " + message);
}
__name(warn, "warn");
function increasing(seq) {
  var tails = [];
  var prev = [];
  for (var i = 0; i < seq.length; i++) {
    var v = seq[i];
    if (v < 0) continue;
    var lo = 0;
    var hi = tails.length;
    while (lo < hi) {
      var mid = lo + hi >> 1;
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
__name(increasing, "increasing");
function install(vf) {
  function create(target, options) {
    var container = typeof target === "string" ? vf.$(target) : target;
    if (!container || container.nodeType !== 1) {
      warn("container not found: " + target);
      return null;
    }
    if (!options || typeof options.key !== "function" || typeof options.render !== "function") {
      throw new TypeError("[vfunc] list: key and render must be functions");
    }
    var keyOf = options.key;
    var render = options.render;
    var entries = [];
    var byKey = /* @__PURE__ */ Object.create(null);
    var destroyed = false;
    function draw(list) {
      if (!list.length) return list;
      var parts = [];
      for (var i = 0; i < list.length; i++) {
        var markup = render(list[i].item);
        parts.push(markup instanceof vf.SafeHtml ? String(markup) : vf.esc(markup));
      }
      var holder = document.createElement(container.tagName);
      holder.innerHTML = parts.join("<!--" + MARK + "-->");
      var drawn = [];
      var n = 0;
      var found = null;
      var count = 0;
      for (var node = holder.firstChild; ; node = holder.firstChild) {
        if (node) holder.removeChild(node);
        if (!node || node.nodeType === 8 && node.nodeValue === MARK) {
          var entry = list[n++];
          if (count === 1) {
            found.setAttribute("data-vf-key", entry.key);
            entry.el = found;
            drawn.push(entry);
          } else if (entry) {
            warn("render must give one element, key " + entry.key);
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
    __name(draw, "draw");
    function replace(oldEl, newEl) {
      var active = typeof document !== "undefined" ? document.activeElement : null;
      var action = active && oldEl.contains(active) ? active.getAttribute("data-action") : null;
      oldEl.parentNode.replaceChild(newEl, oldEl);
      if (action) {
        var list = newEl.querySelectorAll("[data-action]");
        for (var i = 0; i < list.length; i++) {
          if (list[i].getAttribute("data-action") === action) {
            list[i].focus();
            break;
          }
        }
      }
    }
    __name(replace, "replace");
    function update(items2, force) {
      if (destroyed) return;
      items2 = items2 || [];
      var next = [];
      var nextByKey = /* @__PURE__ */ Object.create(null);
      var redraw = [];
      var fresh = [];
      var i;
      for (i = 0; i < items2.length; i++) {
        var k = keyOf(items2[i]);
        if (k == null || k === "") {
          warn("no key at index " + i);
          continue;
        }
        k = String(k);
        if (nextByKey[k]) {
          warn("duplicate key " + k);
          continue;
        }
        var old = byKey[k];
        var entry = { key: k, item: items2[i], el: old ? old.el : null, old: old ? old.index : -1 };
        nextByKey[k] = entry;
        next.push(entry);
        if (!old) fresh.push(entry);
        else if (force || old.item !== items2[i]) redraw.push(entry);
      }
      var shown = [];
      if (next.length === fresh.length) {
        container.textContent = "";
        shown = draw(next);
        var frag = document.createDocumentFragment();
        for (i = 0; i < shown.length; i++) frag.appendChild(shown[i].el);
        container.appendChild(frag);
      } else {
        for (i = 0; i < entries.length; i++) {
          if (!nextByKey[entries[i].key]) container.removeChild(entries[i].el);
        }
        var changed = draw(redraw);
        for (i = 0; i < changed.length; i++) replace(byKey[changed[i].key].el, changed[i].el);
        draw(fresh);
        var kept = [];
        for (i = 0; i < next.length; i++) kept.push(next[i].el ? next[i].old : -1);
        var stay = increasing(kept);
        var ref = null;
        for (i = next.length - 1; i >= 0; i--) {
          var e = next[i];
          if (!e.el) continue;
          if (!stay[i] || e.el.parentNode !== container) container.insertBefore(e.el, ref);
          ref = e.el;
        }
        for (i = 0; i < next.length; i++) if (next[i].el && next[i].el.parentNode === container) shown.push(next[i]);
      }
      entries = shown;
      byKey = /* @__PURE__ */ Object.create(null);
      for (i = 0; i < shown.length; i++) {
        shown[i].index = i;
        byKey[shown[i].key] = shown[i];
      }
    }
    __name(update, "update");
    function refresh(key) {
      if (destroyed) return;
      if (!arguments.length) {
        update(items(), true);
        return;
      }
      var entry = byKey[String(key)];
      if (!entry) return;
      var next = { key: entry.key, item: entry.item, el: null };
      if (draw([next]).length) {
        replace(entry.el, next.el);
        entry.el = next.el;
      }
    }
    __name(refresh, "refresh");
    function items() {
      var out = [];
      for (var i = 0; i < entries.length; i++) out.push(entries[i].item);
      return out;
    }
    __name(items, "items");
    function element(key) {
      var e = byKey[String(key)];
      return e ? e.el : null;
    }
    __name(element, "element");
    function destroy() {
      if (destroyed) return;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].el.parentNode === container) container.removeChild(entries[i].el);
      }
      entries = [];
      byKey = /* @__PURE__ */ Object.create(null);
      destroyed = true;
    }
    __name(destroy, "destroy");
    if (options.items) update(options.items, null);
    return {
      set: /* @__PURE__ */ __name(function(list) {
        update(list, null);
      }, "set"),
      refresh,
      items,
      element,
      destroy
    };
  }
  __name(create, "create");
  return { create };
}
__name(install, "install");
var vfList = { name: "list", version: "1.0.0", requires: "^1.0.0", install };
var list_default = vfList;
export {
  list_default as default
};
//# sourceMappingURL=list.esm.js.map
