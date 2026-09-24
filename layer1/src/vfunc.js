/*!
 * vfunc.js v0.0.0-dev | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc
 */
// SPDX-License-Identifier: Apache-2.0
//
// vfunc.js layer 1 — the engine and its core helpers, in a single source file.
//
// Origin: the pilot engine (vf.func.js, vf.common.js, core/utils/escapeHtml.js) merged and
// reworked for the product. See ai-docs/architecture_decisions.md D-002 to D-014.
//
// Compatibility rule (CLAUDE.md rule 19): this file is also transpiled to ES5 for IE11 /
// Edge IE mode. Do not use APIs that cannot be polyfilled (Proxy, WeakRef, regex lookbehind).

/* global __VFUNC_VERSION__, __VFUNC_DEV__ */
// The build (build/build.mjs) defines both constants. Importing this source directly gives a
// development build: version "0.0.0-dev" and all warnings on.
const VERSION = typeof __VFUNC_VERSION__ === 'undefined' ? '0.0.0-dev' : __VFUNC_VERSION__;

/**
 * Development mode. The minified builds set it to false, so every `if (DEV) warn(...)` call and
 * its message string are removed. Security checks never depend on this flag; only messages do.
 */
const DEV = typeof __VFUNC_DEV__ === 'undefined' ? true : __VFUNC_DEV__;

// ---------------------------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------------------------

const hasOwn = Object.prototype.hasOwnProperty;

/** Reads an own property only, so names like "toString" never resolve to inherited members. */
function ownValue(obj, key) {
  return obj != null && hasOwn.call(obj, key) ? obj[key] : undefined;
}

