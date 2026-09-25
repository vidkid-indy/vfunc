/*! vfunc-ui (vfunc.js layer 2) v1.0.0-rc.8 | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// layer2/src/_internal/vf.js
import { default as default2 } from "../../layer1/dist/vfunc.esm.js";

// layer2/src/_internal/dev.js
var DEV = false ? true : true;
function warn(message) {
  if (typeof console !== "undefined" && console.warn) console.warn("[vfunc-ui] " + message);
}
__name(warn, "warn");

// layer2/src/_internal/attrs.js
var ATTR_NAME = /^(?:id|name|class|title|role|type|value|for|form|placeholder|autocomplete|inputmode|pattern|min|max|step|minlength|maxlength|rows|cols|tabindex|disabled|readonly|required|checked|selected|multiple|hidden|lang|dir|aria-[a-z]+|data-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
var hasOwn = Object.prototype.hasOwnProperty;
function attrs(map) {
  const out = [];
  for (const name in map) {
    if (!hasOwn.call(map, name)) continue;
    if (!ATTR_NAME.test(name)) {
      if (DEV) warn('attribute "' + name + '" is not allowed in component markup.');
      continue;
    }
    const value = map[name];
    if (value == null || value === false || value === "") {
      if (value === false && /^(aria|data)-/.test(name)) out.push(name + '="false"');
      continue;
    }
    if (value === true) out.push(/^(aria|data)-/.test(name) ? name + '="true"' : name);
    else out.push(name + '="' + default2.esc(value) + '"');
  }
  return default2.unsafeHtml(out.join(" "));
}
__name(attrs, "attrs");

// layer2/src/locales/en.js
var en_default = {
  common: {
    loading: "Loading"
  }
};

// layer2/src/_internal/messages.js
default2.i18n.add("en", en_default, { defaults: true });
function msg(key, override, params) {
  if (override != null && override !== "") return override;
  return default2.t(key, params);
}
__name(msg, "msg");

// layer2/src/_internal/props.js
function oneOf(prop, value, allowed) {
  if (value == null || value === "") return allowed[0];
  if (allowed.indexOf(value) >= 0) return value;
  if (DEV) warn(prop + ' "' + value + '" is not one of ' + allowed.join(", ") + '; using "' + allowed[0] + '".');
  return allowed[0];
}
__name(oneOf, "oneOf");

// layer2/src/components/button.js
var html = default2.html;
var VARIANTS = ["secondary", "primary", "danger", "ghost"];
var SIZES = ["md", "sm", "lg"];
var TYPES = ["button", "submit", "reset"];
function vsButton(props) {
  const p = props || {};
  const loading = !!p.loading;
  const spinner = loading ? html`<span class="vf-button__spinner" aria-hidden="true"></span>` : "";
  const status = loading ? html`<span class="vf-visually-hidden">${msg("common.loading", p.loadingText)}</span>` : "";
  return html`<button ${attrs({
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
var hasOwn2 = Object.prototype.hasOwnProperty;
var conflicts = [];
for (const key in members) {
  if (!hasOwn2.call(members, key)) continue;
  if (hasOwn2.call(default2, key)) {
    if (default2[key] !== members[key]) conflicts.push(key);
    continue;
  }
  Object.defineProperty(default2, key, { value: members[key], enumerable: true, writable: false, configurable: false });
}
if (DEV && conflicts.length) warn("vf already has " + conflicts.join(", ") + "; the existing members were kept.");
var index_default = members;
export {
  index_default as default,
  vsButton
};
//# sourceMappingURL=vfunc-ui.esm.js.map
