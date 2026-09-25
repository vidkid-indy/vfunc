// SPDX-License-Identifier: Apache-2.0
//
// vf.ext.shortcut — the official keyboard shortcut plugin (D-027, D-030). Written in ES5 syntax so
// the same source serves IE11; only the final `export` is ES2015, and the build turns it into
// dist/plugins/shortcut.min.js (<script>, global `vfShortcut`) and dist/plugins/shortcut.esm.js.
//
//   const keys = vf.use(vfShortcut);
//   const off = keys.add('mod+k', () => search.focus(), { label: 'Search' });
//   keys.list();   // [{ combo: 'ctrl+k', label: 'Search' }] — for your own help screen
//   off();
//
// Combos: modifiers ctrl, alt, shift, meta and mod (meta on Apple devices, ctrl elsewhere), then
// one key as KeyboardEvent.key names it ('k', 'enter', 'escape', 'arrowup', 'f2', '?', 'space').
// For a symbol such as '?' shift is ignored, because the symbol already depends on the layout.
// Keys typed into inputs, textareas, selects and editable elements are ignored unless the
// shortcut allows it, and so are keys that belong to an IME composition (Korean, Japanese, Chinese).
// The plugin draws no UI (design separation): build the help screen from list().
//
// 키보드 단축키 공식 플러그인입니다. 입력칸 안의 키와 IME 조합 중인 키는 무시하고, 화면은 그리지
// 않습니다(도움말 화면은 list()로 앱이 만듭니다).

var MODIFIERS = ['ctrl', 'alt', 'shift', 'meta'];

// Older names (IE11, old Edge) and friendlier spellings → KeyboardEvent.key, lower case.
var ALIASES = {
  esc: 'escape', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright',
  del: 'delete', spacebar: 'space', ' ': 'space', plus: '+', return: 'enter', control: 'ctrl',
  cmd: 'meta', command: 'meta', os: 'meta', win: 'meta', option: 'alt'
};

function apple() {
  var nav = typeof navigator !== 'undefined' ? navigator : {};
  return /Mac|iPhone|iPad|iPod/.test(nav.platform || nav.userAgent || '');
}

function keyName(key) {
  var k = String(key == null ? '' : key).toLowerCase();
  return Object.prototype.hasOwnProperty.call(ALIASES, k) ? ALIASES[k] : k;
}

/** True for a key that is a symbol (not a letter, digit or named key): shift does not count. */
function symbol(key) {
  return key.length === 1 && !/[a-z0-9]/.test(key);
}

/** Canonical form "ctrl+alt+shift+meta+key" from parts. */
function canonical(mods, key) {
  var out = [];
  for (var i = 0; i < MODIFIERS.length; i++) {
    var m = MODIFIERS[i];
    if (mods[m] && !(m === 'shift' && symbol(key))) out.push(m);
  }
  out.push(key);
  return out.join('+');
}

/** 'Mod+Shift+K' → 'ctrl+shift+k' (or 'shift+meta+k' on Apple devices). Returns '' when invalid. */
function parseCombo(combo, isApple) {
  // A trailing '+' is the plus key itself: 'ctrl++'.
  var text = String(combo == null ? '' : combo).replace(/\s+/g, '');
  var plus = /\+\+$/.test(text) || text === '+';
  var parts = (plus ? text.slice(0, -1) : text).split('+');
  var mods = {};
  var key = plus ? '+' : '';
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '') continue;
    var name = keyName(parts[i]);
    if (name === 'mod') name = isApple ? 'meta' : 'ctrl';
    if (MODIFIERS.indexOf(name) >= 0) mods[name] = true;
    else if (key) return '';
    else key = name;
  }
  return key ? canonical(mods, key) : '';
}

function fromEvent(event) {
  var key = keyName(event.key);
  if (!key || MODIFIERS.indexOf(key) >= 0 || key === 'unidentified' || key === 'dead') return '';
  return canonical({ ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey }, key);
}

function editable(target) {
  if (!target || target.nodeType !== 1) return false;
  var tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    var type = (target.getAttribute('type') || 'text').toLowerCase();
    return !/^(button|submit|reset|checkbox|radio|range|color|file|image)$/.test(type);
  }
  return !!target.isContentEditable;
}

function install(vf, options) {
  var o = options || {};
  var target = o.target || (typeof document !== 'undefined' ? document : null);
  var isApple = o.apple == null ? apple() : !!o.apple;
  var entries = [];

  function onKeyDown(event) {
    if (event.isComposing || event.keyCode === 229) return;
    var combo = fromEvent(event);
    if (!combo) return;
    var inInput = editable(event.target);
    // Newest first, so a screen can override a global shortcut while it is open.
    var list = entries.slice();
    for (var i = list.length - 1; i >= 0; i--) {
      var entry = list[i];
      if (entry.combo !== combo || (inInput && !entry.allowInInput)) continue;
      if (entry.preventDefault) event.preventDefault();
      entry.handler(event, { combo: combo, label: entry.label });
      return;
    }
  }

  /**
   * @param {string} combo - e.g. 'mod+k', 'shift+?', 'escape'
   * @param {function(KeyboardEvent, {combo: string, label: string}): void} handler
   * @param {{label?: string, allowInInput?: boolean, preventDefault?: boolean}} [opts]
   * @returns {function(): void} removes this shortcut
   */
  function add(combo, handler, opts) {
    var c = parseCombo(combo, isApple);
    if (!c || typeof handler !== 'function') {
      if (typeof console !== 'undefined' && console.warn) console.warn('[vfunc] shortcut: invalid combo or handler: ' + combo);
      return function () {};
    }
    var x = opts || {};
    var entry = {
      combo: c,
      handler: handler,
      label: x.label == null ? '' : String(x.label),
      allowInInput: !!x.allowInInput,
      preventDefault: x.preventDefault !== false
    };
    entries.push(entry);
    return function () { removeEntry(entry); };
  }

  function removeEntry(entry) {
    var i = entries.indexOf(entry);
    if (i >= 0) entries.splice(i, 1);
  }

  /** Removes the shortcuts of this combo: only the one with `handler` when given. */
  function remove(combo, handler) {
    var c = parseCombo(combo, isApple);
    for (var i = entries.length - 1; i >= 0; i--) {
      if (entries[i].combo === c && (!handler || entries[i].handler === handler)) entries.splice(i, 1);
    }
  }

  /** One row per combo (the newest label), sorted: for a help screen. */
  function list() {
    var seen = {};
    var rows = [];
    for (var i = entries.length - 1; i >= 0; i--) {
      var e = entries[i];
      if (Object.prototype.hasOwnProperty.call(seen, e.combo)) continue;
      seen[e.combo] = true;
      rows.push({ combo: e.combo, label: e.label });
    }
    rows.sort(function (a, b) { return a.combo < b.combo ? -1 : a.combo > b.combo ? 1 : 0; });
    return rows;
  }

  function destroy() {
    entries = [];
    if (target) target.removeEventListener('keydown', onKeyDown);
  }

  if (target) target.addEventListener('keydown', onKeyDown);

  return { add: add, remove: remove, list: list, parse: function (combo) { return parseCombo(combo, isApple); }, destroy: destroy };
}

var vfShortcut = { name: 'shortcut', version: '1.0.0', requires: '^1.0.0', install: install };

export default vfShortcut;
