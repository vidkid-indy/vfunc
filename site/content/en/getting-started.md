# Getting started

## Start with one file

Create an HTML file and load vfunc. There is no build step.

{{install}}

```html
<div id="app"></div>
<script src="https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/dist/vfunc.js"></script>
<script src="./app.js"></script>
```

```js
// app.js
const hello = vf.vfunc({
  state: { name: 'vfunc' },
  render: (s) => vf.html`
    <p>Hello, <strong>${s.name}</strong>!</p>
    <input id="name" value="${s.name}" data-action="rename">`,
  delegates: [{ selector: '[data-action="rename"]', eventType: 'input',
                onEvent: (e) => { e.sender.name = e.target.value; } }]
});
hello.mount('#app');
```

- Develop with `vfunc.js` (the development build): it explains mistakes in the console. In production use `vfunc.min.js` with SRI, as above.
- Use exact versions in URLs (`vfunc@@VERSION@`). Ranges such as `vfunc@1` are cached by the CDN and pick up new versions late.
- Open pages through a static server, not `file://`: `python -m http.server 8080`.

## As an ES module

```js
import vf from 'vfunc';                       // npm i vfunc
import { vfunc, html, router } from 'vfunc';  // named imports work too
```

The ES modules never create a global `window.vf`. Bundlers pick the minified file without warnings for production builds (the `production` condition in `exports`).

## Start from the starter

A copyable app with a router, shared state, Korean/English, themes and release tools.

```bash
npx degit vidkid-indy/vfunc/layer1/starter my-app
cd my-app
python -m http.server 8080
```

| Path | What |
|---|---|
| `app.js` | messages, layout, router, update plugin — one route per new screen |
| `pages/*.js` | one `(ctx, router) => component` function per screen |
| `store.js` · `api.js` | shared state and the functions that change it · every server call |
| `locales/{en,ko}.json` | messages |
| `styles/tokens.css` | design tokens (derived from `design/DESIGN.md`) |
| `AGENTS.md` | rules read by AI tools (fill in section 0) |
| `tools/release.mjs`, `deploy/` | version-folder releases and server cache settings |

## Read next

- [Core concepts](guide.md): components, state, events, existing HTML, safe HTML
- [SPA](spa.md): router, store, i18n
- [Examples](examples.md): 21 of them, each with a source link
