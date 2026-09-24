// SPDX-License-Identifier: Apache-2.0
// The top bar: follows the cart store and marks the current page.
// 상단 바: cart store를 구독하고 현재 페이지를 표시합니다.
import vf from '../../../dist/vfunc.esm.js';
import { cart, cartCount } from '../store.js';

export function createHeader(router) {
  let unsubscribe = null;
  return vf.vfunc({
    tag: 'header',
    state: { count: cartCount(cart.get()), path: '/' },
    render: (s) => {
      const link = (path, label) => vf.html`<a class="topbar__link" data-link href="${router.href(path)}"
        aria-current="${s.path === path || (path !== '/' && s.path.indexOf(path) === 0) ? 'page' : 'false'}">${label}</a>`;
      return vf.html`
        <div class="topbar">
          <a class="topbar__brand" data-link href="${router.href('/')}">vfunc shop</a>
          <nav class="topbar__nav" aria-label="Main">
            ${link('/', 'Home')}${link('/products', 'Products')}
            <a class="topbar__link" data-link href="${router.href('/cart')}"
               aria-current="${s.path === '/cart' ? 'page' : 'false'}">Cart <span class="badge" data-ref="count">${s.count}</span></a>
          </nav>
          <a class="topbar__link" href="../">← examples</a>
        </div>`;
    },
    onMount: (inst) => { unsubscribe = cart.subscribe((state) => inst.setState({ count: cartCount(state) })); },
    onDestroy: () => { if (unsubscribe) unsubscribe(); }
  });
}
