/*!
 * vfunc.js v0.0.0-dev | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc
 */
// SPDX-License-Identifier: Apache-2.0
//
// vfunc.js layer 1 — the engine and its core helpers, in a single source file.
//
// Origin: the pilot engine (vf.func.js, vf.common.js, core/utils/escapeHtml.js) merged and
// reworked for the product. See ai-docs/architecture_decisions.md D-002, D-004, D-012.
//
// Compatibility rule (CLAUDE.md rule 19): this file is also transpiled to ES5 for IE11 /
// Edge IE mode. Do not use APIs that cannot be polyfilled (Proxy, WeakRef, regex lookbehind).

const VERSION = '0.0.0-dev';

// ---------------------------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------------------------

const hasOwn = Object.prototype.hasOwnProperty;

/** Reads an own property only, so names like "toString" never resolve to inherited members. */
function ownValue(obj, key) {
  return hasOwn.call(obj, key) ? obj[key] : undefined;
}

/** Keys that could reach an object's prototype chain. Never copied from outside data. */
function isDangerousKey(key) {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

const warned = {};

/** Development warning, printed once per distinct message. */
function warn(message) {
  if (hasOwn.call(warned, message)) return;
  warned[message] = true;
  if (typeof console !== 'undefined' && console.warn) console.warn('[vfunc] ' + message);
}

// ---------------------------------------------------------------------------------------------
// Escaping and URL safety
// ---------------------------------------------------------------------------------------------

/**
 * Escapes HTML special characters, including both quote types, so the result is safe
 * inside element content and inside quoted attribute values.
 * @param {*} value - Any value. `null` and `undefined` become an empty string.
 * @returns {string}
 */
function esc(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes a value and turns line breaks into `<br>`.
 * @param {*} value
 * @returns {string}
 */
function nl2br(value) {
  return esc(value).replace(/\r\n|\r|\n/g, '<br>');
}

const SAFE_SCHEMES = { http: 1, https: 1, mailto: 1, tel: 1 };

/**
 * Returns the URL unchanged when it is relative or uses an allowed scheme
 * (http, https, mailto, tel). Any other scheme — `javascript:`, `data:`, `vbscript:` — yields `'#'`.
 * Whitespace and control characters are ignored when detecting the scheme, because browsers
 * ignore them too (`java\tscript:` is still `javascript:`).
 * @param {*} url
 * @returns {string}
 */
function safeUrl(url) {
  if (url == null) return '';
  const text = String(url);
  // eslint-disable-next-line no-control-regex
  const compact = text.replace(/[\u0000- \u007f]+/g, '');
  const match = /^([a-z][a-z0-9+.\-]*):/i.exec(compact);
  if (match && !hasOwn.call(SAFE_SCHEMES, match[1].toLowerCase())) return '#';
  return text.trim();
}

// ---------------------------------------------------------------------------------------------
// Safe property assignment (used by the `opts` option and by vf.el)
// ---------------------------------------------------------------------------------------------

/** Properties that parse a string as HTML. Markup must come from `render`/`innerHTML` instead. */
const HTML_SINK_PROPS = { innerHTML: 1, outerHTML: 1, srcdoc: 1 };

/** Properties that hold a URL. String values pass through safeUrl. */
const URL_PROPS = { href: 1, src: 1, action: 1, formAction: 1, poster: 1, cite: 1 };

function assignProps(element, props, where) {
  if (!props) return;
  for (const key in props) {
    if (!hasOwn.call(props, key) || isDangerousKey(key)) continue;
    const value = props[key];
    if (hasOwn.call(HTML_SINK_PROPS, key)) {
      warn(where + ': "' + key + '" is not allowed. Put markup in render or innerHTML and build it with vf.html.');
      continue;
    }
    if (/^on/i.test(key) && typeof value !== 'function') {
      warn(where + ': "' + key + '" must be a function; string handlers are not allowed.');
      continue;
    }
    element[key] = (hasOwn.call(URL_PROPS, key) && typeof value === 'string') ? safeUrl(value) : value;
  }
}

// ---------------------------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------------------------

/**
 * `querySelector` on `root` (default: document).
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {Element|null}
 */
function $(selector, root) {
  return (root || document).querySelector(selector);
}

/**
 * `querySelectorAll` on `root` (default: document), returned as a real array.
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {Element[]}
 */
function $$(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

/**
 * Creates an element and assigns properties to it. HTML-parsing properties (innerHTML, outerHTML,
 * srcdoc) are refused, `on*` properties must be functions, and URL properties pass through safeUrl.
 * @param {string} tag
 * @param {Object} [props]
 * @returns {HTMLElement}
 */
function el(tag, props) {
  const element = document.createElement(tag);
  assignProps(element, props, 'vf.el');
  return element;
}

/**
 * Parses markup and returns its first element. The markup is trusted as-is: build it with
 * vf.html (or escape values with vf.esc) when it contains outside data.
 * @param {string} html
 * @returns {Element|null}
 */
function node(html) {
  const holder = document.createElement('div');
  holder.innerHTML = html == null ? '' : String(html);
  return holder.firstElementChild || null;
}

/**
 * Parses markup into a DocumentFragment that keeps every top-level node.
 * The same trust rule as vf.node applies.
 * @param {string} html
 * @returns {DocumentFragment}
 */
function frag(html) {
  const fragment = document.createDocumentFragment();
  if (html != null && html !== '') {
    const holder = document.createElement('div');
    holder.innerHTML = String(html);
    while (holder.firstChild) fragment.appendChild(holder.firstChild);
  }
  return fragment;
}

/**
 * Maps every descendant element that has an id: `{ [id]: element }`. The root itself is not included.
 * When ids repeat, the last one in document order wins.
 * @param {ParentNode} root
 * @returns {Object<string, Element>}
 */
function idMap(root) {
  const map = {};
  if (!root || !root.querySelectorAll) return map;
  const list = root.querySelectorAll('[id]');
  for (let i = 0; i < list.length; i++) {
    const id = list[i].id;
    if (id && !isDangerousKey(id)) map[id] = list[i];
  }
  return map;
}

// ---------------------------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------------------------

const FORM_TAGS = { INPUT: 1, SELECT: 1, TEXTAREA: 1 };
const NON_VALUE_INPUTS = { button: 1, submit: 1, reset: 1, image: 1 };

/** Accepts either a map of `{ id: control }` or a root element whose id'd controls are collected. */
function toControlMap(target) {
  if (!target) return {};
  if (target.nodeType === 1 || target.nodeType === 9 || target.nodeType === 11) {
    const all = idMap(target);
    const controls = {};
    for (const id in all) {
      if (hasOwn.call(all, id) && hasOwn.call(FORM_TAGS, all[id].tagName)) controls[id] = all[id];
    }
    return controls;
  }
  return target;
}

function readControl(control) {
  const tag = control.tagName;
  const type = (control.type || '').toLowerCase();
  if (tag === 'INPUT' && (type === 'checkbox' || type === 'radio')) return control.checked;
  if (tag === 'SELECT') {
    if (control.multiple) {
      const selected = [];
      for (let i = 0; i < control.options.length; i++) {
        if (control.options[i].selected) selected.push(control.options[i].value);
      }
      return selected;
    }
    return control.selectedIndex >= 0 ? control.options[control.selectedIndex].value : '';
  }
  return control.value;
}

/**
 * Reads form control values.
 * @param {Object<string, Element>|Element} target - `{ id: control }` map, or a root element
 *   (every input/select/textarea with an id inside it is read).
 * @param {{ skipPassword?: boolean }} [options] - `skipPassword: true` leaves out password fields,
 *   for example when the values are only logged or sent to analytics.
 * @returns {Object<string, *>} `{ id: value }`. Checkboxes and radios give a boolean,
 *   a multiple select gives an array.
 */
function formValues(target, options) {
  const controls = toControlMap(target);
  const skipPassword = !!(options && options.skipPassword);
  const data = {};
  for (const id in controls) {
    if (!hasOwn.call(controls, id) || isDangerousKey(id)) continue;
    const control = controls[id];
    if (!control || !control.tagName) continue;
    if (skipPassword && (control.type || '').toLowerCase() === 'password') continue;
    data[id] = readControl(control);
  }
  return data;
}

/**
 * Clears form controls and returns the resulting values. Hidden inputs are kept.
 * A select returns to the option index in its `user-default` attribute, or to no selection.
 * @param {Object<string, Element>|Element} target
 * @returns {Object<string, *>}
 */
function formReset(target) {
  const controls = toControlMap(target);
  for (const id in controls) {
    if (!hasOwn.call(controls, id)) continue;
    const control = controls[id];
    if (!control || !control.tagName) continue;
    const tag = control.tagName;
    const type = (control.type || '').toLowerCase();
    if (tag === 'SELECT') {
      control.selectedIndex = -1;
      const fallback = control.getAttribute('user-default');
      if (fallback !== null && fallback !== '') control.selectedIndex = Number(fallback);
    } else if (tag === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
      control.checked = false;
    } else if (tag === 'TEXTAREA' || (tag === 'INPUT' && type !== 'hidden' && !hasOwn.call(NON_VALUE_INPUTS, type))) {
      control.value = '';
    }
  }
  return formValues(controls);
}

const form = { values: formValues, reset: formReset };

// ---------------------------------------------------------------------------------------------
// The engine: vfunc
// ---------------------------------------------------------------------------------------------

/**
 * Instance members that state keys, method names and element ids must not shadow.
 * Names starting with "_" are internal and reserved as well.
 */
const RESERVED = [
  '$node', 'state', 'methods', 'ids', 'refs', 'isvfunc',
  'setState', 'refresh', 'scheduleRefresh', 'mount', 'destroy', 'toString', 'valueOf'
];

function isReserved(key) {
  return key.charAt(0) === '_' || isDangerousKey(key) || RESERVED.indexOf(key) >= 0 ||
    (key in Object.prototype);
}

/**
 * @typedef {Object} VfEvent
 * @property {vfunc} sender - The instance that received the event.
 * @property {Event} event - The native event.
 * @property {string} eventType - `event.type`.
 * @property {string} id - The id of the bound element (events) or of the matched element (delegates).
 * @property {Element} target - The bound element (events) or the element that matched the selector (delegates).
 * @property {Object} data - An empty object for your own use.
 */

/**
 * @typedef {Object} VfuncOptions
 * @property {string} [tag='div'] - Tag of the root element.
 * @property {Object} [opts] - Properties assigned to the root element (see vf.el for the safety rules).
 * @property {string} [innerHTML] - Initial markup when there is no render function. Trusted as-is.
 * @property {Array<{$node: Node}|Node|{targetId: string, component: {$node: Node}|Node}>} [childs]
 *   - Children appended after rendering. `{ targetId, component }` appends into the element with that id.
 * @property {Array<{id?: string, eventType: string, onEvent?: function(VfEvent)}>} [events]
 *   - Listeners on the element with `id` (or on the root when `id` is omitted).
 * @property {Array<{selector: string, eventType: string, onEvent?: function(VfEvent)}>} [delegates]
 *   - Delegated listeners on the root, matched with `closest(selector)` inside the root.
 * @property {Object} [state] - State. Each key is also readable and writable as `instance.key`.
 * @property {Object<string, Function>} [methods] - Methods bound to the instance, callable as `instance.name()`.
 * @property {function(Object): string} [render] - Returns markup for the current state.
 * @property {boolean} [replaceRoot=false] - Use the first element of the markup as the root instead of wrapping it.
 * @property {function(VfEvent)} [onEvent] - Fallback handler for events and delegates without their own onEvent.
 * @property {function(Error)} [onError] - Called when render or an event handler throws. The engine does not recover.
 */

/**
 * Creates a component. Can be called with or without `new`.
 * @constructor
 * @param {VfuncOptions} [options]
 */
function vfunc(options) {
  if (!(this instanceof vfunc)) return new vfunc(options);
  const o = options || {};

  this._cfg = {
    tag: o.tag || 'div',
    opts: o.opts || {},
    innerHTML: o.innerHTML || '',
    childs: o.childs || [],
    events: o.events || [],
    delegates: o.delegates || [],
    render: typeof o.render === 'function' ? o.render : null,
    replaceRoot: !!o.replaceRoot,
    onEvent: typeof o.onEvent === 'function' ? o.onEvent : null,
    onError: typeof o.onError === 'function' ? o.onError : null
  };
  this._listeners = [];   // { el, type, fn } — released on refresh (children) and destroy (all)
  this._accessors = Object.create(null); // instance key -> 'state' | 'method' | 'id' (no inherited keys)
  this._scheduled = false;
  this._destroyed = false;

  this.isvfunc = true;
  this.state = o.state || {};
  this.methods = o.methods || {};
  this.ids = {};

  // Keep the public methods usable when detached (e.g. passed as a callback), as in the pilot.
  hide(this, 'setState', this.setState.bind(this));
  hide(this, 'refresh', this.refresh.bind(this));
  hide(this, 'scheduleRefresh', this.scheduleRefresh.bind(this));
  hide(this, 'mount', this.mount.bind(this));
  hide(this, 'destroy', this.destroy.bind(this));

  for (const name in this.methods) {
    if (hasOwn.call(this.methods, name) && typeof this.methods[name] === 'function') {
      this.methods[name] = this.methods[name].bind(this);
    }
  }

  // Build the root element.
  const cfg = this._cfg;
  const holder = document.createElement(cfg.tag);
  if (cfg.render) holder.innerHTML = this._renderMarkup();
  else if (cfg.innerHTML) holder.innerHTML = cfg.innerHTML;

  this.$node = (cfg.replaceRoot && holder.firstElementChild) ? holder.firstElementChild : holder;
  assignProps(this.$node, cfg.opts, 'opts');

  this.ids = idMap(this.$node);
  this._defineStateAccessors(this.state);
  this._defineMethodAccessors();
  this._defineIdAccessors();
  this._bindEvents(false, false);
  this._bindDelegates(false, false);
  this._appendChilds();
}

/** Defines a non-enumerable own value. */
function hide(target, key, value) {
  Object.defineProperty(target, key, { value: value, configurable: true, writable: true, enumerable: false });
}

const proto = vfunc.prototype;

// --- rendering -------------------------------------------------------------------------------

proto._renderMarkup = function () {
  try {
    const out = this._cfg.render.call(this, this.state);
    return out == null ? '' : String(out);
  } catch (err) {
    this._handleError(err);
    return '';
  }
};

proto._handleError = function (err) {
  if (typeof console !== 'undefined' && console.error) console.error('[vfunc] error:', err);
  if (this._cfg.onError) {
    try { this._cfg.onError(err); } catch (inner) { /* never let onError break the engine */ }
  }
};

/**
 * Re-renders immediately from the current state. Children in `childs` are re-attached,
 * listeners on replaced elements are released and bound again.
 */
proto.refresh = function () {
  const cfg = this._cfg;
  if (!cfg.render || this._destroyed) return;

  const holder = document.createElement(cfg.tag);
  holder.innerHTML = this._renderMarkup();

  let rootReplaced = false;
  if (cfg.replaceRoot && holder.firstElementChild) {
    const newRoot = holder.firstElementChild;
    assignProps(newRoot, cfg.opts, 'opts');
    if (this.$node.parentNode) this.$node.parentNode.replaceChild(newRoot, this.$node);
    this.$node = newRoot;
    rootReplaced = true;
  } else {
    const root = this.$node;
    while (root.firstChild) root.removeChild(root.firstChild);
    while (holder.firstChild) root.appendChild(holder.firstChild);
  }

  // Listeners on the old children (or the old root) belong to detached elements now.
  const keepRoot = rootReplaced ? null : this.$node;
  this._releaseListeners(function (entry) { return entry.el !== keepRoot; });

  this.ids = idMap(this.$node);
  this._defineIdAccessors();
  this._bindEvents(true, rootReplaced);
  this._bindDelegates(true, rootReplaced);
  this._appendChilds();
};

/** Schedules one refresh for the current tick. Many changes in the same tick render once. */
proto.scheduleRefresh = function () {
  if (this._scheduled || this._destroyed) return;
  this._scheduled = true;
  const self = this;
  Promise.resolve().then(function () {
    self._scheduled = false;
    self.refresh();
  });
};

/**
 * Merges a partial state and schedules a refresh. Keys that could reach the prototype
 * (`__proto__`, `constructor`, `prototype`) are ignored, so outside JSON can be passed safely.
 * @param {Object} patch
 */
proto.setState = function (patch) {
  if (!patch || typeof patch !== 'object') return;
  const next = {};
  let key;
  for (key in this.state) {
    if (hasOwn.call(this.state, key)) next[key] = this.state[key];
  }
  for (key in patch) {
    if (!hasOwn.call(patch, key)) continue;
    if (isDangerousKey(key)) {
      warn('setState: ignored the key "' + key + '".');
      continue;
    }
    next[key] = patch[key];
  }
  this.state = next;
  this._defineStateAccessors(patch);
  this.scheduleRefresh();
};

// --- instance accessors (the replacement for the pilot's Proxy) --------------------------------

proto._defineStateAccessors = function (source) {
  const self = this;
  for (const key in source) {
    if (!hasOwn.call(source, key) || isDangerousKey(key)) continue;
    if (this._accessors[key] === 'state') continue;
    if (isReserved(key)) {
      warn('state key "' + key + '" is a reserved name; use instance.state.' + key + ' instead.');
      continue;
    }
    // State wins over a method or id with the same name (same priority as the pilot).
    this._accessors[key] = 'state';
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get: function () { return self.state[key]; },
      set: function (value) { self.state[key] = value; self.scheduleRefresh(); }
    });
  }
};

proto._defineMethodAccessors = function () {
  for (const name in this.methods) {
    if (!hasOwn.call(this.methods, name) || this._accessors[name]) continue;
    if (isReserved(name)) {
      warn('method "' + name + '" is a reserved name; call instance.methods.' + name + '() instead.');
      continue;
    }
    this._accessors[name] = 'method';
    hide(this, name, this.methods[name]);
  }
};

proto._defineIdAccessors = function () {
  let key;
  for (key in this._accessors) {
    if (this._accessors[key] === 'id') {
      delete this[key];
      delete this._accessors[key];
    }
  }
  const self = this;
  for (key in this.ids) {
    if (!hasOwn.call(this.ids, key) || this._accessors[key]) continue;
    if (isReserved(key)) {
      warn('element id "' + key + '" is a reserved name; use instance.ids["' + key + '"] instead.');
      continue;
    }
    if (hasOwn.call(this, key)) continue; // an own property set by the user is left alone
    this._accessors[key] = 'id';
    (function (id) {
      Object.defineProperty(self, id, {
        configurable: true,
        enumerable: false,
        get: function () { return self.ids[id]; }
      });
    })(key);
  }
};

// --- listeners --------------------------------------------------------------------------------

proto._listen = function (element, type, fn) {
  element.addEventListener(type, fn);
  this._listeners.push({ el: element, type: type, fn: fn });
};

proto._releaseListeners = function (predicate) {
  const kept = [];
  for (let i = 0; i < this._listeners.length; i++) {
    const entry = this._listeners[i];
    if (!predicate || predicate(entry)) entry.el.removeEventListener(entry.type, entry.fn);
    else kept.push(entry);
  }
  this._listeners = kept;
};

proto._dispatch = function (localHandler, payload) {
  const handler = localHandler || this._cfg.onEvent;
  if (!handler) return;
  try {
    handler(payload);
  } catch (err) {
    this._handleError(err);
  }
};

proto._bindEvents = function (isRefresh, rootReplaced) {
  const self = this;
  const events = this._cfg.events;
  for (let i = 0; i < events.length; i++) {
    const spec = events[i];
    const target = spec.id ? ownValue(this.ids, spec.id) : this.$node;
    if (!target) continue;
    // After a refresh that kept the root, the root's own listeners are still attached.
    if (isRefresh && !rootReplaced && target === this.$node) continue;
    (function (spec, target) {
      self._listen(target, spec.eventType, function (event) {
        self._dispatch(spec.onEvent, {
          sender: self, event: event, eventType: event.type,
          id: spec.id || target.id || '', target: target, data: {}
        });
      });
    })(spec, target);
  }
};

proto._bindDelegates = function (isRefresh, rootReplaced) {
  // Delegated listeners live on the root; they survive a refresh unless the root was replaced.
  if (isRefresh && !rootReplaced) return;
  const self = this;
  const delegates = this._cfg.delegates;
  for (let i = 0; i < delegates.length; i++) {
    (function (spec) {
      self._listen(self.$node, spec.eventType, function (event) {
        let origin = event.target;
        if (origin && origin.nodeType !== 1) origin = origin.parentNode;
        if (!origin || !origin.closest) return;
        const matched = origin.closest(spec.selector);
        if (!matched || !self.$node.contains(matched)) return;
        self._dispatch(spec.onEvent, {
          sender: self, event: event, eventType: event.type,
          id: matched.id || '', target: matched, data: {}
        });
      });
    })(delegates[i]);
  }
};

// --- children ---------------------------------------------------------------------------------

proto._appendChilds = function () {
  const childs = this._cfg.childs;
  for (let i = 0; i < childs.length; i++) {
    const child = childs[i];
    if (!child) continue;
    let target = this.$node;
    let component = child;
    if (child.targetId && child.component) {
      target = ownValue(this.ids, child.targetId) || this.$node;
      component = child.component;
    }
    if (component.$node) target.appendChild(component.$node);
    else if (component.nodeType) target.appendChild(component);
  }
};

// --- mounting ---------------------------------------------------------------------------------

/**
 * Appends the root element to a parent. Calling it again with the same parent does nothing.
 * @param {Element|string} parent - An element or a selector.
 * @returns {Promise<vfunc>} Resolves with the instance (same signature as layer 3's VClass.mount).
 */
proto.mount = function (parent) {
  const target = typeof parent === 'string' ? document.querySelector(parent) : parent;
  if (!target) warn('mount: parent element not found.');
  // Compare with the target parent, not just "has a parent": with replaceRoot the initial root
  // still points at the detached wrapper it was parsed in (pilot decision #13).
  else if (this.$node && this.$node.parentNode !== target) target.appendChild(this.$node);
  return Promise.resolve(this);
};

/** Releases every listener, removes the root element and clears ids. */
proto.destroy = function () {
  this._destroyed = true;
  this._releaseListeners(null);
  if (this.$node && this.$node.parentNode) this.$node.parentNode.removeChild(this.$node);
  this.ids = {};
  this._defineIdAccessors();
};

/** The root element's outerHTML, so an instance can be interpolated into markup. */
proto.toString = function () {
  return this.$node ? this.$node.outerHTML : '';
};

// ---------------------------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------------------------

const version = VERSION;

const vf = {
  vfunc: vfunc,
  $: $,
  $$: $$,
  el: el,
  node: node,
  frag: frag,
  idMap: idMap,
  form: form,
  esc: esc,
  nl2br: nl2br,
  safeUrl: safeUrl,
  version: version
};

export { vfunc, $, $$, el, node, frag, idMap, form, esc, nl2br, safeUrl, version };
export default vf;
