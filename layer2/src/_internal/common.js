// SPDX-License-Identifier: Apache-2.0
//
// Small helpers shared by the components. Layer 2 sources avoid ES2015+ built-ins (Object.assign,
// Array.from, includes, for…of, spread): the legacy build only polyfills Promise (rule 19).

let counter = 0;

/** A page-unique id for aria-controls / aria-labelledby / label[for], e.g. "vf-input-3". */
export function uid(prefix) {
  counter += 1;
  return 'vf-' + prefix + '-' + counter;
}

/** true for a value that should be shown: not null, undefined, '' or false. */
export function present(value) {
  return value != null && value !== '' && value !== false;
}

/** Copies the own properties of each source into `target` (Object.assign without the polyfill). */
export function extend(target) {
  for (let i = 1; i < arguments.length; i++) {
    const source = arguments[i];
    if (!source) continue;
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
    }
  }
  return target;
}

/** The class attribute: the block class plus the user's `className`. */
export function cls(block, className) {
  return present(className) ? block + ' ' + className : block;
}

/** The hook attributes every vs* takes (D-030): id, data-ref, data-action, aria-describedby. */
export function hooks(p) {
  return { id: p.id, 'data-ref': p.ref, 'data-action': p.action, 'aria-describedby': p.describedBy };
}

/**
 * Options of Select, RadioGroup and SelectButton: strings/numbers or { value, label, disabled }.
 * A `{ label, options }` entry is a group (Select only).
 */
export function normalizeOptions(options) {
  const out = [];
  const list = options || [];
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (o != null && typeof o === 'object') {
      if (o.options) out.push({ label: o.label, options: normalizeOptions(o.options), disabled: !!o.disabled });
      else out.push({ value: o.value == null ? '' : String(o.value), label: o.label == null ? o.value : o.label, disabled: !!o.disabled });
    } else {
      out.push({ value: String(o), label: String(o), disabled: false });
    }
  }
  return out;
}

/** Whether `value` (one value or an array of values) contains the option value `v`. */
export function hasValue(value, v) {
  if (value == null) return false;
  if (Object.prototype.toString.call(value) === '[object Array]') {
    for (let i = 0; i < value.length; i++) if (String(value[i]) === v) return true;
    return false;
  }
  return String(value) === v;
}

/** Calls a vf* callback with the G-2 event shape { sender, event, data }. */
export function emit(callback, sender, event, data) {
  if (typeof callback === 'function') callback({ sender: sender, event: event || null, data: data || {} });
}
