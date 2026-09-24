# Extensions, plugins, IE

## Extension rules

Extend vfunc through its public API, never by editing its source. Then your extensions keep working when vfunc is updated.

| Level | How |
|---|---|
| Settings | `vf.config({ strict: true })`, messages, tokens |
| Styles | override `--vf-*` after the token file |
| Composition | functions that create components, `childs` |
| Third-party | `onMount` + `data-vf-keep` + `onDestroy` |
| Plugins | `vf.use(plugin)` → `vf.ext.<name>` |

- Official `vf.*` members are read-only, and extensions do not add members to the `vf` root.
- Never patch native prototypes (`Event.prototype` and the like).

## Plugins — `vf.use`

```js
vf.use({
  name: 'company', version: '1.0.0', requires: '^1.0.0',
  install(vf, options) { return { toast: (message) => { /* … */ } }; }
}, { duration: 3000 });
vf.ext.company.toast('saved');
```

## Official plugin — `vf.ext.update`

Brings new releases to places without a reload button (web views, kiosks, installed PWAs, in-app browsers).

```js
import vfUpdate from 'vfunc/plugins/update';     // <script>: dist/plugins/update.min.js → global vfUpdate
vf.use(vfUpdate, { url: './version.json', current: APP_VERSION, policy: 'next-navigation' });
```

| Policy | Behaviour |
|---|---|
| `next-navigation` (default) | replace on the next screen change; nothing in progress is lost |
| `prompt` | `onAvailable(info, apply)` lets the app show its own notice; replace when the user agrees |
| `immediate` | replace at once (security fixes) |

See [Deployment and cache](deploy.md) for the rest.

## IE11 / Edge IE mode

One engine, several files. `vfunc.legacy.min.js` is transpiled to ES5 with a single Promise polyfill (about 10 KB gzip).

- **Your app code must be ES5 too**: no arrow functions, `const`/`let`, template literals or classes. Build markup with `vf.tpl('<b>{name}</b>', data)`.
- Use the `hash` router mode and plain CSS values (IE11 has no CSS variables).
- Polyfill anything else your app needs (`fetch`, `Object.assign`, …) yourself.
- Public sites use `<script type="module">` together with `<script nomodule>`. Open example 16 in Edge IE mode to check.
