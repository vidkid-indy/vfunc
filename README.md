# vfunc.js

**UI as plain functions. No build, no virtual DOM — one script file.**

[한국어](README.ko.md) · [Website](https://vidkid-indy.github.io/vfunc/en/) · [Discussions](https://github.com/vidkid-indy/vfunc/discussions)

> **Status: 1.0 release candidate (`1.0.0-rc.7`).** The 1.0 API is complete; changes before 1.0.0 come only from release-candidate feedback.

vfunc.js is a small vanilla JavaScript library for building interactive pages and single-page apps.
Its core idea: **keep your HTML as it is, and turn only the parts you need to control into vfunc components.**

- **No build step** — load one `<script>` and start. No bundler, no JSX, no transpiler. 8.8 KB min+gzip.
- **Works with published HTML** — `vf.attach` adds behavior to markup your designers or publishers already made.
- **Safe by default** — `vf.html` escapes every value by its position and refuses `on*` attributes, unquoted values and `javascript:` URLs.
- **Easy for AI to write** — a small, explicit API (`state`, `render`, `delegates`, `methods`). An `llms.txt` reference, an `AGENTS.md` template and prompts ship with the package.
- **SPA ready** — router, store, i18n and number/date formatting are included.
- **Design-independent** — logic and design are separated, so a design can be applied later by changing CSS tokens only.

## Install

Script tag (pin the exact version and keep the SRI hash):

```html
<div id="counter"></div>
<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0-rc.7/dist/vfunc.min.js"
        integrity="sha384-VcX1hu8m+g9DMkbKU9OAHkF7vifW5Iglb4xlRfgvyrGtRUPpIRsnOMxzohR4Mt5N"
        crossorigin="anonymous"></script>
<script src="app.js"></script>
```

```js
// app.js
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`<button type="button" data-action="inc">Clicked ${s.count} times</button>`,
  delegates: [{ selector: '[data-action="inc"]', eventType: 'click',
                onEvent: (e) => { e.sender.count++; } }]
});
counter.mount('#counter');
```

npm (ES module, no bundler needed in the browser either):

```bash
npm install vfunc@next
```

```js
import vf from 'vfunc';
```

| File | Use |
|---|---|
| `dist/vfunc.min.js` | Production, global `vf` |
| `dist/vfunc.js` | Development, with warnings |
| `dist/vfunc.esm.min.js`, `dist/vfunc.esm.js` | ES module |
| `dist/vfunc.legacy.min.js` | IE11 and Edge IE mode (ES5, same API) |
| `css/vfunc.tokens.css` | Optional neutral design tokens (`--vf-*`) |
| `ai/` | `llms.txt`, `llms-full.txt`, `AGENTS.md` template, prompts, design templates |

## Learn

- [Website](https://vidkid-indy.github.io/vfunc/en/) — getting started, guides, API reference, AI prompts.
- [Examples](https://vidkid-indy.github.io/vfunc/layer1/examples/) — 21 runnable samples, no build ([source](layer1/examples/)).
- [Starter](layer1/starter/) — a project skeleton with router, store, i18n, theme and version-folder deployment.
- [AI kit](layer1/ai/) — give `llms.txt` and `AGENTS.template.md` to your AI assistant.
- [Extending](EXTENDING.md) — plugins through `vf.use`, without modifying vfunc.

## Browser support

| Build | Browsers |
|---|---|
| `vfunc.min.js`, ESM | Current Chrome, Edge, Firefox and Safari (desktop and mobile). Tested in Chromium, Firefox and WebKit on every change |
| `vfunc.legacy.min.js` | Internet Explorer 11 and Edge IE mode. Your app code must be ES5 as well |

## Layers

| Layer | Contents | Status |
|---|---|---|
| layer1 | The engine `vf.vfunc` and helpers (`attach`, `html`, `router`, `store`, `i18n`, `fmt`) | 1.0 release candidate |
| layer2 | Class-free components (`vs*` returns a string, `vf*` returns an instance), grid, chart, third-party adapters | Planned |
| layer3 | Class-based framework (`VClass`) and tools | Planned |

## Contributing and security

- [CONTRIBUTING.md](CONTRIBUTING.md) — contributions are accepted under the DCO (`Signed-off-by`).
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md) — report vulnerabilities privately, not in public issues.

## License

[Apache License 2.0](LICENSE). If you redistribute vfunc.js, keep the header comment in the distributed files and the [NOTICE](NOTICE) file.
