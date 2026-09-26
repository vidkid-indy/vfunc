# Extensions, plugins, IE

## Extension rules

Extend vfunc through its public API, never by editing its source. Then your extensions keep working when vfunc is updated.

| Level | How |
|---|---|
| Settings | `vf.config({ strict: true })`, messages, tokens |
| Styles | override `--vf-*` after the token file |
| Composition | functions that create components, `childs`, your own components around the official [components](components.md) (below) |
| Third-party | `onMount` + `data-vf-keep` + `onDestroy`; levels L0, L1, L2 in [Third-party integration](third-party.md) |
| Plugins | `vf.use(plugin)` → `vf.ext.<name>` |

- Official `vf.*` members are read-only, and extensions do not add members to the `vf` root.
- Never patch native prototypes (`Event.prototype` and the like).

## Your own components

Components you build from the official ones read like the rest of your code when they keep the layer 2 rules. Sample: `layer2/examples/custom-component`.

```js
// shop-ui.js — your module, not the vf root
export function vsPriceTag({ amount, was, currency = 'USD' }) {
  const off = was > amount ? Math.round((1 - amount / was) * 100) : 0;
  return vf.html`<span class="price-tag">${vf.fmt.currency(amount, currency)}${
    off ? vf.vsBadge({ label: '-' + off + '%', variant: 'danger' }) : ''}</span>`;
}
```

- `vs*` returns SafeHtml built with `vf.html`; `vf*` returns an instance with `getValue()` / `setValue(v)`. Callbacks receive `{ sender, event, data }`.
- Put the official `vf*` you use inside in `childs` (`{ targetId, component }`): they survive your re-renders and are destroyed with you.
- Hooks on `id`, `data-ref`, `data-action`; your own block class names (`vf-*` is ours); tokens only in CSS.
- To share them across apps, bundle them as a `vf.ext.<name>` plugin.

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

## Official plugin — `vf.ext.shortcut`

Keyboard shortcuts for the whole page. Keys typed into inputs are ignored unless you allow them, and so are keys that belong to an IME composition, so typing Korean, Japanese or Chinese never fires a shortcut.

```js
import vfShortcut from 'vfunc/plugins/shortcut';   // <script>: dist/plugins/shortcut.min.js → global vfShortcut
const keys = vf.use(vfShortcut);
const off = keys.add('mod+k', () => search.focus(), { label: 'Search' });   // mod = ⌘ on Apple devices, Ctrl elsewhere
keys.add('escape', closeDialog, { allowInInput: true });
keys.list();   // [{ combo: 'ctrl+k', label: 'Search' }, …] for your own help screen
off();         // remove one shortcut; keys.destroy() removes all
```

The newest shortcut of a combo wins, so a dialog can take `escape` while it is open and give it back with `off()`. The plugin draws no UI.

## IE11 / Edge IE mode

One engine, several files. `vfunc.legacy.min.js` is transpiled to ES5 with a single Promise polyfill (about 10 KB gzip).

- **Your app code must be ES5 too**: no arrow functions, `const`/`let`, template literals or classes. Build markup with `vf.tpl('<b>{name}</b>', data)`.
- Use the `hash` router mode and plain CSS values (IE11 has no CSS variables).
- Polyfill anything else your app needs (`fetch`, `Object.assign`, …) yourself.
- Public sites use `<script type="module">` together with `<script nomodule>`. Open example 16 in Edge IE mode to check.
