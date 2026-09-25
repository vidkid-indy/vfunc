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
var ATTR_NAME = /^(?:id|name|class|title|role|type|value|for|form|href|src|alt|label|datetime|placeholder|autocomplete|inputmode|pattern|min|max|step|minlength|maxlength|rows|cols|tabindex|disabled|readonly|required|checked|selected|multiple|hidden|lang|dir|aria-[a-z]+|data-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
var URL_ATTR = /^(?:href|src)$/;
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
    else out.push(name + '="' + default2.esc(URL_ATTR.test(name) ? default2.safeUrl(value) : value) + '"');
  }
  return default2.unsafeHtml(out.join(" "));
}
__name(attrs, "attrs");

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
    "aria-describedby": p.describedBy,
    "aria-busy": loading || null,
    disabled: !!p.disabled || loading
  })}>${spinner}<span class="vf-button__label">${p.label}</span>${status}</button>`;
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
var html2 = default2.html;
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
  return a.required ? html2`<span class="vf-field__required" aria-hidden="true">*</span>` : "";
}
__name(requiredMark, "requiredMark");
function fieldTexts(p, a) {
  return html2`${a.hintId ? html2`<p ${attrs({ class: "vf-field__hint", id: a.hintId })}>${p.hint}</p>` : ""}${a.errorId ? html2`<p ${attrs({ class: "vf-field__error", id: a.errorId })}>${p.error}</p>` : ""}`;
}
__name(fieldTexts, "fieldTexts");
function wrapperAttrs(block, p, a, extra) {
  return extend({ class: cls(block, p.className), "data-state": a.invalid ? "invalid" : null }, extra);
}
__name(wrapperAttrs, "wrapperAttrs");
function field(p, a, control2, ownLabel) {
  if (!a.wrapped) return control2;
  const label = !ownLabel && present(p.label) ? html2`<label ${attrs({ class: "vf-field__label", for: a.id })}>${p.label}${requiredMark(a)}</label>` : "";
  return html2`<div ${attrs(wrapperAttrs("vf-field", p, a))}>${label}${control2}${fieldTexts(p, a)}</div>`;
}
__name(field, "field");
function fieldset(block, p, a, legend, inner, extra) {
  const head = present(legend) ? html2`<legend class="vf-field__label">${legend}${requiredMark(a)}</legend>` : "";
  return html2`<fieldset ${attrs(wrapperAttrs(block, p, a, extend({ id: a.id, "data-ref": p.ref, "aria-describedby": a.describedBy }, extra)))}>${head}${inner}${fieldTexts(p, a)}</fieldset>`;
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
var html3 = default2.html;
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
  const control2 = html3`<input ${attrs(extend(controlAttrs("vf-input", p, a, "vsInput"), {
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
var html4 = default2.html;
function vsTextarea(props) {
  const p = props || {};
  const a = fieldIds(p, "textarea");
  const control2 = html4`<textarea ${attrs(extend(controlAttrs("vf-textarea", p, a, "vsTextarea"), {
    rows: p.rows == null ? 3 : p.rows,
    placeholder: p.placeholder,
    minlength: p.minlength,
    maxlength: p.maxlength
  }))}>${p.value == null ? "" : String(p.value)}</textarea>`;
  return field(p, a, control2);
}
__name(vsTextarea, "vsTextarea");

// layer2/src/components/select.js
var html5 = default2.html;
function optionList(options, value) {
  const out = [];
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    if (o.options) {
      out.push(html5`<optgroup ${attrs({ label: o.label, disabled: o.disabled })}>${optionList(o.options, value)}</optgroup>`);
    } else {
      out.push(html5`<option value="${o.value}" ${attrs({ selected: hasValue(value, o.value), disabled: o.disabled })}>${o.label}</option>`);
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
  const placeholder = present(p.placeholder) ? html5`<option value="" ${attrs({ selected: !present(p.value) })}>${p.placeholder}</option>` : "";
  const control2 = html5`<select ${attrs(extend(base, { multiple: !!p.multiple }))}>${placeholder}${optionList(normalizeOptions(p.options), p.value)}</select>`;
  return field(p, a, control2);
}
__name(vsSelect, "vsSelect");

// layer2/src/components/checkbox.js
var html6 = default2.html;
function checkControl(block, p, prefix, extra, decoration) {
  const a = fieldIds({ id: p.id, hint: p.hint, error: p.error, describedBy: p.describedBy, required: p.required }, prefix);
  const input = inputAttrs(block + "__input", p, a, extend({ type: "checkbox", value: p.value, checked: !!p.checked, readonly: null }, extra));
  const control2 = html6`<label ${attrs({ class: a.wrapped ? block : cls(block, p.className) })}><input ${attrs(input)}>${decoration || ""}<span class="${block}__label">${p.label}${requiredMark(a)}</span></label>`;
  return field(p, a, control2, true);
}
__name(checkControl, "checkControl");
function vsCheckbox(props) {
  return checkControl("vf-check", props || {}, "check");
}
__name(vsCheckbox, "vsCheckbox");

// layer2/src/components/radio-group.js
var html7 = default2.html;
var DIRECTIONS = ["vertical", "horizontal"];
function vsRadioGroup(props) {
  const p = props || {};
  const a = fieldIds(p, "radio", true);
  const name = present(p.name) ? p.name : uid("radio-name");
  const options = normalizeOptions(p.options);
  const items = [];
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    items.push(html7`<label class="vf-check"><input ${attrs({
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
    html7`<div class="vf-radio-group__options">${items}</div>`,
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
    default2.html`<span class="vf-switch__track" aria-hidden="true"></span>`
  );
}
__name(vsSwitch, "vsSwitch");

// layer2/src/components/slider.js
var html8 = default2.html;
function vsSlider(props) {
  const p = props || {};
  const a = fieldIds(p, "slider");
  return field(p, a, html8`<input ${attrs(inputAttrs(controlClass("vf-slider", p, a), p, a, {
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
var html9 = default2.html;
function vsProgress(props) {
  const p = props || {};
  const a = fieldIds(p, "progress");
  const max = p.max == null ? 100 : Number(p.max);
  const known = present(p.value) || p.value === 0;
  const value = known ? Math.max(0, Math.min(max, Number(p.value))) : null;
  const bar = html9`<progress ${attrs({
    class: controlClass("vf-progress", p, a),
    id: a.id,
    value,
    max,
    "data-ref": p.ref,
    "aria-describedby": a.describedBy
  })}></progress>`;
  const text = p.showValue && known ? html9`<span class="vf-progress__value" aria-hidden="true">${default2.fmt.number(max ? value / max : 0, { style: "percent" })}</span>` : "";
  return field(p, a, text ? html9`<div class="vf-progress__row">${bar}${text}</div>` : bar);
}
__name(vsProgress, "vsProgress");

// layer2/src/components/button-group.js
var html10 = default2.html;
var SIZES3 = ["md", "sm", "lg"];
function vsButtonGroup(props) {
  const p = props || {};
  const size = oneOf("vsButtonGroup size", p.size, SIZES3);
  const list2 = p.buttons || [];
  const buttons = [];
  for (let i = 0; i < list2.length; i++) buttons.push(vsButton(extend({ size }, list2[i])));
  return html10`<div ${attrs({
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
var html11 = default2.html;
var TONES = ["neutral", "primary", "success", "warning", "danger", "info"];
function vsBadge(props) {
  const p = props || {};
  const dot = p.dot ? html11`<span class="vf-badge__dot" aria-hidden="true"></span>` : "";
  return html11`<span ${attrs({
    class: cls("vf-badge", p.className),
    id: p.id,
    "data-ref": p.ref,
    "data-variant": oneOf("vsBadge variant", p.variant, TONES),
    "aria-describedby": p.describedBy
  })}>${dot}${p.label}</span>`;
}
__name(vsBadge, "vsBadge");

// layer2/src/components/tag.js
var html12 = default2.html;
function vsTag(props) {
  const p = props || {};
  const text = typeof p.label === "string" || typeof p.label === "number" ? String(p.label) : p.value || "";
  const remove = p.removable ? html12`<button ${attrs({
    type: "button",
    class: "vf-tag__remove",
    "data-action": p.removeAction || "remove",
    "data-value": p.value,
    "aria-label": msg("tag.remove", p.removeLabel, { label: text }),
    disabled: !!p.disabled
  })}><span aria-hidden="true">&times;</span></button>` : "";
  return html12`<span ${attrs({
    class: cls("vf-tag", p.className),
    id: p.id,
    "data-ref": p.ref,
    "data-value": p.value,
    "data-variant": oneOf("vsTag variant", p.variant, TONES)
  })}><span class="vf-tag__label">${p.label}</span>${remove}</span>`;
}
__name(vsTag, "vsTag");

// layer2/src/components/avatar.js
var html13 = default2.html;
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
  const inside = present(p.src) ? html13`<img alt="" ${attrs({ class: "vf-avatar__image", src: p.src })}>` : html13`<span class="vf-avatar__initials" aria-hidden="true">${initials(p.name)}</span>`;
  return html13`<span ${attrs({
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
var html14 = default2.html;
var VARIANTS2 = ["info", "success", "warning", "danger"];
function vsAlert(props) {
  const p = props || {};
  const variant = oneOf("vsAlert variant", p.variant, VARIANTS2);
  const title = present(p.title) ? html14`<p class="vf-alert__title">${p.title}</p>` : "";
  const message = present(p.message) ? html14`<div class="vf-alert__message">${p.message}</div>` : "";
  const dismiss = p.dismissible ? html14`<button ${attrs({
    type: "button",
    class: "vf-alert__dismiss",
    "data-action": p.dismissAction || "dismiss",
    "aria-label": msg("alert.dismiss", p.dismissLabel)
  })}><span aria-hidden="true">&times;</span></button>` : "";
  return html14`<div ${attrs({
    class: cls("vf-alert", p.className),
    id: p.id,
    "data-ref": p.ref,
    "data-variant": variant,
    role: variant === "danger" || variant === "warning" ? "alert" : "status"
  })}><div class="vf-alert__body">${title}${message}</div>${dismiss}</div>`;
}
__name(vsAlert, "vsAlert");

// layer2/src/components/card.js
var html15 = default2.html;
function heading(level) {
  const n = Number(level);
  return "h" + (n >= 2 && n <= 6 ? Math.floor(n) : 3);
}
__name(heading, "heading");
function vsCard(props) {
  const p = props || {};
  const h = heading(p.headingLevel);
  const head = present(p.title) || present(p.subtitle) || present(p.actions) ? html15`<div class="vf-card__header"><div class="vf-card__heading">${present(p.title) ? html15`<${h} class="vf-card__title">${p.title}</${h}>` : ""}${present(p.subtitle) ? html15`<p class="vf-card__subtitle">${p.subtitle}</p>` : ""}</div>${present(p.actions) ? html15`<div class="vf-card__actions">${p.actions}</div>` : ""}</div>` : "";
  const body = present(p.body) ? html15`<div class="vf-card__body">${p.body}</div>` : "";
  const footer = present(p.footer) ? html15`<div class="vf-card__footer">${p.footer}</div>` : "";
  return html15`<div ${attrs({ class: cls("vf-card", p.className), id: p.id, "data-ref": p.ref })}>${head}${body}${footer}</div>`;
}
__name(vsCard, "vsCard");

// layer2/src/components/descriptions.js
var html16 = default2.html;
function vsDescriptions(props) {
  const p = props || {};
  const columns = Math.max(1, Math.min(4, Math.floor(Number(p.columns) || 1)));
  const list2 = p.items || [];
  const items = [];
  for (let i = 0; i < list2.length; i++) {
    items.push(html16`<div class="vf-descriptions__item"><dt class="vf-descriptions__label">${list2[i].label}</dt><dd class="vf-descriptions__value">${list2[i].value}</dd></div>`);
  }
  const title = present(p.title) ? html16`<p class="vf-descriptions__title">${p.title}</p>` : "";
  return html16`<div ${attrs({ class: cls("vf-descriptions", p.className), id: p.id, "data-ref": p.ref, "data-columns": columns })}>${title}<dl class="vf-descriptions__list">${items}</dl></div>`;
}
__name(vsDescriptions, "vsDescriptions");

// layer2/src/components/stat-card.js
var html17 = default2.html;
function vsStatCard(props) {
  const p = props || {};
  const value = typeof p.value === "number" ? default2.fmt.number(p.value, p.format) : p.value;
  let delta = "";
  if (typeof p.delta === "number" && !isNaN(p.delta)) {
    const trend = p.delta > 0 ? "up" : p.delta < 0 ? "down" : "flat";
    const text = (p.delta > 0 ? "+" : "") + default2.fmt.number(p.delta, { style: "percent", maximumFractionDigits: 1 });
    const word = trend === "up" ? msg("statCard.up") : trend === "down" ? msg("statCard.down") : "";
    const said = word ? html17`<span class="vf-visually-hidden">${word} </span>` : "";
    delta = html17`<p ${attrs({ class: "vf-stat-card__delta", "data-trend": trend })}>${said}<span class="vf-stat-card__change">${text}</span>${present(p.deltaLabel) ? html17` <span class="vf-stat-card__delta-label">${p.deltaLabel}</span>` : ""}</p>`;
  }
  const icon = present(p.icon) ? html17`<span class="vf-stat-card__icon" aria-hidden="true">${p.icon}</span>` : "";
  const description = present(p.description) ? html17`<p class="vf-stat-card__description">${p.description}</p>` : "";
  return html17`<div ${attrs({ class: cls("vf-stat-card", p.className), id: p.id, "data-ref": p.ref })}><p class="vf-stat-card__label">${icon}${p.label}</p><p class="vf-stat-card__value">${value}</p>${delta}${description}</div>`;
}
__name(vsStatCard, "vsStatCard");

// layer2/src/components/timeline.js
var html18 = default2.html;
function timeOf(value, format) {
  if (!present(value) && value !== 0) return "";
  const date = value instanceof Date ? value : new Date(value);
  const valid = !isNaN(date.getTime());
  const iso = valid ? date.toISOString() : null;
  const text = valid ? default2.fmt.date(date, format) : String(value);
  return html18`<time ${attrs({ class: "vf-timeline__time", datetime: typeof value === "string" ? value : iso })}>${text}</time>`;
}
__name(timeOf, "timeOf");
function vsTimeline(props) {
  const p = props || {};
  const list2 = p.items || [];
  const items = [];
  for (let i = 0; i < list2.length; i++) {
    const item = list2[i] || {};
    items.push(html18`<li ${attrs({ class: "vf-timeline__item", "data-variant": oneOf("vsTimeline variant", item.variant, TONES) })}><span class="vf-timeline__marker" aria-hidden="true"></span><div class="vf-timeline__content"><p class="vf-timeline__title">${item.title}</p>${timeOf(item.time, p.timeFormat)}${present(item.description) ? html18`<p class="vf-timeline__description">${item.description}</p>` : ""}</div></li>`);
  }
  return html18`<ol ${attrs({ class: cls("vf-timeline", p.className), id: p.id, "data-ref": p.ref })}>${items}</ol>`;
}
__name(vsTimeline, "vsTimeline");

// layer2/src/components/empty-state.js
var html19 = default2.html;
function vsEmptyState(props) {
  const p = props || {};
  const icon = present(p.icon) ? html19`<div class="vf-empty-state__icon" aria-hidden="true">${p.icon}</div>` : "";
  const description = present(p.description) ? html19`<p class="vf-empty-state__description">${p.description}</p>` : "";
  const action = present(p.action) ? html19`<div class="vf-empty-state__action">${p.action}</div>` : "";
  return html19`<div ${attrs({ class: cls("vf-empty-state", p.className), id: p.id, "data-ref": p.ref })}>${icon}<p class="vf-empty-state__title">${msg("emptyState.title", p.title)}</p>${description}${action}</div>`;
}
__name(vsEmptyState, "vsEmptyState");

// layer2/src/components/skeleton.js
var html20 = default2.html;
var VARIANTS3 = ["text", "rect", "circle"];
function vsSkeleton(props) {
  const p = props || {};
  const variant = oneOf("vsSkeleton variant", p.variant, VARIANTS3);
  const count = variant === "text" ? Math.max(1, Math.min(20, Math.floor(Number(p.lines) || 1))) : 1;
  const lines = [];
  for (let i = 0; i < count; i++) lines.push(html20`<span class="vf-skeleton__line"></span>`);
  return html20`<div ${attrs({ class: cls("vf-skeleton", p.className), id: p.id, "data-ref": p.ref, "data-variant": variant, "aria-hidden": true })}>${lines}</div>`;
}
__name(vsSkeleton, "vsSkeleton");

// layer2/src/components/spinner.js
var html21 = default2.html;
var SIZES5 = ["md", "sm", "lg"];
function vsSpinner(props) {
  const p = props || {};
  return html21`<span ${attrs({
    class: cls("vf-spinner", p.className),
    id: p.id,
    "data-ref": p.ref,
    "data-size": oneOf("vsSpinner size", p.size, SIZES5),
    role: "status"
  })}><span class="vf-spinner__circle" aria-hidden="true"></span><span class="vf-visually-hidden">${msg("common.loading", p.label)}</span></span>`;
}
__name(vsSpinner, "vsSpinner");

// layer2/src/components/tooltip.js
var html22 = default2.html;
var PLACEMENTS = ["top", "bottom", "start", "end"];
function vsTooltip(props) {
  const p = props || {};
  const id = present(p.id) ? p.id : uid("tooltip");
  const trigger = typeof p.trigger === "function" ? p.trigger({ describedBy: id }) : p.trigger;
  return html22`<span ${attrs({
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
  return default2.vfunc({
    replaceRoot: true,
    state: spec.state,
    render: spec.render,
    delegates: spec.delegates || [],
    events: spec.events,
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
  const root = sender.$node;
  return root.id === sender.state.id ? root : sender.ids[sender.state.id] || null;
}
__name(control, "control");
function actionPart(sender, action) {
  return sender.$node.querySelector('[data-action="' + action + '"]');
}
__name(actionPart, "actionPart");

// layer2/src/components/number-input.js
var html23 = default2.html;
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
  const box = html23`<div ${attrs(boxAttrs("vf-number-input", p, a, "vsNumberInput"))}><button ${attrs({
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
var html24 = default2.html;
function vsSearchInput(props) {
  const p = props || {};
  const a = fieldIds(p, "search");
  const filled = present(p.value);
  const box = html24`<div ${attrs(boxAttrs("vf-search-input", p, a, "vsSearchInput"))}><input ${attrs(inputAttrs("vf-search-input__input", p, a, {
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
  const self = state.id;
  return instance({
    state,
    render: /* @__PURE__ */ __name(function(s) {
      return vsSearchInput(s);
    }, "render"),
    delegates: [
      { selector: idSelector(self), eventType: "input", onEvent: /* @__PURE__ */ __name(function(e) {
        if (!composing(e.event)) typed(e);
      }, "onEvent") },
      { selector: idSelector(self), eventType: "compositionend", onEvent: typed },
      {
        selector: idSelector(self),
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
var html25 = default2.html;
function vsPasswordInput(props) {
  const p = props || {};
  const a = fieldIds(p, "password");
  const visible = !!p.visible;
  const box = html25`<div ${attrs(boxAttrs("vf-password-input", p, a, "vsPasswordInput"))}><input ${attrs(inputAttrs("vf-password-input__input", p, a, {
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
var html26 = default2.html;
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
    chips.push(html26`<li class="vf-chips-input__chip">${vsTag({ label: values[i], value: values[i], removable: true, disabled: !!p.disabled })}</li>`);
    if (p.name) hidden.push(html26`<input ${attrs({ type: "hidden", name: p.name, value: values[i] })}>`);
  }
  const box = html26`<div ${attrs({ class: controlClass("vf-chips-input", p, a), "data-state": p.disabled ? "disabled" : null })}>${chips.length ? html26`<ul class="vf-chips-input__list">${chips}</ul>` : ""}<input ${attrs(inputAttrs("vf-chips-input__input", p, a, {
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
var html27 = default2.html;
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
    for (let i = 1; i <= max; i++) stars.push(html27`<span ${attrs({ class: "vf-rating__star", "data-state": i <= value ? "on" : "off" })}>&#9733;</span>`);
    return html27`<span ${attrs({
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
    stars.push(html27`<label class="vf-rating__item"><input ${attrs({
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
  return fieldset("vf-field vf-rating", p, a, msg("rating.label", p.label), html27`<div class="vf-rating__stars">${stars}</div>`);
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
var html28 = default2.html;
function vsSelectButton(props) {
  const p = props || {};
  const a = fieldIds(p, "select-button");
  const options = normalizeOptions(p.options);
  const buttons = [];
  const hidden = [];
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    const on = hasValue(p.value, o.value);
    buttons.push(html28`<button ${attrs({
      type: "button",
      class: "vf-select-button__option",
      "data-action": "select",
      "data-value": o.value,
      "aria-pressed": on,
      disabled: !!p.disabled || o.disabled
    })}>${o.label}</button>`);
    if (on && present(p.name)) hidden.push(html28`<input ${attrs({ type: "hidden", name: p.name, value: o.value })}>`);
  }
  const labelId = a.wrapped && present(p.label) ? a.id + "-label" : null;
  const group = html28`<div ${attrs({
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
  const label = labelId ? html28`<span ${attrs({ class: "vf-field__label", id: labelId })}>${p.label}</span>` : "";
  return html28`<div ${attrs({ class: cls("vf-field", p.className), "data-state": a.invalid ? "invalid" : null })}>${label}${group}${fieldTexts(p, a)}</div>`;
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
var html29 = default2.html;
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
  return field(p, a, html29`<input ${attrs(base)}>`);
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
var html30 = default2.html;
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
    return html30`<div class="vf-date-range__part"><label ${attrs({ class: "vf-date-range__label", for: map.id })}>${which === "start" ? msg("dateRangePicker.start", s.startLabel) : msg("dateRangePicker.end", s.endLabel)}</label><input ${attrs(map)}></div>`;
  }
  __name(input, "input");
  const start = input("start", { name: names[0], value: s.start, min: s.min, max: s.max });
  const end = input("end", { name: names[1], value: s.end, min: s.start || s.min, max: s.max });
  return fieldset(
    "vf-field vf-date-range",
    s,
    a,
    s.label,
    html30`<div class="vf-date-range__inputs">${start}<span class="vf-date-range__separator" aria-hidden="true">&ndash;</span>${end}</div>`,
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
var html31 = default2.html;
var SELECTABLE = ["none", "single", "multiple"];
function keyOf(item, index, itemKey) {
  if (item != null && typeof item === "object" && item[itemKey] != null) return String(item[itemKey]);
  return String(index);
}
__name(keyOf, "keyOf");
function defaultItem(item) {
  if (item == null || typeof item !== "object" || item instanceof default2.SafeHtml) return item;
  return html31`<span class="vf-list-view__title">${item.title != null ? item.title : item.label}</span>${present(item.description) ? html31`<span class="vf-list-view__description">${item.description}</span>` : ""}${present(item.meta) ? html31`<span class="vf-list-view__meta">${item.meta}</span>` : ""}`;
}
__name(defaultItem, "defaultItem");
function vsListView(props) {
  const p = props || {};
  const items = p.items || [];
  if (!items.length) {
    return html31`<div ${attrs({ class: cls("vf-list-view", p.className), id: p.id, "data-ref": p.ref, "data-state": "empty" })}>${vsEmptyState({ title: p.emptyText })}</div>`;
  }
  const mode = oneOf("vsListView selectable", p.selectable, SELECTABLE);
  const itemKey = p.itemKey || "id";
  const render3 = typeof p.render === "function" ? p.render : defaultItem;
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
    rows.push(mode === "none" ? html31`<li class="vf-list-view__item">${render3(items[i], i)}</li>` : html31`<li ${attrs({
      class: "vf-list-view__item",
      role: "option",
      id: base + "-option-" + i,
      "aria-selected": hasValue(p.selected, key),
      tabindex: i === focusIndex ? 0 : -1,
      "data-action": "select",
      "data-value": key,
      "data-index": i
    })}>${render3(items[i], i)}</li>`);
  }
  return html31`<ul ${attrs({
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

// layer2/src/components/carousel.js
var html32 = default2.html;
function render2(s) {
  const items = s.items || [];
  const total = items.length;
  const slides = [];
  const dots = [];
  for (let i = 0; i < total; i++) {
    const item = items[i] || {};
    const content = present(item.src) ? html32`<img alt="${item.alt == null ? "" : item.alt}" ${attrs({ class: "vf-carousel__image", src: item.src })}>` : item.content;
    slides.push(html32`<div ${attrs({
      class: "vf-carousel__slide",
      role: "group",
      "aria-roledescription": msg("carousel.slide"),
      "aria-label": msg("carousel.position", null, { index: i + 1, total }),
      hidden: i !== s.index
    })}>${content}</div>`);
    if (s.showDots !== false) {
      dots.push(html32`<button ${attrs({
        type: "button",
        class: "vf-carousel__dot",
        "data-action": "go",
        "data-index": i,
        "aria-label": msg("carousel.goTo", null, { index: i + 1 }),
        "aria-current": i === s.index ? true : null
      })}></button>`);
    }
  }
  const autoplay = s.autoplay > 0 ? html32`<button ${attrs({ type: "button", class: "vf-carousel__rotation", "data-action": "rotation" })}>${s.playing ? msg("carousel.pause") : msg("carousel.play")}</button>` : "";
  const loop = s.loop !== false;
  return html32`<section ${attrs({
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
  })}>${slides}</div>${dots.length > 1 ? html32`<div class="vf-carousel__dots">${dots}</div>` : ""}</section>`;
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
  return instance({
    state,
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
    onMount: /* @__PURE__ */ __name(function(self) {
      if (self.state.autoplay > 0 && !reducedMotion()) setPlaying(self, true);
    }, "onMount"),
    onDestroy: stop
  });
}
__name(vfCarousel, "vfCarousel");

// layer2/src/components/breadcrumb.js
var html33 = default2.html;
function vsBreadcrumb(props) {
  const p = props || {};
  const list2 = p.items || [];
  const items = [];
  for (let i = 0; i < list2.length; i++) {
    const item = list2[i] || {};
    const last = i === list2.length - 1;
    const inner = last || !present(item.href) ? html33`<span ${attrs({ class: "vf-breadcrumb__current", "aria-current": last ? "page" : null })}>${item.label}</span>` : html33`<a ${attrs({ class: "vf-breadcrumb__link", href: item.href })}>${item.label}</a>`;
    items.push(html33`<li class="vf-breadcrumb__item">${inner}</li>`);
  }
  return html33`<nav ${attrs({ class: cls("vf-breadcrumb", p.className), id: p.id, "data-ref": p.ref, "aria-label": msg("breadcrumb.label", p.label) })}><ol class="vf-breadcrumb__list">${items}</ol></nav>`;
}
__name(vsBreadcrumb, "vsBreadcrumb");

// layer2/src/components/pagination.js
var html34 = default2.html;
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
    return html34`<li><button ${attrs({
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
  const items = [button(page - 1, html34`<span aria-hidden="true">&lsaquo;</span>`, msg("pagination.previous"))];
  const list2 = pageList(page, pages, siblings);
  for (let i = 0; i < list2.length; i++) {
    const n = list2[i];
    items.push(n === 0 ? html34`<li><span class="vf-pagination__gap" aria-hidden="true">&hellip;</span></li>` : button(n, n, msg("pagination.page", null, { page: n }), n === page));
  }
  items.push(button(page + 1, html34`<span aria-hidden="true">&rsaquo;</span>`, msg("pagination.next")));
  return html34`<nav ${attrs({ class: cls("vf-pagination", p.className), id: p.id, "data-ref": p.ref, "aria-label": msg("pagination.label", p.label) })}><ul class="vf-pagination__list">${items}</ul></nav>`;
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
var html35 = default2.html;
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
    const t = tabs[i];
    const on = i === current;
    buttons.push(html35`<button ${attrs({
      type: "button",
      role: "tab",
      class: "vf-tabs__tab",
      id: base + "-tab-" + i,
      "aria-controls": base + "-panel-" + i,
      "aria-selected": on,
      tabindex: on ? 0 : -1,
      "data-action": "tab",
      "data-value": t.id,
      "data-index": i,
      disabled: !!t.disabled
    })}>${t.label}</button>`);
    panels.push(html35`<div ${attrs({
      role: "tabpanel",
      class: "vf-tabs__panel",
      id: base + "-panel-" + i,
      "aria-labelledby": base + "-tab-" + i,
      tabindex: 0,
      hidden: !on
    })}>${t.content}</div>`);
  }
  return html35`<div ${attrs({ class: cls("vf-tabs", p.className), id: base, "data-ref": p.ref })}><div ${attrs({ class: "vf-tabs__list", role: "tablist", "aria-label": p.label })}>${buttons}</div>${panels}</div>`;
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
  const first = (state.tabs || [])[activeIndex(state.tabs || [], p.active)];
  state.active = first ? first.id : null;
  return instance({
    state,
    render: /* @__PURE__ */ __name(function(s) {
      return vsTabs(s);
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
var html36 = default2.html;
function vsAccordion(props) {
  const p = props || {};
  const base = present(p.id) ? String(p.id) : uid("accordion");
  const h = heading(p.headingLevel);
  const list2 = p.items || [];
  const items = [];
  for (let i = 0; i < list2.length; i++) {
    const item = list2[i];
    const open = !!item.open || hasValue(p.open, String(item.id));
    items.push(html36`<div ${attrs({ class: "vf-accordion__item", "data-state": open ? "open" : "closed" })}><${h} class="vf-accordion__heading"><button ${attrs({
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
  return html36`<div ${attrs({ class: cls("vf-accordion", p.className), id: base, "data-ref": p.ref })}>${items}</div>`;
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
  return instance({
    state,
    render: /* @__PURE__ */ __name(function(s) {
      return vsAccordion(extend({}, s, { open: s.openIds }));
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
var html37 = default2.html;
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
    const step = steps[i] != null && typeof steps[i] === "object" && !(steps[i] instanceof default2.SafeHtml) ? steps[i] : { label: steps[i] };
    const state = i < active ? "complete" : i === active ? "current" : "upcoming";
    const inner = html37`<span class="vf-stepper__marker" aria-hidden="true">${state === "complete" ? html37`&#10003;` : i + 1}</span><span class="vf-stepper__text"><span class="vf-stepper__label">${step.label}</span>${state === "complete" ? html37`<span class="vf-visually-hidden"> ${msg("stepper.complete")}</span>` : ""}${present(step.description) ? html37`<span class="vf-stepper__description">${step.description}</span>` : ""}</span>`;
    items.push(html37`<li ${attrs({ class: "vf-stepper__step", "data-state": state, "aria-current": state === "current" ? "step" : null })}>${p.clickable ? html37`<button ${attrs({ type: "button", class: "vf-stepper__button", "data-action": "step", "data-index": i })}>${inner}</button>` : html37`<span class="vf-stepper__button">${inner}</span>`}</li>`);
  }
  return html37`<ol ${attrs({ class: cls("vf-stepper", p.className), id: p.id, "data-ref": p.ref, "aria-label": p.label })}>${items}</ol>`;
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

// layer2/src/index.js
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
  vfStepper
};
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
  vfAccordion,
  vfCarousel,
  vfChipsInput,
  vfDatePicker,
  vfDateRangePicker,
  vfListView,
  vfMaskedInput,
  vfNumberInput,
  vfPagination,
  vfPasswordInput,
  vfRating,
  vfSearchInput,
  vfSelectButton,
  vfStepper,
  vfTabs,
  vfTimePicker,
  vsAccordion,
  vsAlert,
  vsAvatar,
  vsBadge,
  vsBreadcrumb,
  vsButton,
  vsButtonGroup,
  vsCard,
  vsCheckbox,
  vsChipsInput,
  vsDatePicker,
  vsDescriptions,
  vsEmptyState,
  vsField,
  vsInput,
  vsListView,
  vsMaskedInput,
  vsNumberInput,
  vsPagination,
  vsPasswordInput,
  vsProgress,
  vsRadioGroup,
  vsRating,
  vsSearchInput,
  vsSelect,
  vsSelectButton,
  vsSkeleton,
  vsSlider,
  vsSpinner,
  vsStatCard,
  vsStepper,
  vsSwitch,
  vsTabs,
  vsTag,
  vsTextarea,
  vsTimePicker,
  vsTimeline,
  vsTooltip
};
//# sourceMappingURL=vfunc-ui.esm.js.map