/** Keys that could reach an object's prototype chain. Never copied from outside data. */
function isDangerousKey(key) {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

const reported = {};

function report(kind, message) {
  const id = kind + message;
  if (hasOwn.call(reported, id)) return;
  reported[id] = true;
  if (typeof console !== 'undefined' && console[kind]) console[kind]('[vfunc] ' + message);
}

/** Development warning, printed once per distinct message. */
function warn(message) { report('warn', message); }

/** Calls a user callback; errors are reported instead of breaking the caller. */
function safeCall(fn, self, arg, onError) {
  try {
    return fn.call(self, arg);
  } catch (err) {
    if (typeof console !== 'undefined' && console.error) console.error('[vfunc] error:', err);
    if (onError) { try { onError(err); } catch (inner) { /* ignore */ } }
    return undefined;
  }
}

/** Copies own, non-dangerous keys; nested plain objects are merged recursively. */
function safeMerge(target, source, deep) {
  for (const key in source) {
    if (!hasOwn.call(source, key) || isDangerousKey(key)) continue;
    const value = source[key];
    if (deep && isPlainObject(value)) {
      const current = hasOwn.call(target, key) && isPlainObject(target[key]) ? target[key] : {};
      target[key] = safeMerge(current, value, true);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const nextTick = function (fn) { Promise.resolve().then(fn); };

/**
 * Defines official members as read-only and non-configurable, so extensions cannot replace them
 * (plan section M, S10). The target object itself stays extensible for layer 2 and layer 3.
 */
function protect(target, members) {
  for (const key in members) {
    if (hasOwn.call(members, key)) {
      Object.defineProperty(target, key, { value: members[key], enumerable: true, writable: false, configurable: false });
    }
  }
  return target;
}

// ---------------------------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------------------------

const settings = {
  strict: false,       // unsafe interpolation in vf.html throws instead of being dropped
  strictRender: false  // warn when render returns a plain string instead of vf.html output
};

/**
 * Reads or changes engine settings.
 * - `strict`: an unsafe interpolation in vf.html throws (use in development and tests).
 *   Otherwise the value is dropped and reported once with console.error.
 * - `strictRender`: warn once when a render function returns a plain string
 *   instead of vf.html output.
 * @param {{ strict?: boolean, strictRender?: boolean }} [options]
 * @returns {{ strict: boolean, strictRender: boolean }} A copy of the current settings.
 */
function config(options) {
  if (options) {
    if ('strict' in options) settings.strict = !!options.strict;
    if ('strictRender' in options) settings.strictRender = !!options.strictRender;
  }
  return { strict: settings.strict, strictRender: settings.strictRender };
}

/**
 * Reports a blocked interpolation. The value has already been dropped by the caller; this only
 * tells the developer. The minified builds pass `false` and print a short generic message.
 */
function unsafe(message) {
  const text = message || 'vf.html blocked an unsafe value; use vfunc.js (development build) for details.';
  if (settings.strict) throw new Error('[vfunc] ' + text);
  report('error', text);
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
 * Escapes a value and turns line breaks into `<br>`. The result is marked as safe HTML.
 * @param {*} value
 * @returns {SafeHtml}
 */
function nl2br(value) {
  return new SafeHtml(esc(value).replace(/\r\n|\r|\n/g, '<br>'));
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
// Safe HTML templates: vf.html, vf.unsafeHtml, vf.tpl
// ---------------------------------------------------------------------------------------------

/**
 * Markup that vf.html trusts as-is. Created by vf.html, vf.tpl, vf.nl2br and vf.unsafeHtml.
 * @constructor
 * @param {string} value
 */
function SafeHtml(value) {
  this.value = value;
}
SafeHtml.prototype.toString = function () { return this.value; };

/**
 * Marks a string as trusted markup that vf.html will not escape.
 * **Only for markup you control.** Never pass user data here; add a comment explaining why
 * the value is trusted (CLAUDE.md rule 20).
 * @param {*} markup
 * @returns {SafeHtml}
 */
function unsafeHtml(markup) {
  return new SafeHtml(markup == null ? '' : String(markup));
}

const URL_ATTRS = {
  href: 1, src: 1, action: 1, formaction: 1, 'xlink:href': 1, poster: 1, cite: 1,
  background: 1, data: 1, codebase: 1, manifest: 1
};

/**
 * A minimal HTML tokenizer that follows the markup produced so far, so each interpolation knows
 * where it lands. It is fed incrementally (static parts and inserted pieces).
 * States: text, lt (just after "<"), tagname, tag (between attributes), attrname, expect (after "="),
 * value (quoted value), unquoted, endtag, bang, comment, raw (inside <script>/<style>).
 * @constructor
 */
function MarkupScanner() {
  this.state = 'text';
  this.tagName = '';
  this.word = '';
  this.lastWord = '';
  this.attrName = '';
  this.quote = '';
  this.value = '';
  this.buffer = '';
}

const SPACE = /\s/;
const RAW_TAGS = { script: 1, style: 1 };

MarkupScanner.prototype.closeTag = function () {
  this.state = hasOwn.call(RAW_TAGS, this.tagName) ? 'raw' : 'text';
  this.buffer = '';
};

MarkupScanner.prototype.feed = function (text) {
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    switch (this.state) {
      case 'text':
        if (c === '<') this.state = 'lt';
        break;
      case 'lt':
        if (c === '!') { this.state = 'bang'; this.buffer = ''; }
        else if (c === '/') this.state = 'endtag';
        else if (/[A-Za-z]/.test(c)) { this.state = 'tagname'; this.tagName = c.toLowerCase(); }
        else this.state = c === '<' ? 'lt' : 'text';
        break;
      case 'tagname':
        if (c === '>') this.closeTag();
        else if (SPACE.test(c) || c === '/') { this.state = 'tag'; this.lastWord = ''; }
        else this.tagName += c.toLowerCase();
        break;
      case 'tag':
        if (c === '>') this.closeTag();
        else if (c === '=') { this.attrName = this.lastWord; this.state = 'expect'; }
        else if (!SPACE.test(c) && c !== '/') { this.state = 'attrname'; this.word = c; }
        break;
      case 'attrname':
        if (c === '>') this.closeTag();
        else if (c === '=') { this.attrName = this.word; this.state = 'expect'; }
        else if (SPACE.test(c) || c === '/') { this.lastWord = this.word; this.state = 'tag'; }
        else this.word += c;
        break;
      case 'expect':
        if (c === '"' || c === "'") { this.quote = c; this.value = ''; this.state = 'value'; }
        else if (c === '>') this.closeTag();
        else if (!SPACE.test(c)) this.state = 'unquoted';
        break;
      case 'value':
        if (c === this.quote) { this.state = 'tag'; this.lastWord = ''; }
        else this.value += c;
        break;
      case 'unquoted':
        if (c === '>') this.closeTag();
        else if (SPACE.test(c)) { this.state = 'tag'; this.lastWord = ''; }
        break;
      case 'endtag':
        if (c === '>') this.state = 'text';
        break;
      case 'bang':
        this.buffer += c;
        if (this.buffer === '--') { this.state = 'comment'; this.buffer = ''; }
        else if (c === '>') this.state = 'text';
        else if (this.buffer.length >= 2) this.state = 'endtag'; // <!DOCTYPE …> and the like
        break;
      case 'comment':
        this.buffer = (this.buffer + c).slice(-3);
        if (this.buffer === '-->') this.state = 'text';
        break;
      case 'raw': {
        this.buffer = (this.buffer + c).slice(-(this.tagName.length + 2));
        if (this.buffer.toLowerCase() === '</' + this.tagName) this.state = 'endtag';
        break;
      }
    }
  }
};

/** The context of the next interpolation. */
MarkupScanner.prototype.context = function () {
  switch (this.state) {
    case 'text':
    case 'comment':
      return { kind: 'text' };
    case 'value':
      return { kind: 'attr', name: this.attrName.toLowerCase(), valueSoFar: this.value };
    case 'expect':
    case 'unquoted':
      return { kind: 'unquoted', name: this.attrName.toLowerCase() };
    case 'raw':
      return { kind: this.tagName };
    case 'lt':
    case 'tagname':
      return { kind: 'tagname' };
    default:
      return { kind: 'tag' };
  }
};

function textValue(value) {
  if (value == null || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (value && value.isvfunc && typeof value.toString === 'function') return value.toString();
  if (Array.isArray(value)) {
    let joined = '';
    for (let i = 0; i < value.length; i++) joined += textValue(value[i]);
    return joined;
  }
  if (typeof value === 'function') {
    unsafe(DEV && 'vf.html: a function was interpolated; call it or pass its result.');
    return '';
  }
  return esc(value);
}

function plainString(value) {
  if (value == null || value === false) return '';
  if (Array.isArray(value)) return value.join(' ');
  return String(value);
}

function attrValue(ctx, value) {
  if (/^on/.test(ctx.name)) {
    unsafe(DEV && 'vf.html: interpolation into the event handler attribute "' + ctx.name + '" is not allowed.');
    return '';
  }
  if (ctx.name === 'srcdoc') {
    unsafe(DEV && 'vf.html: interpolation into "srcdoc" is not allowed.');
    return '';
  }
  let text = plainString(value);
  if (hasOwn.call(URL_ATTRS, ctx.name) && !/[:\/?#]/.test(ctx.valueSoFar)) {
    // The scheme is not fixed yet: check what the browser will see so far.
    const decoded = ctx.valueSoFar.replace(/&amp;/g, '&');
    if (safeUrl(decoded + text) === '#') text = decoded === '' ? '#' : '';
  }
  return esc(text);
}

function tagValue(value) {
  if (value == null || value === false || value === '') return '';
  if (value instanceof SafeHtml) return value.value;
  const text = plainString(value);
  // Only bare attribute names such as "disabled" or "checked hidden".
  if (/^[A-Za-z0-9_\-: ]*$/.test(text) && !/(^|\s)on/i.test(text)) return text;
  unsafe(DEV && 'vf.html: only bare attribute names may be interpolated inside a tag; got "' + text + '".');
  return '';
}

/** Elements that must never be created from an interpolated tag name. */
const BLOCKED_TAGS = {
  script: 1, style: 1, iframe: 1, frame: 1, frameset: 1, object: 1, embed: 1, base: 1, meta: 1,
  link: 1, noscript: 1, template: 1, svg: 1, math: 1, xmp: 1, plaintext: 1
};

function tagNameValue(value) {
  const text = plainString(value);
  if (/^[A-Za-z][A-Za-z0-9-]*$/.test(text) && !hasOwn.call(BLOCKED_TAGS, text.toLowerCase())) return text;
  unsafe(DEV && 'vf.html: "' + text + '" is not allowed as an interpolated tag name.');
  return '';
}

/**
 * Tagged template that escapes every interpolated value for where it lands:
 * - element content: HTML-escaped; arrays are joined; vf.html results, vf.unsafeHtml values and
 *   vfunc instances are inserted as markup
 * - quoted attribute value: HTML-escaped; URL attributes (href, src, action, …) also pass
 *   through vf.safeUrl
 * - refused (dropped and reported, or thrown with `vf.config({ strict: true })`): event handler
 *   attributes (`on*`), `srcdoc`, unquoted attribute values, `<script>`/`<style>` content, and
 *   anything but bare attribute names inside a tag
 * @param {TemplateStringsArray|string[]} strings
 * @param {...*} values
 * @returns {SafeHtml}
 */
function html(strings) {
  const scanner = new MarkupScanner();
  let out = strings[0];
  scanner.feed(strings[0]);
  for (let i = 1; i < strings.length; i++) {
    const value = arguments[i];
    const ctx = scanner.context();
    let piece;
    if (ctx.kind === 'text') piece = textValue(value);
    else if (ctx.kind === 'attr') piece = attrValue(ctx, value);
    else if (ctx.kind === 'tag') piece = tagValue(value);
    else if (ctx.kind === 'tagname') piece = tagNameValue(value);
    else {
      unsafe(DEV && (ctx.kind === 'unquoted'
        ? 'vf.html: quote the value of attribute "' + ctx.name + '" (unquoted interpolation is not allowed).'
        : 'vf.html: interpolation inside <' + ctx.kind + '> is not allowed.'));
      piece = '';
    }
    scanner.feed(piece);
    scanner.feed(strings[i]);
    out += piece + strings[i];
  }
  return new SafeHtml(out);
}

/**
 * vf.html for code that cannot use template literals (ES5 / IE11).
 * `{name}` and `{user.name}` are replaced from `data` (own properties only) with the same
 * context-aware escaping as vf.html. Missing values become empty.
 * @example vf.tpl('<a href="{url}">{label}</a>', { url: link, label: text })
 * @param {string} template
 * @param {Object} [data]
 * @returns {SafeHtml}
 */
function tpl(template, data) {
  const source = String(template == null ? '' : template);
  const strings = [];
  const args = [strings];
  const pattern = /\{([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\}/g;
  let last = 0;
  let m;
  while ((m = pattern.exec(source)) !== null) {
    strings.push(source.slice(last, m.index));
    args.push(lookupPath(data, m[1]));
    last = m.index + m[0].length;
  }
  strings.push(source.slice(last));
  return html.apply(null, args);
}

function lookupPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current == null || isDangerousKey(parts[i])) return undefined;
    current = ownValue(current, parts[i]);
  }
  return current;
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
      if (DEV) warn(where + ': "' + key + '" is not allowed. Put markup in render or innerHTML and build it with vf.html.');
      continue;
    }
    if (/^on/i.test(key) && typeof value !== 'function') {
      if (DEV) warn(where + ': "' + key + '" must be a function; string handlers are not allowed.');
      continue;
    }
    element[key] = (hasOwn.call(URL_PROPS, key) && typeof value === 'string') ? safeUrl(value) : value;
  }
}

// ---------------------------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------------------------

/**
 * `element.closest(selector)`, with a fallback for IE11 that has only (ms)matchesSelector.
 * Element.prototype is never patched (CLAUDE.md rule 20).
 */
function closest(element, selector) {
  if (element.closest) return element.closest(selector);
  const match = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
  for (let current = element; current && current.nodeType === 1; current = current.parentNode) {
    if (match.call(current, selector)) return current;
  }
  return null;
}

function resolveElement(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

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
 * vf.html when it contains outside data.
 * @param {string|SafeHtml} markup
 * @returns {Element|null}
 */
function node(markup) {
  const holder = document.createElement('div');
  holder.innerHTML = markup == null ? '' : String(markup);
  return holder.firstElementChild || null;
}

/**
 * Parses markup into a DocumentFragment that keeps every top-level node.
 * The same trust rule as vf.node applies.
 * @param {string|SafeHtml} markup
 * @returns {DocumentFragment}
 */
function frag(markup) {
  const fragment = document.createDocumentFragment();
  if (markup != null && markup !== '') {
    const holder = document.createElement('div');
    holder.innerHTML = String(markup);
    while (holder.firstChild) fragment.appendChild(holder.firstChild);
  }
  return fragment;
}

function mapByAttribute(root, attribute) {
  const map = {};
  if (!root || !root.querySelectorAll) return map;
  const list = root.querySelectorAll('[' + attribute + ']');
  for (let i = 0; i < list.length; i++) {
    const key = attribute === 'id' ? list[i].id : list[i].getAttribute(attribute);
    if (key && !isDangerousKey(key)) map[key] = list[i];
  }
  return map;
}

/**
 * Maps every descendant element that has an id: `{ [id]: element }`. The root itself is not included.
 * When ids repeat, the last one in document order wins.
 * @param {ParentNode} root
 * @returns {Object<string, Element>}
 */
function idMap(root) {
  return mapByAttribute(root, 'id');
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

/** Form helpers: `vf.form.values`, `vf.form.reset`. */
const form = protect({}, { values: formValues, reset: formReset });

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
 * @property {string|SafeHtml} [innerHTML] - Initial markup when there is no render function. Trusted as-is.
 * @property {Array<{$node: Node}|Node|{targetId: string, component: {$node: Node}|Node}>} [childs]
 *   - Children appended after rendering. `{ targetId, component }` appends into the element with that id.
 * @property {Array<{id?: string, eventType: string, onEvent?: function(VfEvent)}>} [events]
 *   - Listeners on the element with `id` (or on the root when `id` is omitted).
 * @property {Array<{selector: string, eventType: string, onEvent?: function(VfEvent)}>} [delegates]
 *   - Delegated listeners on the root, matched with `closest(selector)` inside the root.
 * @property {Object} [state] - State. Each key is also readable and writable as `instance.key`.
 * @property {Object<string, Function>} [methods] - Methods bound to the instance, callable as `instance.name()`.
 * @property {function(Object): (string|SafeHtml)} [render] - Returns markup for the current state. Use vf.html.
 * @property {boolean} [replaceRoot=false] - Use the first element of the markup as the root instead of wrapping it.
 * @property {function(VfEvent)} [onEvent] - Fallback handler for events and delegates without their own onEvent.
 * @property {function(Error)} [onError] - Called when render, a handler or a lifecycle hook throws.
 *   The engine does not recover.
 * @property {function(vfunc)} [onMount] - After mount() or vf.attach() put the element in the page.
 *   The place to create third-party widgets.
 * @property {function(vfunc)} [onUpdate] - After every refresh.
 * @property {function(vfunc)} [onDestroy] - At the start of destroy(), while the element is still in
 *   the page. Release third-party widgets, timers and outside listeners here.
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
    onError: typeof o.onError === 'function' ? o.onError : null,
    onMount: typeof o.onMount === 'function' ? o.onMount : null,
    onUpdate: typeof o.onUpdate === 'function' ? o.onUpdate : null,
    onDestroy: typeof o.onDestroy === 'function' ? o.onDestroy : null
  };
  this._listeners = [];                  // { el, type, fn } — released on refresh (children) and destroy (all)
  this._accessors = Object.create(null); // instance key -> 'state' | 'method' | 'id' (no inherited keys)
  this._scheduled = false;
  this._destroyed = false;

  this.isvfunc = true;
  this.state = o.state || {};
  this.methods = o.methods || {};
  this.ids = {};
  this.refs = {};

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

  const cfg = this._cfg;
  if (o._adopt) {
    // vf.attach without render: take over an element that is already in the page.
    this.$node = o._adopt;
  } else {
    const holder = document.createElement(cfg.tag);
    if (cfg.render) holder.innerHTML = this._renderMarkup();
    else if (cfg.innerHTML) holder.innerHTML = String(cfg.innerHTML);
    this.$node = (cfg.replaceRoot && holder.firstElementChild) ? holder.firstElementChild : holder;
  }
  assignProps(this.$node, cfg.opts, 'opts');

  this._mapNodes();
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
    if (DEV && settings.strictRender && typeof out === 'string' && out !== '') {
      warn('render returned a plain string; build markup with vf.html so values are escaped.');
    }
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

proto._hook = function (name) {
  const fn = this._cfg[name];
  if (fn) safeCall(fn, this, this, this._cfg.onError);
};

proto._mapNodes = function () {
  this.ids = idMap(this.$node);
  this.refs = mapByAttribute(this.$node, 'data-ref');
};

/** Elements marked with data-vf-keep, outermost only: { key: element }. */
function collectKept(root) {
  const kept = {};
  const list = root.querySelectorAll('[data-vf-keep]');
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    const key = element.getAttribute('data-vf-keep');
    if (!key || isDangerousKey(key)) continue;
    const outer = element.parentNode && element.parentNode.nodeType === 1
      ? closest(element.parentNode, '[data-vf-keep]') : null;
    if (outer && root.contains(outer) && outer !== root) continue; // moves with its kept ancestor
    if (hasOwn.call(kept, key)) {
      if (DEV) warn('data-vf-keep="' + key + '" is used more than once; only the first element is kept.');
      continue;
    }
    kept[key] = element;
  }
  return kept;
}

/** Puts kept elements into the placeholders with the same key in freshly parsed markup. */
function restoreKept(holder, kept) {
  for (const key in kept) {
    if (!hasOwn.call(kept, key)) continue;
    const list = holder.querySelectorAll('[data-vf-keep]');
    for (let i = 0; i < list.length; i++) {
      if (list[i].getAttribute('data-vf-keep') === key) {
        list[i].parentNode.replaceChild(kept[key], list[i]);
        break;
      }
    }
  }
}

/** Remembers which element inside the root has focus, so it can be focused again after a refresh. */
proto._captureFocus = function () {
  if (typeof document === 'undefined') return null;
  const active = document.activeElement;
  if (!active || active === this.$node || !this.$node.contains(active)) return null;
  const snapshot = { element: active, id: active.id || '', ref: active.getAttribute('data-ref') || '',
    name: active.getAttribute('name') || '', start: null, end: null };
  try { snapshot.start = active.selectionStart; snapshot.end = active.selectionEnd; } catch (e) { /* not a text field */ }
  return snapshot;
};

proto._restoreFocus = function (snapshot) {
  if (!snapshot) return;
  let target = null;
  if (this.$node.contains(snapshot.element)) target = snapshot.element; // kept element
  else if (snapshot.id) target = ownValue(this.ids, snapshot.id);
  else if (snapshot.ref) target = ownValue(this.refs, snapshot.ref);
  else if (snapshot.name) {
    const named = this.$node.querySelectorAll('[name]');
    for (let i = 0; i < named.length && !target; i++) {
      if (named[i].getAttribute('name') === snapshot.name) target = named[i];
    }
  }
  if (!target || typeof target.focus !== 'function') return;
  target.focus();
  if (snapshot.start != null && typeof target.setSelectionRange === 'function') {
    try { target.setSelectionRange(snapshot.start, snapshot.end); } catch (e) { /* ignore */ }
  }
};

/**
 * Re-renders immediately from the current state. Children in `childs` and elements marked with
 * `data-vf-keep` are moved into the new markup; focus inside the component is restored;
 * listeners on replaced elements are released and bound again. Calls `onUpdate` at the end.
 */
proto.refresh = function () {
  const cfg = this._cfg;
  if (!cfg.render || this._destroyed) return;

  const focus = this._captureFocus();
  const kept = collectKept(this.$node);
  const holder = document.createElement(cfg.tag);
  holder.innerHTML = this._renderMarkup();
  restoreKept(holder, kept);

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

  this._mapNodes();
  this._defineIdAccessors();
  this._bindEvents(true, rootReplaced);
  this._bindDelegates(true, rootReplaced);
  this._appendChilds();
  this._restoreFocus(focus);
  this._hook('onUpdate');
};

/** Schedules one refresh for the current tick. Many changes in the same tick render once. */
proto.scheduleRefresh = function () {
  if (this._scheduled || this._destroyed) return;
  this._scheduled = true;
  const self = this;
  nextTick(function () {
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
      if (DEV) warn('setState: ignored the key "' + key + '".');
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
      if (DEV) warn('state key "' + key + '" is a reserved name; use instance.state.' + key + ' instead.');
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
      if (DEV) warn('method "' + name + '" is a reserved name; call instance.methods.' + name + '() instead.');
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
      if (DEV) warn('element id "' + key + '" is a reserved name; use instance.ids["' + key + '"] instead.');
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
        if (!origin || origin.nodeType !== 1) return;
        const matched = closest(origin, spec.selector);
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
 * Appends the root element to a parent and calls `onMount`. Calling it again with the same
 * parent does nothing.
 * @param {Element|string} parent - An element or a selector.
 * @returns {Promise<vfunc>} Resolves with the instance (same signature as layer 3's VClass.mount).
 */
proto.mount = function (parent) {
  const target = resolveElement(parent);
  if (!target) {
    if (DEV) warn('mount: parent element not found.');
  } else if (this.$node && this.$node.parentNode !== target) {
    // Compare with the target parent, not just "has a parent": with replaceRoot the initial root
    // still points at the detached wrapper it was parsed in (pilot decision #13).
    target.appendChild(this.$node);
    this._hook('onMount');
  }
  return Promise.resolve(this);
};

/** Calls `onDestroy`, releases every listener, removes the root element and clears ids and refs. */
proto.destroy = function () {
  if (this._destroyed) return;
  this._hook('onDestroy');
  this._destroyed = true;
  this._releaseListeners(null);
  if (this.$node && this.$node.parentNode) this.$node.parentNode.removeChild(this.$node);
  this.ids = {};
  this.refs = {};
  this._defineIdAccessors();
};

/** The root element's outerHTML, so an instance can be interpolated into markup. */
proto.toString = function () {
  return this.$node ? this.$node.outerHTML : '';
};

// ---------------------------------------------------------------------------------------------
// vf.attach — control markup that is already in the page
// ---------------------------------------------------------------------------------------------

/**
 * Turns an element that is already in the page into a component.
 * - Without `render` and `innerHTML`, the element itself becomes the root: its markup, form
 *   values and existing listeners stay as they are; state, methods, events and delegates are
 *   added on top.
 * - With `render` (or `innerHTML`), the new markup replaces the element in place.
 *   `replaceRoot` defaults to true here.
 * `onMount` is called once the component is in the page.
 * @param {Element|string} target - An element or a selector.
 * @param {VfuncOptions} [options]
 * @returns {vfunc|null} The instance, or null when the target is not found.
 */
function attach(target, options) {
  const element = resolveElement(target);
  if (!element) {
    if (DEV) warn('attach: target element not found.');
    return null;
  }
  const o = safeMerge({}, options || {}, false);
  delete o._adopt;
  let instance;
  if (!o.render && !o.innerHTML) {
    o._adopt = element;
    instance = new vfunc(o);
  } else {
    if (!('replaceRoot' in o)) o.replaceRoot = true;
    instance = new vfunc(o);
    if (element.parentNode) element.parentNode.replaceChild(instance.$node, element);
  }
  instance._hook('onMount');
  return instance;
}

// ---------------------------------------------------------------------------------------------
// vf.store — shared state with subscribers
// ---------------------------------------------------------------------------------------------

/**
 * A small shared state container.
 * @param {Object} [initial]
 * @returns {{ get: function(string=): *, set: function(Object|function(Object): Object): void,
 *   subscribe: function(function(Object)): function(): void }}
 *   `get()` returns the state object (treat it as read-only) or one key; `set(patch)` merges
 *   own, non-dangerous keys and notifies subscribers once per tick; `subscribe(fn)` returns an
 *   unsubscribe function.
 */
function store(initial) {
  let state = safeMerge({}, initial || {}, false);
  const listeners = [];
  let pending = false;

  function notify() {
    pending = false;
    const snapshot = listeners.slice();
    for (let i = 0; i < snapshot.length; i++) safeCall(snapshot[i], null, state, null);
  }

  return {
    get: function (key) { return key === undefined ? state : ownValue(state, key); },
    set: function (patch) {
      const value = typeof patch === 'function' ? patch(state) : patch;
      if (!value || typeof value !== 'object') return;
      state = safeMerge(safeMerge({}, state, false), value, false);
      if (!pending) { pending = true; nextTick(notify); }
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        const index = listeners.indexOf(fn);
        if (index >= 0) listeners.splice(index, 1);
      };
    }
  };
}

// ---------------------------------------------------------------------------------------------
// vf.router — hash or history routing
// ---------------------------------------------------------------------------------------------

function parseQuery(search) {
  const query = {};
  const text = search.charAt(0) === '?' ? search.slice(1) : search;
  if (!text) return query;
  const pairs = text.split('&');
  for (let i = 0; i < pairs.length; i++) {
    if (!pairs[i]) continue;
    const index = pairs[i].indexOf('=');
    const key = decodePart(index < 0 ? pairs[i] : pairs[i].slice(0, index));
    const value = index < 0 ? '' : decodePart(pairs[i].slice(index + 1));
    if (key && !isDangerousKey(key)) query[key] = value;
  }
  return query;
}

function decodePart(text) {
  try { return decodeURIComponent(text.replace(/\+/g, ' ')); } catch (e) { return text; }
}

function compileRoute(pattern) {
  const segments = pattern.replace(/^\/+|\/+$/g, '').split('/');
  return { pattern: pattern, segments: segments[0] === '' ? [] : segments };
}

function matchRoute(route, segments) {
  const params = {};
  const expected = route.segments;
  for (let i = 0; i < expected.length; i++) {
    const part = expected[i];
    if (part === '*') {
      params.wildcard = segments.slice(i).map(decodePart).join('/');
      return params;
    }
    if (i >= segments.length) return null;
    if (part.charAt(0) === ':') {
      const name = part.slice(1);
      if (!isDangerousKey(name)) params[name] = decodePart(segments[i]);
    } else if (part !== segments[i]) {
      return null;
    }
  }
  return expected.length === segments.length ? params : null;
}

/** An app path: starts with "/" and is not a protocol-relative or absolute URL. */
function isAppPath(path) {
  return typeof path === 'string' && path.charAt(0) === '/' && path.charAt(1) !== '/' &&
    path.charAt(1) !== '\\' && safeUrl(path) === path.trim();
}

/**
 * @typedef {Object} RouteContext
 * @property {string} path - The path without query, e.g. "/users/7".
 * @property {Object<string, string>} params - Values of ":name" segments (and `wildcard` for "*").
 * @property {Object<string, string>} query - Parsed query string.
 * @property {string|null} route - The matched pattern, or null when nothing matched.
 */

/**
 * Creates a router. Call `start()` once the page is ready.
 * - `mode: 'hash'` (default) keeps the path after `#`, works on any static server and in IE.
 * - `mode: 'history'` uses real paths; the server must return index.html for them.
 * Only same-origin app paths starting with "/" are followed: `go('javascript:…')`,
 * `go('https://other.site')` and `go('//other.site')` are refused.
 * Client-side routes are not access control; always authorize on the server.
 * @param {{ mode?: 'hash'|'history', base?: string, routes: Object<string, function(RouteContext)>,
 *   notFound?: function(RouteContext), onChange?: function(RouteContext), linkSelector?: string,
 *   focus?: string }} options - `linkSelector` (default `a[data-link]`) marks links handled by the
 *   router; `focus` is a selector focused after each navigation (for screen readers).
 * @returns {{ start: function(): void, stop: function(): void, go: function(string, {replace?: boolean}=): void,
 *   replace: function(string): void, current: function(): RouteContext, href: function(string): string }}
 */
function router(options) {
  const o = options || {};
  const mode = o.mode === 'history' ? 'history' : 'hash';
  const base = (o.base || '').replace(/\/+$/, '');
  const linkSelector = o.linkSelector || 'a[data-link]';
  const routes = [];
  for (const pattern in (o.routes || {})) {
    if (hasOwn.call(o.routes, pattern)) routes.push({ compiled: compileRoute(pattern), handler: o.routes[pattern] });
  }
  let current = { path: '/', params: {}, query: {}, route: null };
  let started = false;

  function readLocation() {
    if (mode === 'hash') {
      const hash = window.location.hash.replace(/^#/, '');
      return hash || '/';
    }
    let path = window.location.pathname;
    if (base && path.indexOf(base) === 0) path = path.slice(base.length);
    return (path || '/') + window.location.search;
  }

  function resolve(focusAfter) {
    const full = readLocation();
    const qIndex = full.indexOf('?');
    const path = qIndex < 0 ? full : full.slice(0, qIndex);
    const query = parseQuery(qIndex < 0 ? '' : full.slice(qIndex));
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(function (s) { return s !== ''; });
    let handler = o.notFound || null;
    let ctx = { path: path, params: {}, query: query, route: null };
    for (let i = 0; i < routes.length; i++) {
      const params = matchRoute(routes[i].compiled, segments);
      if (params) {
        ctx = { path: path, params: params, query: query, route: routes[i].compiled.pattern };
        handler = routes[i].handler;
        break;
      }
    }
    current = ctx;
    if (handler) safeCall(handler, null, ctx, null);
    if (o.onChange) safeCall(o.onChange, null, ctx, null);
    if (focusAfter && o.focus) {
      const target = document.querySelector(o.focus);
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus();
      }
    }
  }

  function onLocationChange() { resolve(true); }

  function onClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    let origin = event.target;
    if (origin && origin.nodeType !== 1) origin = origin.parentNode;
    const link = origin && origin.nodeType === 1 ? closest(origin, linkSelector) : null;
    if (!link) return;
    const targetAttr = link.getAttribute('target');
    if ((targetAttr && targetAttr !== '_self') || link.hasAttribute('download')) return;
    const href = link.getAttribute('href') || '';
    let path = mode === 'hash' && href.charAt(0) === '#' ? href.slice(1) : href;
    if (mode === 'history' && base && (path === base || path.indexOf(base + '/') === 0)) {
      path = path.slice(base.length) || '/';
    }
    if (!isAppPath(path)) return; // not ours: let the browser handle it
    event.preventDefault();
    go(path);
  }

  function href(path) {
    return mode === 'hash' ? '#' + path : base + path;
  }

  function go(path, goOptions) {
    if (!isAppPath(path)) {
      if (DEV) warn('router.go: refused "' + path + '"; only app paths starting with "/" are allowed.');
      return;
    }
    const replaceEntry = !!(goOptions && goOptions.replace);
    if (mode === 'hash') {
      // The hashchange listener resolves the new route.
      if (replaceEntry) window.location.replace(window.location.href.split('#')[0] + '#' + path);
      else window.location.hash = path;
    } else {
      window.history[replaceEntry ? 'replaceState' : 'pushState']({}, '', base + path);
      resolve(true);
    }
  }

  return {
    start: function () {
      if (started) return;
      started = true;
      window.addEventListener(mode === 'hash' ? 'hashchange' : 'popstate', onLocationChange);
      document.addEventListener('click', onClick);
      resolve(false);
    },
    stop: function () {
      if (!started) return;
      started = false;
      window.removeEventListener(mode === 'hash' ? 'hashchange' : 'popstate', onLocationChange);
      document.removeEventListener('click', onClick);
    },
    go: go,
    replace: function (path) { go(path, { replace: true }); },
    current: function () { return current; },
    href: href
  };
}

// ---------------------------------------------------------------------------------------------
// vf.i18n, vf.t, vf.fmt
// ---------------------------------------------------------------------------------------------

const LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const I18N_ATTRS = { title: 1, alt: 1, placeholder: 1, 'aria-label': 1, 'aria-description': 1, value: 1 };

const i18nState = {
  locale: 'en',
  fallback: 'en',
  allowed: null,        // array of allowed locales, or null = any locale with messages
  messages: {},         // { locale: { ... } }
  load: null,           // async (locale) => messages
  persistKey: '',       // localStorage key, or '' for no persistence
  listeners: []
};

function isAllowedLocale(locale) {
  if (typeof locale !== 'string' || !LOCALE_PATTERN.test(locale)) return false;
  if (i18nState.allowed) return i18nState.allowed.indexOf(locale) >= 0;
  return hasOwn.call(i18nState.messages, locale) || !!i18nState.load || locale === i18nState.fallback;
}

/** Picks the best allowed locale for a requested tag: exact match first, then its base language. */
function pickLocale(requested) {
  if (!requested) return '';
  if (isAllowedLocale(requested)) return requested;
  const baseLanguage = String(requested).split('-')[0].toLowerCase();
  return isAllowedLocale(baseLanguage) ? baseLanguage : '';
}

function readPersisted() {
  if (!i18nState.persistKey) return '';
  try { return window.localStorage.getItem(i18nState.persistKey) || ''; } catch (e) { return ''; }
}

function writePersisted(locale) {
  if (!i18nState.persistKey) return;
  try { window.localStorage.setItem(i18nState.persistKey, locale); } catch (e) { /* storage unavailable */ }
}

function addMessages(locale, messages) {
  if (!LOCALE_PATTERN.test(locale) || !messages || typeof messages !== 'object') return;
  const current = hasOwn.call(i18nState.messages, locale) ? i18nState.messages[locale] : {};
  i18nState.messages[locale] = safeMerge(current, messages, true);
}

function setLocale(locale) {
  const chosen = pickLocale(locale);
  if (!chosen) {
    if (DEV) warn('i18n: locale "' + locale + '" is not allowed; staying on "' + i18nState.locale + '".');
    return Promise.resolve(i18nState.locale);
  }
  const ready = (!hasOwn.call(i18nState.messages, chosen) && i18nState.load)
    ? Promise.resolve(i18nState.load(chosen)).then(function (loaded) { addMessages(chosen, loaded); },
      function (err) { report('error', 'i18n: failed to load "' + chosen + '": ' + err); })
    : Promise.resolve();
  return ready.then(function () {
    i18nState.locale = chosen;
    if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = chosen;
    writePersisted(chosen);
    const snapshot = i18nState.listeners.slice();
    for (let i = 0; i < snapshot.length; i++) safeCall(snapshot[i], null, chosen, null);
    return chosen;
  });
}

function lookupMessage(locale, key) {
  const table = ownValue(i18nState.messages, locale);
  return table ? lookupPath(table, key) : undefined;
}

function pluralCategory(count) {
  try {
    if (typeof Intl !== 'undefined' && Intl.PluralRules) return new Intl.PluralRules(i18nState.locale).select(count);
  } catch (e) { /* unsupported locale */ }
  return count === 1 ? 'one' : 'other';
}

/**
 * Translates a key in the current locale, falling back to the fallback locale, then to the key.
 * `{name}` placeholders are filled from `params`. A message object `{ zero?, one, other, … }`
 * is chosen by `params.count`. The result is plain text: vf.html escapes it when inserted.
 * @param {string} key - Dotted key, e.g. "cart.items".
 * @param {Object} [params]
 * @returns {string}
 */
function t(key, params) {
  let message = lookupMessage(i18nState.locale, key);
  if (message === undefined) message = lookupMessage(i18nState.fallback, key);
  if (message === undefined) {
    if (DEV) warn('i18n: missing message "' + key + '" for "' + i18nState.locale + '".');
    return key;
  }
  if (message && typeof message === 'object') {
    const count = params ? Number(params.count) : NaN;
    let chosen = count === 0 ? ownValue(message, 'zero') : undefined;
    if (chosen === undefined) chosen = ownValue(message, pluralCategory(count));
    if (chosen === undefined) chosen = ownValue(message, 'other');
    if (chosen === undefined) return key;
    message = chosen;
  }
  return String(message).replace(/\{([A-Za-z_$][\w$]*)\}/g, function (all, name) {
    const value = params ? ownValue(params, name) : undefined;
    return value == null ? '' : String(value);
  });
}

/**
 * Translates published markup in place:
 * - `data-i18n="key"` sets the element's text (never HTML).
 * - `data-i18n-attr="placeholder:form.name; title:form.hint"` sets allowed attributes
 *   (title, alt, placeholder, aria-label, aria-description, value).
 * @param {ParentNode} [root=document]
 */
function applyI18n(root) {
  const scope = root || document;
  const list = Array.prototype.slice.call(scope.querySelectorAll('[data-i18n],[data-i18n-attr]'));
  if (scope.nodeType === 1 && (scope.hasAttribute('data-i18n') || scope.hasAttribute('data-i18n-attr'))) list.unshift(scope);
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    const textKey = element.getAttribute('data-i18n');
    if (textKey) element.textContent = t(textKey);
    const attrSpec = element.getAttribute('data-i18n-attr');
    if (!attrSpec) continue;
    const pairs = attrSpec.split(';');
    for (let j = 0; j < pairs.length; j++) {
      const index = pairs[j].indexOf(':');
      if (index < 0) continue;
      const attr = pairs[j].slice(0, index).trim().toLowerCase();
      const key = pairs[j].slice(index + 1).trim();
      if (!key) continue;
      if (!hasOwn.call(I18N_ATTRS, attr)) {
        if (DEV) warn('i18n: attribute "' + attr + '" cannot be translated (allowed: title, alt, placeholder, aria-label, aria-description, value).');
        continue;
      }
      element.setAttribute(attr, t(key));
    }
  }
}

/**
 * Internationalization.
 * - `setup({ locale?, fallback?, locales?, messages?, load?, persist? })` → Promise<locale>.
 *   Initial locale: `locale`, then the persisted one, then `navigator.language`, then `fallback`.
 *   `locales` is the allow-list (recommended); `load(locale)` returns messages (e.g. fetched JSON);
 *   `persist: true` (or a key string) remembers the choice in localStorage.
 * - `set(locale)` → Promise<locale>; updates `<html lang>` and notifies subscribers.
 * - `locale()`, `add(locale, messages)`, `subscribe(fn)` → unsubscribe, `apply(root?)`.
 */
const i18n = protect({}, {
  setup: function (options) {
    const o = options || {};
    i18nState.fallback = o.fallback && LOCALE_PATTERN.test(o.fallback) ? o.fallback : 'en';
    i18nState.allowed = Array.isArray(o.locales) ? o.locales.filter(function (l) { return LOCALE_PATTERN.test(l); }) : null;
    i18nState.load = typeof o.load === 'function' ? o.load : null;
    i18nState.persistKey = o.persist ? (typeof o.persist === 'string' ? o.persist : 'vf.locale') : '';
    if (o.messages) {
      for (const locale in o.messages) {
        if (hasOwn.call(o.messages, locale)) addMessages(locale, o.messages[locale]);
      }
    }
    const nav = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || '') : '';
    const initial = pickLocale(o.locale) || pickLocale(readPersisted()) || pickLocale(nav) || i18nState.fallback;
    return setLocale(initial);
  },
  set: setLocale,
  locale: function () { return i18nState.locale; },
  add: addMessages,
  subscribe: function (fn) {
    i18nState.listeners.push(fn);
    return function () {
      const index = i18nState.listeners.indexOf(fn);
      if (index >= 0) i18nState.listeners.splice(index, 1);
    };
  },
  apply: applyI18n
});

function intlCall(kind, args, fallback) {
  try {
    if (typeof Intl !== 'undefined' && Intl[kind]) {
      const Ctor = Intl[kind];
      return args(Ctor);
    }
  } catch (e) { /* unsupported option or locale */ }
  return fallback();
}

/**
 * Locale-aware formatting with Intl, following vf.i18n.locale().
 * Falls back to plain strings where Intl (or a feature of it) is missing.
 */
const fmt = protect({}, {
  /** @param {number} value @param {Intl.NumberFormatOptions} [options] */
  number: function (value, options) {
    return intlCall('NumberFormat', function (C) { return new C(i18nState.locale, options).format(value); },
      function () { return String(value); });
  },
  /** @param {number} value @param {string} currency - ISO code such as "KRW" @param {Intl.NumberFormatOptions} [options] */
  currency: function (value, currency, options) {
    const o = safeMerge({ style: 'currency', currency: currency }, options || {}, false);
    return intlCall('NumberFormat', function (C) { return new C(i18nState.locale, o).format(value); },
      function () { return String(value) + ' ' + currency; });
  },
  /** @param {Date|number|string} value @param {Intl.DateTimeFormatOptions} [options] */
  date: function (value, options) {
    const date = value instanceof Date ? value : new Date(value);
    return intlCall('DateTimeFormat', function (C) { return new C(i18nState.locale, options).format(date); },
      function () { return date.toISOString ? date.toISOString().slice(0, 10) : String(date); });
  },
  /** @param {number} value - e.g. -3 @param {string} unit - "second" … "year" */
  relative: function (value, unit) {
    return intlCall('RelativeTimeFormat', function (C) { return new C(i18nState.locale, { numeric: 'auto' }).format(value, unit); },
      function () { return String(value) + ' ' + unit; });
  }
});

// ---------------------------------------------------------------------------------------------
// vf.use and vf.ext — extensions
// ---------------------------------------------------------------------------------------------

/** Registered extensions: vf.ext[name]. */
const ext = {};

function parseVersion(text) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(text));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}

/** Supports "*", "x.y.z", ">=x.y.z" and "^x.y.z". Development builds satisfy every range. */
function satisfies(version, range) {
  if (!range || range === '*' || /-dev$/.test(version)) return true;
  const current = parseVersion(version);
  const wanted = parseVersion(range.replace(/^[\^>=\s]+/, ''));
  if (!current || !wanted) return false;
  if (range.indexOf('>=') === 0) return compareVersions(current, wanted) >= 0;
  if (range.charAt(0) === '^') {
    if (compareVersions(current, wanted) < 0) return false;
    return wanted[0] > 0 ? current[0] === wanted[0] : (current[0] === 0 && current[1] === wanted[1]);
  }
  return compareVersions(current, wanted) === 0;
}

/**
 * Installs an extension. The plugin is `{ name, version?, requires?, install(vf, options) }`.
 * Whatever `install` returns is stored in `vf.ext[name]`. The official `vf.*` root is reserved:
 * extensions must not add or replace root members.
 * @param {{ name: string, version?: string, requires?: string, install: function(Object, Object=): * }} plugin
 * @param {Object} [options]
 * @returns {*} The installed extension (the value stored in vf.ext[name]), or undefined.
 */
function use(plugin, options) {
  if (!plugin || typeof plugin.install !== 'function' || typeof plugin.name !== 'string' ||
      !/^[A-Za-z_$][\w$-]*$/.test(plugin.name) || isDangerousKey(plugin.name)) {
    if (DEV) warn('use: plugin "' + (plugin && plugin.name) + '" needs a valid "name" and an "install" function.');
    return undefined;
  }
  if (hasOwn.call(ext, plugin.name)) {
    if (DEV) warn('use: "' + plugin.name + '" is already installed.');
    return ext[plugin.name];
  }
  if (DEV && plugin.requires && !satisfies(VERSION, plugin.requires)) {
    warn('use: "' + plugin.name + '" requires vfunc ' + plugin.requires + ' but this is ' + VERSION + '.');
  }
  const result = plugin.install(vf, options || {});
  ext[plugin.name] = result === undefined ? true : result;
  return ext[plugin.name];
}

// ---------------------------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------------------------

const version = VERSION;

const vf = {};

protect(vf, {
  vfunc: vfunc,
  attach: attach,
  html: html,
  unsafeHtml: unsafeHtml,
  tpl: tpl,
  esc: esc,
  nl2br: nl2br,
  safeUrl: safeUrl,
  $: $,
  $$: $$,
  el: el,
  node: node,
  frag: frag,
  idMap: idMap,
  form: form,
  router: router,
  store: store,
  i18n: i18n,
  t: t,
  fmt: fmt,
  use: use,
  ext: ext,
  config: config,
  SafeHtml: SafeHtml,
  version: version
});

export {
  vfunc, attach, html, unsafeHtml, tpl, esc, nl2br, safeUrl,
  $, $$, el, node, frag, idMap, form, router, store, i18n, t, fmt, use, ext, config, SafeHtml, version
};
export default vf;
