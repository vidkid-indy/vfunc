// SPDX-License-Identifier: Apache-2.0
// The app: messages, layout, router, update plugin. The only file that knows every page.
// A new screen = a file in pages/ + one route below.
// 앱 전체: 메시지, 레이아웃, 라우터, update 플러그인. 모든 페이지를 아는 유일한 파일입니다.
import vf from './lib/vf.js';
import vfUpdate from './lib/plugins/update.esm.js';
import { APP_VERSION, LOCALES, DEFAULT_LOCALE } from './config.js';
import { localesUrl } from './api.js';
import { createHeader } from './components/header.js';
import homePage from './pages/home.js';
import itemsPage from './pages/items.js';
import settingsPage from './pages/settings.js';
import notFoundPage from './pages/not-found.js';

// New releases reach users on the next screen change (web views and kiosks never reload by themselves).
// 새 버전은 다음 화면 이동 때 반영됩니다.
vf.use(vfUpdate, { url: './version.json', current: APP_VERSION, policy: 'next-navigation' });

vf.i18n.setup({
  locales: LOCALES,
  fallback: DEFAULT_LOCALE,
  load: (locale) => fetch(localesUrl(locale)).then((r) => r.json()),
  persist: 'app-locale'
}).then(start);

function start() {
  // Components render when created, so everything is created after the messages are loaded.
  // 컴포넌트는 만들 때 렌더하므로 메시지를 불러온 뒤에 만듭니다.
  const layout = vf.vfunc({
    innerHTML: '<div class="shell"><div id="top"></div><main class="shell__main" id="view" tabindex="-1"></main></div>',
    replaceRoot: true
  });
  layout.mount('#app');

  let page = null;
  let render = null; // re-creates the current page (after a language change)

  const router = vf.router({
    mode: 'hash',
    routes: {
      '/': (ctx) => show(() => homePage(ctx, router)),
      '/items': (ctx) => show(() => itemsPage(ctx, router)),
      '/settings': (ctx) => show(() => settingsPage(ctx, router))
    },
    notFound: (ctx) => show(() => notFoundPage(ctx, router)),
    onChange: (ctx) => {
      header.setState({ path: ctx.path });
      document.title = vf.t('app.name') + (ctx.route ? '' : ' — ' + vf.t('notFound.title'));
    },
    focus: '#view'
  });

  function show(create) {
    if (page) page.destroy(); // releases listeners and subscriptions of the old page
    render = create;
    page = create();
    page.mount(layout.ids.view);
  }

  // Mounted directly (not through `childs`) so that its onMount subscribes to the store.
  const header = createHeader(router);
  header.mount(layout.ids.top);

  vf.i18n.subscribe(() => {
    header.refresh();
    if (render) show(render);
  });

  router.start();
}
