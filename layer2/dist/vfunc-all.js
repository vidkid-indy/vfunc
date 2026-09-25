/*! vfunc-ui (vfunc.js layer 2) v1.0.0-rc.8 | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // layer1/src/vfunc.js
  var VERSION = false ? "0.0.0-dev" : "1.0.0-rc.8";
  var DEV = false ? true : true;
  var hasOwn = Object.prototype.hasOwnProperty;
  function ownValue(obj, key) {
    return obj != null && hasOwn.call(obj, key) ? obj[key] : void 0;
  }
  __name(ownValue, "ownValue");
  function isDangerousKey(key) {
    return key === "__proto__" || key === "constructor" || key === "prototype";
  }
  __name(isDangerousKey, "isDangerousKey");
  var reported = {};
  function report(kind, message) {
    const id = kind + message;
    if (hasOwn.call(reported, id)) return;
    reported[id] = true;
    if (typeof console !== "undefined" && console[kind]) console[kind]("[vfunc] " + message);
  }
  __name(report, "report");
  function warn(message) {
    report("warn", message);
  }
  __name(warn, "warn");
  function safeCall(fn, self2, arg, onError) {
    try {
      return fn.call(self2, arg);
    } catch (err) {
      if (typeof console !== "undefined" && console.error) console.error("[vfunc] error:", err);
      if (onError) {
        try {
          onError(err);
        } catch (inner) {
        }
      }
      return void 0;
    }
  }
  __name(safeCall, "safeCall");
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
  __name(safeMerge, "safeMerge");
  function isPlainObject(value) {
    if (value === null || typeof value !== "object") return false;
    const proto2 = Object.getPrototypeOf(value);
    return proto2 === Object.prototype || proto2 === null;
  }
  __name(isPlainObject, "isPlainObject");
  var nextTick = /* @__PURE__ */ __name(function(fn) {
    Promise.resolve().then(fn);
  }, "nextTick");
  function protect(target, members2) {
    for (const key in members2) {
      if (hasOwn.call(members2, key)) {
        Object.defineProperty(target, key, { value: members2[key], enumerable: true, writable: false, configurable: false });
      }
    }
    return target;
  }
  __name(protect, "protect");
  var settings = {
    strict: false,
    // unsafe interpolation in vf.html throws instead of being dropped
    strictRender: false
    // warn when render returns a plain string instead of vf.html output
  };
  function config(options) {
    if (options) {
      if ("strict" in options) settings.strict = !!options.strict;
      if ("strictRender" in options) settings.strictRender = !!options.strictRender;
    }
    return { strict: settings.strict, strictRender: settings.strictRender };
  }
  __name(config, "config");
  function unsafe(message) {
    const text = message || "vf.html blocked an unsafe value; use vfunc.js (development build) for details.";
    if (settings.strict) throw new Error("[vfunc] " + text);
    report("error", text);
  }
  __name(unsafe, "unsafe");
  function esc(value) {
    if (value == null) return "";
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  __name(esc, "esc");
  function nl2br(value) {
    return new SafeHtml(esc(value).replace(/\r\n|\r|\n/g, "<br>"));
  }
  __name(nl2br, "nl2br");
  var SAFE_SCHEMES = { http: 1, https: 1, mailto: 1, tel: 1 };
  function safeUrl(url) {
    if (url == null) return "";
    const text = String(url);
    const compact = text.replace(/[\u0000- \u007f]+/g, "");
    const match = /^([a-z][a-z0-9+.\-]*):/i.exec(compact);
    if (match && !hasOwn.call(SAFE_SCHEMES, match[1].toLowerCase())) return "#";
    return text.trim();
  }
  __name(safeUrl, "safeUrl");
  function SafeHtml(value) {
    this.value = value;
  }
  __name(SafeHtml, "SafeHtml");
  SafeHtml.prototype.toString = function() {
    return this.value;
  };
  function unsafeHtml(markup) {
    return new SafeHtml(markup == null ? "" : String(markup));
  }
  __name(unsafeHtml, "unsafeHtml");
  var URL_ATTRS = {
    href: 1,
    src: 1,
    action: 1,
    formaction: 1,
    "xlink:href": 1,
    poster: 1,
    cite: 1,
    background: 1,
    data: 1,
    codebase: 1,
    manifest: 1
  };
  function MarkupScanner() {
    this.state = "text";
    this.tagName = "";
    this.word = "";
    this.lastWord = "";
    this.attrName = "";
    this.quote = "";
    this.value = "";
    this.buffer = "";
  }
  __name(MarkupScanner, "MarkupScanner");
  var SPACE = /\s/;
  var RAW_TAGS = { script: 1, style: 1 };
  MarkupScanner.prototype.closeTag = function() {
    this.state = hasOwn.call(RAW_TAGS, this.tagName) ? "raw" : "text";
    this.buffer = "";
  };
  MarkupScanner.prototype.feed = function(text) {
    for (let i = 0; i < text.length; i++) {
      const c = text.charAt(i);
      switch (this.state) {
        case "text":
          if (c === "<") this.state = "lt";
          break;
        case "lt":
          if (c === "!") {
            this.state = "bang";
            this.buffer = "";
          } else if (c === "/") this.state = "endtag";
          else if (/[A-Za-z]/.test(c)) {
            this.state = "tagname";
            this.tagName = c.toLowerCase();
          } else this.state = c === "<" ? "lt" : "text";
          break;
        case "tagname":
          if (c === ">") this.closeTag();
          else if (SPACE.test(c) || c === "/") {
            this.state = "tag";
            this.lastWord = "";
          } else this.tagName += c.toLowerCase();
          break;
        case "tag":
          if (c === ">") this.closeTag();
          else if (c === "=") {
            this.attrName = this.lastWord;
            this.state = "expect";
          } else if (!SPACE.test(c) && c !== "/") {
            this.state = "attrname";
            this.word = c;
          }
          break;
        case "attrname":
          if (c === ">") this.closeTag();
          else if (c === "=") {
            this.attrName = this.word;
            this.state = "expect";
          } else if (SPACE.test(c) || c === "/") {
            this.lastWord = this.word;
            this.state = "tag";
          } else this.word += c;
          break;
        case "expect":
          if (c === '"' || c === "'") {
            this.quote = c;
            this.value = "";
            this.state = "value";
          } else if (c === ">") this.closeTag();
          else if (!SPACE.test(c)) this.state = "unquoted";
          break;
        case "value":
          if (c === this.quote) {
            this.state = "tag";
            this.lastWord = "";
          } else this.value += c;
          break;
        case "unquoted":
          if (c === ">") this.closeTag();
          else if (SPACE.test(c)) {
            this.state = "tag";
            this.lastWord = "";
          }
          break;
        case "endtag":
          if (c === ">") this.state = "text";
          break;
        case "bang":
          this.buffer += c;
          if (this.buffer === "--") {
            this.state = "comment";
            this.buffer = "";
          } else if (c === ">") this.state = "text";
          else if (this.buffer.length >= 2) this.state = "endtag";
          break;
        case "comment":
          this.buffer = (this.buffer + c).slice(-3);
          if (this.buffer === "-->") this.state = "text";
          break;
        case "raw": {
          this.buffer = (this.buffer + c).slice(-(this.tagName.length + 2));
          if (this.buffer.toLowerCase() === "</" + this.tagName) this.state = "endtag";
          break;
        }
      }
    }
  };
  MarkupScanner.prototype.context = function() {
    switch (this.state) {
      case "text":
      case "comment":
        return { kind: "text" };
      case "value":
        return { kind: "attr", name: this.attrName.toLowerCase(), valueSoFar: this.value };
      case "expect":
      case "unquoted":
        return { kind: "unquoted", name: this.attrName.toLowerCase() };
      case "raw":
        return { kind: this.tagName };
      case "lt":
      case "tagname":
        return { kind: "tagname" };
      default:
        return { kind: "tag" };
    }
  };
  function textValue(value) {
    if (value == null || value === false) return "";
    if (value instanceof SafeHtml) return value.value;
    if (value && value.isvfunc && typeof value.toString === "function") return value.toString();
    if (Array.isArray(value)) {
      let joined = "";
      for (let i = 0; i < value.length; i++) joined += textValue(value[i]);
      return joined;
    }
    if (typeof value === "function") {
      unsafe(DEV && "vf.html: a function was interpolated; call it or pass its result.");
      return "";
    }
    return esc(value);
  }
  __name(textValue, "textValue");
  function plainString(value) {
    if (value == null || value === false) return "";
    if (Array.isArray(value)) return value.join(" ");
    return String(value);
  }
  __name(plainString, "plainString");
  function attrValue(ctx, value) {
    if (/^on/.test(ctx.name)) {
      unsafe(DEV && 'vf.html: interpolation into the event handler attribute "' + ctx.name + '" is not allowed.');
      return "";
    }
    if (ctx.name === "srcdoc") {
      unsafe(DEV && 'vf.html: interpolation into "srcdoc" is not allowed.');
      return "";
    }
    let text = typeof value === "boolean" && /^(aria|data)-/.test(ctx.name) ? String(value) : plainString(value);
    if (hasOwn.call(URL_ATTRS, ctx.name) && !/[:\/?#]/.test(ctx.valueSoFar)) {
      const decoded = ctx.valueSoFar.replace(/&amp;/g, "&");
      if (safeUrl(decoded + text) === "#") text = decoded === "" ? "#" : "";
    }
    return esc(text);
  }
  __name(attrValue, "attrValue");
  function tagValue(value) {
    if (value == null || value === false || value === "") return "";
    if (value instanceof SafeHtml) return value.value;
    const text = plainString(value);
    if (/^[A-Za-z0-9_\-: ]*$/.test(text) && !/(^|\s)on/i.test(text)) return text;
    unsafe(DEV && 'vf.html: only bare attribute names may be interpolated inside a tag; got "' + text + '".');
    return "";
  }
  __name(tagValue, "tagValue");
  var BLOCKED_TAGS = {
    script: 1,
    style: 1,
    iframe: 1,
    frame: 1,
    frameset: 1,
    object: 1,
    embed: 1,
    base: 1,
    meta: 1,
    link: 1,
    noscript: 1,
    template: 1,
    svg: 1,
    math: 1,
    xmp: 1,
    plaintext: 1
  };
  function tagNameValue(value) {
    const text = plainString(value);
    if (/^[A-Za-z][A-Za-z0-9-]*$/.test(text) && !hasOwn.call(BLOCKED_TAGS, text.toLowerCase())) return text;
    unsafe(DEV && 'vf.html: "' + text + '" is not allowed as an interpolated tag name.');
    return "";
  }
  __name(tagNameValue, "tagNameValue");
  function html(strings) {
    const scanner = new MarkupScanner();
    let out = strings[0];
    scanner.feed(strings[0]);
    for (let i = 1; i < strings.length; i++) {
      const value = arguments[i];
      const ctx = scanner.context();
      let piece;
      if (ctx.kind === "text") piece = textValue(value);
      else if (ctx.kind === "attr") piece = attrValue(ctx, value);
      else if (ctx.kind === "tag") piece = tagValue(value);
      else if (ctx.kind === "tagname") piece = tagNameValue(value);
      else {
        unsafe(DEV && (ctx.kind === "unquoted" ? 'vf.html: quote the value of attribute "' + ctx.name + '" (unquoted interpolation is not allowed).' : "vf.html: interpolation inside <" + ctx.kind + "> is not allowed."));
        piece = "";
      }
      scanner.feed(piece);
      scanner.feed(strings[i]);
      out += piece + strings[i];
    }
    return new SafeHtml(out);
  }
  __name(html, "html");
  function tpl(template, data) {
    const source = String(template == null ? "" : template);
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
  __name(tpl, "tpl");
  function lookupPath(obj, path) {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      if (current == null || isDangerousKey(parts[i])) return void 0;
      current = ownValue(current, parts[i]);
    }
    return current;
  }
  __name(lookupPath, "lookupPath");
  var HTML_SINK_PROPS = { innerHTML: 1, outerHTML: 1, srcdoc: 1 };
  var URL_PROPS = { href: 1, src: 1, action: 1, formAction: 1, poster: 1, cite: 1 };
  function assignProps(element, props, where) {
    if (!props) return;
    for (const key in props) {
      if (!hasOwn.call(props, key) || isDangerousKey(key)) continue;
      const value = props[key];
      if (hasOwn.call(HTML_SINK_PROPS, key)) {
        if (DEV) warn(where + ': "' + key + '" is not allowed. Put markup in render or innerHTML and build it with vf.html.');
        continue;
      }
      if (/^on/i.test(key) && typeof value !== "function") {
        if (DEV) warn(where + ': "' + key + '" must be a function; string handlers are not allowed.');
        continue;
      }
      element[key] = hasOwn.call(URL_PROPS, key) && typeof value === "string" ? safeUrl(value) : value;
    }
  }
  __name(assignProps, "assignProps");
  function closest(element, selector) {
    if (element.closest) return element.closest(selector);
    const match = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
    for (let current = element; current && current.nodeType === 1; current = current.parentNode) {
      if (match.call(current, selector)) return current;
    }
    return null;
  }
  __name(closest, "closest");
  function resolveElement(target) {
    return typeof target === "string" ? document.querySelector(target) : target;
  }
  __name(resolveElement, "resolveElement");
  function $(selector, root2) {
    return (root2 || document).querySelector(selector);
  }
  __name($, "$");
  function $$(selector, root2) {
    return Array.prototype.slice.call((root2 || document).querySelectorAll(selector));
  }
  __name($$, "$$");
  function el(tag, props) {
    const element = document.createElement(tag);
    assignProps(element, props, "vf.el");
    return element;
  }
  __name(el, "el");
  function node(markup) {
    const holder = document.createElement("div");
    holder.innerHTML = markup == null ? "" : String(markup);
    return holder.firstElementChild || null;
  }
  __name(node, "node");
  function frag(markup) {
    const fragment = document.createDocumentFragment();
    if (markup != null && markup !== "") {
      const holder = document.createElement("div");
      holder.innerHTML = String(markup);
      while (holder.firstChild) fragment.appendChild(holder.firstChild);
    }
    return fragment;
  }
  __name(frag, "frag");
  function mapByAttribute(root2, attribute) {
    const map = {};
    if (!root2 || !root2.querySelectorAll) return map;
    const list = root2.querySelectorAll("[" + attribute + "]");
    for (let i = 0; i < list.length; i++) {
      const key = attribute === "id" ? list[i].id : list[i].getAttribute(attribute);
      if (key && !isDangerousKey(key)) map[key] = list[i];
    }
    return map;
  }
  __name(mapByAttribute, "mapByAttribute");
  function idMap(root2) {
    return mapByAttribute(root2, "id");
  }
  __name(idMap, "idMap");
  var FORM_TAGS = { INPUT: 1, SELECT: 1, TEXTAREA: 1 };
  var NON_VALUE_INPUTS = { button: 1, submit: 1, reset: 1, image: 1 };
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
  __name(toControlMap, "toControlMap");
  function readControl(control) {
    const tag = control.tagName;
    const type = (control.type || "").toLowerCase();
    if (tag === "INPUT" && (type === "checkbox" || type === "radio")) return control.checked;
    if (tag === "SELECT") {
      if (control.multiple) {
        const selected = [];
        for (let i = 0; i < control.options.length; i++) {
          if (control.options[i].selected) selected.push(control.options[i].value);
        }
        return selected;
      }
      return control.selectedIndex >= 0 ? control.options[control.selectedIndex].value : "";
    }
    return control.value;
  }
  __name(readControl, "readControl");
  function formValues(target, options) {
    const controls = toControlMap(target);
    const skipPassword = !!(options && options.skipPassword);
    const data = {};
    for (const id in controls) {
      if (!hasOwn.call(controls, id) || isDangerousKey(id)) continue;
      const control = controls[id];
      if (!control || !control.tagName) continue;
      if (skipPassword && (control.type || "").toLowerCase() === "password") continue;
      data[id] = readControl(control);
    }
    return data;
  }
  __name(formValues, "formValues");
  function formReset(target) {
    const controls = toControlMap(target);
    for (const id in controls) {
      if (!hasOwn.call(controls, id)) continue;
      const control = controls[id];
      if (!control || !control.tagName) continue;
      const tag = control.tagName;
      const type = (control.type || "").toLowerCase();
      if (tag === "SELECT") {
        control.selectedIndex = -1;
        const fallback = control.getAttribute("user-default");
        if (fallback !== null && fallback !== "") control.selectedIndex = Number(fallback);
      } else if (tag === "INPUT" && (type === "checkbox" || type === "radio")) {
        control.checked = false;
      } else if (tag === "TEXTAREA" || tag === "INPUT" && type !== "hidden" && !hasOwn.call(NON_VALUE_INPUTS, type)) {
        control.value = "";
      }
    }
    return formValues(controls);
  }
  __name(formReset, "formReset");
  var form = protect({}, { values: formValues, reset: formReset });
  var RESERVED = [
    "$node",
    "state",
    "methods",
    "ids",
    "refs",
    "isvfunc",
    "setState",
    "refresh",
    "scheduleRefresh",
    "mount",
    "destroy",
    "toString",
    "valueOf"
  ];
  function isReserved(key) {
    return key.charAt(0) === "_" || isDangerousKey(key) || RESERVED.indexOf(key) >= 0 || key in Object.prototype;
  }
  __name(isReserved, "isReserved");
  function vfunc(options) {
    if (!(this instanceof vfunc)) return new vfunc(options);
    const o = options || {};
    this._cfg = {
      tag: o.tag || "div",
      opts: o.opts || {},
      innerHTML: o.innerHTML || "",
      childs: o.childs || [],
      events: o.events || [],
      delegates: o.delegates || [],
      render: typeof o.render === "function" ? o.render : null,
      replaceRoot: !!o.replaceRoot,
      onEvent: typeof o.onEvent === "function" ? o.onEvent : null,
      onError: typeof o.onError === "function" ? o.onError : null,
      onMount: typeof o.onMount === "function" ? o.onMount : null,
      onUpdate: typeof o.onUpdate === "function" ? o.onUpdate : null,
      onDestroy: typeof o.onDestroy === "function" ? o.onDestroy : null
    };
    this._listeners = [];
    this._accessors = /* @__PURE__ */ Object.create(null);
    this._scheduled = false;
    this._destroyed = false;
    this._mounted = false;
    this._adopted = !!o._adopt;
    this.isvfunc = true;
    this.state = o.state || {};
    this.methods = o.methods || {};
    this.ids = {};
    this.refs = {};
    hide(this, "setState", this.setState.bind(this));
    hide(this, "refresh", this.refresh.bind(this));
    hide(this, "scheduleRefresh", this.scheduleRefresh.bind(this));
    hide(this, "mount", this.mount.bind(this));
    hide(this, "destroy", this.destroy.bind(this));
    for (const name in this.methods) {
      if (hasOwn.call(this.methods, name) && typeof this.methods[name] === "function") {
        this.methods[name] = this.methods[name].bind(this);
      }
    }
    const cfg = this._cfg;
    if (o._adopt) {
      this.$node = o._adopt;
      if (cfg.render || cfg.innerHTML) {
        const kept = collectKept(this.$node);
        const holder = document.createElement(cfg.tag);
        holder.innerHTML = cfg.render ? this._renderMarkup() : String(cfg.innerHTML);
        restoreKept(holder, kept);
        const first = holder.firstElementChild;
        if (DEV && first && this.$node.id && first.id === this.$node.id) {
          warn('attach: render returned the target element itself (id "' + this.$node.id + '"). Render only its inside, or pass replaceRoot: true.');
        }
        while (this.$node.firstChild) this.$node.removeChild(this.$node.firstChild);
        while (holder.firstChild) this.$node.appendChild(holder.firstChild);
      }
    } else {
      const holder = document.createElement(cfg.tag);
      if (cfg.render) holder.innerHTML = this._renderMarkup();
      else if (cfg.innerHTML) holder.innerHTML = String(cfg.innerHTML);
      this.$node = cfg.replaceRoot && holder.firstElementChild ? holder.firstElementChild : holder;
    }
    assignProps(this.$node, cfg.opts, "opts");
    this._mapNodes();
    this._defineStateAccessors(this.state);
    this._defineMethodAccessors();
    this._defineIdAccessors();
    this._bindEvents(false, false);
    this._bindDelegates(false, false);
    this._appendChilds();
  }
  __name(vfunc, "vfunc");
  function hide(target, key, value) {
    Object.defineProperty(target, key, { value, configurable: true, writable: true, enumerable: false });
  }
  __name(hide, "hide");
  var proto = vfunc.prototype;
  proto._renderMarkup = function() {
    try {
      const out = this._cfg.render.call(this, this.state);
      if (DEV && settings.strictRender && typeof out === "string" && out !== "") {
        warn("render returned a plain string; build markup with vf.html so values are escaped.");
      }
      return out == null ? "" : String(out);
    } catch (err) {
      this._handleError(err);
      return "";
    }
  };
  proto._handleError = function(err) {
    if (typeof console !== "undefined" && console.error) console.error("[vfunc] error:", err);
    if (this._cfg.onError) {
      try {
        this._cfg.onError(err);
      } catch (inner) {
      }
    }
  };
  proto._hook = function(name) {
    const fn = this._cfg[name];
    if (fn) safeCall(fn, this, this, this._cfg.onError);
  };
  proto._mapNodes = function() {
    this.ids = idMap(this.$node);
    this.refs = mapByAttribute(this.$node, "data-ref");
  };
  function collectKept(root2) {
    const kept = {};
    const list = root2.querySelectorAll("[data-vf-keep]");
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const key = element.getAttribute("data-vf-keep");
      if (!key || isDangerousKey(key)) continue;
      const outer = element.parentNode && element.parentNode.nodeType === 1 ? closest(element.parentNode, "[data-vf-keep]") : null;
      if (outer && root2.contains(outer) && outer !== root2) continue;
      if (hasOwn.call(kept, key)) {
        if (DEV) warn('data-vf-keep="' + key + '" is used more than once; only the first element is kept.');
        continue;
      }
      kept[key] = element;
    }
    return kept;
  }
  __name(collectKept, "collectKept");
  function restoreKept(holder, kept) {
    for (const key in kept) {
      if (!hasOwn.call(kept, key)) continue;
      const list = holder.querySelectorAll("[data-vf-keep]");
      for (let i = 0; i < list.length; i++) {
        if (list[i].getAttribute("data-vf-keep") === key) {
          list[i].parentNode.replaceChild(kept[key], list[i]);
          break;
        }
      }
    }
  }
  __name(restoreKept, "restoreKept");
  function sameAction(root2, action) {
    const out = [];
    const list = root2.querySelectorAll("[data-action]");
    for (let i = 0; i < list.length; i++) {
      if (list[i].getAttribute("data-action") === action) out.push(list[i]);
    }
    return out;
  }
  __name(sameAction, "sameAction");
  proto._captureFocus = function() {
    if (typeof document === "undefined") return null;
    const active = document.activeElement;
    if (!active || active === this.$node || !this.$node.contains(active)) return null;
    const snapshot = {
      element: active,
      id: active.id || "",
      ref: active.getAttribute("data-ref") || "",
      name: active.getAttribute("name") || "",
      action: active.getAttribute("data-action") || "",
      index: 0,
      start: null,
      end: null
    };
    if (snapshot.action) snapshot.index = sameAction(this.$node, snapshot.action).indexOf(active);
    try {
      snapshot.start = active.selectionStart;
      snapshot.end = active.selectionEnd;
    } catch (e) {
    }
    return snapshot;
  };
  proto._restoreFocus = function(snapshot) {
    if (!snapshot) return;
    let target = null;
    if (this.$node.contains(snapshot.element)) target = snapshot.element;
    else if (snapshot.id) target = ownValue(this.ids, snapshot.id);
    else if (snapshot.ref) target = ownValue(this.refs, snapshot.ref);
    else if (snapshot.name) {
      const named = this.$node.querySelectorAll("[name]");
      for (let i = 0; i < named.length && !target; i++) {
        if (named[i].getAttribute("name") === snapshot.name) target = named[i];
      }
    } else if (snapshot.action) {
      target = sameAction(this.$node, snapshot.action)[snapshot.index] || null;
    }
    if (!target || typeof target.focus !== "function") return;
    target.focus();
    if (snapshot.start != null && typeof target.setSelectionRange === "function") {
      try {
        target.setSelectionRange(snapshot.start, snapshot.end);
      } catch (e) {
      }
    }
  };
  proto.refresh = function() {
    const cfg = this._cfg;
    if (this._destroyed) return;
    if (!cfg.render) {
      this._hook("onUpdate");
      return;
    }
    const focus = this._captureFocus();
    const kept = collectKept(this.$node);
    const holder = document.createElement(cfg.tag);
    holder.innerHTML = this._renderMarkup();
    restoreKept(holder, kept);
    let rootReplaced = false;
    if (cfg.replaceRoot && holder.firstElementChild) {
      const newRoot = holder.firstElementChild;
      assignProps(newRoot, cfg.opts, "opts");
      if (this.$node.parentNode) this.$node.parentNode.replaceChild(newRoot, this.$node);
      this.$node = newRoot;
      rootReplaced = true;
    } else {
      const root2 = this.$node;
      while (root2.firstChild) root2.removeChild(root2.firstChild);
      while (holder.firstChild) root2.appendChild(holder.firstChild);
    }
    const keepRoot = rootReplaced ? null : this.$node;
    this._releaseListeners(function(entry) {
      return entry.el !== keepRoot;
    });
    this._mapNodes();
    this._defineIdAccessors();
    this._bindEvents(true, rootReplaced);
    this._bindDelegates(true, rootReplaced);
    this._appendChilds();
    this._restoreFocus(focus);
    this._hook("onUpdate");
  };
  proto.scheduleRefresh = function() {
    if (this._scheduled || this._destroyed) return;
    this._scheduled = true;
    const self2 = this;
    nextTick(function() {
      self2._scheduled = false;
      self2.refresh();
    });
  };
  proto.setState = function(patch) {
    if (typeof patch === "function") {
      try {
        patch = patch.call(this, this.state);
      } catch (err) {
        this._handleError(err);
        return;
      }
    }
    if (!patch || typeof patch !== "object") {
      if (DEV && patch != null) warn("setState: expected an object or a function that returns one.");
      return;
    }
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
  proto._defineStateAccessors = function(source) {
    const self2 = this;
    for (const key in source) {
      if (!hasOwn.call(source, key) || isDangerousKey(key)) continue;
      if (this._accessors[key] === "state") continue;
      if (isReserved(key)) {
        if (DEV) warn('state key "' + key + '" is a reserved name; use instance.state.' + key + " instead.");
        continue;
      }
      this._accessors[key] = "state";
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get: /* @__PURE__ */ __name(function() {
          return self2.state[key];
        }, "get"),
        set: /* @__PURE__ */ __name(function(value) {
          self2.state[key] = value;
          self2.scheduleRefresh();
        }, "set")
      });
    }
  };
  proto._defineMethodAccessors = function() {
    for (const name in this.methods) {
      if (!hasOwn.call(this.methods, name) || this._accessors[name]) continue;
      if (isReserved(name)) {
        if (DEV) warn('method "' + name + '" is a reserved name; call instance.methods.' + name + "() instead.");
        continue;
      }
      this._accessors[name] = "method";
      hide(this, name, this.methods[name]);
    }
  };
  proto._defineIdAccessors = function() {
    let key;
    for (key in this._accessors) {
      if (this._accessors[key] === "id") {
        delete this[key];
        delete this._accessors[key];
      }
    }
    const self2 = this;
    for (key in this.ids) {
      if (!hasOwn.call(this.ids, key) || this._accessors[key]) continue;
      if (isReserved(key)) {
        if (DEV) warn('element id "' + key + '" is a reserved name; use instance.ids["' + key + '"] instead.');
        continue;
      }
      if (hasOwn.call(this, key)) continue;
      this._accessors[key] = "id";
      (function(id) {
        Object.defineProperty(self2, id, {
          configurable: true,
          enumerable: false,
          get: /* @__PURE__ */ __name(function() {
            return self2.ids[id];
          }, "get")
        });
      })(key);
    }
  };
  proto._listen = function(element, type, fn) {
    element.addEventListener(type, fn);
    this._listeners.push({ el: element, type, fn });
  };
  proto._releaseListeners = function(predicate) {
    const kept = [];
    for (let i = 0; i < this._listeners.length; i++) {
      const entry = this._listeners[i];
      if (!predicate || predicate(entry)) entry.el.removeEventListener(entry.type, entry.fn);
      else kept.push(entry);
    }
    this._listeners = kept;
  };
  proto._dispatch = function(localHandler, payload) {
    const handler = localHandler || this._cfg.onEvent;
    if (!handler) return;
    try {
      handler(payload);
    } catch (err) {
      this._handleError(err);
    }
  };
  proto._bindEvents = function(isRefresh, rootReplaced) {
    const self2 = this;
    const events = this._cfg.events;
    for (let i = 0; i < events.length; i++) {
      const spec = events[i];
      const target = spec.id ? ownValue(this.ids, spec.id) : this.$node;
      if (!target) continue;
      if (isRefresh && !rootReplaced && target === this.$node) continue;
      (function(spec2, target2) {
        self2._listen(target2, spec2.eventType, function(event) {
          self2._dispatch(spec2.onEvent, {
            sender: self2,
            event,
            eventType: event.type,
            id: spec2.id || target2.id || "",
            target: target2,
            data: {}
          });
        });
      })(spec, target);
    }
  };
  proto._bindDelegates = function(isRefresh, rootReplaced) {
    if (isRefresh && !rootReplaced) return;
    const self2 = this;
    const delegates = this._cfg.delegates;
    for (let i = 0; i < delegates.length; i++) {
      (function(spec) {
        self2._listen(self2.$node, spec.eventType, function(event) {
          let origin = event.target;
          if (origin && origin.nodeType !== 1) origin = origin.parentNode;
          if (!origin || origin.nodeType !== 1) return;
          const matched = closest(origin, spec.selector);
          if (!matched || !self2.$node.contains(matched)) return;
          self2._dispatch(spec.onEvent, {
            sender: self2,
            event,
            eventType: event.type,
            id: matched.id || "",
            target: matched,
            data: {}
          });
        });
      })(delegates[i]);
    }
  };
  proto._appendChilds = function() {
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
  proto._childInstances = function() {
    const out = [];
    const childs = this._cfg.childs;
    for (let i = 0; i < childs.length; i++) {
      const child = childs[i];
      const component = child && child.targetId && child.component ? child.component : child;
      if (component && component.isvfunc) out.push(component);
    }
    return out;
  };
  proto._mountHook = function(own) {
    if (this._destroyed || this._mounted && !own) return;
    const children = this._childInstances();
    for (let i = 0; i < children.length; i++) children[i]._mountHook(false);
    this._mounted = true;
    this._hook("onMount");
  };
  proto.mount = function(parent) {
    const target = resolveElement(parent);
    if (!target) {
      if (DEV) warn("mount: parent element not found.");
    } else if (this.$node && this.$node.parentNode !== target) {
      target.appendChild(this.$node);
      this._mountHook(true);
    }
    return Promise.resolve(this);
  };
  proto.destroy = function() {
    if (this._destroyed) return;
    const children = this._childInstances();
    for (let i = 0; i < children.length; i++) children[i].destroy();
    this._hook("onDestroy");
    this._destroyed = true;
    this._releaseListeners(null);
    if (this._adopted) {
      if (this._cfg.render || this._cfg.innerHTML) {
        while (this.$node.firstChild) this.$node.removeChild(this.$node.firstChild);
      }
    } else if (this.$node && this.$node.parentNode) {
      this.$node.parentNode.removeChild(this.$node);
    }
    this.ids = {};
    this.refs = {};
    this._defineIdAccessors();
  };
  proto.toString = function() {
    return this.$node ? this.$node.outerHTML : "";
  };
  function attach(target, options) {
    const element = resolveElement(target);
    if (!element) {
      if (DEV) warn("attach: target element not found.");
      return null;
    }
    const o = safeMerge({}, options || {}, false);
    delete o._adopt;
    let instance;
    if (o.replaceRoot && (o.render || o.innerHTML)) {
      instance = new vfunc(o);
      if (element.parentNode) element.parentNode.replaceChild(instance.$node, element);
    } else {
      if (!o.tag) o.tag = element.tagName.toLowerCase();
      o._adopt = element;
      instance = new vfunc(o);
    }
    instance._mountHook(true);
    return instance;
  }
  __name(attach, "attach");
  function store(initial) {
    let state = safeMerge({}, initial || {}, false);
    const listeners = [];
    let pending = false;
    function notify() {
      pending = false;
      const snapshot = listeners.slice();
      for (let i = 0; i < snapshot.length; i++) safeCall(snapshot[i], null, state, null);
    }
    __name(notify, "notify");
    return {
      get: /* @__PURE__ */ __name(function(key) {
        return key === void 0 ? state : ownValue(state, key);
      }, "get"),
      set: /* @__PURE__ */ __name(function(patch) {
        const value = typeof patch === "function" ? patch(state) : patch;
        if (!value || typeof value !== "object") return;
        state = safeMerge(safeMerge({}, state, false), value, false);
        if (!pending) {
          pending = true;
          nextTick(notify);
        }
      }, "set"),
      subscribe: /* @__PURE__ */ __name(function(fn) {
        listeners.push(fn);
        return function() {
          const index = listeners.indexOf(fn);
          if (index >= 0) listeners.splice(index, 1);
        };
      }, "subscribe")
    };
  }
  __name(store, "store");
  function parseQuery(search) {
    const query = {};
    const text = search.charAt(0) === "?" ? search.slice(1) : search;
    if (!text) return query;
    const pairs = text.split("&");
    for (let i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      const index = pairs[i].indexOf("=");
      const key = decodePart(index < 0 ? pairs[i] : pairs[i].slice(0, index));
      const value = index < 0 ? "" : decodePart(pairs[i].slice(index + 1));
      if (key && !isDangerousKey(key)) query[key] = value;
    }
    return query;
  }
  __name(parseQuery, "parseQuery");
  function decodePart(text) {
    try {
      return decodeURIComponent(text.replace(/\+/g, " "));
    } catch (e) {
      return text;
    }
  }
  __name(decodePart, "decodePart");
  function compileRoute(pattern) {
    const segments = pattern.replace(/^\/+|\/+$/g, "").split("/");
    return { pattern, segments: segments[0] === "" ? [] : segments };
  }
  __name(compileRoute, "compileRoute");
  function matchRoute(route, segments) {
    const params = {};
    const expected = route.segments;
    for (let i = 0; i < expected.length; i++) {
      const part = expected[i];
      if (part === "*") {
        params.wildcard = segments.slice(i).map(decodePart).join("/");
        return params;
      }
      if (i >= segments.length) return null;
      if (part.charAt(0) === ":") {
        const name = part.slice(1);
        if (!isDangerousKey(name)) params[name] = decodePart(segments[i]);
      } else if (part !== segments[i]) {
        return null;
      }
    }
    return expected.length === segments.length ? params : null;
  }
  __name(matchRoute, "matchRoute");
  function isAppPath(path) {
    return typeof path === "string" && path.charAt(0) === "/" && path.charAt(1) !== "/" && path.charAt(1) !== "\\" && safeUrl(path) === path.trim();
  }
  __name(isAppPath, "isAppPath");
  function router(options) {
    const o = options || {};
    const mode = o.mode === "history" ? "history" : "hash";
    const base = (o.base || "").replace(/\/+$/, "");
    const linkSelector = o.linkSelector || "a[data-link]";
    const routes = [];
    for (const pattern in o.routes || {}) {
      if (hasOwn.call(o.routes, pattern)) routes.push({ compiled: compileRoute(pattern), handler: o.routes[pattern] });
    }
    let current = { path: "/", params: {}, query: {}, route: null };
    let started = false;
    function readLocation() {
      if (mode === "hash") {
        const hash = window.location.hash.replace(/^#/, "");
        return hash || "/";
      }
      let path = window.location.pathname;
      if (base && path.indexOf(base) === 0) path = path.slice(base.length);
      return (path || "/") + window.location.search;
    }
    __name(readLocation, "readLocation");
    function resolve(focusAfter) {
      const full = readLocation();
      const qIndex = full.indexOf("?");
      const path = qIndex < 0 ? full : full.slice(0, qIndex);
      const query = parseQuery(qIndex < 0 ? "" : full.slice(qIndex));
      const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(function(s) {
        return s !== "";
      });
      let handler = o.notFound || null;
      let ctx = { path, params: {}, query, route: null };
      for (let i = 0; i < routes.length; i++) {
        const params = matchRoute(routes[i].compiled, segments);
        if (params) {
          ctx = { path, params, query, route: routes[i].compiled.pattern };
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
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus();
        }
      }
    }
    __name(resolve, "resolve");
    function onLocationChange() {
      resolve(true);
    }
    __name(onLocationChange, "onLocationChange");
    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      let origin = event.target;
      if (origin && origin.nodeType !== 1) origin = origin.parentNode;
      const link = origin && origin.nodeType === 1 ? closest(origin, linkSelector) : null;
      if (!link) return;
      const targetAttr = link.getAttribute("target");
      if (targetAttr && targetAttr !== "_self" || link.hasAttribute("download")) return;
      const href2 = link.getAttribute("href") || "";
      let path = mode === "hash" && href2.charAt(0) === "#" ? href2.slice(1) : href2;
      if (mode === "history" && base && (path === base || path.indexOf(base + "/") === 0)) {
        path = path.slice(base.length) || "/";
      }
      if (!isAppPath(path)) return;
      event.preventDefault();
      go(path);
    }
    __name(onClick, "onClick");
    function href(path) {
      return mode === "hash" ? "#" + path : base + path;
    }
    __name(href, "href");
    function go(path, goOptions) {
      if (!isAppPath(path)) {
        if (DEV) warn('router.go: refused "' + path + '"; only app paths starting with "/" are allowed.');
        return;
      }
      const replaceEntry = !!(goOptions && goOptions.replace);
      if (mode === "hash") {
        if (replaceEntry) window.location.replace(window.location.href.split("#")[0] + "#" + path);
        else window.location.hash = path;
      } else {
        window.history[replaceEntry ? "replaceState" : "pushState"]({}, "", base + path);
        resolve(true);
      }
    }
    __name(go, "go");
    return {
      start: /* @__PURE__ */ __name(function() {
        if (started) return;
        started = true;
        window.addEventListener(mode === "hash" ? "hashchange" : "popstate", onLocationChange);
        document.addEventListener("click", onClick);
        resolve(false);
      }, "start"),
      stop: /* @__PURE__ */ __name(function() {
        if (!started) return;
        started = false;
        window.removeEventListener(mode === "hash" ? "hashchange" : "popstate", onLocationChange);
        document.removeEventListener("click", onClick);
      }, "stop"),
      go,
      replace: /* @__PURE__ */ __name(function(path) {
        go(path, { replace: true });
      }, "replace"),
      current: /* @__PURE__ */ __name(function() {
        return current;
      }, "current"),
      href
    };
  }
  __name(router, "router");
  var LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
  var I18N_ATTRS = { title: 1, alt: 1, placeholder: 1, "aria-label": 1, "aria-description": 1, value: 1 };
  var i18nState = {
    locale: "en",
    fallback: "en",
    allowed: null,
    // array of allowed locales, or null = any locale with messages
    messages: {},
    // { locale: { ... } } — the app's messages
    defaults: {},
    // { locale: { ... } } — built-in messages of components (below the app's)
    load: null,
    // async (locale) => messages
    persistKey: "",
    // localStorage key, or '' for no persistence
    listeners: []
  };
  function isAllowedLocale(locale) {
    if (typeof locale !== "string" || !LOCALE_PATTERN.test(locale)) return false;
    if (i18nState.allowed) return i18nState.allowed.indexOf(locale) >= 0;
    return hasOwn.call(i18nState.messages, locale) || hasOwn.call(i18nState.defaults, locale) || !!i18nState.load || locale === i18nState.fallback;
  }
  __name(isAllowedLocale, "isAllowedLocale");
  function pickLocale(requested) {
    if (!requested) return "";
    if (isAllowedLocale(requested)) return requested;
    const baseLanguage = String(requested).split("-")[0].toLowerCase();
    return isAllowedLocale(baseLanguage) ? baseLanguage : "";
  }
  __name(pickLocale, "pickLocale");
  function readPersisted() {
    if (!i18nState.persistKey) return "";
    try {
      return window.localStorage.getItem(i18nState.persistKey) || "";
    } catch (e) {
      return "";
    }
  }
  __name(readPersisted, "readPersisted");
  function writePersisted(locale) {
    if (!i18nState.persistKey) return;
    try {
      window.localStorage.setItem(i18nState.persistKey, locale);
    } catch (e) {
    }
  }
  __name(writePersisted, "writePersisted");
  function addMessages(locale, messages, options) {
    if (!LOCALE_PATTERN.test(locale) || !messages || typeof messages !== "object") return;
    const store2 = options && options.defaults ? i18nState.defaults : i18nState.messages;
    const current = hasOwn.call(store2, locale) ? store2[locale] : {};
    store2[locale] = safeMerge(current, messages, true);
  }
  __name(addMessages, "addMessages");
  function setLocale(locale) {
    const chosen = pickLocale(locale);
    if (!chosen) {
      if (DEV) warn('i18n: locale "' + locale + '" is not allowed; staying on "' + i18nState.locale + '".');
      return Promise.resolve(i18nState.locale);
    }
    const ready = !hasOwn.call(i18nState.messages, chosen) && i18nState.load ? Promise.resolve(i18nState.load(chosen)).then(
      function(loaded) {
        addMessages(chosen, loaded);
      },
      function(err) {
        report("error", 'i18n: failed to load "' + chosen + '": ' + err);
      }
    ) : Promise.resolve();
    return ready.then(function() {
      i18nState.locale = chosen;
      if (typeof document !== "undefined" && document.documentElement) document.documentElement.lang = chosen;
      writePersisted(chosen);
      const snapshot = i18nState.listeners.slice();
      for (let i = 0; i < snapshot.length; i++) safeCall(snapshot[i], null, chosen, null);
      return chosen;
    });
  }
  __name(setLocale, "setLocale");
  function lookupMessage(locale, key) {
    const found = lookupIn(i18nState.messages, locale, key);
    return found !== void 0 ? found : lookupIn(i18nState.defaults, locale, key);
  }
  __name(lookupMessage, "lookupMessage");
  function lookupIn(store2, locale, key) {
    const table = ownValue(store2, locale);
    if (!table) return void 0;
    const whole = isDangerousKey(key) ? void 0 : ownValue(table, key);
    return whole !== void 0 ? whole : lookupPath(table, key);
  }
  __name(lookupIn, "lookupIn");
  function pluralCategory(count) {
    try {
      if (typeof Intl !== "undefined" && Intl.PluralRules) return new Intl.PluralRules(i18nState.locale).select(count);
    } catch (e) {
    }
    return count === 1 ? "one" : "other";
  }
  __name(pluralCategory, "pluralCategory");
  function t(key, params) {
    let message = lookupMessage(i18nState.locale, key);
    if (message === void 0) message = lookupMessage(i18nState.fallback, key);
    if (message === void 0) {
      if (DEV) warn('i18n: missing message "' + key + '" for "' + i18nState.locale + '".');
      return key;
    }
    if (message && typeof message === "object") {
      const count = params ? Number(params.count) : NaN;
      let chosen = count === 0 ? ownValue(message, "zero") : void 0;
      if (chosen === void 0) chosen = ownValue(message, pluralCategory(count));
      if (chosen === void 0) chosen = ownValue(message, "other");
      if (chosen === void 0) return key;
      message = chosen;
    }
    return String(message).replace(/\{([A-Za-z_$][\w$]*)\}/g, function(all, name) {
      const value = params ? ownValue(params, name) : void 0;
      return value == null ? "" : String(value);
    });
  }
  __name(t, "t");
  function applyI18n(root2) {
    const scope = root2 || document;
    const list = Array.prototype.slice.call(scope.querySelectorAll("[data-i18n],[data-i18n-attr]"));
    if (scope.nodeType === 1 && (scope.hasAttribute("data-i18n") || scope.hasAttribute("data-i18n-attr"))) list.unshift(scope);
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const textKey = element.getAttribute("data-i18n");
      if (textKey) element.textContent = t(textKey);
      const attrSpec = element.getAttribute("data-i18n-attr");
      if (!attrSpec) continue;
      const pairs = attrSpec.split(";");
      for (let j = 0; j < pairs.length; j++) {
        const index = pairs[j].indexOf(":");
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
  __name(applyI18n, "applyI18n");
  var i18n = protect({}, {
    setup: /* @__PURE__ */ __name(function(options) {
      const o = options || {};
      i18nState.fallback = o.fallback && LOCALE_PATTERN.test(o.fallback) ? o.fallback : "en";
      i18nState.allowed = Array.isArray(o.locales) ? o.locales.filter(function(l) {
        return LOCALE_PATTERN.test(l);
      }) : null;
      i18nState.load = typeof o.load === "function" ? o.load : null;
      i18nState.persistKey = o.persist ? typeof o.persist === "string" ? o.persist : "vf.locale" : "";
      if (o.messages) {
        for (const locale in o.messages) {
          if (hasOwn.call(o.messages, locale)) addMessages(locale, o.messages[locale]);
        }
      }
      const nav = typeof navigator !== "undefined" ? navigator.language || navigator.userLanguage || "" : "";
      const initial = pickLocale(o.locale) || pickLocale(readPersisted()) || pickLocale(nav) || i18nState.fallback;
      return setLocale(initial);
    }, "setup"),
    set: setLocale,
    locale: /* @__PURE__ */ __name(function() {
      return i18nState.locale;
    }, "locale"),
    add: addMessages,
    subscribe: /* @__PURE__ */ __name(function(fn) {
      i18nState.listeners.push(fn);
      return function() {
        const index = i18nState.listeners.indexOf(fn);
        if (index >= 0) i18nState.listeners.splice(index, 1);
      };
    }, "subscribe"),
    apply: applyI18n
  });
  function intlCall(kind, args, fallback) {
    try {
      if (typeof Intl !== "undefined" && Intl[kind]) {
        const Ctor = Intl[kind];
        return args(Ctor);
      }
    } catch (e) {
    }
    return fallback();
  }
  __name(intlCall, "intlCall");
  var fmt = protect({}, {
    /** @param {number} value @param {Intl.NumberFormatOptions} [options] */
    number: /* @__PURE__ */ __name(function(value, options) {
      return intlCall(
        "NumberFormat",
        function(C) {
          return new C(i18nState.locale, options).format(value);
        },
        function() {
          return String(value);
        }
      );
    }, "number"),
    /** @param {number} value @param {string} currency - ISO code such as "KRW" @param {Intl.NumberFormatOptions} [options] */
    currency: /* @__PURE__ */ __name(function(value, currency, options) {
      const o = safeMerge({ style: "currency", currency }, options || {}, false);
      return intlCall(
        "NumberFormat",
        function(C) {
          return new C(i18nState.locale, o).format(value);
        },
        function() {
          return String(value) + " " + currency;
        }
      );
    }, "currency"),
    /** @param {Date|number|string} value @param {Intl.DateTimeFormatOptions} [options] */
    date: /* @__PURE__ */ __name(function(value, options) {
      const date = value instanceof Date ? value : new Date(value);
      return intlCall(
        "DateTimeFormat",
        function(C) {
          return new C(i18nState.locale, options).format(date);
        },
        function() {
          return date.toISOString ? date.toISOString().slice(0, 10) : String(date);
        }
      );
    }, "date"),
    /** @param {number} value - e.g. -3 @param {string} unit - "second" … "year" */
    relative: /* @__PURE__ */ __name(function(value, unit) {
      return intlCall(
        "RelativeTimeFormat",
        function(C) {
          return new C(i18nState.locale, { numeric: "auto" }).format(value, unit);
        },
        function() {
          return String(value) + " " + unit;
        }
      );
    }, "relative")
  });
  var ext = {};
  function parseVersion(text) {
    const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(text));
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  }
  __name(parseVersion, "parseVersion");
  function compareVersions(a, b) {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    return 0;
  }
  __name(compareVersions, "compareVersions");
  function satisfies(version2, range) {
    if (!range || range === "*" || /-dev$/.test(version2)) return true;
    const current = parseVersion(version2);
    const wanted = parseVersion(range.replace(/^[\^>=\s]+/, ""));
    if (!current || !wanted) return false;
    if (range.indexOf(">=") === 0) return compareVersions(current, wanted) >= 0;
    if (range.charAt(0) === "^") {
      if (compareVersions(current, wanted) < 0) return false;
      return wanted[0] > 0 ? current[0] === wanted[0] : current[0] === 0 && current[1] === wanted[1];
    }
    return compareVersions(current, wanted) === 0;
  }
  __name(satisfies, "satisfies");
  function use(plugin, options) {
    if (!plugin || typeof plugin.install !== "function" || typeof plugin.name !== "string" || !/^[A-Za-z_$][\w$-]*$/.test(plugin.name) || isDangerousKey(plugin.name)) {
      if (DEV) warn('use: plugin "' + (plugin && plugin.name) + '" needs a valid "name" and an "install" function.');
      return void 0;
    }
    if (hasOwn.call(ext, plugin.name)) {
      if (DEV) warn('use: "' + plugin.name + '" is already installed.');
      return ext[plugin.name];
    }
    if (DEV && plugin.requires && !satisfies(VERSION, plugin.requires)) {
      warn('use: "' + plugin.name + '" requires vfunc ' + plugin.requires + " but this is " + VERSION + ".");
    }
    const result = plugin.install(vf, options || {});
    ext[plugin.name] = result === void 0 ? true : result;
    return ext[plugin.name];
  }
  __name(use, "use");
  var version = VERSION;
  var vf = {};
  protect(vf, {
    vfunc,
    attach,
    html,
    unsafeHtml,
    tpl,
    esc,
    nl2br,
    safeUrl,
    $,
    $$,
    el,
    node,
    frag,
    idMap,
    form,
    router,
    store,
    i18n,
    t,
    fmt,
    use,
    ext,
    config,
    SafeHtml,
    version
  });
  var vfunc_default = vf;

  // build/iife-entry.js
  var root = typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : void 0;
  function devWarn(message) {
    if (typeof console !== "undefined" && console.warn) console.warn("[vfunc] " + message);
  }
  __name(devWarn, "devWarn");
  if (root) {
    const existing = root.vf;
    if (existing == null) {
      root.vf = vfunc_default;
    } else if (typeof existing !== "object" && typeof existing !== "function") {
      if (true) devWarn("window.vf is not an object; vfunc was not installed.");
    } else if (typeof existing.vfunc === "function" && existing.vfunc !== vfunc_default.vfunc) {
      if (true) devWarn("vfunc " + existing.version + " is already loaded; this copy (" + vfunc_default.version + ") was ignored.");
    } else {
      const hasOwn4 = Object.prototype.hasOwnProperty;
      const conflicts2 = [];
      const keys = Object.keys(vfunc_default);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (hasOwn4.call(existing, key)) {
          if (existing[key] !== vfunc_default[key]) conflicts2.push(key);
        } else {
          Object.defineProperty(existing, key, Object.getOwnPropertyDescriptor(vfunc_default, key));
        }
      }
      if (conflicts2.length) devWarn("window.vf already has " + conflicts2.join(", ") + "; the existing members were kept.");
    }
  }

  // layer2/src/_internal/dev.js
  var DEV2 = false ? true : true;
  function warn2(message) {
    if (typeof console !== "undefined" && console.warn) console.warn("[vfunc-ui] " + message);
  }
  __name(warn2, "warn");

  // layer2/src/_internal/attrs.js
  var ATTR_NAME = /^(?:id|name|class|title|role|type|value|for|form|placeholder|autocomplete|inputmode|pattern|min|max|step|minlength|maxlength|rows|cols|tabindex|disabled|readonly|required|checked|selected|multiple|hidden|lang|dir|aria-[a-z]+|data-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
  var hasOwn2 = Object.prototype.hasOwnProperty;
  function attrs(map) {
    const out = [];
    for (const name in map) {
      if (!hasOwn2.call(map, name)) continue;
      if (!ATTR_NAME.test(name)) {
        if (DEV2) warn2('attribute "' + name + '" is not allowed in component markup.');
        continue;
      }
      const value = map[name];
      if (value == null || value === false || value === "") {
        if (value === false && /^(aria|data)-/.test(name)) out.push(name + '="false"');
        continue;
      }
      if (value === true) out.push(/^(aria|data)-/.test(name) ? name + '="true"' : name);
      else out.push(name + '="' + vfunc_default.esc(value) + '"');
    }
    return vfunc_default.unsafeHtml(out.join(" "));
  }
  __name(attrs, "attrs");

  // layer2/src/locales/en.js
  var en_default = {
    common: {
      loading: "Loading"
    }
  };

  // layer2/src/_internal/messages.js
  vfunc_default.i18n.add("en", en_default, { defaults: true });
  function msg(key, override, params) {
    if (override != null && override !== "") return override;
    return vfunc_default.t(key, params);
  }
  __name(msg, "msg");

  // layer2/src/_internal/props.js
  function oneOf(prop, value, allowed) {
    if (value == null || value === "") return allowed[0];
    if (allowed.indexOf(value) >= 0) return value;
    if (DEV2) warn2(prop + ' "' + value + '" is not one of ' + allowed.join(", ") + '; using "' + allowed[0] + '".');
    return allowed[0];
  }
  __name(oneOf, "oneOf");

  // layer2/src/components/button.js
  var html2 = vfunc_default.html;
  var VARIANTS = ["secondary", "primary", "danger", "ghost"];
  var SIZES = ["md", "sm", "lg"];
  var TYPES = ["button", "submit", "reset"];
  function vsButton(props) {
    const p = props || {};
    const loading = !!p.loading;
    const spinner = loading ? html2`<span class="vf-button__spinner" aria-hidden="true"></span>` : "";
    const status = loading ? html2`<span class="vf-visually-hidden">${msg("common.loading", p.loadingText)}</span>` : "";
    return html2`<button ${attrs({
      type: oneOf("vsButton type", p.type, TYPES),
      class: "vf-button" + (p.className ? " " + p.className : ""),
      id: p.id,
      "data-action": p.action,
      "data-ref": p.ref,
      "data-variant": oneOf("vsButton variant", p.variant, VARIANTS),
      "data-size": oneOf("vsButton size", p.size, SIZES),
      "aria-label": p.ariaLabel,
      "aria-busy": loading || null,
      disabled: !!p.disabled || loading
    })}>${spinner}<span class="vf-button__label">${p.label}</span>${status}</button>`;
  }
  __name(vsButton, "vsButton");

  // layer2/src/index.js
  var members = { vsButton };
  var hasOwn3 = Object.prototype.hasOwnProperty;
  var conflicts = [];
  for (const key in members) {
    if (!hasOwn3.call(members, key)) continue;
    if (hasOwn3.call(vfunc_default, key)) {
      if (vfunc_default[key] !== members[key]) conflicts.push(key);
      continue;
    }
    Object.defineProperty(vfunc_default, key, { value: members[key], enumerable: true, writable: false, configurable: false });
  }
  if (DEV2 && conflicts.length) warn2("vf already has " + conflicts.join(", ") + "; the existing members were kept.");
})();
//# sourceMappingURL=vfunc-all.js.map
