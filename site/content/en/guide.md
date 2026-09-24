# Core concepts

## Components

`vf.vfunc(options)` creates a component, with or without `new`.

```js
const box = vf.vfunc({
  tag: 'section',                         // root element, default 'div'
  state: { open: false },                 // state
  render: (s) => vf.html`<button type="button" data-action="toggle"
    aria-expanded="${s.open ? 'true' : 'false'}">Details</button>
    ${s.open ? vf.html`<p data-ref="body">More text</p>` : ''}`,
  methods: { close() { this.open = false; } },
  delegates: [{ selector: '[data-action="toggle"]', eventType: 'click',
                onEvent: (e) => { e.sender.open = !e.sender.open; } }]
});
box.mount('#app');
```

- **State**: `box.open` is `box.state.open`. Assigning it or calling `setState({…})` schedules a render; changes in the same tick render once.
- **Methods** are bound to the instance: call `box.close()`, or pass it around as a callback.
- **Elements**: `data-ref="body"` → `box.refs.body`, `id="save"` → `box.ids.save`.

## Events

| Kind | Use for |
|---|---|
| `delegates: [{ selector, eventType, onEvent }]` | one listener on the root, matched with `closest(selector)` inside the root — one for every row of a list |
| `events: [{ id, eventType, onEvent }]` | directly on one element (scroll, focus) |

The event object is `{ sender, event, eventType, target, id, data }`. **Hang selectors on `data-action`, `data-ref` or `id` only.** Selectors on CSS classes break when the design changes.

## Existing HTML — `vf.attach`

The core idea of vfunc: keep the publisher's HTML and add behaviour.

```js
// Without render: adopt the element as it is (markup, typed values and styles stay)
vf.attach('#search', {
  delegates: [{ selector: '[data-action="search"]', eventType: 'submit',
                onEvent: (e) => { e.event.preventDefault(); run(vf.form.values(e.sender.$node)); } }]
});

// With render: the element stays, render fills its inside (areas that change with data)
const results = vf.attach('#results', { state: { items: [] }, render: (s) => vf.html`…` });
```

## Safe HTML — `vf.html`

`vf.html` looks at **where** each value lands.

| Position | Handling |
|---|---|
| element content `<p>${x}</p>` | HTML-escaped; arrays joined; `vf.html` results inserted as markup |
| quoted attribute `title="${x}"` | escaped; `false`/`null` empty, but `aria-*`/`data-*` keep `"true"`/`"false"` |
| URL attribute `href`, `src`, `action` … | escaped + `vf.safeUrl` (`javascript:` refused) |
| inside a tag `<button ${x}>` | bare attribute names such as `disabled` only |
| `on*` attributes, `<script>`, unquoted attributes | **refused**: the value is dropped and reported (an error with `vf.config({ strict: true })`) |

- In ES5 code without template literals, `vf.tpl('<a href="{url}">{label}</a>', data)` gives the same protection.
- `vf.unsafeHtml(markup)` is for markup **you wrote** (icon SVG), with a comment explaining why it is safe.

## Lifecycle and third-party widgets

| Hook | When | Do |
|---|---|---|
| `onMount` | right after `mount()` / `vf.attach()` put it in the page | create charts and editors, load data, subscribe |
| `onUpdate` | after every render | push the new state into widgets |
| `onDestroy` | at the start of `destroy()` | release widgets, timers, subscriptions |

Mark elements that must survive renders (a chart canvas) with `data-vf-keep="chart"`: the element is moved, not rebuilt. See [example 15](examples.md).

## Children and slots

`childs: [{ targetId: 'main', component: child }]` puts a child into the element with `id="main"`, and moves it back after every parent render so its state survives. The engine does not destroy children for you: call `child.destroy()` in the parent's `onDestroy`.

## Forms

`vf.form.values(form)` reads every input with an id as `{ id: value }` (checkboxes as booleans). `vf.form.reset(form)` clears them. Never log form values; leave passwords out with `{ skipPassword: true }` when you show them.

## Common mistakes

- Building strings without `vf.html` in `render` → nothing is escaped.
- One component per list row → use one delegated listener.
- `setState` on every keystroke → store the value, render on submit.
- Rendering table rows without `tag: 'table'` → the `<tr>` elements disappear.
- Believing client routes protect anything → check permissions on the server.
