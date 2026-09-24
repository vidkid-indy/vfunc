Reference answer for the grader tests (not part of any bundle).

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'">
  <title>Status board</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./lib/vfunc.tokens.css">
  <link rel="stylesheet" href="./styles/app.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

### app.js

```js
// Layout, router and page switching: the only place that knows every page.
import vf from './lib/vfunc.esm.js';
import { createHeader } from './components/header.js';
import homePage from './pages/home.js';
import serversPage from './pages/servers.js';
import serverPage from './pages/server.js';
import notFoundPage from './pages/not-found.js';

await vf.i18n.setup({
  locales: ['en', 'ko'],
  fallback: 'en',
  load: (locale) => fetch(new URL('./locales/' + locale + '.json', import.meta.url)).then((r) => r.json()),
  persist: true
});

const layout = vf.vfunc({
  innerHTML: '<div class="shell"><div id="top"></div><main class="shell__view" id="view" tabindex="-1"></main></div>',
  replaceRoot: true
});
layout.mount('#app');

let page = null;
function show(next) {
  if (page) page.destroy();
  page = next;
  page.mount(layout.ids.view);
}

const router = vf.router({
  mode: 'hash',
  routes: {
    '/': (ctx) => show(homePage(ctx, router)),
    '/servers': (ctx) => show(serversPage(ctx, router)),
    '/servers/:id': (ctx) => show(serverPage(ctx, router))
  },
  notFound: (ctx) => show(notFoundPage(ctx, router)),
  onChange: (ctx) => header.setState({ path: ctx.path }),
  focus: '#view'
});

const header = createHeader(router);
header.mount(layout.ids.top);

vf.i18n.subscribe((locale) => {
  header.setState({ locale: locale });
  if (page) page.refresh();
});

router.start();
```

### store.js

```js
// Shared state and the only functions that change it.
import vf from './lib/vfunc.esm.js';

export const store = vf.store({ favorites: [] });

export const isFavorite = (id) => store.get('favorites').indexOf(id) >= 0;

export function toggleFavorite(id) {
  store.set((s) => ({
    favorites: s.favorites.indexOf(id) >= 0 ? s.favorites.filter((x) => x !== id) : s.favorites.concat(id)
  }));
}
```

### api.js

```js
// Every server call.
export async function getServers() {
  const response = await fetch(new URL('./data/servers.json', import.meta.url));
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}
```

### components/header.js

```js
import vf from '../lib/vfunc.esm.js';
import { store } from '../store.js';

export function createHeader(router) {
  let off = null;
  return vf.vfunc({
    tag: 'header',
    state: { path: '/', count: store.get('favorites').length, locale: vf.i18n.locale() },
    render: (s) => {
      const onServers = s.path.indexOf('/servers') === 0;
      return vf.html`
        <nav class="header__nav">
          <a class="header__link" data-link href="${router.href('/')}" aria-current="${s.path === '/' ? 'page' : 'false'}">${vf.t('nav.home')}</a>
          <a class="header__link" data-link href="${router.href('/servers')}" aria-current="${onServers ? 'page' : 'false'}">${vf.t('nav.servers')}</a>
        </nav>
        <p class="header__favorites">${vf.t('favorites.label')}: <span data-ref="fav-count">${s.count}</span></p>
        <div class="header__locales" role="group" aria-label="Language">
          <button class="header__locale" type="button" data-action="locale" data-locale="en" aria-pressed="${s.locale === 'en'}">English</button>
          <button class="header__locale" type="button" data-action="locale" data-locale="ko" aria-pressed="${s.locale === 'ko'}">한국어</button>
        </div>`;
    },
    delegates: [{ selector: '[data-action="locale"]', eventType: 'click', onEvent: (e) => vf.i18n.set(e.target.getAttribute('data-locale')) }],
    onMount: (inst) => { off = store.subscribe((st) => inst.setState({ count: st.favorites.length })); },
    onDestroy: () => { if (off) off(); }
  });
}
```

### pages/home.js

```js
import vf from '../lib/vfunc.esm.js';

export default function homePage() {
  return vf.vfunc({
    render: () => vf.html`
      <section class="page">
        <h1 class="page__title">${vf.t('home.title')}</h1>
        <p class="page__intro">${vf.t('home.intro')}</p>
      </section>`
  });
}
```

### pages/servers.js

