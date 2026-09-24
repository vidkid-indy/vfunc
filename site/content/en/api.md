# API reference

The public API is exactly what `types/vfunc.d.ts` declares. Members starting with `_` are internal. Official `vf` members are read-only.

## Components

### `vf.vfunc(options)`
Creates a component (`new` optional). Options:

| Option | Meaning |
|---|---|
| `tag` | root tag, default `'div'`; `'table'` when rendering table rows |
| `opts` | root element properties; `innerHTML` · `outerHTML` · `srcdoc` and string `on*` refused, URLs through `safeUrl` |
| `innerHTML` | fixed markup when there is no `render` (trusted as is) |
| `render(state)` | markup for the current state, written with `vf.html`; `this` is the instance |
| `replaceRoot` | `false` (default): the root is a `tag` element (for `vf.attach`, the target itself) and the markup is its inside; `true`: the first element of the markup is the root |
| `state`, `methods` | state and methods; also reachable as `inst.key`, `inst.method()` |
| `events` | `[{ id?, eventType, onEvent? }]` direct listeners on the element with that `id` inside the root, or on the root when `id` is omitted |
| `delegates` | `[{ selector, eventType, onEvent? }]` delegated listeners |
| `childs` | child instances or nodes, `{ targetId, component }` slots |
| `onEvent`, `onError` | fallback handler, error report (the engine does not recover) |
| `onMount`, `onUpdate`, `onDestroy` | lifecycle |

Instance: `$node`, `state`, `methods`, `ids`, `refs`, `setState(patch | (state) => patch)` (shallow merge, one render per tick), `scheduleRefresh()`, `refresh()`, `mount(parent)` → `Promise`, `destroy()`, `toString()`. Reserved names (`state`, `refresh`, `mount` … and names starting with `_`) cannot be used as shortcut names for state keys, methods or ids. Do not add your own properties to an instance; keep listener functions and timers in a closure.

### `vf.attach(target, options)`
Turns an element already in the page into a component. The options are those of `vf.vfunc`. The element is the root and keeps its attributes and listeners. Without `render` its markup and typed values stay as they are. With `render`, return **only the inside** of the element; it is parsed as content of the element's own tag, so rows can go straight into a `<tbody>`. Set state-dependent attributes of the root in `onMount`/`onUpdate`. `replaceRoot: true` replaces the element with the first element of the markup. Returns `null` when the target is missing. `destroy()` keeps the element in the page, releases the listeners and removes only what `render`/`innerHTML` drew, so the element can be attached again.

## Safe HTML

### `vf.html`
Tagged template. Escapes each value for its position and refuses dangerous ones (`on*`, `<script>`, unquoted attributes). In a quoted attribute `null` and `undefined` become an empty value, arrays are joined with spaces, and `false` is empty too — except in `aria-*` and `data-*`, where booleans stay `"true"`/`"false"` (`aria-selected="${on}"`). Returns `SafeHtml`. In ES5 it can be called as a function: `vf.html(['<b>', '</b>'], value)`.

### `vf.tpl(template, data)`
Fills `{key}` and `{user.name}` from own properties of `data`, without template literals. Same protection as `vf.html`.

### `vf.unsafeHtml(markup)`
Marks markup as trusted. Only for markup you wrote, with a comment explaining why.

### `vf.esc(value)`
A string with `& < > " '` escaped.

### `vf.nl2br(value)`
Escapes and turns line breaks into `<br>`; returns `SafeHtml`.

### `vf.safeUrl(url)`
Keeps relative URLs and `http` · `https` · `mailto` · `tel`; any other scheme becomes `'#'`.

### `vf.SafeHtml`
The constructor of `vf.html` results (`value instanceof vf.SafeHtml`).

### `vf.config(options)`
`{ strict, strictRender }`. With `strict: true` unsafe interpolation throws. `strictRender` warns (development build) when render returns a plain string.

## DOM and forms

### `vf.$(selector, root?)`
`querySelector`.

### `vf.$$(selector, root?)`
`querySelectorAll` as an array.

### `vf.el(tag, props?)`
Creates an element and assigns properties with the same safety rules as `opts`.

### `vf.node(markup)`
The first element of the markup, trusted as is. Parsed inside a `<div>`, so not for table rows.

### `vf.frag(markup)`
A DocumentFragment with every top-level node.

### `vf.idMap(root)`
`{ id: element }` for every descendant with an id.

### `vf.form`
`vf.form.values(target, { skipPassword? })` returns `{ id: value }` (checkboxes as booleans, multiple selects as arrays); `vf.form.reset(target)` clears the controls and returns the values.

## SPA

### `vf.router(options)`
`{ mode: 'hash' | 'history', base, routes, notFound, onChange, linkSelector, focus }` → `start()`, `stop()`, `go(path, { replace })`, `replace(path)`, `current()`, `href(path)`. Follows only app paths starting with `/`.

### `vf.store(initial)`
`get(key?)` (the whole state without a key), `set(patch | (state) => patch)` (shallow merge: other keys stay; one notification per tick), `subscribe(fn)` (receives the new state) → an unsubscribe function.

## i18n

### `vf.i18n`
`setup({ locale, fallback, locales, messages, load, persist })` → `Promise<locale>`, `set(locale)`, `locale()`, `add(locale, messages)`, `subscribe(fn)`, `apply(root?)`.

### `vf.t(key, params?)`
A message as plain text: `{name}` placeholders, plural forms chosen by `params.count`. `vf.t('nav.home')` finds `{ "nav": { "home": "…" } }` and `{ "nav.home": "…" }` alike.

### `vf.fmt`
`number(n, opts)`, `currency(n, code, opts)`, `date(d, opts)`, `relative(n, unit)`, with `Intl` in the current locale, or plain strings without it.

## Extensions

### `vf.use(plugin, options?)`
Installs `{ name, version?, requires?, install(vf, options) }` and stores what `install` returns in `vf.ext[name]`.

### `vf.ext`
Installed extensions. User extensions live here only.

### `vf.version`
The build version (for example `@VERSION@`); `0.0.0-dev` when the source is imported directly.

## Official plugin

`vfunc/plugins/update` (`dist/plugins/update.min.js` → global `vfUpdate`): `vf.use(vfUpdate, { url, current, policy, interval, minGap, onAvailable, onError })` → `check(force)`, `status()`, `navigated()`, `apply()`, `stop()`. See [Extensions](extend.md#official-plugin-vfextupdate).
