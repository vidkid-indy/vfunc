// SPDX-License-Identifier: Apache-2.0
// 10 spa-app — app.js defines the whole app: layout, router and page switching.
// app.js가 앱 전체를 정의합니다: 레이아웃, 라우터, 페이지 전환. 공용 상태는 store.js에 있습니다.
//
//   index.html        only <div id="app"> and this script
//   app.js            layout + router (this file)
//   store.js          shared state (vf.store) and the functions that change it
//   api.js            data access
//   components/       reusable parts (header)
//   pages/*.js        one function per screen: (ctx, router) => component
import vf from '../../dist/vfunc.esm.js';
import { createHeader } from './components/header.js';
import homePage from './pages/home.js';
import productsPage from './pages/products.js';
import productPage from './pages/product.js';
import cartPage from './pages/cart.js';
import notFoundPage from './pages/not-found.js';

// 1) Layout: fixed markup with two slots. / 레이아웃: 슬롯 두 개가 있는 고정 마크업
const layout = vf.vfunc({
  innerHTML: '<div class="shell"><div id="top"></div><main class="view" id="view" tabindex="-1"></main></div>',
  replaceRoot: true
});
layout.mount('#app');

// 2) Router. Pages get (ctx, router). / 라우터. 페이지는 (ctx, router)를 받습니다.
let page = null;
const router = vf.router({
  mode: 'hash',
  routes: {
    '/': (ctx) => show(homePage(ctx, router)),
    '/products': (ctx) => show(productsPage(ctx, router)),
    '/products/:id': (ctx) => show(productPage(ctx, router)),
    '/cart': (ctx) => show(cartPage(ctx, router))
  },
  notFound: (ctx) => show(notFoundPage(ctx, router)),
  onChange: (ctx) => {
    header.setState({ path: ctx.path });
    document.title = (ctx.route || 'Not found') + ' — 10 spa-app';
  },
  focus: '#view'
});

function show(next) {
  if (page) page.destroy();   // releases the old page's listeners and subscriptions
  page = next;
  page.mount(layout.ids.view); // mount() → the page's onMount runs (data loading)
}

// 3) Header: mounted directly (not as a `childs` entry) so that its onMount subscribes to the store.
// 헤더는 childs가 아니라 직접 mount합니다. 그래야 onMount에서 store를 구독합니다.
const header = createHeader(router);
header.mount(layout.ids.top);

router.start();