```js
import vf from '../lib/vfunc.esm.js';
import { getServers } from '../api.js';

export default function serversPage(ctx, router) {
  return vf.vfunc({
    state: { status: 'loading', items: [] },
    render: (s) => vf.html`
      <section class="page">
        <h1 class="page__title">${vf.t('servers.title')}</h1>
        ${s.status === 'loading' ? vf.html`<p class="page__note" role="status">${vf.t('servers.loading')}</p>` : ''}
        ${s.status === 'error' ? vf.html`<p class="page__note" role="alert" data-state="error">${vf.t('servers.error')}</p>` : ''}
        ${s.status === 'ready' && s.items.length === 0 ? vf.html`<p class="page__note">${vf.t('servers.empty')}</p>` : ''}
        <ul class="servers">${s.items.map((x) => vf.html`
          <li class="servers__item" data-id="${x.id}"><a data-link href="${router.href('/servers/' + encodeURIComponent(x.id))}">${x.name}</a></li>`)}</ul>
      </section>`,
    onMount: async (inst) => {
      try {
        inst.setState({ status: 'ready', items: await getServers() });
      } catch (err) {
        inst.setState({ status: 'error' });
      }
    }
  });
}
```

### pages/server.js

```js
import vf from '../lib/vfunc.esm.js';
import { getServers } from '../api.js';
import { store, isFavorite, toggleFavorite } from '../store.js';

export default function serverPage(ctx) {
  let off = null;
  return vf.vfunc({
    state: { status: 'loading', server: null },
    render: (s) => {
      if (s.status === 'loading') return vf.html`<section class="page"><p class="page__note" role="status">${vf.t('servers.loading')}</p></section>`;
      if (s.status === 'error') return vf.html`<section class="page"><p class="page__note" role="alert">${vf.t('servers.error')}</p></section>`;
      if (!s.server) return vf.html`<section class="page"><h1 class="page__title">${vf.t('server.missing')}</h1></section>`;
      const fav = isFavorite(s.server.id);
      return vf.html`
        <section class="page">
          <h1 class="page__title">${s.server.name}</h1>
          <p class="page__intro">${s.server.region}</p>
          <button class="page__button" type="button" data-action="favorite" aria-pressed="${fav}">${vf.t(fav ? 'server.favorite.remove' : 'server.favorite.add')}</button>
        </section>`;
    },
    delegates: [{ selector: '[data-action="favorite"]', eventType: 'click', onEvent: (e) => toggleFavorite(e.sender.state.server.id) }],
    onMount: async (inst) => {
      off = store.subscribe(() => inst.refresh());
      try {
        const all = await getServers();
        inst.setState({ status: 'ready', server: all.filter((x) => x.id === ctx.params.id)[0] || null });
      } catch (err) {
        inst.setState({ status: 'error' });
      }
    },
    onDestroy: () => { if (off) off(); }
  });
}
```

### pages/not-found.js

```js
import vf from '../lib/vfunc.esm.js';

export default function notFoundPage() {
  return vf.vfunc({
    render: () => vf.html`<section class="page"><h1 class="page__title">${vf.t('notFound.title')}</h1></section>`
  });
}
```

### locales/en.json

```json
{
  "nav": { "home": "Home", "servers": "Servers" },
  "favorites": { "label": "Favorites" },
  "home": { "title": "Status board", "intro": "Watch your servers in one place." },
  "servers": { "title": "Servers", "loading": "Loading…", "error": "Could not load servers.", "empty": "No servers yet." },
  "server": { "favorite": { "add": "Add to favorites", "remove": "Remove from favorites" }, "missing": "Server not found" },
  "notFound": { "title": "Page not found" }
}
```

### locales/ko.json

```json
{
  "nav": { "home": "홈", "servers": "서버" },
  "favorites": { "label": "즐겨찾기" },
  "home": { "title": "상태 보드", "intro": "서버를 한곳에서 살펴봅니다." },
  "servers": { "title": "서버 목록", "loading": "불러오는 중…", "error": "서버 목록을 불러오지 못했습니다.", "empty": "아직 서버가 없습니다." },
  "server": { "favorite": { "add": "즐겨찾기에 추가", "remove": "즐겨찾기에서 빼기" }, "missing": "서버를 찾을 수 없습니다" },
  "notFound": { "title": "페이지를 찾을 수 없습니다" }
}
```

### styles/app.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.shell { max-width: 48rem; margin: 0 auto; padding: var(--vf-space-4); }
.shell__view:focus { outline: none; }
.header__nav, .header__locales { display: flex; gap: var(--vf-space-3); }
.header__link[aria-current="page"] { font-weight: var(--vf-font-weight-strong); }
.header__locale[aria-pressed="true"] { background: var(--vf-color-primary-soft); }
.page__title { font-size: var(--vf-font-size-2xl); }
.page__note { color: var(--vf-color-text-muted); }
.page__note[data-state="error"] { color: var(--vf-color-danger-text); }
.servers { list-style: none; padding: 0; }
.page__button[aria-pressed="true"] { background: var(--vf-color-primary); color: var(--vf-color-on-primary); }
```

### REPORT.md

Reference solution.
