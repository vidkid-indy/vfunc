# SPA: router, store, i18n

## App structure

```
index.html       <div id="app"> + <script type="module" src="app.js">
app.js           layout + router + page switching (the only place that knows every page)
store.js         vf.store and the functions that change it
api.js           every server call
pages/*.js       one (ctx, router) => component per screen
components/*.js  reusable parts
```

The [starter](getting-started.md#start-from-the-starter) and example 10 use this structure.

## Router — `vf.router`

```js
const router = vf.router({
  mode: 'hash',                                 // default: any static server, IE too
  routes: {
    '/': (ctx) => show(homePage(ctx, router)),
    '/orders/:id': (ctx) => show(orderPage(ctx.params.id, ctx.query.tab))
  },
  notFound: (ctx) => show(notFoundPage(ctx)),
  onChange: (ctx) => { document.title = ctx.route || 'Not found'; },
  focus: '#view'                                // focus after navigation (screen readers)
});
router.start();
```

- Links are ordinary `<a data-link href="${router.href('/orders/7')}">`; the router intercepts them. New windows, downloads and external addresses are left to the browser.
- `router.go(path)` accepts only app paths starting with `/`; `javascript:` or other sites are refused.
- `history` mode needs a server that returns `index.html` for every app path.
- `destroy()` the previous page when switching: its listeners and subscriptions are released.

> Client routes are not access control. Hiding an admin screen protects nothing; check permissions on the server.

## Shared state — `vf.store`

```js
export const cart = vf.store({ items: [] });
export function add(item) { cart.set((s) => ({ items: s.items.concat(item) })); }

// in a component
onMount: (inst) => { off = cart.subscribe((s) => inst.setState({ count: s.items.length })); },
onDestroy: () => off()
```

- Several `set` calls in one tick notify subscribers once.
- Change state only through the functions in `store.js`. Keep secrets such as tokens out (sessions belong in HttpOnly cookies).

## i18n — `vf.i18n`, `vf.t`, `vf.fmt`

```js
await vf.i18n.setup({
  locales: ['ko', 'en'], fallback: 'en',
  load: (l) => fetch(new URL('./locales/' + l + '.json', import.meta.url)).then((r) => r.json()),
  persist: true
});
vf.t('cart.items', { count: 3 });       // picks { zero, one, other }
vf.fmt.currency(12900, 'KRW');           // Intl formatting in the current locale
vf.i18n.apply();                         // translates data-i18n / data-i18n-attr in published HTML
```

- A locale is loaded only when it passes both the allow-list (`locales`) and a format check.
- `vf.t` returns plain text that `vf.html` escapes; `data-i18n` also inserts text only.
- **A component renders when it is created.** Create components that use `vf.t` after `setup()` resolves.
- On a locale change, re-render in `vf.i18n.subscribe(() => …)` and call `apply()` again. `<html lang>` follows automatically.
