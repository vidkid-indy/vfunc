// SPDX-License-Identifier: Apache-2.0
//
// Optional attributes for vs* markup. vf.html only takes bare attribute names inside a tag, so
// `id`, `data-action`, `data-ref`, `aria-*` … that may be absent are built here, in one place:
// - names come from our code and must match ATTR_NAME (never on*, never style);
// - href and src go through vf.safeUrl, so a javascript: URL becomes "#" (rule 20);
// - values are escaped with vf.esc;
// - null, undefined, false and '' leave the attribute out; true writes a bare attribute, except
//   for aria-* and data-*, where booleans are written as "true" / "false" (as vf.html does).

import vf from './vf.js';
import { DEV, warn } from './dev.js';

const ATTR_NAME = /^(?:id|name|class|title|role|type|value|for|form|href|src|alt|label|datetime|placeholder|autocomplete|inputmode|pattern|min|max|step|minlength|maxlength|rows|cols|tabindex|disabled|readonly|required|checked|selected|multiple|hidden|lang|dir|aria-[a-z]+|data-[a-z0-9]+(?:-[a-z0-9]+)*)$/;

const URL_ATTR = /^(?:href|src)$/;

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * @param {Object<string, *>} map - attribute name → value
 * @returns {SafeHtml} `name="value" …` for use inside a tag, after a space: html`<button ${attrs({ id })}>`
 *   (right after the tag name, vf.html would read it as part of the name and refuse it)
 */
export function attrs(map) {
  const out = [];
  for (const name in map) {
    if (!hasOwn.call(map, name)) continue;
    if (!ATTR_NAME.test(name)) {
      if (DEV) warn('attribute "' + name + '" is not allowed in component markup.');
      continue;
    }
    const value = map[name];
    if (value == null || value === false || value === '') {
      if (value === false && /^(aria|data)-/.test(name)) out.push(name + '="false"');
      continue;
    }
    if (value === true) out.push(/^(aria|data)-/.test(name) ? name + '="true"' : name);
    else out.push(name + '="' + vf.esc(URL_ATTR.test(name) ? vf.safeUrl(value) : value) + '"');
  }
  // Trusted: every name was checked against ATTR_NAME and every value escaped with vf.esc above.
  return vf.unsafeHtml(out.join(' '));
}
