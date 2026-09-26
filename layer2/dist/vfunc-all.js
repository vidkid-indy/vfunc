/*! vfunc-ui (vfunc.js layer 2) v1.0.0 | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // layer1/src/vfunc.js
  var VERSION = false ? "0.0.0-dev" : "1.0.0";
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
  function protect(target, members3) {
    for (const key in members3) {
      if (hasOwn.call(members3, key)) {
        Object.defineProperty(target, key, { value: members3[key], enumerable: true, writable: false, configurable: false });
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
    const list2 = root2.querySelectorAll("[" + attribute + "]");
    for (let i = 0; i < list2.length; i++) {
      const key = attribute === "id" ? list2[i].id : list2[i].getAttribute(attribute);
      if (key && !isDangerousKey(key)) map[key] = list2[i];
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
  function readControl(control2) {
    const tag = control2.tagName;
    const type = (control2.type || "").toLowerCase();
    if (tag === "INPUT" && (type === "checkbox" || type === "radio")) return control2.checked;
    if (tag === "SELECT") {
      if (control2.multiple) {
        const selected = [];
        for (let i = 0; i < control2.options.length; i++) {
          if (control2.options[i].selected) selected.push(control2.options[i].value);
        }
        return selected;
      }
      return control2.selectedIndex >= 0 ? control2.options[control2.selectedIndex].value : "";
    }
    return control2.value;
  }
  __name(readControl, "readControl");
  function formValues(target, options) {
    const controls = toControlMap(target);
    const skipPassword = !!(options && options.skipPassword);
    const data = {};
    for (const id in controls) {
      if (!hasOwn.call(controls, id) || isDangerousKey(id)) continue;
      const control2 = controls[id];
      if (!control2 || !control2.tagName) continue;
      if (skipPassword && (control2.type || "").toLowerCase() === "password") continue;
      data[id] = readControl(control2);
    }
    return data;
  }
  __name(formValues, "formValues");
  function formReset(target) {
    const controls = toControlMap(target);
    for (const id in controls) {
      if (!hasOwn.call(controls, id)) continue;
      const control2 = controls[id];
      if (!control2 || !control2.tagName) continue;
      const tag = control2.tagName;
      const type = (control2.type || "").toLowerCase();
      if (tag === "SELECT") {
        control2.selectedIndex = -1;
        const fallback = control2.getAttribute("user-default");
        if (fallback !== null && fallback !== "") control2.selectedIndex = Number(fallback);
      } else if (tag === "INPUT" && (type === "checkbox" || type === "radio")) {
        control2.checked = false;
      } else if (tag === "TEXTAREA" || tag === "INPUT" && type !== "hidden" && !hasOwn.call(NON_VALUE_INPUTS, type)) {
        control2.value = "";
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
    const list2 = root2.querySelectorAll("[data-vf-keep]");
    for (let i = 0; i < list2.length; i++) {
      const element = list2[i];
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
      const list2 = holder.querySelectorAll("[data-vf-keep]");
      for (let i = 0; i < list2.length; i++) {
        if (list2[i].getAttribute("data-vf-keep") === key) {
          list2[i].parentNode.replaceChild(kept[key], list2[i]);
          break;
        }
      }
    }
  }
  __name(restoreKept, "restoreKept");
  function sameAction(root2, action) {
    const out = [];
    const list2 = root2.querySelectorAll("[data-action]");
    for (let i = 0; i < list2.length; i++) {
      if (list2[i].getAttribute("data-action") === action) out.push(list2[i]);
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
    let instance2;
    if (o.replaceRoot && (o.render || o.innerHTML)) {
      instance2 = new vfunc(o);
      if (element.parentNode) element.parentNode.replaceChild(instance2.$node, element);
    } else {
      if (!o.tag) o.tag = element.tagName.toLowerCase();
      o._adopt = element;
      instance2 = new vfunc(o);
    }
    instance2._mountHook(true);
    return instance2;
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
    const list2 = Array.prototype.slice.call(scope.querySelectorAll("[data-i18n],[data-i18n-attr]"));
    if (scope.nodeType === 1 && (scope.hasAttribute("data-i18n") || scope.hasAttribute("data-i18n-attr"))) list2.unshift(scope);
    for (let i = 0; i < list2.length; i++) {
      const element = list2[i];
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
      const hasOwn5 = Object.prototype.hasOwnProperty;
      const conflicts3 = [];
      const keys = Object.keys(vfunc_default);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (hasOwn5.call(existing, key)) {
          if (existing[key] !== vfunc_default[key]) conflicts3.push(key);
        } else {
          Object.defineProperty(existing, key, Object.getOwnPropertyDescriptor(vfunc_default, key));
        }
      }
      if (conflicts3.length) devWarn("window.vf already has " + conflicts3.join(", ") + "; the existing members were kept.");
    }
  }

  // layer2/src/_internal/dev.js
  var DEV2 = false ? true : true;
  function warn2(message) {
    if (typeof console !== "undefined" && console.warn) console.warn("[vfunc-ui] " + message);
  }
  __name(warn2, "warn");

  // layer2/src/locales/en.js
  var en_default = {
    common: {
      loading: "Loading"
    },
    alert: {
      dismiss: "Dismiss"
    },
    breadcrumb: {
      label: "Breadcrumb"
    },
    carousel: {
      carousel: "carousel",
      slide: "slide",
      position: "{index} of {total}",
      goTo: "Go to slide {index}",
      prev: "Previous slide",
      next: "Next slide",
      pause: "Pause",
      play: "Play"
    },
    chart: {
      label: "Chart",
      legend: "Legend",
      point: "{series}, {label}: {value}"
    },
    confirm: {
      ok: "OK",
      cancel: "Cancel"
    },
    datePicker: {
      placeholder: "YYYY-MM-DD"
    },
    dateRangePicker: {
      start: "Start date",
      end: "End date"
    },
    emptyState: {
      title: "No data"
    },
    grid: {
      select: "Select",
      selectAll: "Select all rows on this page",
      selectRow: "Select row {index}",
      range: "{from}–{to} of {total}"
    },
    modal: {
      close: "Close"
    },
    numberInput: {
      decrement: "Decrease",
      increment: "Increase"
    },
    pagination: {
      label: "Pagination",
      previous: "Previous page",
      next: "Next page",
      page: "Page {page}"
    },
    passwordInput: {
      show: "Show",
      hide: "Hide"
    },
    rating: {
      label: "Rating",
      value: "{value} of {max}"
    },
    searchInput: {
      label: "Search",
      placeholder: "Search",
      clear: "Clear search"
    },
    sparkline: {
      summary: "From {first} to {last}, low {min}, high {max}",
      empty: "No data"
    },
    splitButton: {
      more: "More options"
    },
    statCard: {
      up: "Up",
      down: "Down"
    },
    stepper: {
      complete: "Completed"
    },
    tag: {
      remove: "Remove {label}"
    },
    timePicker: {
      placeholder: "HH:MM"
    },
    toast: {
      dismiss: "Dismiss",
      region: "Notifications"
    }
  };

  // layer2/src/_internal/attrs.js
  var ATTR_NAME = /^(?:id|name|class|title|role|type|value|for|form|href|src|alt|label|datetime|scope|placeholder|autocomplete|inputmode|pattern|min|max|step|minlength|maxlength|rows|cols|tabindex|disabled|readonly|required|checked|selected|multiple|hidden|lang|dir|aria-[a-z]+|data-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
  var URL_ATTR = /^(?:href|src)$/;
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
      else out.push(name + '="' + vfunc_default.esc(URL_ATTR.test(name) ? vfunc_default.safeUrl(value) : value) + '"');
    }
    return vfunc_default.unsafeHtml(out.join(" "));
  }
  __name(attrs, "attrs");

  // layer2/src/_internal/messages.js
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
    const map = {
      type: oneOf("vsButton type", p.type, TYPES),
      class: "vf-button" + (p.className ? " " + p.className : ""),
      id: p.id,
      "data-action": p.action,
      "data-ref": p.ref,
      "data-variant": oneOf("vsButton variant", p.variant, VARIANTS),
      "data-size": oneOf("vsButton size", p.size, SIZES),
      "aria-label": p.ariaLabel,
      "aria-describedby": p.describedBy,
      "aria-busy": loading || null,
      disabled: !!p.disabled || loading
    };
    if (p.aria) {
      for (const key in p.aria) if (Object.prototype.hasOwnProperty.call(p.aria, key)) map["aria-" + key] = p.aria[key];
    }
    return html2`<button ${attrs(map)}>${spinner}<span class="vf-button__label">${p.label}</span>${status}</button>`;
  }
  __name(vsButton, "vsButton");

  // layer2/src/_internal/common.js
  var counter = 0;
  function uid(prefix) {
    counter += 1;
    return "vf-" + prefix + "-" + counter;
  }
  __name(uid, "uid");
  function present(value) {
    return value != null && value !== "" && value !== false;
  }
  __name(present, "present");
  function extend(target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      if (!source) continue;
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
      }
    }
    return target;
  }
  __name(extend, "extend");
  function cls(block, className) {
    return present(className) ? block + " " + className : block;
  }
  __name(cls, "cls");
  function normalizeOptions(options) {
    const out = [];
    const list2 = options || [];
    for (let i = 0; i < list2.length; i++) {
      const o = list2[i];
      if (o != null && typeof o === "object") {
        if (o.options) out.push({ label: o.label, options: normalizeOptions(o.options), disabled: !!o.disabled });
        else out.push({ value: o.value == null ? "" : String(o.value), label: o.label == null ? o.value : o.label, disabled: !!o.disabled });
      } else {
        out.push({ value: String(o), label: String(o), disabled: false });
      }
    }
    return out;
  }
  __name(normalizeOptions, "normalizeOptions");
  function hasValue(value, v) {
    if (value == null) return false;
    if (Object.prototype.toString.call(value) === "[object Array]") {
      for (let i = 0; i < value.length; i++) if (String(value[i]) === v) return true;
      return false;
    }
    return String(value) === v;
  }
  __name(hasValue, "hasValue");
  function emit(callback, sender, event, data) {
    if (typeof callback === "function") callback({ sender, event: event || null, data: data || {} });
  }
  __name(emit, "emit");

  // layer2/src/_internal/field.js
  var html3 = vfunc_default.html;
  function fieldIds(p, prefix, always) {
    const wrapped = !!always || present(p.label) || present(p.hint) || present(p.error);
    const id = present(p.id) ? String(p.id) : wrapped ? uid(prefix) : null;
    const hintId = present(p.hint) ? id + "-hint" : null;
    const errorId = present(p.error) ? id + "-error" : null;
    const described = [];
    if (present(p.describedBy)) described.push(p.describedBy);
    if (hintId) described.push(hintId);
    if (errorId) described.push(errorId);
    return {
      wrapped,
      id,
      hintId,
      errorId,
      describedBy: described.length ? described.join(" ") : null,
      invalid: present(p.error),
      required: !!p.required
    };
  }
  __name(fieldIds, "fieldIds");
  function inputAttrs(className, p, a, extra) {
    return extend({
      class: className,
      id: a.id,
      name: p.name,
      "data-ref": p.ref,
      "data-action": p.action,
      "aria-describedby": a.describedBy,
      "aria-invalid": a.invalid || null,
      disabled: !!p.disabled,
      readonly: !!p.readonly,
      required: !!p.required
    }, extra);
  }
  __name(inputAttrs, "inputAttrs");
  function requiredMark(a) {
    return a.required ? html3`<span class="vf-field__required" aria-hidden="true">*</span>` : "";
  }
  __name(requiredMark, "requiredMark");
  function fieldTexts(p, a) {
    return html3`${a.hintId ? html3`<p ${attrs({ class: "vf-field__hint", id: a.hintId })}>${p.hint}</p>` : ""}${a.errorId ? html3`<p ${attrs({ class: "vf-field__error", id: a.errorId })}>${p.error}</p>` : ""}`;
  }
  __name(fieldTexts, "fieldTexts");
  function wrapperAttrs(block, p, a, extra) {
    return extend({ class: cls(block, p.className), "data-state": a.invalid ? "invalid" : null }, extra);
  }
  __name(wrapperAttrs, "wrapperAttrs");
  function field(p, a, control2, ownLabel) {
    if (!a.wrapped) return control2;
    const label = !ownLabel && present(p.label) ? html3`<label ${attrs({ class: "vf-field__label", for: a.id })}>${p.label}${requiredMark(a)}</label>` : "";
    return html3`<div ${attrs(wrapperAttrs("vf-field", p, a))}>${label}${control2}${fieldTexts(p, a)}</div>`;
  }
  __name(field, "field");
  function fieldset(block, p, a, legend2, inner, extra) {
    const head = present(legend2) ? html3`<legend class="vf-field__label">${legend2}${requiredMark(a)}</legend>` : "";
    return html3`<fieldset ${attrs(wrapperAttrs(block, p, a, extend({ id: a.id, "data-ref": p.ref, "aria-describedby": a.describedBy }, extra)))}>${head}${inner}${fieldTexts(p, a)}</fieldset>`;
  }
  __name(fieldset, "fieldset");
  function controlClass(block, p, a) {
    return a.wrapped ? block : cls(block, p.className);
  }
  __name(controlClass, "controlClass");

  // layer2/src/components/field.js
  function vsField(props) {
    const p = props || {};
    const a = fieldIds(p, "field", true);
    const control2 = typeof p.control === "function" ? p.control({ id: a.id, describedBy: a.describedBy, invalid: a.invalid, required: a.required }) : "";
    return field(p, a, control2);
  }
  __name(vsField, "vsField");

  // layer2/src/components/input.js
  var html4 = vfunc_default.html;
  var TYPES2 = ["text", "email", "tel", "url", "number", "search", "password", "date", "time", "datetime-local", "month", "week"];
  var SIZES2 = ["md", "sm", "lg"];
  function controlAttrs(block, p, a, name) {
    return inputAttrs(controlClass(block, p, a), p, a, { "data-size": oneOf(name + " size", p.size, SIZES2) });
  }
  __name(controlAttrs, "controlAttrs");
  function boxAttrs(block, p, a, name) {
    return { class: controlClass(block, p, a), "data-size": oneOf(name + " size", p.size, SIZES2) };
  }
  __name(boxAttrs, "boxAttrs");
  function vsInput(props) {
    const p = props || {};
    const a = fieldIds(p, "input");
    const control2 = html4`<input ${attrs(extend(controlAttrs("vf-input", p, a, "vsInput"), {
      type: oneOf("vsInput type", p.type, TYPES2),
      value: p.value,
      placeholder: p.placeholder,
      autocomplete: p.autocomplete,
      inputmode: p.inputmode,
      pattern: p.pattern,
      min: p.min,
      max: p.max,
      step: p.step,
      minlength: p.minlength,
      maxlength: p.maxlength
    }))}>`;
    return field(p, a, control2);
  }
  __name(vsInput, "vsInput");

  // layer2/src/components/textarea.js
  var html5 = vfunc_default.html;
  function vsTextarea(props) {
    const p = props || {};
    const a = fieldIds(p, "textarea");
    const control2 = html5`<textarea ${attrs(extend(controlAttrs("vf-textarea", p, a, "vsTextarea"), {
      rows: p.rows == null ? 3 : p.rows,
      placeholder: p.placeholder,
      minlength: p.minlength,
      maxlength: p.maxlength
    }))}>${p.value == null ? "" : String(p.value)}</textarea>`;
    return field(p, a, control2);
  }
  __name(vsTextarea, "vsTextarea");

  // layer2/src/components/select.js
  var html6 = vfunc_default.html;
  function optionList(options, value) {
    const out = [];
    for (let i = 0; i < options.length; i++) {
      const o = options[i];
      if (o.options) {
        out.push(html6`<optgroup ${attrs({ label: o.label, disabled: o.disabled })}>${optionList(o.options, value)}</optgroup>`);
      } else {
        out.push(html6`<option value="${o.value}" ${attrs({ selected: hasValue(value, o.value), disabled: o.disabled })}>${o.label}</option>`);
      }
    }
    return out;
  }
  __name(optionList, "optionList");
  function vsSelect(props) {
    const p = props || {};
    const a = fieldIds(p, "select");
    const base = controlAttrs("vf-select", p, a, "vsSelect");
    base.readonly = null;
    const placeholder = present(p.placeholder) ? html6`<option value="" ${attrs({ selected: !present(p.value) })}>${p.placeholder}</option>` : "";
    const control2 = html6`<select ${attrs(extend(base, { multiple: !!p.multiple }))}>${placeholder}${optionList(normalizeOptions(p.options), p.value)}</select>`;
    return field(p, a, control2);
  }
  __name(vsSelect, "vsSelect");

  // layer2/src/components/checkbox.js
  var html7 = vfunc_default.html;
  function checkControl(block, p, prefix, extra, decoration) {
    const a = fieldIds({ id: p.id, hint: p.hint, error: p.error, describedBy: p.describedBy, required: p.required }, prefix);
    const input = inputAttrs(block + "__input", p, a, extend({ type: "checkbox", value: p.value, checked: !!p.checked, readonly: null }, extra));
    const control2 = html7`<label ${attrs({ class: a.wrapped ? block : cls(block, p.className) })}><input ${attrs(input)}>${decoration || ""}<span class="${block}__label">${p.label}${requiredMark(a)}</span></label>`;
    return field(p, a, control2, true);
  }
  __name(checkControl, "checkControl");
  function vsCheckbox(props) {
    return checkControl("vf-check", props || {}, "check");
  }
  __name(vsCheckbox, "vsCheckbox");

  // layer2/src/components/radio-group.js
  var html8 = vfunc_default.html;
  var DIRECTIONS = ["vertical", "horizontal"];
  function vsRadioGroup(props) {
    const p = props || {};
    const a = fieldIds(p, "radio", true);
    const name = present(p.name) ? p.name : uid("radio-name");
    const options = normalizeOptions(p.options);
    const items = [];
    for (let i = 0; i < options.length; i++) {
      const o = options[i];
      items.push(html8`<label class="vf-check"><input ${attrs({
        type: "radio",
        class: "vf-check__input",
        name,
        value: o.value,
        "data-action": p.action,
        "aria-invalid": a.invalid || null,
        checked: hasValue(p.value, o.value),
        disabled: !!p.disabled || o.disabled,
        required: !!p.required
      })}><span class="vf-check__label">${o.label}</span></label>`);
    }
    return fieldset(
      "vf-field vf-radio-group",
      p,
      a,
      p.label,
      html8`<div class="vf-radio-group__options">${items}</div>`,
      { "data-direction": oneOf("vsRadioGroup direction", p.direction, DIRECTIONS) }
    );
  }
  __name(vsRadioGroup, "vsRadioGroup");

  // layer2/src/components/switch.js
  function vsSwitch(props) {
    return checkControl(
      "vf-switch",
      props || {},
      "switch",
      { role: "switch" },
      vfunc_default.html`<span class="vf-switch__track" aria-hidden="true"></span>`
    );
  }
  __name(vsSwitch, "vsSwitch");

  // layer2/src/components/slider.js
  var html9 = vfunc_default.html;
  function vsSlider(props) {
    const p = props || {};
    const a = fieldIds(p, "slider");
    return field(p, a, html9`<input ${attrs(inputAttrs(controlClass("vf-slider", p, a), p, a, {
      type: "range",
      value: p.value,
      min: p.min == null ? 0 : p.min,
      max: p.max == null ? 100 : p.max,
      step: p.step == null ? 1 : p.step,
      readonly: null,
      required: null
    }))}>`);
  }
  __name(vsSlider, "vsSlider");

  // layer2/src/components/progress.js
  var html10 = vfunc_default.html;
  function vsProgress(props) {
    const p = props || {};
    const a = fieldIds(p, "progress");
    const max = p.max == null ? 100 : Number(p.max);
    const known = present(p.value) || p.value === 0;
    const value = known ? Math.max(0, Math.min(max, Number(p.value))) : null;
    const bar = html10`<progress ${attrs({
      class: controlClass("vf-progress", p, a),
      id: a.id,
      value,
      max,
      "data-ref": p.ref,
      "aria-describedby": a.describedBy
    })}></progress>`;
    const text = p.showValue && known ? html10`<span class="vf-progress__value" aria-hidden="true">${vfunc_default.fmt.number(max ? value / max : 0, { style: "percent" })}</span>` : "";
    return field(p, a, text ? html10`<div class="vf-progress__row">${bar}${text}</div>` : bar);
  }
  __name(vsProgress, "vsProgress");

  // layer2/src/components/button-group.js
  var html11 = vfunc_default.html;
  var SIZES3 = ["md", "sm", "lg"];
  function vsButtonGroup(props) {
    const p = props || {};
    const size = oneOf("vsButtonGroup size", p.size, SIZES3);
    const list2 = p.buttons || [];
    const buttons = [];
    for (let i = 0; i < list2.length; i++) buttons.push(vsButton(extend({ size }, list2[i])));
    return html11`<div ${attrs({
      class: cls("vf-button-group", p.className),
      role: "group",
      id: p.id,
      "data-ref": p.ref,
      "data-attached": p.attached ? "true" : null,
      "aria-label": p.label
    })}>${buttons}</div>`;
  }
  __name(vsButtonGroup, "vsButtonGroup");

  // layer2/src/components/badge.js
  var html12 = vfunc_default.html;
  var TONES = ["neutral", "primary", "success", "warning", "danger", "info"];
  function vsBadge(props) {
    const p = props || {};
    const dot = p.dot ? html12`<span class="vf-badge__dot" aria-hidden="true"></span>` : "";
    return html12`<span ${attrs({
      class: cls("vf-badge", p.className),
      id: p.id,
      "data-ref": p.ref,
      "data-variant": oneOf("vsBadge variant", p.variant, TONES),
      "aria-describedby": p.describedBy
    })}>${dot}${p.label}</span>`;
  }
  __name(vsBadge, "vsBadge");

  // layer2/src/components/tag.js
  var html13 = vfunc_default.html;
  function vsTag(props) {
    const p = props || {};
    const text = typeof p.label === "string" || typeof p.label === "number" ? String(p.label) : p.value || "";
    const remove = p.removable ? html13`<button ${attrs({
      type: "button",
      class: "vf-tag__remove",
      "data-action": p.removeAction || "remove",
      "data-value": p.value,
      "aria-label": msg("tag.remove", p.removeLabel, { label: text }),
      disabled: !!p.disabled
    })}><span aria-hidden="true">&times;</span></button>` : "";
    return html13`<span ${attrs({
      class: cls("vf-tag", p.className),
      id: p.id,
      "data-ref": p.ref,
      "data-value": p.value,
      "data-variant": oneOf("vsTag variant", p.variant, TONES)
    })}><span class="vf-tag__label">${p.label}</span>${remove}</span>`;
  }
  __name(vsTag, "vsTag");

  // layer2/src/components/avatar.js
  var html14 = vfunc_default.html;
  var SIZES4 = ["md", "sm", "lg"];
  function initials(name) {
    const words = String(name == null ? "" : name).replace(/^\s+|\s+$/g, "").split(/\s+/);
    if (!words[0]) return "";
    const first = words[0].charAt(0);
    return (words.length > 1 ? first + words[words.length - 1].charAt(0) : first).toUpperCase();
  }
  __name(initials, "initials");
  function vsAvatar(props) {
    const p = props || {};
    const label = present(p.alt) ? p.alt : p.name;
    const inside = present(p.src) ? html14`<img alt="" ${attrs({ class: "vf-avatar__image", src: p.src })}>` : html14`<span class="vf-avatar__initials" aria-hidden="true">${initials(p.name)}</span>`;
    return html14`<span ${attrs({
      class: cls("vf-avatar", p.className),
      id: p.id,
      "data-ref": p.ref,
      "data-size": oneOf("vsAvatar size", p.size, SIZES4),
      role: present(label) ? "img" : null,
      "aria-label": label
    })}>${inside}</span>`;
  }
  __name(vsAvatar, "vsAvatar");

  // layer2/src/components/alert.js
  var html15 = vfunc_default.html;
  var VARIANTS2 = ["info", "success", "warning", "danger"];
  function vsAlert(props) {
    const p = props || {};
    const variant = oneOf("vsAlert variant", p.variant, VARIANTS2);
    const title = present(p.title) ? html15`<p class="vf-alert__title">${p.title}</p>` : "";
    const message = present(p.message) ? html15`<div class="vf-alert__message">${p.message}</div>` : "";
    const dismiss = p.dismissible ? html15`<button ${attrs({
      type: "button",
      class: "vf-alert__dismiss",
      "data-action": p.dismissAction || "dismiss",
      "aria-label": msg("alert.dismiss", p.dismissLabel)
    })}><span aria-hidden="true">&times;</span></button>` : "";
    return html15`<div ${attrs({
      class: cls("vf-alert", p.className),
      id: p.id,
      "data-ref": p.ref,
      "data-variant": variant,
      role: variant === "danger" || variant === "warning" ? "alert" : "status"
    })}><div class="vf-alert__body">${title}${message}</div>${dismiss}</div>`;
  }
  __name(vsAlert, "vsAlert");

  // layer2/src/components/card.js
  var html16 = vfunc_default.html;
  function heading(level) {
    const n = Number(level);
    return "h" + (n >= 2 && n <= 6 ? Math.floor(n) : 3);
  }
  __name(heading, "heading");
  function vsCard(props) {
    const p = props || {};
    const h = heading(p.headingLevel);
    const head = present(p.title) || present(p.subtitle) || present(p.actions) ? html16`<div class="vf-card__header"><div class="vf-card__heading">${present(p.title) ? html16`<${h} class="vf-card__title">${p.title}</${h}>` : ""}${present(p.subtitle) ? html16`<p class="vf-card__subtitle">${p.subtitle}</p>` : ""}</div>${present(p.actions) ? html16`<div class="vf-card__actions">${p.actions}</div>` : ""}</div>` : "";
    const body = present(p.body) ? html16`<div class="vf-card__body">${p.body}</div>` : "";
    const footer = present(p.footer) ? html16`<div class="vf-card__footer">${p.footer}</div>` : "";
    return html16`<div ${attrs({ class: cls("vf-card", p.className), id: p.id, "data-ref": p.ref })}>${head}${body}${footer}</div>`;
  }
  __name(vsCard, "vsCard");

  // layer2/src/components/descriptions.js
  var html17 = vfunc_default.html;
  function vsDescriptions(props) {
    const p = props || {};
    const columns = Math.max(1, Math.min(4, Math.floor(Number(p.columns) || 1)));
    const list2 = p.items || [];
    const items = [];
    for (let i = 0; i < list2.length; i++) {
      items.push(html17`<div class="vf-descriptions__item"><dt class="vf-descriptions__label">${list2[i].label}</dt><dd class="vf-descriptions__value">${list2[i].value}</dd></div>`);
    }
    const title = present(p.title) ? html17`<p class="vf-descriptions__title">${p.title}</p>` : "";
    return html17`<div ${attrs({ class: cls("vf-descriptions", p.className), id: p.id, "data-ref": p.ref, "data-columns": columns })}>${title}<dl class="vf-descriptions__list">${items}</dl></div>`;
  }
  __name(vsDescriptions, "vsDescriptions");

  // layer2/src/components/stat-card.js
  var html18 = vfunc_default.html;
  function vsStatCard(props) {
    const p = props || {};
    const value = typeof p.value === "number" ? vfunc_default.fmt.number(p.value, p.format) : p.value;
    let delta = "";
    if (typeof p.delta === "number" && !isNaN(p.delta)) {
      const trend = p.delta > 0 ? "up" : p.delta < 0 ? "down" : "flat";
      const text = (p.delta > 0 ? "+" : "") + vfunc_default.fmt.number(p.delta, { style: "percent", maximumFractionDigits: 1 });
      const word = trend === "up" ? msg("statCard.up") : trend === "down" ? msg("statCard.down") : "";
      const said = word ? html18`<span class="vf-visually-hidden">${word} </span>` : "";
      delta = html18`<p ${attrs({ class: "vf-stat-card__delta", "data-trend": trend })}>${said}<span class="vf-stat-card__change">${text}</span>${present(p.deltaLabel) ? html18` <span class="vf-stat-card__delta-label">${p.deltaLabel}</span>` : ""}</p>`;
    }
    const icon = present(p.icon) ? html18`<span class="vf-stat-card__icon" aria-hidden="true">${p.icon}</span>` : "";
    const description = present(p.description) ? html18`<p class="vf-stat-card__description">${p.description}</p>` : "";
    return html18`<div ${attrs({ class: cls("vf-stat-card", p.className), id: p.id, "data-ref": p.ref })}><p class="vf-stat-card__label">${icon}${p.label}</p><p class="vf-stat-card__value">${value}</p>${delta}${description}</div>`;
  }
  __name(vsStatCard, "vsStatCard");

  // layer2/src/components/timeline.js
  var html19 = vfunc_default.html;
  function timeOf(value, format) {
    if (!present(value) && value !== 0) return "";
    const date = value instanceof Date ? value : new Date(value);
    const valid = !isNaN(date.getTime());
    const iso = valid ? date.toISOString() : null;
    const text = valid ? vfunc_default.fmt.date(date, format) : String(value);
    return html19`<time ${attrs({ class: "vf-timeline__time", datetime: typeof value === "string" ? value : iso })}>${text}</time>`;
  }
  __name(timeOf, "timeOf");
  function vsTimeline(props) {
    const p = props || {};
    const list2 = p.items || [];
    const items = [];
    for (let i = 0; i < list2.length; i++) {
      const item = list2[i] || {};
      items.push(html19`<li ${attrs({ class: "vf-timeline__item", "data-variant": oneOf("vsTimeline variant", item.variant, TONES) })}><span class="vf-timeline__marker" aria-hidden="true"></span><div class="vf-timeline__content"><p class="vf-timeline__title">${item.title}</p>${timeOf(item.time, p.timeFormat)}${present(item.description) ? html19`<p class="vf-timeline__description">${item.description}</p>` : ""}</div></li>`);
    }
    return html19`<ol ${attrs({ class: cls("vf-timeline", p.className), id: p.id, "data-ref": p.ref })}>${items}</ol>`;
  }
  __name(vsTimeline, "vsTimeline");

  // layer2/src/components/empty-state.js
  var html20 = vfunc_default.html;
  function vsEmptyState(props) {
    const p = props || {};
    const icon = present(p.icon) ? html20`<div class="vf-empty-state__icon" aria-hidden="true">${p.icon}</div>` : "";
    const description = present(p.description) ? html20`<p class="vf-empty-state__description">${p.description}</p>` : "";
    const action = present(p.action) ? html20`<div class="vf-empty-state__action">${p.action}</div>` : "";
    return html20`<div ${attrs({ class: cls("vf-empty-state", p.className), id: p.id, "data-ref": p.ref })}>${icon}<p class="vf-empty-state__title">${msg("emptyState.title", p.title)}</p>${description}${action}</div>`;
  }
  __name(vsEmptyState, "vsEmptyState");

  // layer2/src/components/skeleton.js
  var html21 = vfunc_default.html;
  var VARIANTS3 = ["text", "rect", "circle"];
  function vsSkeleton(props) {
    const p = props || {};
    const variant = oneOf("vsSkeleton variant", p.variant, VARIANTS3);
    const count = variant === "text" ? Math.max(1, Math.min(20, Math.floor(Number(p.lines) || 1))) : 1;
    const lines = [];
    for (let i = 0; i < count; i++) lines.push(html21`<span class="vf-skeleton__line"></span>`);
    return html21`<div ${attrs({ class: cls("vf-skeleton", p.className), id: p.id, "data-ref": p.ref, "data-variant": variant, "aria-hidden": true })}>${lines}</div>`;
  }
  __name(vsSkeleton, "vsSkeleton");

  // layer2/src/components/spinner.js
  var html22 = vfunc_default.html;
  var SIZES5 = ["md", "sm", "lg"];
  function vsSpinner(props) {
    const p = props || {};
    return html22`<span ${attrs({
      class: cls("vf-spinner", p.className),
      id: p.id,
      "data-ref": p.ref,
      "data-size": oneOf("vsSpinner size", p.size, SIZES5),
      role: "status"
    })}><span class="vf-spinner__circle" aria-hidden="true"></span><span class="vf-visually-hidden">${msg("common.loading", p.label)}</span></span>`;
  }
  __name(vsSpinner, "vsSpinner");

  // layer2/src/components/tooltip.js
  var html23 = vfunc_default.html;
  var PLACEMENTS = ["top", "bottom", "start", "end"];
  function vsTooltip(props) {
    const p = props || {};
    const id = present(p.id) ? p.id : uid("tooltip");
    const trigger = typeof p.trigger === "function" ? p.trigger({ describedBy: id }) : p.trigger;
    return html23`<span ${attrs({
      class: cls("vf-tooltip", p.className),
      "data-ref": p.ref,
      "data-placement": oneOf("vsTooltip placement", p.placement, PLACEMENTS)
    })}>${trigger}<span ${attrs({ class: "vf-tooltip__bubble", role: "tooltip", id })}>${p.text}</span></span>`;
  }
  __name(vsTooltip, "vsTooltip");

  // layer2/src/_internal/instance.js
  function stateOf(p, prefix, extra) {
    const state = {};
    for (const key in p) {
      if (Object.prototype.hasOwnProperty.call(p, key) && typeof p[key] !== "function") state[key] = p[key];
    }
    state.id = present(p.id) ? String(p.id) : uid(prefix);
    return extend(state, extra);
  }
  __name(stateOf, "stateOf");
  function instance(spec) {
    const methods = extend({
      getValue: /* @__PURE__ */ __name(function() {
        return this.state.value;
      }, "getValue"),
      setValue: /* @__PURE__ */ __name(function(value) {
        this.setState({ value });
      }, "setValue")
    }, spec.methods);
    for (const name in methods) {
      if (Object.prototype.hasOwnProperty.call(methods, name) && Object.prototype.hasOwnProperty.call(spec.state, name)) {
        delete spec.state[name];
      }
    }
    return vfunc_default.vfunc({
      replaceRoot: true,
      state: spec.state,
      render: spec.render,
      delegates: spec.delegates || [],
      events: spec.events,
      childs: spec.childs,
      methods,
      onMount: spec.onMount,
      onUpdate: spec.onUpdate,
      onDestroy: spec.onDestroy
    });
  }
  __name(instance, "instance");
  function composing(event) {
    return !!(event && (event.isComposing || event.keyCode === 229));
  }
  __name(composing, "composing");
  function idSelector(id) {
    return '[id="' + String(id).replace(/["\\]/g, "\\$&") + '"]';
  }
  __name(idSelector, "idSelector");
  function control(sender) {
    const root2 = sender.$node;
    return root2.id === sender.state.id ? root2 : sender.ids[sender.state.id] || null;
  }
  __name(control, "control");
  function actionPart(sender, action) {
    return sender.$node.querySelector('[data-action="' + action + '"]');
  }
  __name(actionPart, "actionPart");

  // layer2/src/components/number-input.js
  var html24 = vfunc_default.html;
  function num(value) {
    if (value === "" || value == null) return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  }
  __name(num, "num");
  function clampStep(value, p) {
    if (value == null) return null;
    let n = value;
    const min = num(p.min);
    const max = num(p.max);
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    const decimals = (String(p.step == null ? 1 : p.step).split(".")[1] || "").length;
    return Number(n.toFixed(decimals));
  }
  __name(clampStep, "clampStep");
  function vsNumberInput(props) {
    const p = props || {};
    const a = fieldIds(p, "number");
    const value = num(p.value);
    const min = num(p.min);
    const max = num(p.max);
    const locked = !!p.disabled || !!p.readonly;
    const box = html24`<div ${attrs(boxAttrs("vf-number-input", p, a, "vsNumberInput"))}><button ${attrs({
      type: "button",
      class: "vf-number-input__step",
      "data-action": "decrement",
      "aria-label": msg("numberInput.decrement", p.decrementLabel),
      "aria-controls": a.id,
      tabindex: -1,
      disabled: locked || value != null && min != null && value <= min
    })}><span aria-hidden="true">&minus;</span></button><input ${attrs(inputAttrs("vf-number-input__input", p, a, {
      type: "number",
      value,
      min,
      max,
      step: p.step == null ? 1 : p.step,
      placeholder: p.placeholder,
      inputmode: "decimal"
    }))}><button ${attrs({
      type: "button",
      class: "vf-number-input__step",
      "data-action": "increment",
      "aria-label": msg("numberInput.increment", p.incrementLabel),
      "aria-controls": a.id,
      tabindex: -1,
      disabled: locked || value != null && max != null && value >= max
    })}><span aria-hidden="true">+</span></button></div>`;
    return field(p, a, box);
  }
  __name(vsNumberInput, "vsNumberInput");
  function vfNumberInput(props) {
    const p = props || {};
    function commit(e, value) {
      const next = clampStep(value, e.sender.state);
      const input = control(e.sender);
      if (input && input.value !== (next == null ? "" : String(next))) input.value = next == null ? "" : String(next);
      if (next === e.sender.state.value) return;
      e.sender.setState({ value: next });
      emit(p.onChange, e.sender, e.event, { value: next });
    }
    __name(commit, "commit");
    function stepBy(direction) {
      return function(e) {
        const s = e.sender.state;
        if (s.disabled || s.readonly) return;
        const step = num(s.step) || 1;
        const edge = num(direction > 0 ? s.min : s.max);
        commit(e, s.value == null ? edge == null ? 0 : edge : s.value + direction * step);
      };
    }
    __name(stepBy, "stepBy");
    const state = stateOf(p, "number", { value: clampStep(num(p.value), p) });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsNumberInput(s);
      }, "render"),
      delegates: [
        { selector: '[data-action="decrement"]', eventType: "click", onEvent: stepBy(-1) },
        { selector: '[data-action="increment"]', eventType: "click", onEvent: stepBy(1) },
        { selector: idSelector(state.id), eventType: "change", onEvent: /* @__PURE__ */ __name(function(e) {
          commit(e, num(e.target.value));
        }, "onEvent") }
      ],
      methods: {
        setValue: /* @__PURE__ */ __name(function(value) {
          this.setState({ value: clampStep(num(value), this.state) });
        }, "setValue")
      }
    });
  }
  __name(vfNumberInput, "vfNumberInput");

  // layer2/src/components/search-input.js
  var html25 = vfunc_default.html;
  function vsSearchInput(props) {
    const p = props || {};
    const a = fieldIds(p, "search");
    const filled = present(p.value);
    const box = html25`<div ${attrs(boxAttrs("vf-search-input", p, a, "vsSearchInput"))}><input ${attrs(inputAttrs("vf-search-input__input", p, a, {
      type: "search",
      value: p.value,
      placeholder: msg("searchInput.placeholder", p.placeholder),
      autocomplete: "off",
      "aria-label": present(p.label) ? null : msg("searchInput.label", p.ariaLabel)
    }))}><button ${attrs({
      type: "button",
      class: "vf-search-input__clear",
      "data-action": "clear",
      "aria-label": msg("searchInput.clear", p.clearLabel),
      "aria-controls": a.id,
      hidden: !filled || !!p.disabled
    })}><span aria-hidden="true">&times;</span></button></div>`;
    return field(p, a, box);
  }
  __name(vsSearchInput, "vsSearchInput");
  function vfSearchInput(props) {
    const p = props || {};
    const wait = p.debounce == null ? 300 : Math.max(0, Number(p.debounce) || 0);
    let timer = null;
    let last = null;
    function cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
    }
    __name(cancel, "cancel");
    function search(sender, event) {
      cancel();
      const value = sender.state.value || "";
      if (value === last) return;
      last = value;
      emit(p.onSearch, sender, event, { value });
    }
    __name(search, "search");
    function typed(e) {
      const value = e.target.value;
      e.sender.state.value = value;
      const clear2 = actionPart(e.sender, "clear");
      if (clear2) clear2.hidden = value === "";
      cancel();
      if (wait === 0) search(e.sender, e.event);
      else timer = setTimeout(function() {
        search(e.sender, e.event);
      }, wait);
    }
    __name(typed, "typed");
    function clear(sender, event) {
      cancel();
      const input = control(sender);
      if (input) {
        input.value = "";
        input.focus();
      }
      sender.state.value = "";
      const button = actionPart(sender, "clear");
      if (button) button.hidden = true;
      emit(p.onClear, sender, event, {});
      search(sender, event);
    }
    __name(clear, "clear");
    const state = stateOf(p, "search", { value: p.value == null ? "" : String(p.value) });
    last = state.value;
    const self2 = state.id;
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsSearchInput(s);
      }, "render"),
      delegates: [
        { selector: idSelector(self2), eventType: "input", onEvent: /* @__PURE__ */ __name(function(e) {
          if (!composing(e.event)) typed(e);
        }, "onEvent") },
        { selector: idSelector(self2), eventType: "compositionend", onEvent: typed },
        {
          selector: idSelector(self2),
          eventType: "keydown",
          onEvent: /* @__PURE__ */ __name(function(e) {
            if (composing(e.event)) return;
            const key = e.event.key;
            if (key === "Enter") {
              e.event.preventDefault();
              search(e.sender, e.event);
            } else if ((key === "Escape" || key === "Esc") && e.target.value !== "") {
              e.event.preventDefault();
              clear(e.sender, e.event);
            }
          }, "onEvent")
        },
        { selector: '[data-action="clear"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          clear(e.sender, e.event);
        }, "onEvent") }
      ],
      methods: {
        setValue: /* @__PURE__ */ __name(function(value) {
          cancel();
          last = value == null ? "" : String(value);
          this.setState({ value: last });
        }, "setValue"),
        clear: /* @__PURE__ */ __name(function() {
          clear(this, null);
        }, "clear"),
        focus: /* @__PURE__ */ __name(function() {
          const input = control(this);
          if (input) input.focus();
        }, "focus")
      },
      onDestroy: cancel
    });
  }
  __name(vfSearchInput, "vfSearchInput");

  // layer2/src/components/password-input.js
  var html26 = vfunc_default.html;
  function vsPasswordInput(props) {
    const p = props || {};
    const a = fieldIds(p, "password");
    const visible = !!p.visible;
    const box = html26`<div ${attrs(boxAttrs("vf-password-input", p, a, "vsPasswordInput"))}><input ${attrs(inputAttrs("vf-password-input__input", p, a, {
      type: visible ? "text" : "password",
      value: p.value,
      placeholder: p.placeholder,
      autocomplete: p.autocomplete || "current-password",
      minlength: p.minlength,
      maxlength: p.maxlength
    }))}><button ${attrs({
      type: "button",
      class: "vf-password-input__toggle",
      "data-action": "toggle-visibility",
      "aria-controls": a.id,
      "aria-pressed": visible,
      disabled: !!p.disabled
    })}>${visible ? msg("passwordInput.hide", p.hideLabel) : msg("passwordInput.show", p.showLabel)}</button></div>`;
    return field(p, a, box);
  }
  __name(vsPasswordInput, "vsPasswordInput");
  function vfPasswordInput(props) {
    const p = props || {};
    function toggle(sender, event, visible) {
      const next = visible == null ? !sender.state.visible : !!visible;
      sender.state.visible = next;
      const input = control(sender);
      const button = actionPart(sender, "toggle-visibility");
      if (input) input.type = next ? "text" : "password";
      if (button) {
        button.setAttribute("aria-pressed", next ? "true" : "false");
        button.textContent = next ? msg("passwordInput.hide", sender.state.hideLabel) : msg("passwordInput.show", sender.state.showLabel);
      }
      emit(p.onToggle, sender, event, { visible: next });
    }
    __name(toggle, "toggle");
    const state = stateOf(p, "password", { value: p.value == null ? "" : String(p.value), visible: !!p.visible });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsPasswordInput(s);
      }, "render"),
      delegates: [
        { selector: idSelector(state.id), eventType: "input", onEvent: /* @__PURE__ */ __name(function(e) {
          e.sender.state.value = e.target.value;
        }, "onEvent") },
        {
          selector: idSelector(state.id),
          eventType: "change",
          onEvent: /* @__PURE__ */ __name(function(e) {
            e.sender.state.value = e.target.value;
            emit(p.onChange, e.sender, e.event, { value: e.target.value });
          }, "onEvent")
        },
        { selector: '[data-action="toggle-visibility"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          toggle(e.sender, e.event);
        }, "onEvent") }
      ],
      methods: {
        toggle: /* @__PURE__ */ __name(function(visible) {
          toggle(this, null, visible);
        }, "toggle")
      }
    });
  }
  __name(vfPasswordInput, "vfPasswordInput");

  // layer2/src/components/chips-input.js
  var html27 = vfunc_default.html;
  function list(value) {
    if (Object.prototype.toString.call(value) !== "[object Array]") return [];
    const out = [];
    for (let i = 0; i < value.length; i++) if (value[i] != null && value[i] !== "") out.push(String(value[i]));
    return out;
  }
  __name(list, "list");
  function vsChipsInput(props) {
    const p = props || {};
    const a = fieldIds(p, "chips");
    const values = list(p.value);
    const full = p.max != null && values.length >= Number(p.max);
    const chips = [];
    const hidden = [];
    for (let i = 0; i < values.length; i++) {
      chips.push(html27`<li class="vf-chips-input__chip">${vsTag({ label: values[i], value: values[i], removable: true, disabled: !!p.disabled })}</li>`);
      if (p.name) hidden.push(html27`<input ${attrs({ type: "hidden", name: p.name, value: values[i] })}>`);
    }
    const box = html27`<div ${attrs({ class: controlClass("vf-chips-input", p, a), "data-state": p.disabled ? "disabled" : null })}>${chips.length ? html27`<ul class="vf-chips-input__list">${chips}</ul>` : ""}<input ${attrs(inputAttrs("vf-chips-input__input", p, a, {
      type: "text",
      name: null,
      "data-action": null,
      placeholder: p.placeholder,
      autocomplete: "off",
      readonly: null,
      required: !!p.required && values.length === 0,
      disabled: !!p.disabled || full
    }))}>${hidden}</div>`;
    return field(p, a, box);
  }
  __name(vsChipsInput, "vsChipsInput");
  function vfChipsInput(props) {
    const p = props || {};
    function change(sender, event, next) {
      sender.setState({ value: next });
      emit(p.onChange, sender, event, { value: next.slice() });
    }
    __name(change, "change");
    function add(sender, event, text) {
      const s = sender.state;
      const value = String(text == null ? "" : text).replace(/^\s+|\s+$/g, "");
      if (!value || s.disabled || s.value.indexOf(value) >= 0) return false;
      if (s.max != null && s.value.length >= Number(s.max)) return false;
      change(sender, event, s.value.concat([value]));
      return true;
    }
    __name(add, "add");
    function remove(sender, event, value) {
      const s = sender.state;
      const index = s.value.indexOf(String(value));
      if (index < 0 || s.disabled) return;
      const next = s.value.slice();
      next.splice(index, 1);
      change(sender, event, next);
    }
    __name(remove, "remove");
    const state = stateOf(p, "chips", { value: list(p.value) });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsChipsInput(s);
      }, "render"),
      delegates: [
        {
          selector: idSelector(state.id),
          eventType: "keydown",
          onEvent: /* @__PURE__ */ __name(function(e) {
            if (composing(e.event)) return;
            const key = e.event.key;
            const input = e.target;
            if (key === "Enter" || key === ",") {
              e.event.preventDefault();
              if (add(e.sender, e.event, input.value)) input.value = "";
            } else if (key === "Backspace" && input.value === "" && e.sender.state.value.length) {
              remove(e.sender, e.event, e.sender.state.value[e.sender.state.value.length - 1]);
            }
          }, "onEvent")
        },
        {
          selector: '[data-action="remove"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            remove(e.sender, e.event, e.target.getAttribute("data-value"));
            const input = control(e.sender);
            if (input) input.focus();
          }, "onEvent")
        }
      ],
      methods: {
        setValue: /* @__PURE__ */ __name(function(value) {
          this.setState({ value: list(value) });
        }, "setValue"),
        add: /* @__PURE__ */ __name(function(text) {
          return add(this, null, text);
        }, "add"),
        remove: /* @__PURE__ */ __name(function(text) {
          remove(this, null, text);
        }, "remove")
      }
    });
  }
  __name(vfChipsInput, "vfChipsInput");

  // layer2/src/components/rating.js
  var html28 = vfunc_default.html;
  function clampMax(max) {
    return Math.max(1, Math.min(10, Math.floor(Number(max) || 5)));
  }
  __name(clampMax, "clampMax");
  function vsRating(props) {
    const p = props || {};
    const max = clampMax(p.max);
    const value = Math.max(0, Math.min(max, Math.round(Number(p.value) || 0)));
    const stars = [];
    if (p.readonly) {
      for (let i = 1; i <= max; i++) stars.push(html28`<span ${attrs({ class: "vf-rating__star", "data-state": i <= value ? "on" : "off" })}>&#9733;</span>`);
      return html28`<span ${attrs({
        class: cls("vf-rating", p.className),
        id: p.id,
        "data-ref": p.ref,
        "data-readonly": "true",
        role: "img",
        "aria-label": msg("rating.value", null, { value, max })
      })}>${stars}</span>`;
    }
    const a = fieldIds(p, "rating", true);
    const name = present(p.name) ? p.name : uid("rating-name");
    for (let i = 1; i <= max; i++) {
      stars.push(html28`<label class="vf-rating__item"><input ${attrs({
        type: "radio",
        class: "vf-rating__input vf-visually-hidden",
        name,
        value: i,
        "data-action": "rate",
        checked: i === value,
        disabled: !!p.disabled,
        required: !!p.required
      })}><span ${attrs({ class: "vf-rating__star", "data-state": i <= value ? "on" : "off", "aria-hidden": true })}>&#9733;</span><span class="vf-visually-hidden">${msg("rating.value", null, { value: i, max })}</span></label>`);
    }
    return fieldset("vf-field vf-rating", p, a, msg("rating.label", p.label), html28`<div class="vf-rating__stars">${stars}</div>`);
  }
  __name(vsRating, "vsRating");
  function vfRating(props) {
    const p = props || {};
    const state = stateOf(p, "rating", { value: Number(p.value) || 0, name: present(p.name) ? p.name : uid("rating-name") });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsRating(s);
      }, "render"),
      delegates: [{
        selector: '[data-action="rate"]',
        eventType: "change",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const value = Number(e.target.value);
          if (value === e.sender.state.value) return;
          e.sender.setState({ value });
          emit(p.onChange, e.sender, e.event, { value });
        }, "onEvent")
      }]
    });
  }
  __name(vfRating, "vfRating");

  // layer2/src/components/select-button.js
  var html29 = vfunc_default.html;
  function vsSelectButton(props) {
    const p = props || {};
    const a = fieldIds(p, "select-button");
    const options = normalizeOptions(p.options);
    const buttons = [];
    const hidden = [];
    for (let i = 0; i < options.length; i++) {
      const o = options[i];
      const on = hasValue(p.value, o.value);
      buttons.push(html29`<button ${attrs({
        type: "button",
        class: "vf-select-button__option",
        "data-action": "select",
        "data-value": o.value,
        "aria-pressed": on,
        disabled: !!p.disabled || o.disabled
      })}>${o.label}</button>`);
      if (on && present(p.name)) hidden.push(html29`<input ${attrs({ type: "hidden", name: p.name, value: o.value })}>`);
    }
    const labelId = a.wrapped && present(p.label) ? a.id + "-label" : null;
    const group = html29`<div ${attrs({
      class: controlClass("vf-select-button", p, a),
      role: "group",
      id: a.id,
      "data-ref": p.ref,
      "data-size": oneOf("vsSelectButton size", p.size, SIZES2),
      "aria-labelledby": labelId,
      "aria-label": labelId ? null : p.ariaLabel,
      "aria-describedby": a.describedBy
    })}>${buttons}${hidden}</div>`;
    if (!a.wrapped) return group;
    const label = labelId ? html29`<span ${attrs({ class: "vf-field__label", id: labelId })}>${p.label}</span>` : "";
    return html29`<div ${attrs({ class: cls("vf-field", p.className), "data-state": a.invalid ? "invalid" : null })}>${label}${group}${fieldTexts(p, a)}</div>`;
  }
  __name(vsSelectButton, "vsSelectButton");
  function vfSelectButton(props) {
    const p = props || {};
    const initial = p.multiple ? Object.prototype.toString.call(p.value) === "[object Array]" ? p.value.slice() : p.value == null ? [] : [p.value] : p.value;
    return instance({
      state: stateOf(p, "select-button", { value: initial }),
      render: /* @__PURE__ */ __name(function(s) {
        return vsSelectButton(s);
      }, "render"),
      delegates: [{
        selector: '[data-action="select"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const s = e.sender.state;
          if (s.disabled) return;
          const picked = e.target.getAttribute("data-value");
          let next;
          if (s.multiple) {
            next = [];
            let found = false;
            for (let i = 0; i < s.value.length; i++) {
              if (String(s.value[i]) === picked) found = true;
              else next.push(s.value[i]);
            }
            if (!found) next.push(picked);
          } else {
            if (hasValue(s.value, picked)) return;
            next = picked;
          }
          e.sender.setState({ value: next });
          emit(p.onChange, e.sender, e.event, { value: next });
        }, "onEvent")
      }]
    });
  }
  __name(vfSelectButton, "vfSelectButton");

  // layer2/src/components/masked-input.js
  var html30 = vfunc_default.html;
  var TOKENS = { "0": /[0-9]/, a: /[A-Za-z]/, "*": /[A-Za-z0-9]/ };
  function applyMask(value, mask) {
    const chars = String(value == null ? "" : value);
    let out = "";
    let j = 0;
    for (let i = 0; i < mask.length && j < chars.length; i++) {
      const m = mask.charAt(i);
      const token = Object.prototype.hasOwnProperty.call(TOKENS, m) ? TOKENS[m] : null;
      if (token) {
        while (j < chars.length && !token.test(chars.charAt(j))) j++;
        if (j >= chars.length) break;
        out += chars.charAt(j++);
      } else {
        out += m;
        if (chars.charAt(j) === m) j++;
      }
    }
    return out;
  }
  __name(applyMask, "applyMask");
  function unmask(value, mask) {
    const text = applyMask(value, mask);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      if (Object.prototype.hasOwnProperty.call(TOKENS, mask.charAt(i))) out += text.charAt(i);
    }
    return out;
  }
  __name(unmask, "unmask");
  function vsMaskedInput(props) {
    const p = props || {};
    const a = fieldIds(p, "masked");
    const mask = String(p.mask || "");
    const base = controlAttrs("vf-input", p, a, "vsMaskedInput");
    base.type = "text";
    base.value = applyMask(p.value, mask);
    base.placeholder = p.placeholder;
    base.autocomplete = p.autocomplete;
    base.maxlength = mask.length || null;
    base.inputmode = /^[^a*]*$/.test(mask) ? "numeric" : null;
    base["data-mask"] = mask;
    return field(p, a, html30`<input ${attrs(base)}>`);
  }
  __name(vsMaskedInput, "vsMaskedInput");
  function vfMaskedInput(props) {
    const p = props || {};
    const mask = String(p.mask || "");
    function tokensBefore(text, end) {
      let n = 0;
      for (let i = 0; i < end && i < text.length; i++) if (Object.prototype.hasOwnProperty.call(TOKENS, mask.charAt(i))) n++;
      return n;
    }
    __name(tokensBefore, "tokensBefore");
    function caretAfter(text, count) {
      if (count === 0) return 0;
      let n = 0;
      for (let i = 0; i < text.length; i++) {
        if (Object.prototype.hasOwnProperty.call(TOKENS, mask.charAt(i))) n++;
        if (n === count) return i + 1;
      }
      return text.length;
    }
    __name(caretAfter, "caretAfter");
    const state = stateOf(p, "masked", { value: applyMask(p.value, mask), mask });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsMaskedInput(s);
      }, "render"),
      delegates: [
        {
          selector: idSelector(state.id),
          eventType: "input",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const input = e.target;
            const typed = input.value;
            let caret = null;
            try {
              caret = input.selectionStart;
            } catch (err) {
            }
            let count = 0;
            if (caret != null) {
              const head = applyMask(typed.slice(0, caret), mask);
              count = tokensBefore(head, head.length);
            }
            const formatted = applyMask(typed, mask);
            if (formatted !== typed) {
              input.value = formatted;
              if (caret != null) {
                const at = caretAfter(formatted, count);
                try {
                  input.setSelectionRange(at, at);
                } catch (err) {
                }
              }
            }
            if (formatted === e.sender.state.value) return;
            e.sender.state.value = formatted;
            emit(p.onInput, e.sender, e.event, { value: formatted, raw: unmask(formatted, mask) });
          }, "onEvent")
        },
        {
          selector: idSelector(state.id),
          eventType: "change",
          onEvent: /* @__PURE__ */ __name(function(e) {
            emit(p.onChange, e.sender, e.event, { value: e.sender.state.value, raw: unmask(e.sender.state.value, mask) });
          }, "onEvent")
        }
      ],
      methods: {
        getRawValue: /* @__PURE__ */ __name(function() {
          return unmask(this.state.value, mask);
        }, "getRawValue"),
        setValue: /* @__PURE__ */ __name(function(value) {
          this.setState({ value: applyMask(value, mask) });
        }, "setValue")
      }
    });
  }
  __name(vfMaskedInput, "vfMaskedInput");

  // layer2/src/_internal/dates.js
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  __name(pad, "pad");
  function isoDate(value) {
    if (value == null || value === "") return "";
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? "" : value.getFullYear() + "-" + pad(value.getMonth() + 1) + "-" + pad(value.getDate());
    }
    const m = /^\s*(\d{4})[-./ ](\d{1,2})[-./ ](\d{1,2})\.?\s*$/.exec(String(value));
    if (!m) return "";
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const date = new Date(y, mo - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return "";
    return m[1] + "-" + pad(mo) + "-" + pad(d);
  }
  __name(isoDate, "isoDate");
  function dateOf(value) {
    const iso = isoDate(value);
    if (!iso) return null;
    return new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  }
  __name(dateOf, "dateOf");
  function isoTime(value) {
    if (value == null || value === "") return "";
    if (value instanceof Date) return isNaN(value.getTime()) ? "" : pad(value.getHours()) + ":" + pad(value.getMinutes());
    const m = /^\s*(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?\s*$/.exec(String(value));
    if (!m) return "";
    const h = Number(m[1]);
    const mi = Number(m[2]);
    const s = m[3] == null ? null : Number(m[3]);
    if (h > 23 || mi > 59 || s != null && s > 59) return "";
    return pad(h) + ":" + pad(mi) + (s == null ? "" : ":" + pad(s));
  }
  __name(isoTime, "isoTime");

  // layer2/src/components/date-picker.js
  function vsDatePicker(props) {
    const p = props || {};
    return vsInput(extend({}, p, {
      type: "date",
      value: isoDate(p.value),
      min: isoDate(p.min),
      max: isoDate(p.max),
      placeholder: msg("datePicker.placeholder", p.placeholder)
    }));
  }
  __name(vsDatePicker, "vsDatePicker");
  function vfDatePicker(props) {
    const p = props || {};
    const state = stateOf(p, "date", { value: isoDate(p.value) });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsDatePicker(s);
      }, "render"),
      delegates: [{
        selector: idSelector(state.id),
        eventType: "change",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const input = e.target;
          const value = isoDate(input.value);
          if (!value && input.value !== "") {
            input.setAttribute("aria-invalid", "true");
            return;
          }
          if (!e.sender.state.error) input.removeAttribute("aria-invalid");
          if (input.value !== value) input.value = value;
          if (value === e.sender.state.value) return;
          e.sender.state.value = value;
          emit(p.onChange, e.sender, e.event, { value, date: dateOf(value) });
        }, "onEvent")
      }],
      methods: {
        getDate: /* @__PURE__ */ __name(function() {
          return dateOf(this.state.value);
        }, "getDate"),
        setValue: /* @__PURE__ */ __name(function(value) {
          this.setState({ value: isoDate(value) });
        }, "setValue")
      }
    });
  }
  __name(vfDatePicker, "vfDatePicker");

  // layer2/src/components/time-picker.js
  function vsTimePicker(props) {
    const p = props || {};
    return vsInput(extend({}, p, {
      type: "time",
      value: isoTime(p.value),
      min: isoTime(p.min),
      max: isoTime(p.max),
      placeholder: msg("timePicker.placeholder", p.placeholder)
    }));
  }
  __name(vsTimePicker, "vsTimePicker");
  function vfTimePicker(props) {
    const p = props || {};
    const state = stateOf(p, "time", { value: isoTime(p.value) });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsTimePicker(s);
      }, "render"),
      delegates: [{
        selector: idSelector(state.id),
        eventType: "change",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const input = e.target;
          const value = isoTime(input.value);
          if (!value && input.value !== "") {
            input.setAttribute("aria-invalid", "true");
            return;
          }
          if (!e.sender.state.error) input.removeAttribute("aria-invalid");
          if (input.value !== value) input.value = value;
          if (value === e.sender.state.value) return;
          e.sender.state.value = value;
          emit(p.onChange, e.sender, e.event, { value });
        }, "onEvent")
      }],
      methods: {
        setValue: /* @__PURE__ */ __name(function(value) {
          this.setState({ value: isoTime(value) });
        }, "setValue")
      }
    });
  }
  __name(vfTimePicker, "vfTimePicker");

  // layer2/src/components/date-range-picker.js
  var html31 = vfunc_default.html;
  function render(s) {
    const a = fieldIds(s, "date-range", true);
    const names = s.names || [];
    const shared = {
      type: "date",
      class: "vf-input",
      placeholder: msg("datePicker.placeholder"),
      "aria-describedby": a.describedBy,
      "aria-invalid": a.invalid || null,
      disabled: !!s.disabled,
      readonly: !!s.readonly,
      required: !!s.required
    };
    function input(which, extra) {
      const map = {};
      for (const key in shared) if (Object.prototype.hasOwnProperty.call(shared, key)) map[key] = shared[key];
      for (const key in extra) if (Object.prototype.hasOwnProperty.call(extra, key)) map[key] = extra[key];
      map.id = a.id + "-" + which;
      map["data-action"] = which;
      return html31`<div class="vf-date-range__part"><label ${attrs({ class: "vf-date-range__label", for: map.id })}>${which === "start" ? msg("dateRangePicker.start", s.startLabel) : msg("dateRangePicker.end", s.endLabel)}</label><input ${attrs(map)}></div>`;
    }
    __name(input, "input");
    const start = input("start", { name: names[0], value: s.start, min: s.min, max: s.max });
    const end = input("end", { name: names[1], value: s.end, min: s.start || s.min, max: s.max });
    return fieldset(
      "vf-field vf-date-range",
      s,
      a,
      s.label,
      html31`<div class="vf-date-range__inputs">${start}<span class="vf-date-range__separator" aria-hidden="true">&ndash;</span>${end}</div>`,
      { "aria-describedby": null }
    );
  }
  __name(render, "render");
  function vfDateRangePicker(props) {
    const p = props || {};
    function commit(sender, event, start, end) {
      if (end && start && end < start) end = start;
      if (start === sender.state.start && end === sender.state.end) return;
      sender.setState({ start, end });
      emit(p.onChange, sender, event, { start, end, startDate: dateOf(start), endDate: dateOf(end) });
    }
    __name(commit, "commit");
    function changed(which) {
      return function(e) {
        const input = e.target;
        const value = isoDate(input.value);
        if (!value && input.value !== "") {
          input.setAttribute("aria-invalid", "true");
          return;
        }
        const s = e.sender.state;
        commit(e.sender, e.event, which === "start" ? value : s.start, which === "end" ? value : s.end);
      };
    }
    __name(changed, "changed");
    return instance({
      state: stateOf(p, "date-range", {
        start: isoDate(p.start),
        end: isoDate(p.end),
        min: isoDate(p.min),
        max: isoDate(p.max)
      }),
      render,
      delegates: [
        { selector: '[data-action="start"]', eventType: "change", onEvent: changed("start") },
        { selector: '[data-action="end"]', eventType: "change", onEvent: changed("end") }
      ],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return { start: this.state.start, end: this.state.end };
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(value) {
          const v = value || {};
          let start = isoDate(v.start);
          let end = isoDate(v.end);
          if (end && start && end < start) end = start;
          this.setState({ start, end });
        }, "setValue")
      }
    });
  }
  __name(vfDateRangePicker, "vfDateRangePicker");

  // layer2/src/components/list-view.js
  var html32 = vfunc_default.html;
  var SELECTABLE = ["none", "single", "multiple"];
  function keyOf(item, index, itemKey) {
    if (item != null && typeof item === "object" && item[itemKey] != null) return String(item[itemKey]);
    return String(index);
  }
  __name(keyOf, "keyOf");
  function defaultItem(item) {
    if (item == null || typeof item !== "object" || item instanceof vfunc_default.SafeHtml) return item;
    return html32`<span class="vf-list-view__title">${item.title != null ? item.title : item.label}</span>${present(item.description) ? html32`<span class="vf-list-view__description">${item.description}</span>` : ""}${present(item.meta) ? html32`<span class="vf-list-view__meta">${item.meta}</span>` : ""}`;
  }
  __name(defaultItem, "defaultItem");
  function vsListView(props) {
    const p = props || {};
    const items = p.items || [];
    if (!items.length) {
      return html32`<div ${attrs({ class: cls("vf-list-view", p.className), id: p.id, "data-ref": p.ref, "data-state": "empty" })}>${vsEmptyState({ title: p.emptyText })}</div>`;
    }
    const mode = oneOf("vsListView selectable", p.selectable, SELECTABLE);
    const itemKey = p.itemKey || "id";
    const render7 = typeof p.render === "function" ? p.render : defaultItem;
    const base = present(p.id) ? String(p.id) : uid("list");
    let focusIndex = 0;
    if (mode !== "none") {
      for (let i = 0; i < items.length; i++) {
        if (hasValue(p.selected, keyOf(items[i], i, itemKey))) {
          focusIndex = i;
          break;
        }
      }
    }
    const rows = [];
    for (let i = 0; i < items.length; i++) {
      const key = keyOf(items[i], i, itemKey);
      rows.push(mode === "none" ? html32`<li class="vf-list-view__item">${render7(items[i], i)}</li>` : html32`<li ${attrs({
        class: "vf-list-view__item",
        role: "option",
        id: base + "-option-" + i,
        "aria-selected": hasValue(p.selected, key),
        tabindex: i === focusIndex ? 0 : -1,
        "data-action": "select",
        "data-value": key,
        "data-index": i
      })}>${render7(items[i], i)}</li>`);
    }
    return html32`<ul ${attrs({
      class: cls("vf-list-view", p.className),
      id: base,
      "data-ref": p.ref,
      role: mode === "none" ? null : "listbox",
      "aria-multiselectable": mode === "multiple" ? true : null,
      "aria-label": p.label
    })}>${rows}</ul>`;
  }
  __name(vsListView, "vsListView");
  function vfListView(props) {
    const p = props || {};
    const itemKey = p.itemKey || "id";
    function selectedItems(s) {
      const out = [];
      for (let i = 0; i < s.items.length; i++) if (hasValue(s.selected, keyOf(s.items[i], i, itemKey))) out.push(s.items[i]);
      return out;
    }
    __name(selectedItems, "selectedItems");
    function choose(sender, event, key) {
      const s = sender.state;
      let next;
      if (s.selectable === "multiple") {
        next = [];
        let found = false;
        const list2 = s.selected || [];
        for (let i = 0; i < list2.length; i++) {
          if (String(list2[i]) === key) found = true;
          else next.push(list2[i]);
        }
        if (!found) next.push(key);
      } else {
        if (hasValue(s.selected, key)) return;
        next = key;
      }
      s.selected = next;
      sender.refresh();
      const option = sender.$node.querySelector('[data-value="' + key.replace(/["\\]/g, "\\$&") + '"]');
      if (option) option.focus();
      emit(p.onSelect, sender, event, { value: s.selectable === "multiple" ? next.slice() : next, items: selectedItems(s) });
    }
    __name(choose, "choose");
    const state = stateOf(p, "list", {
      items: (p.items || []).slice(),
      selected: p.selectable === "multiple" ? Object.prototype.toString.call(p.selected) === "[object Array]" ? p.selected.slice() : [] : p.selected == null ? null : String(p.selected)
    });
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsListView(extend({}, s, { render: p.render }));
      }, "render"),
      delegates: [
        { selector: '[data-action="select"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          choose(e.sender, e.event, e.target.getAttribute("data-value"));
        }, "onEvent") },
        {
          selector: '[data-action="select"]',
          eventType: "keydown",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const key = e.event.key;
            if (key === " " || key === "Spacebar" || key === "Enter") {
              e.event.preventDefault();
              choose(e.sender, e.event, e.target.getAttribute("data-value"));
              return;
            }
            const options = e.sender.$node.querySelectorAll('[data-action="select"]');
            const from = Number(e.target.getAttribute("data-index"));
            let to = null;
            if (key === "ArrowDown" || key === "Down") to = Math.min(options.length - 1, from + 1);
            else if (key === "ArrowUp" || key === "Up") to = Math.max(0, from - 1);
            else if (key === "Home") to = 0;
            else if (key === "End") to = options.length - 1;
            if (to == null) return;
            e.event.preventDefault();
            e.target.setAttribute("tabindex", "-1");
            options[to].setAttribute("tabindex", "0");
            options[to].focus();
          }, "onEvent")
        }
      ],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.selected;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(selected) {
          this.setState({ selected });
        }, "setValue"),
        setItems: /* @__PURE__ */ __name(function(items) {
          this.setState({ items: (items || []).slice() });
        }, "setItems")
      }
    });
  }
  __name(vfListView, "vfListView");

  // layer2/src/_internal/slots.js
  function isInstance(value) {
    return !!(value && value.isvfunc);
  }
  __name(isInstance, "isInstance");
  function markupOnly(items, key) {
    return slotChilds(items, key, function() {
      return "";
    }).items;
  }
  __name(markupOnly, "markupOnly");
  function slotChilds(items, key, idOf) {
    const out = [];
    const childs = [];
    for (let i = 0; i < (items || []).length; i++) {
      const item = items[i];
      if (!item || !isInstance(item[key])) {
        out.push(item);
        continue;
      }
      const copy = {};
      for (const k in item) if (Object.prototype.hasOwnProperty.call(item, k)) copy[k] = item[k];
      copy[key] = "";
      out.push(copy);
      childs.push({ targetId: idOf(i), component: item[key] });
    }
    return { items: out, childs };
  }
  __name(slotChilds, "slotChilds");

  // layer2/src/components/carousel.js
  var html33 = vfunc_default.html;
  function render2(s) {
    const items = markupOnly(s.items || [], "content");
    const total = items.length;
    const slides = [];
    const dots = [];
    for (let i = 0; i < total; i++) {
      const item = items[i] || {};
      const content = present(item.src) ? html33`<img alt="${item.alt == null ? "" : item.alt}" ${attrs({ class: "vf-carousel__image", src: item.src })}>` : item.content;
      slides.push(html33`<div ${attrs({
        class: "vf-carousel__slide",
        id: s.id + "-slide-" + i,
        role: "group",
        "aria-roledescription": msg("carousel.slide"),
        "aria-label": msg("carousel.position", null, { index: i + 1, total }),
        hidden: i !== s.index
      })}>${content}</div>`);
      if (s.showDots !== false) {
        dots.push(html33`<button ${attrs({
          type: "button",
          class: "vf-carousel__dot",
          "data-action": "go",
          "data-index": i,
          "aria-label": msg("carousel.goTo", null, { index: i + 1 }),
          "aria-current": i === s.index ? true : null
        })}></button>`);
      }
    }
    const autoplay = s.autoplay > 0 ? html33`<button ${attrs({ type: "button", class: "vf-carousel__rotation", "data-action": "rotation" })}>${s.playing ? msg("carousel.pause") : msg("carousel.play")}</button>` : "";
    const loop = s.loop !== false;
    return html33`<section ${attrs({
      class: cls("vf-carousel", s.className),
      id: s.id,
      "data-ref": s.ref,
      "aria-roledescription": msg("carousel.carousel"),
      "aria-label": s.label
    })}><div class="vf-carousel__controls">${autoplay}<button ${attrs({
      type: "button",
      class: "vf-carousel__prev",
      "data-action": "prev",
      "aria-controls": s.id + "-slides",
      "aria-label": msg("carousel.prev"),
      disabled: total < 2 || !loop && s.index === 0
    })}><span aria-hidden="true">&lsaquo;</span></button><button ${attrs({
      type: "button",
      class: "vf-carousel__next",
      "data-action": "next",
      "aria-controls": s.id + "-slides",
      "aria-label": msg("carousel.next"),
      disabled: total < 2 || !loop && s.index === total - 1
    })}><span aria-hidden="true">&rsaquo;</span></button></div><div ${attrs({
      class: "vf-carousel__slides",
      id: s.id + "-slides",
      "aria-live": s.playing ? "off" : "polite"
    })}>${slides}</div>${dots.length > 1 ? html33`<div class="vf-carousel__dots">${dots}</div>` : ""}</section>`;
  }
  __name(render2, "render");
  function reducedMotion() {
    try {
      return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (err) {
      return false;
    }
  }
  __name(reducedMotion, "reducedMotion");
  function vfCarousel(props) {
    const p = props || {};
    let timer = null;
    let held = false;
    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
    }
    __name(stop, "stop");
    function schedule(sender) {
      stop();
      if (!sender.state.playing || held || sender.state.autoplay <= 0) return;
      timer = setTimeout(function() {
        timer = null;
        go(sender, null, sender.state.index + 1, true);
        schedule(sender);
      }, sender.state.autoplay);
    }
    __name(schedule, "schedule");
    function go(sender, event, index, wrap) {
      const s = sender.state;
      const total = (s.items || []).length;
      if (!total) return;
      let next = Math.floor(Number(index) || 0);
      if (s.loop !== false || wrap) next = (next % total + total) % total;
      else next = Math.max(0, Math.min(total - 1, next));
      if (next === s.index) return;
      sender.setState({ index: next });
      if (event) emit(p.onChange, sender, event, { index: next });
    }
    __name(go, "go");
    function setPlaying(sender, playing) {
      sender.setState({ playing });
      if (playing) schedule(sender);
      else stop();
    }
    __name(setPlaying, "setPlaying");
    const count = (p.items || []).length;
    const state = stateOf(p, "carousel", {
      index: count ? Math.max(0, Math.min(count - 1, Math.floor(Number(p.index) || 0))) : 0,
      autoplay: Math.max(0, Number(p.autoplay) || 0),
      playing: false
    });
    const slots = slotChilds(state.items, "content", function(i) {
      return state.id + "-slide-" + i;
    });
    state.items = slots.items;
    return instance({
      state,
      childs: slots.childs,
      render: render2,
      delegates: [
        { selector: '[data-action="prev"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          go(e.sender, e.event, e.sender.state.index - 1);
        }, "onEvent") },
        { selector: '[data-action="next"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          go(e.sender, e.event, e.sender.state.index + 1);
        }, "onEvent") },
        { selector: '[data-action="go"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          go(e.sender, e.event, e.target.getAttribute("data-index"));
        }, "onEvent") },
        { selector: '[data-action="rotation"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          setPlaying(e.sender, !e.sender.state.playing);
        }, "onEvent") },
        // Hold the rotation while the pointer or the focus is inside (focusin / focusout bubble).
        { selector: idSelector(state.id), eventType: "focusin", onEvent: /* @__PURE__ */ __name(function(e) {
          held = true;
          stop();
        }, "onEvent") },
        {
          selector: idSelector(state.id),
          eventType: "focusout",
          onEvent: /* @__PURE__ */ __name(function(e) {
            if (e.event.relatedTarget && e.sender.$node.contains(e.event.relatedTarget)) return;
            held = false;
            schedule(e.sender);
          }, "onEvent")
        }
      ],
      events: [
        { eventType: "mouseenter", onEvent: /* @__PURE__ */ __name(function() {
          held = true;
          stop();
        }, "onEvent") },
        { eventType: "mouseleave", onEvent: /* @__PURE__ */ __name(function(e) {
          held = false;
          schedule(e.sender);
        }, "onEvent") }
      ],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.index;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(index) {
          go(this, null, index);
        }, "setValue"),
        goTo: /* @__PURE__ */ __name(function(index) {
          go(this, null, index);
        }, "goTo"),
        next: /* @__PURE__ */ __name(function() {
          go(this, null, this.state.index + 1);
        }, "next"),
        prev: /* @__PURE__ */ __name(function() {
          go(this, null, this.state.index - 1);
        }, "prev"),
        play: /* @__PURE__ */ __name(function() {
          setPlaying(this, true);
        }, "play"),
        pause: /* @__PURE__ */ __name(function() {
          setPlaying(this, false);
        }, "pause")
      },
      onMount: /* @__PURE__ */ __name(function(self2) {
        if (self2.state.autoplay > 0 && !reducedMotion()) setPlaying(self2, true);
      }, "onMount"),
      onDestroy: stop
    });
  }
  __name(vfCarousel, "vfCarousel");

  // layer2/src/components/breadcrumb.js
  var html34 = vfunc_default.html;
  function vsBreadcrumb(props) {
    const p = props || {};
    const list2 = p.items || [];
    const items = [];
    for (let i = 0; i < list2.length; i++) {
      const item = list2[i] || {};
      const last = i === list2.length - 1;
      const inner = last || !present(item.href) ? html34`<span ${attrs({ class: "vf-breadcrumb__current", "aria-current": last ? "page" : null })}>${item.label}</span>` : html34`<a ${attrs({ class: "vf-breadcrumb__link", href: item.href })}>${item.label}</a>`;
      items.push(html34`<li class="vf-breadcrumb__item">${inner}</li>`);
    }
    return html34`<nav ${attrs({ class: cls("vf-breadcrumb", p.className), id: p.id, "data-ref": p.ref, "aria-label": msg("breadcrumb.label", p.label) })}><ol class="vf-breadcrumb__list">${items}</ol></nav>`;
  }
  __name(vsBreadcrumb, "vsBreadcrumb");

  // layer2/src/components/pagination.js
  var html35 = vfunc_default.html;
  function pageCount(total, pageSize) {
    const size = Math.max(1, Math.floor(Number(pageSize) || 10));
    return Math.max(1, Math.ceil((Number(total) || 0) / size));
  }
  __name(pageCount, "pageCount");
  function pageList(page, pages, siblings) {
    const out = [];
    const from = Math.max(2, page - siblings);
    const to = Math.min(pages - 1, page + siblings);
    out.push(1);
    if (from > 2) out.push(from === 3 ? 2 : 0);
    for (let n = from; n <= to; n++) out.push(n);
    if (to < pages - 1) out.push(to === pages - 2 ? pages - 1 : 0);
    if (pages > 1) out.push(pages);
    return out;
  }
  __name(pageList, "pageList");
  function clampPage(page, pages) {
    return Math.max(1, Math.min(pages, Math.floor(Number(page) || 1)));
  }
  __name(clampPage, "clampPage");
  function vsPagination(props) {
    const p = props || {};
    const pages = pageCount(p.total, p.pageSize);
    const page = clampPage(p.page, pages);
    const siblings = p.siblings == null ? 1 : Math.max(0, Math.floor(Number(p.siblings) || 0));
    function button(target, text, label, current) {
      return html35`<li><button ${attrs({
        type: "button",
        class: "vf-pagination__button",
        "data-action": "page",
        "data-page": target,
        "aria-label": label,
        "aria-current": current ? "page" : null,
        disabled: target < 1 || target > pages
      })}>${text}</button></li>`;
    }
    __name(button, "button");
    const items = [button(page - 1, html35`<span aria-hidden="true">&lsaquo;</span>`, msg("pagination.previous"))];
    const list2 = pageList(page, pages, siblings);
    for (let i = 0; i < list2.length; i++) {
      const n = list2[i];
      items.push(n === 0 ? html35`<li><span class="vf-pagination__gap" aria-hidden="true">&hellip;</span></li>` : button(n, n, msg("pagination.page", null, { page: n }), n === page));
    }
    items.push(button(page + 1, html35`<span aria-hidden="true">&rsaquo;</span>`, msg("pagination.next")));
    return html35`<nav ${attrs({ class: cls("vf-pagination", p.className), id: p.id, "data-ref": p.ref, "aria-label": msg("pagination.label", p.label) })}><ul class="vf-pagination__list">${items}</ul></nav>`;
  }
  __name(vsPagination, "vsPagination");
  function vfPagination(props) {
    const p = props || {};
    return instance({
      state: stateOf(p, "pagination", { page: clampPage(p.page, pageCount(p.total, p.pageSize)) }),
      render: /* @__PURE__ */ __name(function(s) {
        return vsPagination(s);
      }, "render"),
      delegates: [{
        selector: '[data-action="page"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const s = e.sender.state;
          const page = clampPage(e.target.getAttribute("data-page"), pageCount(s.total, s.pageSize));
          if (page === s.page) return;
          e.sender.setState({ page });
          emit(p.onChange, e.sender, e.event, { page });
        }, "onEvent")
      }],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.page;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(page) {
          this.setState({ page: clampPage(page, pageCount(this.state.total, this.state.pageSize)) });
        }, "setValue"),
        setTotal: /* @__PURE__ */ __name(function(total) {
          const s = this.state;
          this.setState({ total, page: clampPage(s.page, pageCount(total, s.pageSize)) });
        }, "setTotal")
      }
    });
  }
  __name(vfPagination, "vfPagination");

  // layer2/src/components/tabs.js
  var html36 = vfunc_default.html;
  function activeIndex(tabs, active) {
    let first = -1;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].disabled) continue;
      if (first < 0) first = i;
      if (present(active) && String(tabs[i].id) === String(active)) return i;
    }
    return first;
  }
  __name(activeIndex, "activeIndex");
  function vsTabs(props) {
    const p = props || {};
    const base = present(p.id) ? String(p.id) : uid("tabs");
    const tabs = p.tabs || [];
    const current = activeIndex(tabs, p.active);
    const buttons = [];
    const panels = [];
    for (let i = 0; i < tabs.length; i++) {
      const t2 = tabs[i];
      const on = i === current;
      buttons.push(html36`<button ${attrs({
        type: "button",
        role: "tab",
        class: "vf-tabs__tab",
        id: base + "-tab-" + i,
        "aria-controls": base + "-panel-" + i,
        "aria-selected": on,
        tabindex: on ? 0 : -1,
        "data-action": "tab",
        "data-value": t2.id,
        "data-index": i,
        disabled: !!t2.disabled
      })}>${t2.label}</button>`);
      panels.push(html36`<div ${attrs({
        role: "tabpanel",
        class: "vf-tabs__panel",
        id: base + "-panel-" + i,
        "aria-labelledby": base + "-tab-" + i,
        tabindex: 0,
        hidden: !on
      })}>${t2.content}</div>`);
    }
    return html36`<div ${attrs({ class: cls("vf-tabs", p.className), id: base, "data-ref": p.ref })}><div ${attrs({ class: "vf-tabs__list", role: "tablist", "aria-label": p.label })}>${buttons}</div>${panels}</div>`;
  }
  __name(vsTabs, "vsTabs");
  function vfTabs(props) {
    const p = props || {};
    function select(sender, event, index, focus) {
      const tabs = sender.state.tabs || [];
      const tab = tabs[index];
      if (!tab || tab.disabled) return;
      const changed = String(tab.id) !== String(sender.state.active);
      sender.state.active = tab.id;
      sender.refresh();
      if (focus) {
        const button = sender.ids[sender.state.id + "-tab-" + index];
        if (button) button.focus();
      }
      if (changed && event) emit(p.onChange, sender, event, { id: tab.id, index });
    }
    __name(select, "select");
    function move(sender, from, step) {
      const tabs = sender.state.tabs || [];
      for (let n = 1; n <= tabs.length; n++) {
        const i = (from + step * n + tabs.length * n) % tabs.length;
        if (!tabs[i].disabled) return i;
      }
      return from;
    }
    __name(move, "move");
    const state = stateOf(p, "tabs");
    const slots = slotChilds(state.tabs, "content", function(i) {
      return state.id + "-panel-" + i;
    });
    state.tabs = slots.items;
    const first = (state.tabs || [])[activeIndex(state.tabs || [], p.active)];
    state.active = first ? first.id : null;
    return instance({
      state,
      childs: slots.childs,
      render: /* @__PURE__ */ __name(function(s) {
        return vsTabs(extend({}, s, { tabs: markupOnly(s.tabs, "content") }));
      }, "render"),
      delegates: [
        {
          selector: '[data-action="tab"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            select(e.sender, e.event, Number(e.target.getAttribute("data-index")), true);
          }, "onEvent")
        },
        {
          selector: '[data-action="tab"]',
          eventType: "keydown",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const s = e.sender.state;
            const tabs = s.tabs || [];
            const from = Number(e.target.getAttribute("data-index"));
            const rtl = typeof window !== "undefined" && window.getComputedStyle && window.getComputedStyle(e.sender.$node).direction === "rtl";
            const key = e.event.key;
            let to = null;
            if (key === "ArrowRight" || key === "Right") to = move(e.sender, from, rtl ? -1 : 1);
            else if (key === "ArrowLeft" || key === "Left") to = move(e.sender, from, rtl ? 1 : -1);
            else if (key === "Home") to = move(e.sender, -1, 1);
            else if (key === "End") to = move(e.sender, tabs.length, -1);
            if (to == null) return;
            e.event.preventDefault();
            select(e.sender, e.event, to, true);
          }, "onEvent")
        }
      ],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.active;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(id) {
          this.select(id);
        }, "setValue"),
        select: /* @__PURE__ */ __name(function(id) {
          const tabs = this.state.tabs || [];
          for (let i = 0; i < tabs.length; i++) {
            if (String(tabs[i].id) === String(id)) return select(this, null, i, false);
          }
        }, "select")
      }
    });
  }
  __name(vfTabs, "vfTabs");

  // layer2/src/components/accordion.js
  var html37 = vfunc_default.html;
  function vsAccordion(props) {
    const p = props || {};
    const base = present(p.id) ? String(p.id) : uid("accordion");
    const h = heading(p.headingLevel);
    const list2 = p.items || [];
    const items = [];
    for (let i = 0; i < list2.length; i++) {
      const item = list2[i];
      const open = !!item.open || hasValue(p.open, String(item.id));
      items.push(html37`<div ${attrs({ class: "vf-accordion__item", "data-state": open ? "open" : "closed" })}><${h} class="vf-accordion__heading"><button ${attrs({
        type: "button",
        class: "vf-accordion__trigger",
        id: base + "-trigger-" + i,
        "aria-expanded": open,
        "aria-controls": base + "-panel-" + i,
        "data-action": "toggle",
        "data-value": item.id,
        disabled: !!item.disabled
      })}>${item.title}</button></${h}><div ${attrs({
        class: "vf-accordion__panel",
        id: base + "-panel-" + i,
        role: "region",
        "aria-labelledby": base + "-trigger-" + i,
        hidden: !open
      })}>${item.content}</div></div>`);
    }
    return html37`<div ${attrs({ class: cls("vf-accordion", p.className), id: base, "data-ref": p.ref })}>${items}</div>`;
  }
  __name(vsAccordion, "vsAccordion");
  function vfAccordion(props) {
    const p = props || {};
    function openIds(items2, open, seed) {
      const out = [];
      for (let i = 0; i < items2.length; i++) {
        const id = String(items2[i].id);
        if (seed && items2[i].open || hasValue(open, id)) out.push(id);
      }
      return p.multiple ? out : out.slice(0, 1);
    }
    __name(openIds, "openIds");
    function set(sender, event, id, open) {
      const s = sender.state;
      const key = String(id);
      const was = hasValue(s.openIds, key);
      if (was === open) return;
      let next;
      if (open) next = p.multiple ? s.openIds.concat([key]) : [key];
      else {
        next = [];
        for (let i = 0; i < s.openIds.length; i++) if (s.openIds[i] !== key) next.push(s.openIds[i]);
      }
      sender.setState({ openIds: next });
      if (event) emit(p.onToggle, sender, event, { id: key, open, openIds: next.slice() });
    }
    __name(set, "set");
    const items = [];
    const given = p.items || [];
    for (let i = 0; i < given.length; i++) {
      const copy = {};
      for (const k in given[i]) if (Object.prototype.hasOwnProperty.call(given[i], k) && k !== "open") copy[k] = given[i][k];
      items.push(copy);
    }
    const state = stateOf(p, "accordion", { items, openIds: openIds(given, p.open, true) });
    delete state.open;
    const slots = slotChilds(state.items, "content", function(i) {
      return state.id + "-panel-" + i;
    });
    state.items = slots.items;
    return instance({
      state,
      childs: slots.childs,
      render: /* @__PURE__ */ __name(function(s) {
        return vsAccordion(extend({}, s, { open: s.openIds, items: markupOnly(s.items, "content") }));
      }, "render"),
      delegates: [{
        selector: '[data-action="toggle"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const id = e.target.getAttribute("data-value");
          set(e.sender, e.event, id, !hasValue(e.sender.state.openIds, id));
        }, "onEvent")
      }],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.openIds.slice();
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(ids) {
          this.setState({ openIds: openIds(this.state.items, ids) });
        }, "setValue"),
        open: /* @__PURE__ */ __name(function(id) {
          set(this, null, id, true);
        }, "open"),
        close: /* @__PURE__ */ __name(function(id) {
          set(this, null, id, false);
        }, "close"),
        toggle: /* @__PURE__ */ __name(function(id) {
          set(this, null, id, !hasValue(this.state.openIds, String(id)));
        }, "toggle")
      }
    });
  }
  __name(vfAccordion, "vfAccordion");

  // layer2/src/components/stepper.js
  var html38 = vfunc_default.html;
  function clampIndex(index, count) {
    return Math.max(0, Math.min(count - 1, Math.floor(Number(index) || 0)));
  }
  __name(clampIndex, "clampIndex");
  function vsStepper(props) {
    const p = props || {};
    const steps = p.steps || [];
    const active = clampIndex(p.active, steps.length);
    const items = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] != null && typeof steps[i] === "object" && !(steps[i] instanceof vfunc_default.SafeHtml) ? steps[i] : { label: steps[i] };
      const state = i < active ? "complete" : i === active ? "current" : "upcoming";
      const inner = html38`<span class="vf-stepper__marker" aria-hidden="true">${state === "complete" ? html38`&#10003;` : i + 1}</span><span class="vf-stepper__text"><span class="vf-stepper__label">${step.label}</span>${state === "complete" ? html38`<span class="vf-visually-hidden"> ${msg("stepper.complete")}</span>` : ""}${present(step.description) ? html38`<span class="vf-stepper__description">${step.description}</span>` : ""}</span>`;
      items.push(html38`<li ${attrs({ class: "vf-stepper__step", "data-state": state, "aria-current": state === "current" ? "step" : null })}>${p.clickable ? html38`<button ${attrs({ type: "button", class: "vf-stepper__button", "data-action": "step", "data-index": i })}>${inner}</button>` : html38`<span class="vf-stepper__button">${inner}</span>`}</li>`);
    }
    return html38`<ol ${attrs({ class: cls("vf-stepper", p.className), id: p.id, "data-ref": p.ref, "aria-label": p.label })}>${items}</ol>`;
  }
  __name(vsStepper, "vsStepper");
  function vfStepper(props) {
    const p = props || {};
    function go(sender, index) {
      const next = clampIndex(index, (sender.state.steps || []).length);
      if (next !== sender.state.active) sender.setState({ active: next });
      return next;
    }
    __name(go, "go");
    return instance({
      state: stateOf(p, "stepper", { active: clampIndex(p.active, (p.steps || []).length) }),
      render: /* @__PURE__ */ __name(function(s) {
        return vsStepper(s);
      }, "render"),
      delegates: [{
        selector: '[data-action="step"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const before = e.sender.state.active;
          const index = go(e.sender, e.target.getAttribute("data-index"));
          if (index !== before) emit(p.onChange, e.sender, e.event, { index });
        }, "onEvent")
      }],
      methods: {
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.active;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(index) {
          go(this, index);
        }, "setValue"),
        goTo: /* @__PURE__ */ __name(function(index) {
          go(this, index);
        }, "goTo"),
        next: /* @__PURE__ */ __name(function() {
          go(this, this.state.active + 1);
        }, "next"),
        prev: /* @__PURE__ */ __name(function() {
          go(this, this.state.active - 1);
        }, "prev")
      }
    });
  }
  __name(vfStepper, "vfStepper");

  // layer2/src/_internal/overlay.js
  var layers = [];
  var locks = 0;
  var listening = false;
  var FOCUSABLE = 'a[href], button, input, select, textarea, iframe, [tabindex], [contenteditable="true"]';
  function onKeyDown(event) {
    const key = event.key;
    if (key !== "Escape" && key !== "Esc" || !layers.length) return;
    const top = layers[layers.length - 1];
    event.preventDefault();
    top.close("escape", event);
  }
  __name(onKeyDown, "onKeyDown");
  function pushLayer(layer) {
    layers.push(layer);
    if (!listening && typeof document !== "undefined") {
      document.addEventListener("keydown", onKeyDown);
      listening = true;
    }
  }
  __name(pushLayer, "pushLayer");
  function removeLayer(layer) {
    const i = layers.indexOf(layer);
    if (i >= 0) layers.splice(i, 1);
    if (!layers.length && listening) {
      document.removeEventListener("keydown", onKeyDown);
      listening = false;
    }
  }
  __name(removeLayer, "removeLayer");
  function lockScroll() {
    locks += 1;
    if (locks === 1) document.documentElement.setAttribute("data-vf-scroll-lock", "true");
  }
  __name(lockScroll, "lockScroll");
  function unlockScroll() {
    if (locks === 0) return;
    locks -= 1;
    if (locks === 0) document.documentElement.removeAttribute("data-vf-scroll-lock");
  }
  __name(unlockScroll, "unlockScroll");
  function focusables(root2) {
    const out = [];
    const list2 = root2.querySelectorAll(FOCUSABLE);
    for (let i = 0; i < list2.length; i++) {
      const el2 = list2[i];
      if (el2.disabled || el2.getAttribute("tabindex") === "-1") continue;
      if (el2.tagName === "INPUT" && el2.type === "hidden") continue;
      if (el2.tagName === "A" && !el2.getAttribute("href")) continue;
      let hidden = false;
      for (let node2 = el2; node2 && node2 !== root2.parentNode; node2 = node2.parentNode) {
        if (node2.nodeType === 1 && node2.hasAttribute("hidden")) {
          hidden = true;
          break;
        }
      }
      if (!hidden) out.push(el2);
    }
    return out;
  }
  __name(focusables, "focusables");
  function trapTab(event, root2) {
    if (event.key !== "Tab") return;
    const list2 = focusables(root2);
    if (!list2.length) {
      event.preventDefault();
      root2.focus();
      return;
    }
    const first = list2[0];
    const last = list2[list2.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === root2)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
  __name(trapTab, "trapTab");
  function restoreFocus(el2) {
    if (el2 && typeof el2.focus === "function" && document.documentElement.contains(el2)) el2.focus();
  }
  __name(restoreFocus, "restoreFocus");

  // layer2/src/components/modal.js
  var html39 = vfunc_default.html;
  var SIZES6 = ["md", "sm", "lg"];
  var SIDES = ["end", "start", "bottom"];
  var OWN_ACTIONS = { close: 1, backdrop: 1 };
  function render3(s) {
    const base = s.id;
    const titleId = base + "-title";
    const dismissible = s.dismissible !== false;
    const close = dismissible ? html39`<button ${attrs({ type: "button", class: "vf-modal__close", "data-action": "close", "aria-label": msg("modal.close", s.closeLabel) })}><span aria-hidden="true">&times;</span></button>` : "";
    const title = present(s.title) ? html39`<h2 ${attrs({ class: "vf-modal__title", id: titleId })}>${s.title}</h2>` : "";
    const footer = present(s.footer) ? html39`<div class="vf-modal__footer">${s.footer}</div>` : "";
    return html39`<div ${attrs({
      class: cls(s.kind === "drawer" ? "vf-modal vf-drawer" : "vf-modal", s.className),
      id: base,
      "data-ref": s.ref,
      "data-size": s.size,
      "data-side": s.kind === "drawer" ? s.side : null
    })}><div class="vf-modal__backdrop" data-action="backdrop"></div><div ${attrs({
      class: "vf-modal__dialog",
      id: base + "-dialog",
      role: s.role || "dialog",
      "aria-modal": true,
      "aria-labelledby": present(s.title) ? titleId : null,
      "aria-label": present(s.title) ? null : s.label,
      "aria-describedby": s.describedBy,
      tabindex: -1
    })}>${title || close ? html39`<div class="vf-modal__header">${title}${close}</div>` : ""}<div ${attrs({ class: "vf-modal__body", id: base + "-body" })}>${isInstance(s.content) ? "" : s.content}</div>${footer}</div></div>`;
  }
  __name(render3, "render");
  function createModal(p, kind, extra) {
    const x = extra || {};
    let layer = null;
    let returnTo = null;
    let mounted = false;
    function dialog(sender) {
      return sender.ids[sender.state.id + "-dialog"] || null;
    }
    __name(dialog, "dialog");
    function firstFocus(sender) {
      const d = dialog(sender);
      if (!d) return;
      const wanted = present(sender.state.initialFocus) ? sender.refs[sender.state.initialFocus] : null;
      if (wanted) return wanted.focus();
      const list2 = focusables(d);
      for (let i = 0; i < list2.length; i++) {
        if (list2[i].getAttribute("data-action") !== "close") return list2[i].focus();
      }
      d.focus();
    }
    __name(firstFocus, "firstFocus");
    function open(sender, event) {
      if (layer) return;
      returnTo = document.activeElement;
      if (!mounted) {
        mounted = true;
        sender.mount(document.body);
      } else {
        document.body.appendChild(sender.$node);
      }
      lockScroll();
      layer = {
        close: /* @__PURE__ */ __name(function(reason, ev) {
          if (sender.state.dismissible !== false) close(sender, reason, ev);
        }, "close")
      };
      pushLayer(layer);
      firstFocus(sender);
      emit(p.onOpen, sender, event, {});
    }
    __name(open, "open");
    function release() {
      if (!layer) return false;
      removeLayer(layer);
      unlockScroll();
      layer = null;
      return true;
    }
    __name(release, "release");
    function close(sender, reason, event) {
      if (!release()) return;
      const node2 = sender.$node;
      if (node2.parentNode) node2.parentNode.removeChild(node2);
      restoreFocus(returnTo);
      returnTo = null;
      emit(p.onClose, sender, event, { reason });
      if (x.onClose) x.onClose(reason);
    }
    __name(close, "close");
    const state = stateOf(p, kind, {
      kind,
      size: oneOf((kind === "drawer" ? "vfDrawer" : "vfModal") + " size", p.size, SIZES6),
      side: kind === "drawer" ? oneOf("vfDrawer side", p.side, SIDES) : null,
      role: x.role,
      describedBy: x.describedBy
    });
    return instance({
      state,
      render: render3,
      childs: isInstance(p.content) ? [{ targetId: state.id + "-body", component: p.content }] : void 0,
      delegates: [
        { selector: '[data-action="close"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          close(e.sender, "close", e.event);
        }, "onEvent") },
        {
          selector: '[data-action="backdrop"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            if (e.sender.state.dismissible !== false) close(e.sender, "backdrop", e.event);
          }, "onEvent")
        },
        {
          selector: "[data-action]",
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const action = e.target.getAttribute("data-action");
            if (OWN_ACTIONS[action]) return;
            if (x.onAction) x.onAction(e.sender, action, e.event);
            emit(p.onAction, e.sender, e.event, { action });
          }, "onEvent")
        },
        { selector: idSelector(state.id + "-dialog"), eventType: "keydown", onEvent: /* @__PURE__ */ __name(function(e) {
          trapTab(e.event, dialog(e.sender));
        }, "onEvent") }
      ],
      methods: {
        open: /* @__PURE__ */ __name(function() {
          const self2 = this;
          if (x.open) return x.open(function() {
            open(self2, null);
          });
          open(self2, null);
        }, "open"),
        close: /* @__PURE__ */ __name(function(reason) {
          close(this, reason || "code", null);
        }, "close"),
        isOpen: /* @__PURE__ */ __name(function() {
          return !!layer;
        }, "isOpen")
      },
      onDestroy: /* @__PURE__ */ __name(function() {
        if (release()) restoreFocus(returnTo);
      }, "onDestroy")
    });
  }
  __name(createModal, "createModal");
  function vfModal(props) {
    return createModal(props || {}, "modal");
  }
  __name(vfModal, "vfModal");
  function vfDrawer(props) {
    return createModal(props || {}, "drawer");
  }
  __name(vfDrawer, "vfDrawer");

  // layer2/src/components/confirm.js
  var html40 = vfunc_default.html;
  function vfConfirm(props) {
    const p = props || {};
    const danger = p.variant === "danger";
    const base = present(p.id) ? String(p.id) : uid("confirm");
    const messageId = base + "-message";
    let settle = null;
    let pending = null;
    let answer = false;
    return createModal({
      id: base,
      title: p.title,
      className: p.className,
      size: "sm",
      content: present(p.message) ? html40`<p class="vf-confirm__message" id="${messageId}">${p.message}</p>` : "",
      footer: html40`${vsButton({ label: msg("confirm.cancel", p.cancelLabel), action: "cancel", ref: "cancel" })}${vsButton({
        label: msg("confirm.ok", p.confirmLabel),
        action: "confirm",
        ref: "confirm",
        variant: danger ? "danger" : "primary"
      })}`,
      initialFocus: danger ? "cancel" : "confirm"
    }, "modal", {
      role: "alertdialog",
      describedBy: present(p.message) ? messageId : null,
      open: /* @__PURE__ */ __name(function(doOpen) {
        if (pending) return pending;
        pending = new Promise(function(resolve) {
          settle = resolve;
        });
        doOpen();
        return pending;
      }, "open"),
      onAction: /* @__PURE__ */ __name(function(sender, action) {
        if (action !== "confirm" && action !== "cancel") return;
        answer = action === "confirm";
        sender.close(action);
      }, "onAction"),
      onClose: /* @__PURE__ */ __name(function() {
        const done = settle;
        const result = answer;
        settle = null;
        pending = null;
        answer = false;
        if (done) done(result);
      }, "onClose")
    });
  }
  __name(vfConfirm, "vfConfirm");

  // layer2/src/components/toast.js
  var html41 = vfunc_default.html;
  var POSITIONS = ["bottom-end", "bottom-start", "bottom-center", "top-end", "top-start", "top-center"];
  var VARIANTS4 = ["info", "success", "warning", "danger"];
  function renderItems(s) {
    const out = [];
    for (let i = 0; i < s.items.length; i++) {
      const t2 = s.items[i];
      const action = t2.action && present(t2.action.label) ? html41`<button ${attrs({ type: "button", class: "vf-toast__action", "data-action": "toast-action", "data-value": t2.id })}>${t2.action.label}</button>` : "";
      out.push(html41`<div ${attrs({
        class: "vf-toast",
        id: t2.id,
        "data-variant": t2.variant,
        role: t2.variant === "danger" || t2.variant === "warning" ? "alert" : null
      })}><div class="vf-toast__body">${present(t2.title) ? html41`<p class="vf-toast__title">${t2.title}</p>` : ""}<p class="vf-toast__message">${t2.message}</p></div>${action}<button ${attrs({
        type: "button",
        class: "vf-toast__dismiss",
        "data-action": "dismiss",
        "data-value": t2.id,
        "aria-label": msg("toast.dismiss")
      })}><span aria-hidden="true">&times;</span></button></div>`);
    }
    return html41`${out}`;
  }
  __name(renderItems, "renderItems");
  function vfToast(props) {
    const p = props || {};
    const base = uid("toast");
    const timers = {};
    let held = false;
    let count = 0;
    function stopTimer(id) {
      if (timers[id]) clearTimeout(timers[id]);
      delete timers[id];
    }
    __name(stopTimer, "stopTimer");
    function startTimer(self2, t2) {
      stopTimer(t2.id);
      if (held || !(t2.duration > 0)) return;
      timers[t2.id] = setTimeout(function() {
        self2.dismiss(t2.id);
      }, t2.duration);
    }
    __name(startTimer, "startTimer");
    function hold(self2, on) {
      held = on;
      for (let i = 0; i < self2.state.items.length; i++) {
        if (on) stopTimer(self2.state.items[i].id);
        else startTimer(self2, self2.state.items[i]);
      }
    }
    __name(hold, "hold");
    function find(self2, id) {
      for (let i = 0; i < self2.state.items.length; i++) if (self2.state.items[i].id === id) return self2.state.items[i];
      return null;
    }
    __name(find, "find");
    const toaster = vfunc_default.vfunc({
      tag: "div",
      state: {
        items: [],
        duration: p.duration == null ? 4e3 : Math.max(0, Number(p.duration) || 0),
        max: Math.max(1, Math.floor(Number(p.max) || 3))
      },
      render: renderItems,
      events: [
        { eventType: "mouseenter", onEvent: /* @__PURE__ */ __name(function(e) {
          hold(e.sender, true);
        }, "onEvent") },
        { eventType: "mouseleave", onEvent: /* @__PURE__ */ __name(function(e) {
          hold(e.sender, false);
        }, "onEvent") },
        { eventType: "focusin", onEvent: /* @__PURE__ */ __name(function(e) {
          hold(e.sender, true);
        }, "onEvent") },
        {
          eventType: "focusout",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const next = e.event.relatedTarget;
            if (!next || !e.sender.$node.contains(next)) hold(e.sender, false);
          }, "onEvent")
        }
      ],
      delegates: [
        { selector: '[data-action="dismiss"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          e.sender.dismiss(e.target.getAttribute("data-value"));
        }, "onEvent") },
        {
          selector: '[data-action="toast-action"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const id = e.target.getAttribute("data-value");
            const t2 = find(e.sender, id);
            if (t2 && t2.action) emit(t2.action.onClick, e.sender, e.event, { id });
            e.sender.dismiss(id);
          }, "onEvent")
        }
      ],
      methods: {
        show: /* @__PURE__ */ __name(function(options) {
          const o = options || {};
          count += 1;
          const t2 = {
            id: base + "-" + count,
            title: o.title,
            message: o.message,
            variant: oneOf("vfToast variant", o.variant, VARIANTS4),
            duration: o.duration == null ? this.state.duration : Math.max(0, Number(o.duration) || 0),
            action: o.action ? extend({}, o.action) : null
          };
          const items = this.state.items.concat([t2]);
          while (items.length > this.state.max) stopTimer(items.shift().id);
          this.setState({ items });
          startTimer(this, t2);
          return t2.id;
        }, "show"),
        dismiss: /* @__PURE__ */ __name(function(id) {
          stopTimer(id);
          const items = [];
          for (let i = 0; i < this.state.items.length; i++) if (this.state.items[i].id !== id) items.push(this.state.items[i]);
          if (items.length !== this.state.items.length) this.setState({ items });
        }, "dismiss"),
        clear: /* @__PURE__ */ __name(function() {
          for (const id in timers) if (Object.prototype.hasOwnProperty.call(timers, id)) stopTimer(id);
          this.setState({ items: [] });
        }, "clear")
      },
      onUpdate: /* @__PURE__ */ __name(function(self2) {
        self2.$node.setAttribute("aria-label", msg("toast.region", p.label));
      }, "onUpdate"),
      onDestroy: /* @__PURE__ */ __name(function() {
        for (const id in timers) if (Object.prototype.hasOwnProperty.call(timers, id)) stopTimer(id);
      }, "onDestroy")
    });
    const root2 = toaster.$node;
    root2.className = "vf-toast-region";
    root2.id = base;
    root2.setAttribute("role", "region");
    root2.setAttribute("aria-live", "polite");
    root2.setAttribute("aria-label", msg("toast.region", p.label));
    root2.setAttribute("data-position", oneOf("vfToast position", p.position, POSITIONS));
    toaster.mount(document.body);
    return toaster;
  }
  __name(vfToast, "vfToast");

  // layer2/src/_internal/position.js
  var PLACEMENTS2 = ["bottom-start", "bottom-end", "top-start", "top-end"];
  function placementOf(value) {
    return PLACEMENTS2.indexOf(value) >= 0 ? value : PLACEMENTS2[0];
  }
  __name(placementOf, "placementOf");
  function place(panel, anchor, placement) {
    const parts = placementOf(placement).split("-");
    let side = parts[0];
    const a = anchor.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (side === "bottom" && a.bottom + height > vh && a.top - height >= 0) side = "top";
    else if (side === "top" && a.top - height < 0 && a.bottom + height <= vh) side = "bottom";
    const rtl = window.getComputedStyle && window.getComputedStyle(anchor).direction === "rtl";
    const alignLeft = parts[1] === "start" !== !!rtl;
    let left = alignLeft ? a.left : a.right - width;
    if (left + width > vw) left = vw - width;
    if (left < 0) left = 0;
    const top = side === "top" ? a.top - height : a.bottom;
    panel.style.top = Math.round(top) + "px";
    panel.style.left = Math.round(left) + "px";
    panel.setAttribute("data-placement", side);
  }
  __name(place, "place");

  // layer2/src/_internal/floating.js
  function floatControl(o) {
    let sender = null;
    let layer = null;
    function reposition() {
      if (!sender) return;
      const panel = o.panel(sender);
      const trigger = o.trigger(sender);
      if (panel && trigger) place(panel, trigger, sender.state.placement);
    }
    __name(reposition, "reposition");
    function outside(event) {
      if (sender && !sender.$node.contains(event.target)) close("outside", event, false);
    }
    __name(outside, "outside");
    function listen(on) {
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("resize", reposition);
      window[method]("scroll", reposition, true);
      document[method]("mousedown", outside, true);
    }
    __name(listen, "listen");
    function open(s) {
      if (sender) return;
      sender = s;
      s.state.expanded = true;
      s.refresh();
      reposition();
      listen(true);
      layer = { close: /* @__PURE__ */ __name(function(reason, event) {
        close(reason, event, true);
      }, "close") };
      pushLayer(layer);
    }
    __name(open, "open");
    function stop() {
      if (!sender) return false;
      listen(false);
      removeLayer(layer);
      layer = null;
      sender = null;
      return true;
    }
    __name(stop, "stop");
    function close(reason, event, focusTrigger) {
      const s = sender;
      if (!stop()) return;
      s.state.expanded = false;
      s.refresh();
      if (focusTrigger) {
        const trigger = o.trigger(s);
        if (trigger) trigger.focus();
      }
      if (o.onClose) o.onClose(s, reason, event || null);
    }
    __name(close, "close");
    return {
      open,
      close,
      isOpen: /* @__PURE__ */ __name(function() {
        return !!sender;
      }, "isOpen"),
      /** For onUpdate: a refresh draws a new panel without its coordinates. */
      reposition,
      /** For onDestroy: release listeners without drawing. */
      stop
    };
  }
  __name(floatControl, "floatControl");

  // layer2/src/_internal/menu.js
  var html42 = vfunc_default.html;
  function menuMarkup(base, items, open, label) {
    const out = [];
    const list2 = items || [];
    let index = 0;
    for (let i = 0; i < list2.length; i++) {
      const item = list2[i] || {};
      if (item.separator) {
        out.push(html42`<div class="vf-menu__separator" role="separator"></div>`);
        continue;
      }
      out.push(html42`<button ${attrs({
        type: "button",
        role: "menuitem",
        class: "vf-menu__item",
        tabindex: -1,
        "data-action": "menu-item",
        "data-value": item.action,
        "data-index": index,
        "data-variant": item.danger ? "danger" : null,
        "aria-disabled": item.disabled ? true : null
      })}>${item.label}</button>`);
      index += 1;
    }
    return html42`<div ${attrs({ class: "vf-menu", role: "menu", id: base + "-menu", "aria-labelledby": label ? null : base + "-trigger", "aria-label": label, hidden: !open })}>${out}</div>`;
  }
  __name(menuMarkup, "menuMarkup");
  function triggerAria(base, open) {
    return { haspopup: "menu", expanded: !!open, controls: base + "-menu" };
  }
  __name(triggerAria, "triggerAria");
  function modelItems(items) {
    const out = [];
    for (let i = 0; i < (items || []).length; i++) if (items[i] && !items[i].separator) out.push(items[i]);
    return out;
  }
  __name(modelItems, "modelItems");
  function menuBehavior(onSelect) {
    const ctrl = floatControl({
      panel: /* @__PURE__ */ __name(function(s) {
        return s.ids[s.state.id + "-menu"] || null;
      }, "panel"),
      trigger: /* @__PURE__ */ __name(function(s) {
        return s.ids[s.state.id + "-trigger"] || null;
      }, "trigger")
    });
    function items(sender) {
      return sender.$node.querySelectorAll('[data-action="menu-item"]');
    }
    __name(items, "items");
    function focusAt(sender, index) {
      const list2 = items(sender);
      if (!list2.length) return;
      const i = (index % list2.length + list2.length) % list2.length;
      list2[i].focus();
    }
    __name(focusAt, "focusAt");
    function openAt(sender, index) {
      ctrl.open(sender);
      focusAt(sender, index);
    }
    __name(openAt, "openAt");
    function choose(sender, event, element) {
      if (element.getAttribute("aria-disabled") === "true") return;
      const item = modelItems(sender.state.items)[Number(element.getAttribute("data-index"))];
      ctrl.close("select", event, true);
      onSelect(sender, event, item || {});
    }
    __name(choose, "choose");
    function typeahead(sender, from, letter) {
      const list2 = items(sender);
      for (let n = 1; n <= list2.length; n++) {
        const i = (from + n) % list2.length;
        if ((list2[i].textContent || "").replace(/^\s+/, "").charAt(0).toLowerCase() === letter) return focusAt(sender, i);
      }
    }
    __name(typeahead, "typeahead");
    return {
      ctrl,
      delegates: [
        {
          selector: '[data-action="menu"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            if (ctrl.isOpen()) ctrl.close("toggle", e.event, true);
            else openAt(e.sender, 0);
          }, "onEvent")
        },
        {
          selector: '[data-action="menu"]',
          eventType: "keydown",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const key = e.event.key;
            if (key === "ArrowDown" || key === "Down") {
              e.event.preventDefault();
              openAt(e.sender, 0);
            } else if (key === "ArrowUp" || key === "Up") {
              e.event.preventDefault();
              openAt(e.sender, -1);
            }
          }, "onEvent")
        },
        { selector: '[data-action="menu-item"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          choose(e.sender, e.event, e.target);
        }, "onEvent") },
        {
          selector: '[data-action="menu-item"]',
          eventType: "keydown",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const key = e.event.key;
            const from = Number(e.target.getAttribute("data-index"));
            let to = null;
            if (key === "ArrowDown" || key === "Down") to = from + 1;
            else if (key === "ArrowUp" || key === "Up") to = from - 1;
            else if (key === "Home") to = 0;
            else if (key === "End") to = -1;
            else if (key === "Tab") return ctrl.close("tab", e.event, false);
            else if (key === " " || key === "Spacebar" || key === "Enter") {
              e.event.preventDefault();
              return choose(e.sender, e.event, e.target);
            } else if (key && key.length === 1 && /\S/.test(key)) {
              return typeahead(e.sender, from, key.toLowerCase());
            }
            if (to == null) return;
            e.event.preventDefault();
            focusAt(e.sender, to);
          }, "onEvent")
        }
      ],
      methods: {
        open: /* @__PURE__ */ __name(function() {
          openAt(this, 0);
        }, "open"),
        close: /* @__PURE__ */ __name(function() {
          ctrl.close("code", null, false);
        }, "close")
      },
      onUpdate: /* @__PURE__ */ __name(function() {
        ctrl.reposition();
      }, "onUpdate"),
      onDestroy: /* @__PURE__ */ __name(function() {
        ctrl.stop();
      }, "onDestroy")
    };
  }
  __name(menuBehavior, "menuBehavior");
  function withMenu(spec, behavior) {
    return extend({}, spec, {
      delegates: (spec.delegates || []).concat(behavior.delegates),
      methods: extend({}, behavior.methods, spec.methods),
      onUpdate: behavior.onUpdate,
      onDestroy: behavior.onDestroy
    });
  }
  __name(withMenu, "withMenu");

  // layer2/src/components/dropdown.js
  var html43 = vfunc_default.html;
  function render4(s) {
    const trigger = vsButton(extend({}, s.trigger, { id: s.id + "-trigger", action: "menu", aria: triggerAria(s.id, s.expanded) }));
    return html43`<div ${attrs({ class: cls("vf-dropdown", s.className), id: s.id, "data-ref": s.ref })}>${trigger}${menuMarkup(s.id, s.items, s.expanded, s.label)}</div>`;
  }
  __name(render4, "render");
  function vfDropdown(props) {
    const p = props || {};
    const behavior = menuBehavior(function(sender, event, item) {
      emit(p.onSelect, sender, event, { action: item.action, item });
    });
    return instance(withMenu({
      state: stateOf(p, "dropdown", { trigger: p.trigger || {}, expanded: false, placement: placementOf(p.placement) }),
      render: render4,
      methods: { isOpen: /* @__PURE__ */ __name(function() {
        return behavior.ctrl.isOpen();
      }, "isOpen") }
    }, behavior));
  }
  __name(vfDropdown, "vfDropdown");

  // layer2/src/components/popover.js
  var html44 = vfunc_default.html;
  function render5(s) {
    const panelId = s.id + "-panel";
    const titleId = s.id + "-title";
    const trigger = vsButton(extend({}, s.trigger, {
      id: s.id + "-trigger",
      action: "popover",
      aria: { haspopup: "dialog", expanded: !!s.expanded, controls: panelId }
    }));
    const title = present(s.title) ? html44`<p ${attrs({ class: "vf-popover__title", id: titleId })}>${s.title}</p>` : "";
    return html44`<div ${attrs({ class: cls("vf-popover", s.className), id: s.id, "data-ref": s.ref })}>${trigger}<div ${attrs({
      class: "vf-popover__panel",
      id: panelId,
      role: "dialog",
      tabindex: -1,
      "aria-labelledby": present(s.title) ? titleId : null,
      "aria-label": present(s.title) ? null : s.label,
      hidden: !s.expanded
    })}><div class="vf-popover__header">${title}<button ${attrs({
      type: "button",
      class: "vf-popover__close",
      "data-action": "close",
      "aria-label": msg("modal.close")
    })}><span aria-hidden="true">&times;</span></button></div><div ${attrs({ class: "vf-popover__body", id: s.id + "-body" })}>${isInstance(s.content) ? "" : s.content}</div></div></div>`;
  }
  __name(render5, "render");
  function vfPopover(props) {
    const p = props || {};
    const ctrl = floatControl({
      panel: /* @__PURE__ */ __name(function(s) {
        return s.ids[s.state.id + "-panel"] || null;
      }, "panel"),
      trigger: /* @__PURE__ */ __name(function(s) {
        return s.ids[s.state.id + "-trigger"] || null;
      }, "trigger"),
      onClose: /* @__PURE__ */ __name(function(s, reason, event) {
        emit(p.onClose, s, event, { reason });
      }, "onClose")
    });
    function open(sender, event) {
      if (ctrl.isOpen()) return;
      ctrl.open(sender);
      const panel = sender.ids[sender.state.id + "-panel"];
      if (panel) {
        const list2 = focusables(panel);
        (list2.length > 1 ? list2[1] : panel).focus();
      }
      emit(p.onOpen, sender, event, {});
    }
    __name(open, "open");
    const state = stateOf(p, "popover", { trigger: p.trigger || {}, expanded: false, placement: placementOf(p.placement) });
    const slots = slotChilds([state], "content", function() {
      return state.id + "-body";
    });
    state.content = slots.items[0].content;
    return instance({
      state,
      childs: slots.childs,
      render: render5,
      delegates: [
        {
          selector: '[data-action="popover"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            if (ctrl.isOpen()) ctrl.close("toggle", e.event, true);
            else open(e.sender, e.event);
          }, "onEvent")
        },
        { selector: '[data-action="close"]', eventType: "click", onEvent: /* @__PURE__ */ __name(function(e) {
          ctrl.close("close", e.event, true);
        }, "onEvent") },
        {
          selector: idSelector(state.id),
          eventType: "focusout",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const next = e.event.relatedTarget;
            if (ctrl.isOpen() && next && !e.sender.$node.contains(next)) ctrl.close("blur", e.event, false);
          }, "onEvent")
        }
      ],
      methods: {
        open: /* @__PURE__ */ __name(function() {
          open(this, null);
        }, "open"),
        close: /* @__PURE__ */ __name(function() {
          ctrl.close("code", null, false);
        }, "close"),
        isOpen: /* @__PURE__ */ __name(function() {
          return ctrl.isOpen();
        }, "isOpen")
      },
      onUpdate: /* @__PURE__ */ __name(function() {
        ctrl.reposition();
      }, "onUpdate"),
      onDestroy: /* @__PURE__ */ __name(function() {
        ctrl.stop();
      }, "onDestroy")
    });
  }
  __name(vfPopover, "vfPopover");

  // layer2/src/components/split-button.js
  var html45 = vfunc_default.html;
  function vsSplitButton(props) {
    const p = props || {};
    const base = present(p.id) ? String(p.id) : uid("split");
    const shared = { variant: p.variant, size: p.size, disabled: !!p.disabled };
    const main = vsButton({ label: p.label, action: p.action, id: base + "-main", variant: shared.variant, size: shared.size, disabled: shared.disabled, className: "vf-split-button__main" });
    const more = vsButton({
      label: html45`<span class="vf-split-button__caret" aria-hidden="true"></span>`,
      ariaLabel: msg("splitButton.more", p.menuLabel),
      id: base + "-trigger",
      action: "menu",
      aria: triggerAria(base, p.expanded),
      variant: shared.variant,
      size: shared.size,
      disabled: shared.disabled,
      className: "vf-split-button__toggle"
    });
    return html45`<div ${attrs({ class: cls("vf-split-button", p.className), id: base, "data-ref": p.ref, role: "group" })}>${main}${more}${menuMarkup(base, p.items, p.expanded)}</div>`;
  }
  __name(vsSplitButton, "vsSplitButton");
  function vfSplitButton(props) {
    const p = props || {};
    const behavior = menuBehavior(function(sender, event, item) {
      emit(p.onSelect, sender, event, { action: item.action, item });
    });
    const state = stateOf(p, "split", { expanded: false, placement: placementOf(p.placement || "bottom-end") });
    return instance(withMenu({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return vsSplitButton(s);
      }, "render"),
      delegates: [{
        selector: idSelector(state.id + "-main"),
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          emit(p.onClick, e.sender, e.event, { action: e.sender.state.action });
        }, "onEvent")
      }],
      methods: { isOpen: /* @__PURE__ */ __name(function() {
        return behavior.ctrl.isOpen();
      }, "isOpen") }
    }, behavior));
  }
  __name(vfSplitButton, "vfSplitButton");

  // layer2/src/components/table.js
  var html46 = vfunc_default.html;
  var ALIGNS = { start: 1, center: 1, end: 1 };
  function cellOf(column, row, index) {
    if (typeof column.render === "function") return column.render(row, index);
    return row == null ? "" : row[column.key];
  }
  __name(cellOf, "cellOf");
  function rowKeyOf(row, index, rowKey) {
    const k = rowKey || "id";
    return row != null && typeof row === "object" && row[k] != null ? String(row[k]) : String(index);
  }
  __name(rowKeyOf, "rowKeyOf");
  function vsTable(props) {
    const p = props || {};
    const columns = p.columns || [];
    const rows = p.data || [];
    const sort = p.sort || {};
    const base = Number(p.indexBase) || 0;
    const head = [];
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const align = ALIGNS[col.align] ? col.align : null;
      const sorted = col.sortable && sort.key === col.key ? sort.dir === "desc" ? "descending" : "ascending" : col.sortable ? "none" : null;
      const label = col.sortable ? html46`<button ${attrs({ type: "button", class: "vf-table__sort", "data-action": "sort", "data-value": col.key })}>${col.label}<span class="vf-table__sort-icon" aria-hidden="true"></span></button>` : col.label;
      head.push(html46`<th ${attrs({ class: "vf-table__head", scope: "col", "data-align": align, "aria-sort": sorted })}>${label}</th>`);
    }
    const body = [];
    for (let r = 0; r < rows.length; r++) {
      const key = rowKeyOf(rows[r], base + r, p.rowKey);
      const cells = [];
      for (let c = 0; c < columns.length; c++) {
        cells.push(html46`<td ${attrs({ class: "vf-table__cell", "data-align": ALIGNS[columns[c].align] ? columns[c].align : null })}>${cellOf(columns[c], rows[r], base + r)}</td>`);
      }
      body.push(html46`<tr ${attrs({
        class: "vf-table__row",
        "data-value": key,
        "data-index": base + r,
        "data-action": p.rowAction,
        "data-state": hasValue(p.selected, key) ? "selected" : null
      })}>${cells}</tr>`);
    }
    if (!rows.length) {
      body.push(html46`<tr><td class="vf-table__empty" colspan="${columns.length || 1}">${p.loading ? html46`<span class="vf-table__loading">${msg("common.loading")}</span>` : vsEmptyState({ title: p.emptyText })}</td></tr>`);
    }
    return html46`<div ${attrs({ class: cls("vf-table", p.className), "data-ref": p.ref, "data-state": p.loading ? "loading" : null })}><table ${attrs({
      class: "vf-table__table",
      id: p.id,
      "aria-busy": p.loading ? true : null
    })}>${present(p.caption) ? html46`<caption class="vf-table__caption">${p.caption}</caption>` : ""}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  __name(vsTable, "vsTable");

  // layer2/src/components/sparkline.js
  var html47 = vfunc_default.html;
  var TYPES3 = ["line", "bar"];
  var W = 100;
  var H = 24;
  function numbers(data) {
    const out = [];
    const list2 = data || [];
    for (let i = 0; i < list2.length; i++) {
      const n = Number(list2[i]);
      if (!isNaN(n)) out.push(n);
    }
    return out;
  }
  __name(numbers, "numbers");
  function round(n) {
    return Math.round(n * 100) / 100;
  }
  __name(round, "round");
  function vsSparkline(props) {
    const p = props || {};
    const values = numbers(p.data);
    const type = oneOf("vsSparkline type", p.type, TYPES3);
    let low = Infinity;
    let high = -Infinity;
    for (let i = 0; i < values.length; i++) {
      if (values[i] < low) low = values[i];
      if (values[i] > high) high = values[i];
    }
    const min = type === "bar" ? Math.min(low, 0) : low;
    const max = type === "bar" ? Math.max(high, 0) : high;
    const span = max - min || 1;
    const y = /* @__PURE__ */ __name(function(v) {
      return round(H - (v - min) / span * H);
    }, "y");
    let marks = "";
    if (values.length && type === "line") {
      const step = values.length > 1 ? W / (values.length - 1) : 0;
      const points = [];
      for (let i = 0; i < values.length; i++) points.push(round(i * step) + "," + y(values[i]));
      marks = html47`<polyline class="vf-sparkline__line" points="${points.join(" ")}"></polyline>`;
    } else if (values.length) {
      const band = W / values.length;
      const bars = [];
      for (let i = 0; i < values.length; i++) {
        const top = Math.min(y(values[i]), y(0));
        const height = Math.max(round(Math.abs(y(values[i]) - y(0))), 0.5);
        bars.push(html47`<rect class="vf-sparkline__bar" x="${round(i * band + band * 0.15)}" y="${top}" width="${round(band * 0.7)}" height="${height}"></rect>`);
      }
      marks = html47`${bars}`;
    }
    const f = /* @__PURE__ */ __name(function(n) {
      return vfunc_default.fmt.number(n, p.format);
    }, "f");
    const label = present(p.label) ? p.label : values.length ? msg("sparkline.summary", null, { first: f(values[0]), last: f(values[values.length - 1]), min: f(low), max: f(high) }) : msg("sparkline.empty");
    return html47`<svg ${attrs({ class: cls("vf-sparkline", p.className), id: p.id, "data-ref": p.ref, "data-type": type, role: "img", "aria-label": label })} viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" focusable="false">${marks}</svg>`;
  }
  __name(vsSparkline, "vsSparkline");

  // layer2/src/index.js
  vfunc_default.i18n.add("en", en_default, { defaults: true });
  var members = {
    vsButton,
    vsField,
    vsInput,
    vsTextarea,
    vsSelect,
    vsCheckbox,
    vsRadioGroup,
    vsSwitch,
    vsSlider,
    vsProgress,
    vsButtonGroup,
    vsBadge,
    vsTag,
    vsAvatar,
    vsAlert,
    vsCard,
    vsDescriptions,
    vsStatCard,
    vsTimeline,
    vsEmptyState,
    vsSkeleton,
    vsSpinner,
    vsTooltip,
    vsNumberInput,
    vfNumberInput,
    vsSearchInput,
    vfSearchInput,
    vsPasswordInput,
    vfPasswordInput,
    vsChipsInput,
    vfChipsInput,
    vsRating,
    vfRating,
    vsSelectButton,
    vfSelectButton,
    vsMaskedInput,
    vfMaskedInput,
    vsDatePicker,
    vfDatePicker,
    vsTimePicker,
    vfTimePicker,
    vfDateRangePicker,
    vsListView,
    vfListView,
    vfCarousel,
    vsBreadcrumb,
    vsPagination,
    vfPagination,
    vsTabs,
    vfTabs,
    vsAccordion,
    vfAccordion,
    vsStepper,
    vfStepper,
    vfModal,
    vfDrawer,
    vfConfirm,
    vfToast,
    vfDropdown,
    vfPopover,
    vsSplitButton,
    vfSplitButton,
    vsTable,
    vsSparkline
  };
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

  // layer2/src/_internal/ui.js
  var ui_default = vfunc_default;

  // layer2/src/data/grid.js
  var html48 = ui_default.html;
  function keyOf2(row, index, rowKey) {
    const k = rowKey || "id";
    return row != null && typeof row === "object" && row[k] != null ? String(row[k]) : String(index);
  }
  __name(keyOf2, "keyOf");
  function compare(a, b) {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    return String(a).localeCompare(String(b));
  }
  __name(compare, "compare");
  function prepared(s) {
    const out = [];
    const data = s.data || [];
    const q = present(s.query) ? String(s.query).toLowerCase() : "";
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (q && s.mode !== "server") {
        let hit = false;
        for (let c = 0; c < s.columns.length && !hit; c++) {
          const v = row == null ? null : row[s.columns[c].key];
          if (v != null && String(v).toLowerCase().indexOf(q) >= 0) hit = true;
        }
        if (!hit) continue;
      }
      out.push({ row, key: keyOf2(row, i, s.rowKey), order: i });
    }
    if (s.sort && s.sort.key && s.mode !== "server") {
      const k = s.sort.key;
      const dir = s.sort.dir === "desc" ? -1 : 1;
      out.sort(function(x, y) {
        return dir * compare(x.row && x.row[k], y.row && y.row[k]) || x.order - y.order;
      });
    }
    return out;
  }
  __name(prepared, "prepared");
  function pagesOf(total, pageSize) {
    return Math.max(1, Math.ceil(total / pageSize));
  }
  __name(pagesOf, "pagesOf");
  function view(s) {
    const all = prepared(s);
    const size = Math.max(1, Math.floor(Number(s.pageSize) || 10));
    const total = s.mode === "server" ? Math.max(0, Number(s.total) || 0) : all.length;
    const page = Math.max(1, Math.min(pagesOf(total, size), Math.floor(Number(s.page) || 1)));
    const rows = s.mode === "server" ? all : all.slice((page - 1) * size, page * size);
    return { rows, total, page, size };
  }
  __name(view, "view");
  function render6(s) {
    const v = view(s);
    const multiple = s.selectable === "multiple";
    const single = s.selectable === "single";
    const keys = [];
    const data = [];
    for (let i = 0; i < v.rows.length; i++) {
      keys.push(v.rows[i].key);
      data.push(extend({}, v.rows[i].row, { __vfKey: v.rows[i].key }));
    }
    let allOn = keys.length > 0;
    for (let i = 0; i < keys.length; i++) if (!hasValue(s.selected, keys[i])) allOn = false;
    const columns = [];
    if (multiple || single) {
      columns.push({
        key: "",
        label: multiple ? html48`<input ${attrs({ type: "checkbox", class: "vf-grid__check", "data-action": "select-all", "aria-label": msg("grid.selectAll"), checked: allOn })}>` : html48`<span class="vf-visually-hidden">${msg("grid.select")}</span>`,
        render: /* @__PURE__ */ __name(function(row, index) {
          const key = row.__vfKey;
          return html48`<input ${attrs({
            type: multiple ? "checkbox" : "radio",
            class: "vf-grid__check",
            name: single ? s.id + "-select" : null,
            "data-action": "select-row",
            "data-value": key,
            "aria-label": msg("grid.selectRow", null, { index: index + 1 }),
            checked: hasValue(s.selected, key)
          })}>`;
        }, "render")
      });
    }
    for (let c = 0; c < s.columns.length; c++) columns.push(s.columns[c]);
    const from = v.total ? (v.page - 1) * v.size + 1 : 0;
    const to = v.rows.length ? Math.min(v.total, from + v.rows.length - 1) : from;
    const pager = v.total > v.size ? ui_default.vsPagination({ total: v.total, page: v.page, pageSize: v.size, id: s.id + "-pages" }) : "";
    return html48`<div ${attrs({ class: cls("vf-grid", s.className), id: s.id, "data-ref": s.ref, "data-mode": s.mode })}><div ${attrs({ class: "vf-grid__scroll", id: s.id + "-scroll", "data-height": present(s.height) ? true : null })}>${ui_default.vsTable({
      columns,
      data,
      sort: s.sort,
      rowKey: "__vfKey",
      selected: s.selected,
      rowAction: "row",
      caption: s.caption,
      emptyText: s.emptyText,
      loading: s.loading,
      indexBase: (v.page - 1) * v.size
    })}</div><div class="vf-grid__footer"><p class="vf-grid__range" aria-live="polite">${msg("grid.range", null, {
      from: ui_default.fmt.number(from),
      to: ui_default.fmt.number(Math.max(to, 0)),
      total: ui_default.fmt.number(v.total)
    })}</p>${pager}</div></div>`;
  }
  __name(render6, "render");
  function vfGrid(props) {
    const p = props || {};
    function rowsByKey(s, keys) {
      const out = [];
      const data = s.data || [];
      for (let i = 0; i < data.length; i++) if (hasValue(keys, keyOf2(data[i], i, s.rowKey))) out.push(data[i]);
      return out;
    }
    __name(rowsByKey, "rowsByKey");
    function select(sender, event, keys) {
      sender.setState({ selected: keys });
      emit(p.onSelect, sender, event, { keys: keys.slice(), rows: rowsByKey(sender.state, keys) });
    }
    __name(select, "select");
    function applyHeight(self2) {
      const box = self2.ids[self2.state.id + "-scroll"];
      const h = self2.state.height;
      if (box && present(h)) box.style.maxHeight = typeof h === "number" ? h + "px" : String(h);
    }
    __name(applyHeight, "applyHeight");
    const selectable = p.selectable === true ? "multiple" : p.selectable === "single" || p.selectable === "multiple" ? p.selectable : "none";
    const state = stateOf(p, "grid", {
      columns: (p.columns || []).slice(),
      data: (p.data || []).slice(),
      mode: p.mode === "server" ? "server" : "client",
      selectable,
      selected: [],
      page: Math.max(1, Math.floor(Number(p.page) || 1)),
      sort: p.sort || null,
      instance: null
    });
    delete state.options;
    delete state.lib;
    return instance({
      state,
      render: render6,
      delegates: [
        {
          selector: '[data-action="sort"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const key = e.target.getAttribute("data-value");
            const now = e.sender.state.sort;
            const dir = now && now.key === key && now.dir === "asc" ? "desc" : "asc";
            e.sender.setState({ sort: { key, dir }, page: 1 });
            emit(p.onSort, e.sender, e.event, { key, dir });
          }, "onEvent")
        },
        {
          selector: '[data-action="page"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const page = Number(e.target.getAttribute("data-page"));
            if (page === e.sender.state.page) return;
            e.sender.setState({ page });
            emit(p.onPage, e.sender, e.event, { page });
          }, "onEvent")
        },
        {
          selector: '[data-action="select-row"]',
          eventType: "change",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const key = e.target.getAttribute("data-value");
            const s = e.sender.state;
            let keys;
            if (s.selectable === "single") keys = [key];
            else {
              keys = [];
              for (let i = 0; i < s.selected.length; i++) if (s.selected[i] !== key) keys.push(s.selected[i]);
              if (e.target.checked) keys.push(key);
            }
            select(e.sender, e.event, keys);
          }, "onEvent")
        },
        {
          selector: '[data-action="select-all"]',
          eventType: "change",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const s = e.sender.state;
            const pageKeys = [];
            const v = view(s);
            for (let i = 0; i < v.rows.length; i++) pageKeys.push(v.rows[i].key);
            const keys = [];
            for (let i = 0; i < s.selected.length; i++) if (pageKeys.indexOf(s.selected[i]) < 0) keys.push(s.selected[i]);
            if (e.target.checked) for (let i = 0; i < pageKeys.length; i++) keys.push(pageKeys[i]);
            select(e.sender, e.event, keys);
          }, "onEvent")
        },
        {
          selector: '[data-action="row"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            for (let node2 = e.event.target; node2 && node2 !== e.target; node2 = node2.parentNode) {
              if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL)$/.test(node2.tagName)) return;
            }
            const key = e.target.getAttribute("data-value");
            const index = Number(e.target.getAttribute("data-index"));
            const rows = rowsByKey(e.sender.state, [key]);
            emit(p.onRowClick, e.sender, e.event, { row: rows[0] || null, key, index });
          }, "onEvent")
        }
      ],
      methods: {
        setData: /* @__PURE__ */ __name(function(data) {
          const s = this.state;
          const next = (data || []).slice();
          const keys = [];
          for (let i = 0; i < next.length; i++) keys.push(keyOf2(next[i], i, s.rowKey));
          const kept = [];
          for (let i = 0; i < s.selected.length; i++) if (keys.indexOf(s.selected[i]) >= 0) kept.push(s.selected[i]);
          this.setState({ data: next, selected: kept, page: s.mode === "server" ? s.page : 1, loading: false });
        }, "setData"),
        getData: /* @__PURE__ */ __name(function() {
          return this.state.data.slice();
        }, "getData"),
        setColumns: /* @__PURE__ */ __name(function(columns) {
          this.setState({ columns: (columns || []).slice() });
        }, "setColumns"),
        getSelection: /* @__PURE__ */ __name(function() {
          return rowsByKey(this.state, this.state.selected);
        }, "getSelection"),
        clearSelection: /* @__PURE__ */ __name(function() {
          this.setState({ selected: [] });
        }, "clearSelection"),
        setPage: /* @__PURE__ */ __name(function(page) {
          this.setState({ page: Math.max(1, Math.floor(Number(page) || 1)) });
        }, "setPage"),
        setQuery: /* @__PURE__ */ __name(function(query) {
          this.setState({ query, page: 1 });
        }, "setQuery"),
        setLoading: /* @__PURE__ */ __name(function(loading) {
          this.setState({ loading: !!loading });
        }, "setLoading"),
        setTotal: /* @__PURE__ */ __name(function(total) {
          this.setState({ total });
        }, "setTotal"),
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.selected.slice();
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(keys) {
          this.setState({ selected: (keys || []).slice() });
        }, "setValue")
      },
      onMount: applyHeight,
      onUpdate: applyHeight
    });
  }
  __name(vfGrid, "vfGrid");

  // layer2/src/data/geometry.js
  function r2(n) {
    return Math.round(n * 100) / 100;
  }
  __name(r2, "r2");
  function niceStep(span, count) {
    const raw = span / Math.max(1, count);
    const power = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    const f = raw / power;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * power;
  }
  __name(niceStep, "niceStep");
  function niceTicks(lo, hi, count) {
    let min = Math.min(0, lo);
    let max = Math.max(0, hi);
    if (min === max) max = min + 1;
    const step = niceStep(max - min, count || 5);
    min = Math.floor(min / step) * step;
    max = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v / step) * step);
    return { min, max, ticks };
  }
  __name(niceTicks, "niceTicks");
  function point(cx, cy, radius, angle) {
    return r2(cx + radius * Math.sin(angle)) + " " + r2(cy - radius * Math.cos(angle));
  }
  __name(point, "point");
  function arcPath(cx, cy, radius, inner, a0, a1) {
    if (a1 - a0 >= Math.PI * 2 - 1e-6) {
      const mid = a0 + Math.PI;
      return arcPath(cx, cy, radius, inner, a0, mid) + " " + arcPath(cx, cy, radius, inner, mid, a0 + Math.PI * 2);
    }
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const outer = "M " + point(cx, cy, radius, a0) + " A " + radius + " " + radius + " 0 " + large + " 1 " + point(cx, cy, radius, a1);
    if (!inner) return outer + " L " + r2(cx) + " " + r2(cy) + " Z";
    return outer + " L " + point(cx, cy, inner, a1) + " A " + inner + " " + inner + " 0 " + large + " 0 " + point(cx, cy, inner, a0) + " Z";
  }
  __name(arcPath, "arcPath");

  // layer2/src/data/chart.js
  var html49 = ui_default.html;
  var TYPES4 = ["bar", "line", "area", "pie", "donut", "sparkline"];
  var COLORS = 8;
  var PAD = { top: 12, right: 12, bottom: 28, left: 48 };
  function normalize(data) {
    const d = data || {};
    const labels = d.labels || [];
    const series = [];
    const list2 = d.series || [];
    for (let i = 0; i < list2.length; i++) {
      const values = [];
      const raw = list2[i] && list2[i].data || [];
      for (let j = 0; j < raw.length; j++) values.push(Number(raw[j]) || 0);
      series.push({ name: list2[i] && list2[i].name != null ? String(list2[i].name) : String(i + 1), data: values, index: i });
    }
    return { labels, series };
  }
  __name(normalize, "normalize");
  function color(i) {
    return String(i % COLORS);
  }
  __name(color, "color");
  function markAttrs(s, series, index, label, value, className) {
    const text = msg("chart.point", null, { series: series.name, label, value: ui_default.fmt.number(value, s.valueFormat) });
    return {
      class: className,
      "data-series": color(series.index),
      "data-s": series.index,
      "data-index": index,
      "data-action": s.interactive ? "mark" : null,
      tabindex: s.interactive ? 0 : null,
      "aria-label": s.interactive ? text : null
    };
  }
  __name(markAttrs, "markAttrs");
  function cartesian(s, d, visible, W2, H2) {
    const plotW = W2 - PAD.left - PAD.right;
    const plotH = H2 - PAD.top - PAD.bottom;
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < visible.length; i++) {
      for (let j = 0; j < visible[i].data.length; j++) {
        lo = Math.min(lo, visible[i].data[j]);
        hi = Math.max(hi, visible[i].data[j]);
      }
    }
    const axis = niceTicks(lo === Infinity ? 0 : lo, hi === -Infinity ? 1 : hi, 5);
    const y = /* @__PURE__ */ __name(function(v) {
      return r2(PAD.top + plotH - (v - axis.min) / (axis.max - axis.min) * plotH);
    }, "y");
    const n = Math.max(1, d.labels.length);
    const band = plotW / n;
    const out = [];
    for (let t2 = 0; t2 < axis.ticks.length; t2++) {
      const ty = y(axis.ticks[t2]);
      out.push(html49`<line class="vf-chart__gridline" x1="${PAD.left}" x2="${W2 - PAD.right}" y1="${ty}" y2="${ty}"></line><text class="vf-chart__tick" x="${PAD.left - 6}" y="${ty}" text-anchor="end" dominant-baseline="middle">${ui_default.fmt.number(axis.ticks[t2], s.valueFormat)}</text>`);
    }
    const every = Math.ceil(n / Math.max(1, Math.floor(plotW / 48)));
    for (let i = 0; i < d.labels.length; i += every) {
      out.push(html49`<text class="vf-chart__label" x="${r2(PAD.left + band * (i + 0.5))}" y="${H2 - 8}" text-anchor="middle">${d.labels[i]}</text>`);
    }
    const zero = y(Math.max(axis.min, Math.min(0, axis.max)));
    if (s.type === "bar") {
      const inner = band * 0.8 / Math.max(1, visible.length);
      for (let k = 0; k < visible.length; k++) {
        const series = visible[k];
        for (let i = 0; i < n && i < series.data.length; i++) {
          const v = series.data[i];
          const top = Math.min(y(v), zero);
          const x = r2(PAD.left + band * i + band * 0.1 + inner * k);
          out.push(html49`<rect ${attrs(markAttrs(s, series, i, d.labels[i], v, "vf-chart__mark vf-chart__bar"))} x="${x}" y="${top}" width="${r2(Math.max(inner - 1, 1))}" height="${r2(Math.max(Math.abs(y(v) - zero), 0.5))}"></rect>`);
        }
      }
    } else {
      for (let k = 0; k < visible.length; k++) {
        const series = visible[k];
        const pts = [];
        for (let i = 0; i < n && i < series.data.length; i++) pts.push([r2(PAD.left + band * (i + 0.5)), y(series.data[i])]);
        if (!pts.length) continue;
        let line = "M " + pts[0][0] + " " + pts[0][1];
        for (let i = 1; i < pts.length; i++) line += " L " + pts[i][0] + " " + pts[i][1];
        if (s.type === "area") {
          const area = line + " L " + pts[pts.length - 1][0] + " " + zero + " L " + pts[0][0] + " " + zero + " Z";
          out.push(html49`<path class="vf-chart__area" data-series="${color(series.index)}" d="${area}"></path>`);
        }
        out.push(html49`<path class="vf-chart__line" data-series="${color(series.index)}" d="${line}"></path>`);
        for (let i = 0; i < pts.length; i++) {
          out.push(html49`<circle ${attrs(markAttrs(s, series, i, d.labels[i], series.data[i], "vf-chart__mark vf-chart__point"))} cx="${pts[i][0]}" cy="${pts[i][1]}" r="4"></circle>`);
        }
      }
    }
    return out;
  }
  __name(cartesian, "cartesian");
  function radial(s, d, W2, H2) {
    const series = d.series[0] || { name: "", data: [], index: 0 };
    const cx = W2 / 2;
    const cy = H2 / 2;
    const radius = Math.max(1, Math.min(W2, H2) / 2 - 8);
    const inner = s.type === "donut" ? r2(radius * 0.6) : 0;
    let total = 0;
    for (let i = 0; i < series.data.length; i++) if (s.hidden.indexOf(i) < 0) total += Math.max(0, series.data[i]);
    const out = [];
    let a = 0;
    for (let i = 0; i < series.data.length; i++) {
      const v = Math.max(0, series.data[i]);
      if (s.hidden.indexOf(i) >= 0 || !v || !total) continue;
      const a1 = a + v / total * Math.PI * 2;
      const slice = { name: d.labels[i] != null ? String(d.labels[i]) : series.name, index: i };
      out.push(html49`<path ${attrs(markAttrs(s, slice, i, d.labels[i], v, "vf-chart__mark vf-chart__slice"))} d="${arcPath(cx, cy, r2(radius), inner, a, a1)}"></path>`);
      a = a1;
    }
    return out;
  }
  __name(radial, "radial");
  function legend(s, d) {
    const radialType = s.type === "pie" || s.type === "donut";
    const names = [];
    if (radialType) for (let i = 0; i < d.labels.length; i++) names.push({ name: d.labels[i], index: i });
    else for (let i = 0; i < d.series.length; i++) names.push({ name: d.series[i].name, index: i });
    if (names.length < 2 && !radialType) return "";
    const items = [];
    for (let i = 0; i < names.length; i++) {
      const shown = s.hidden.indexOf(names[i].index) < 0;
      const swatch = html49`<span class="vf-chart__swatch" data-series="${color(names[i].index)}" aria-hidden="true"></span>`;
      items.push(s.interactive ? html49`<li><button ${attrs({ type: "button", class: "vf-chart__toggle", "data-action": "toggle-series", "data-index": names[i].index, "aria-pressed": shown })}>${swatch}${names[i].name}</button></li>` : html49`<li class="vf-chart__entry">${swatch}${names[i].name}</li>`);
    }
    return html49`<ul class="vf-chart__legend" aria-label="${msg("chart.legend")}">${items}</ul>`;
  }
  __name(legend, "legend");
  function dataTable(s, d) {
    const columns = [{ key: "label", label: "" }];
    for (let i = 0; i < d.series.length; i++) columns.push({ key: "s" + i, label: d.series[i].name, align: "end" });
    const rows = [];
    for (let j = 0; j < d.labels.length; j++) {
      const row = { id: String(j), label: d.labels[j] };
      for (let i = 0; i < d.series.length; i++) row["s" + i] = ui_default.fmt.number(d.series[i].data[j] || 0, s.valueFormat);
      rows.push(row);
    }
    return html49`<div class="vf-visually-hidden">${ui_default.vsTable({ columns, data: rows, caption: s.label || msg("chart.label") })}</div>`;
  }
  __name(dataTable, "dataTable");
  function draw(s) {
    const type = oneOf("vsChart type", s.type, TYPES4);
    const d = normalize(s.data);
    if (type === "sparkline") {
      return ui_default.vsSparkline({ data: d.series[0] ? d.series[0].data : [], label: s.label, format: s.valueFormat, id: s.id, className: s.className });
    }
    const st = extend({}, s, { type, hidden: s.hidden || [] });
    const W2 = Math.max(120, Math.round(Number(s.width) || 600));
    const H2 = Math.max(80, Math.round(Number(s.height) || 240));
    const visible = [];
    for (let i = 0; i < d.series.length; i++) if (st.hidden.indexOf(i) < 0) visible.push(d.series[i]);
    const marks = type === "pie" || type === "donut" ? radial(st, d, W2, H2) : cartesian(st, d, visible, W2, H2);
    const tooltip = s.interactive ? html49`<div ${attrs({ class: "vf-chart__tooltip", id: s.id + "-tooltip", "aria-hidden": true, hidden: true })}></div>` : "";
    return html49`<figure ${attrs({
      class: cls("vf-chart", s.className),
      id: s.id,
      "data-ref": s.ref,
      "data-type": type,
      "data-animate": s.animate ? true : null
    })}><svg ${attrs({ class: "vf-chart__svg", role: "img", "aria-label": present(s.label) ? s.label : msg("chart.label") })} viewBox="0 0 ${W2} ${H2}" focusable="false">${marks}</svg>${s.legend === false ? "" : legend(st, d)}${s.dataTable ? dataTable(st, d) : ""}${tooltip}</figure>`;
  }
  __name(draw, "draw");
  function vsChart(props) {
    return draw(extend({}, props || {}, { interactive: false, animate: false }));
  }
  __name(vsChart, "vsChart");
  function vfChart(props) {
    const p = props || {};
    let observer = null;
    let onResize = null;
    function measure(self2) {
      const width = self2.$node.clientWidth;
      if (width > 0 && Math.abs(width - (self2.state.width || 0)) > 1) self2.setState({ width });
    }
    __name(measure, "measure");
    function tip(self2, mark, show) {
      const tooltip = self2.ids[self2.state.id + "-tooltip"];
      if (!tooltip) return;
      if (!show) {
        tooltip.hidden = true;
        return;
      }
      tooltip.textContent = mark.getAttribute("aria-label");
      tooltip.hidden = false;
      const root2 = self2.$node.getBoundingClientRect();
      const r = mark.getBoundingClientRect();
      tooltip.style.left = Math.round(r.left - root2.left + r.width / 2) + "px";
      tooltip.style.top = Math.round(r.top - root2.top) + "px";
    }
    __name(tip, "tip");
    const state = stateOf(p, "chart", {
      type: oneOf("vfChart type", p.type, TYPES4),
      data: p.data || { labels: [], series: [] },
      hidden: [],
      interactive: true,
      animate: true,
      width: 0,
      instance: null
    });
    return instance({
      state,
      render: draw,
      delegates: [
        { selector: '[data-action="mark"]', eventType: "mouseover", onEvent: /* @__PURE__ */ __name(function(e) {
          tip(e.sender, e.target, true);
        }, "onEvent") },
        { selector: '[data-action="mark"]', eventType: "focusin", onEvent: /* @__PURE__ */ __name(function(e) {
          tip(e.sender, e.target, true);
        }, "onEvent") },
        { selector: '[data-action="mark"]', eventType: "mouseout", onEvent: /* @__PURE__ */ __name(function(e) {
          tip(e.sender, e.target, false);
        }, "onEvent") },
        { selector: '[data-action="mark"]', eventType: "focusout", onEvent: /* @__PURE__ */ __name(function(e) {
          tip(e.sender, e.target, false);
        }, "onEvent") },
        {
          selector: '[data-action="mark"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const s = e.sender.state;
            const d = normalize(s.data);
            const si = Number(e.target.getAttribute("data-s"));
            const i = Number(e.target.getAttribute("data-index"));
            const radialType = s.type === "pie" || s.type === "donut";
            const series = radialType ? d.series[0] : d.series[si];
            emit(p.onClick, e.sender, e.event, {
              series: series ? series.name : null,
              index: i,
              label: d.labels[i],
              value: series ? series.data[i] : null
            });
          }, "onEvent")
        },
        {
          selector: '[data-action="toggle-series"]',
          eventType: "click",
          onEvent: /* @__PURE__ */ __name(function(e) {
            const i = Number(e.target.getAttribute("data-index"));
            const hidden = e.sender.state.hidden.slice();
            const at = hidden.indexOf(i);
            if (at >= 0) hidden.splice(at, 1);
            else hidden.push(i);
            e.sender.setState({ hidden, animate: false });
          }, "onEvent")
        }
      ],
      methods: {
        setData: /* @__PURE__ */ __name(function(data) {
          this.setState({ data: data || { labels: [], series: [] }, hidden: [], animate: true });
        }, "setData"),
        setType: /* @__PURE__ */ __name(function(type) {
          this.setState({ type: oneOf("vfChart type", type, TYPES4), hidden: [], animate: true });
        }, "setType"),
        resize: /* @__PURE__ */ __name(function() {
          measure(this);
        }, "resize"),
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.data;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(data) {
          this.setData(data);
        }, "setValue")
      },
      onMount: /* @__PURE__ */ __name(function(self2) {
        measure(self2);
        if (typeof window === "undefined") return;
        if (typeof window.ResizeObserver === "function") {
          observer = new window.ResizeObserver(function() {
            measure(self2);
          });
          observer.observe(self2.$node);
        } else {
          onResize = /* @__PURE__ */ __name(function() {
            measure(self2);
          }, "onResize");
          window.addEventListener("resize", onResize);
        }
      }, "onMount"),
      onUpdate: /* @__PURE__ */ __name(function(self2) {
        self2.state.animate = false;
        if (observer) {
          observer.disconnect();
          observer.observe(self2.$node);
        }
      }, "onUpdate"),
      onDestroy: /* @__PURE__ */ __name(function() {
        if (observer) observer.disconnect();
        if (onResize) window.removeEventListener("resize", onResize);
        observer = null;
        onResize = null;
      }, "onDestroy")
    });
  }
  __name(vfChart, "vfChart");

  // layer2/src/data.js
  var members2 = {
    vfGrid,
    vsChart,
    vfChart
  };
  var hasOwn4 = Object.prototype.hasOwnProperty;
  var conflicts2 = [];
  for (const key in members2) {
    if (!hasOwn4.call(members2, key)) continue;
    if (hasOwn4.call(ui_default, key)) {
      if (ui_default[key] !== members2[key]) conflicts2.push(key);
      continue;
    }
    Object.defineProperty(ui_default, key, { value: members2[key], enumerable: true, writable: false, configurable: false });
  }
  if (DEV2 && conflicts2.length) warn2("vf already has " + conflicts2.join(", ") + "; the existing members were kept.");
})();
//# sourceMappingURL=vfunc-all.js.map
