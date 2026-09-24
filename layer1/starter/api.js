// SPDX-License-Identifier: Apache-2.0
// Every server call lives here. Replace the local JSON with your API.
// URLs are resolved from this module (import.meta.url), so they still work inside a version folder.
// 모든 서버 호출은 여기에 둡니다. 주소는 이 모듈 기준이라 버전 폴더 안에서도 맞습니다.

const DATA = new URL('./data/items.json', import.meta.url);

let cache = null;

export async function listItems() {
  if (!cache) {
    const response = await fetch(DATA, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    cache = await response.json();
  }
  return cache.slice();
}

/** Sessions use HttpOnly cookies: send them with `credentials: 'same-origin'`, never store tokens in JS. */
export async function saveItem(item) {
  // Replace with: fetch('/api/items', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
  const list = await listItems();
  cache = list.concat(item);
  return item;
}

export function localesUrl(locale) {
  return new URL('./locales/' + locale + '.json', import.meta.url);
}
