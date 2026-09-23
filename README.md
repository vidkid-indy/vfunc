# vfunc.js

**UI as plain functions. No build, no virtual DOM — one script file.**

[한국어](README.ko.md)

> **Status: in development (Phase 0).** The first public release (1.0) is being prepared. The API described here is planned and may change until 1.0.

vfunc.js is a small vanilla JavaScript library for building interactive pages and single-page apps.
Its core idea: **keep your HTML as it is, and turn only the parts you need to control into vfunc components.**

- **No build step** — load one `<script>` and start. No bundler, no JSX, no transpiler.
- **Works with published HTML** — attach behavior to markup your designers or publishers already made.
- **Easy for AI to write** — a small, explicit API (`state`, `render`, `delegates`, `methods`) that language models generate correctly. Prompts and an `llms.txt` reference ship with the project.
- **SPA ready** — a tiny router, store, and i18n are included.
- **Design-independent** — logic and design are separated, so a design can be applied later by changing CSS tokens only.

## Planned usage

```html
<div id="counter"></div>
<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0/dist/vfunc.min.js"
        integrity="sha384-..." crossorigin="anonymous"></script>
<script src="app.js"></script>
```

```js
// app.js
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`<button data-action="inc">Clicked ${s.count} times</button>`,
  delegates: [{ selector: '[data-action="inc"]', eventType: 'click',
                onEvent: (e) => e.sender.setState({ count: e.sender.state.count + 1 }) }]
});
counter.mount(document.getElementById('counter'));
```

## Layers

| Layer | Contents | Status |
|---|---|---|
| layer1 | The engine `vf.vfunc` and helpers (`attach`, `html`, `router`, `store`, `i18n`) | In development |
| layer2 | Class-free components (`vs*` returns a string, `vf*` returns an instance), grid, chart, third-party adapters | Planned |
| layer3 | Class-based framework (`VClass`) and tools | Planned |

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. A separate legacy build (`vfunc.legacy.min.js`) is planned for Internet Explorer 11 and Edge IE mode.

## Contributing and security

- [CONTRIBUTING.md](CONTRIBUTING.md) — contributions are accepted under the DCO (`Signed-off-by`).
- [EXTENDING.md](EXTENDING.md) — how to extend vfunc without modifying it.
- [SECURITY.md](SECURITY.md) — report vulnerabilities privately, not in public issues.

## License

[Apache License 2.0](LICENSE). If you redistribute vfunc.js, keep the header comment in the distributed files and the [NOTICE](NOTICE) file.
