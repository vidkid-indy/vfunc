# vfunc.js — keep your HTML, control only what you need

vfunc.js is a no-build vanilla JavaScript UI library. It renders with `innerHTML` and event delegation instead of a virtual DOM, and it can add behaviour to HTML that is already on the page. One file (about 9 KB gzip) gives you components, a router, shared state and i18n.

{{demo}}

## Three promises

### No build, no VDOM, one file
Start with one `<script>` tag. No bundler, no transpiler, no `node_modules`. The code in your browser's developer tools is exactly the code you wrote.

### A structure AI gets right
A component is a plain object: `state`, `render`, `delegates`, `methods`. There are few rules and names tell you what things are, so AI assistants have little room to go wrong. [Working with AI](ai.md) has the rules file and prompts.

### Published HTML stays as it is
Instead of rewriting a publisher's page, add behaviour with `vf.attach` **only where it is needed** — a search box, a table. This site is static HTML too; only the theme switch, copy buttons, search and the demo above are vfunc.

## At a glance

```js
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`<button type="button" data-action="inc">${s.count}</button>`,
  delegates: [{ selector: '[data-action="inc"]', eventType: 'click',
                onEvent: (e) => { e.sender.count++; } }]
});
counter.mount('#app');
```

- `vf.html` escapes each value for where it lands; `onclick="${…}"` and `javascript:` URLs are refused.
- Events hang on `data-action`, so renaming CSS classes never breaks behaviour.
- Changing state renders once per tick.

## Install

{{install}}

See [Getting started](getting-started.md) for more. An IE11 / Edge IE mode file ships as well.

## What is inside

| Feature | API |
|---|---|
| Components | `vf.vfunc`, lifecycle `onMount` · `onUpdate` · `onDestroy`, `refs`, `data-vf-keep` |
| Existing HTML | `vf.attach` |
| Safe HTML | `vf.html`, `vf.tpl` (ES5), `vf.safeUrl`, `vf.esc` |
| SPA | `vf.router` (hash and history), `vf.store` |
| i18n | `vf.i18n`, `vf.t`, `vf.fmt` |
| Extensions | `vf.use`, `vf.ext`, the official update plugin |
| Design | optional token CSS (light and dark), the `DESIGN.md` workflow |

Start right away with [21 examples](examples.md) and the [starter template](getting-started.md#start-from-the-starter).
