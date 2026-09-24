# vfunc.js anti-patterns

**How to use.** Give this list to your AI together with `llms.txt`, or use it as a review checklist. Each item says what to do instead.

---

## Security
1. **Building HTML with strings** — `'<li>' + name + '</li>'`, `el.innerHTML = data`. → `vf.html\`<li>${name}</li>\``.
2. **`vf.unsafeHtml` on data** — anything that came from a user, a server or a URL. → `vf.html`; `unsafeHtml` only for markup written in the repo, with a comment.
3. **Interpolating into handlers or scripts** — `onclick="${fn}"`, `<script>var x = ${json}</script>`. → `data-action` + `delegates`; pass data through state or `data-*` attributes.
4. **Unquoted attributes** — `class=${x}`. → `class="${x}"`.
5. **`eval`, `new Function`, `setTimeout('code')`**. → real functions.
6. **Trusting client routes for permissions** — hiding an admin page is not protection. → check on the server.
7. **Secrets in the frontend** — API keys, tokens in `store` or `localStorage`, logging form values. → HttpOnly cookies, server-side keys, `skipPassword`.
8. **Inline scripts or styles on CSP pages** — `<script>…</script>`, `style="…"`. → files.
9. **Unpinned CDN files** — `vfunc@1`, no `integrity`. → exact version + SRI.

## Structure
10. **Monkeypatching** — changing `Event.prototype`, `Element.prototype`, or `vf.*` members. → `vf.use` plugins under `vf.ext`.
11. **Editing vfunc files** in `lib/`. → extend through the public API; report bugs upstream.
12. **One instance per list row**. → one component for the list and one delegated listener (`closest('[data-id]')`).
13. **Re-rendering an outer container's `innerHTML` by hand** (wipes children, listeners and third-party widgets). → `setState` / `refresh`, `childs` slots, `data-vf-keep`.
14. **Creating third-party widgets in `render`**. → `onMount` + `data-vf-keep`, release in `onDestroy`.
15. **Forgetting cleanup** — store subscriptions, timers, window listeners of a page that was left. → `onDestroy`.
16. **`setState` on every keystroke** for plain inputs. → store the value; render on submit or blur.
17. **Components that use `vf.t` created before `vf.i18n.setup()` resolved**. → create them inside `setup().then(…)`.
18. **Auto-sensing helpers** that return a string or an instance depending on arguments. → separate functions with one return type.
19. **Dead code** — commented-out blocks, unused helpers. → delete; git keeps the history.

## Design
20. **Selectors on CSS classes** — `delegates: [{ selector: '.btn-save' }]`. → `data-action="save"`.
21. **Colors, fonts or spacing in JS** — `el.style.color = '#f00'`. → `data-state` / `aria-*` + CSS with tokens.
22. **Raw values in component CSS** — `color: #2563eb`. → `var(--vf-color-primary)`; raw values only in `tokens.css`.
23. **Changing logic during a design task**. → CSS and tokens only; report needed markup changes as a separate "structure change".
24. **State as class toggles in vfunc markup** — `class="${on ? 'is-on' : ''}"`. → `aria-pressed` / `data-state` (frameworks such as Bootstrap that require classes are the exception; keep behaviour off those classes).

## Delivery
25. **Caching `index.html`**, forgetting `version.json`, or adding a Service Worker by default. → `no-cache` headers, bump on every release, SW only by decision.
26. **Modern syntax in IE11 app code**. → ES5 + `vf.tpl` + `vfunc.legacy.min.js`.
