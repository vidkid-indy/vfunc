// SPDX-License-Identifier: Apache-2.0
//
// Date and time values of the pickers: the same strings as the native inputs ('YYYY-MM-DD',
// 'HH:mm'). Where the browser has no date/time input (IE11) the field is a text box, so typed
// text such as "2026.1.5" or "9:5" is normalized here and anything else is rejected.

function pad(n) {
  return (n < 10 ? '0' : '') + n;
}

/** Date or text → 'YYYY-MM-DD' (local calendar day), or '' when it is not a real date. */
export function isoDate(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? '' : value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
  }
  const m = /^\s*(\d{4})[-./ ](\d{1,2})[-./ ](\d{1,2})\.?\s*$/.exec(String(value));
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return '';
  return m[1] + '-' + pad(mo) + '-' + pad(d);
}

/** 'YYYY-MM-DD' → a local Date at midnight, or null. */
export function dateOf(value) {
  const iso = isoDate(value);
  if (!iso) return null;
  return new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** Date or text → 'HH:mm' (or 'HH:mm:ss' when seconds are given), or '' when it is not a time. */
export function isoTime(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date) return isNaN(value.getTime()) ? '' : pad(value.getHours()) + ':' + pad(value.getMinutes());
  const m = /^\s*(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?\s*$/.exec(String(value));
  if (!m) return '';
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] == null ? null : Number(m[3]);
  if (h > 23 || mi > 59 || (s != null && s > 59)) return '';
  return pad(h) + ':' + pad(mi) + (s == null ? '' : ':' + pad(s));
}
