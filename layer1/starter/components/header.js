// SPDX-License-Identifier: Apache-2.0
// Top bar: navigation, favorites count (from the store) and the current page.
// 상단 바: 내비게이션, 즐겨찾기 수(store), 현재 페이지 표시.
import vf from '../lib/vf.js';
import { app } from '../store.js';

export function createHeader(router) {
  let unsubscribe = null;
  return vf.vfunc({
    tag: 'header',
    state: { path: '/', favorites: app.get('favorites').length },
    render: (s) => {
      const link = (path, key) => vf.html`<a class="header__link" data-link href="${router.href(path)}"
        aria-current="${s.path === path ? 'page' : 'false'}">${vf.t(key)}</a>`;
      return vf.html`
        <div class="header">
          <a class="header__brand" data-link href="${router.href('/')}">${vf.t('app.name')}</a>
          <nav class="header__nav" aria-label="${vf.t('nav.label')}">
            ${link('/', 'nav.home')}${link('/items', 'nav.items')}${link('/settings', 'nav.settings')}
          </nav>
          <span class="header__meta" data-ref="favorites">${vf.t('nav.favorites', { count: s.favorites })}</span>
        </div>`;
    },
    onMount: (inst) => { unsubscribe = app.subscribe((state) => inst.setState({ favorites: state.favorites.length })); },
    onDestroy: () => { if (unsubscribe) unsubscribe(); }
  });
}
