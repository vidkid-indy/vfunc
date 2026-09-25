/*! vfunc.js shortcut plugin (vfunc v1.0.0-rc.8) | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// layer1/plugins/shortcut.js
var MODIFIERS = ["ctrl", "alt", "shift", "meta"];
var ALIASES = {
  esc: "escape",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  spacebar: "space",
  " ": "space",
  plus: "+",
  return: "enter",
  control: "ctrl",
  cmd: "meta",
  command: "meta",
  os: "meta",
  win: "meta",
  option: "alt"
};
function apple() {
  var nav = typeof navigator !== "undefined" ? navigator : {};
  return /Mac|iPhone|iPad|iPod/.test(nav.platform || nav.userAgent || "");
}
__name(apple, "apple");
function keyName(key) {
  var k = String(key == null ? "" : key).toLowerCase();
  return Object.prototype.hasOwnProperty.call(ALIASES, k) ? ALIASES[k] : k;
}
__name(keyName, "keyName");
function symbol(key) {
  return key.length === 1 && !/[a-z0-9]/.test(key);
}
__name(symbol, "symbol");
function canonical(mods, key) {
  var out = [];
  for (var i = 0; i < MODIFIERS.length; i++) {
    var m = MODIFIERS[i];
    if (mods[m] && !(m === "shift" && symbol(key))) out.push(m);
  }
  out.push(key);
  return out.join("+");
}
__name(canonical, "canonical");
function parseCombo(combo, isApple) {
  var text = String(combo == null ? "" : combo).replace(/\s+/g, "");
  var plus = /\+\+$/.test(text) || text === "+";
  var parts = (plus ? text.slice(0, -1) : text).split("+");
  var mods = {};
  var key = plus ? "+" : "";
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === "") continue;
    var name = keyName(parts[i]);
    if (name === "mod") name = isApple ? "meta" : "ctrl";
    if (MODIFIERS.indexOf(name) >= 0) mods[name] = true;
    else if (key) return "";
    else key = name;
  }
  return key ? canonical(mods, key) : "";
}
__name(parseCombo, "parseCombo");
function fromEvent(event) {
  var key = keyName(event.key);
  if (!key || MODIFIERS.indexOf(key) >= 0 || key === "unidentified" || key === "dead") return "";
  return canonical({ ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey }, key);
}
__name(fromEvent, "fromEvent");
function editable(target) {
  if (!target || target.nodeType !== 1) return false;
  var tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    var type = (target.getAttribute("type") || "text").toLowerCase();
    return !/^(button|submit|reset|checkbox|radio|range|color|file|image)$/.test(type);
  }
  return !!target.isContentEditable;
}
__name(editable, "editable");
function install(vf, options) {
  var o = options || {};
  var target = o.target || (typeof document !== "undefined" ? document : null);
  var isApple = o.apple == null ? apple() : !!o.apple;
  var entries = [];
  function onKeyDown(event) {
    if (event.isComposing || event.keyCode === 229) return;
    var combo = fromEvent(event);
    if (!combo) return;
    var inInput = editable(event.target);
    var list2 = entries.slice();
    for (var i = list2.length - 1; i >= 0; i--) {
      var entry = list2[i];
      if (entry.combo !== combo || inInput && !entry.allowInInput) continue;
      if (entry.preventDefault) event.preventDefault();
      entry.handler(event, { combo, label: entry.label });
      return;
    }
  }
  __name(onKeyDown, "onKeyDown");
  function add(combo, handler, opts) {
    var c = parseCombo(combo, isApple);
    if (!c || typeof handler !== "function") {
      if (typeof console !== "undefined" && console.warn) console.warn("[vfunc] shortcut: invalid combo or handler: " + combo);
      return function() {
      };
    }
    var x = opts || {};
    var entry = {
      combo: c,
      handler,
      label: x.label == null ? "" : String(x.label),
      allowInInput: !!x.allowInInput,
      preventDefault: x.preventDefault !== false
    };
    entries.push(entry);
    return function() {
      removeEntry(entry);
    };
  }
  __name(add, "add");
  function removeEntry(entry) {
    var i = entries.indexOf(entry);
    if (i >= 0) entries.splice(i, 1);
  }
  __name(removeEntry, "removeEntry");
  function remove(combo, handler) {
    var c = parseCombo(combo, isApple);
    for (var i = entries.length - 1; i >= 0; i--) {
      if (entries[i].combo === c && (!handler || entries[i].handler === handler)) entries.splice(i, 1);
    }
  }
  __name(remove, "remove");
  function list() {
    var seen = {};
    var rows = [];
    for (var i = entries.length - 1; i >= 0; i--) {
      var e = entries[i];
      if (Object.prototype.hasOwnProperty.call(seen, e.combo)) continue;
      seen[e.combo] = true;
      rows.push({ combo: e.combo, label: e.label });
    }
    rows.sort(function(a, b) {
      return a.combo < b.combo ? -1 : a.combo > b.combo ? 1 : 0;
    });
    return rows;
  }
  __name(list, "list");
  function destroy() {
    entries = [];
    if (target) target.removeEventListener("keydown", onKeyDown);
  }
  __name(destroy, "destroy");
  if (target) target.addEventListener("keydown", onKeyDown);
  return { add, remove, list, parse: /* @__PURE__ */ __name(function(combo) {
    return parseCombo(combo, isApple);
  }, "parse"), destroy };
}
__name(install, "install");
var vfShortcut = { name: "shortcut", version: "1.0.0", requires: "^1.0.0", install };
var shortcut_default = vfShortcut;
export {
  shortcut_default as default
};
//# sourceMappingURL=shortcut.esm.js.map
