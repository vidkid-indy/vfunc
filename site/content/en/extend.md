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

## Official plugin — `vf.ext.list`

A keyed list. A component's `render` redraws its whole inside, which is slow for long lists where a few rows change often (update, swap, remove). This plugin keeps one element per item, draws only the rows that changed and only moves rows when the order changes. The numbers are in the [FAQ](faq.md#how-slow-are-large-lists).

```js
import vfList from 'vfunc/plugins/list';   // <script>: dist/plugins/list.min.js → global vfList
const list = vf.use(vfList);
const rows = list.create('#tbody', {       // the direct parent of the rows (tbody, ul, div …); nothing else in it
  key: (item) => item.id,
  render: (item) => vf.html`<tr><td>${item.name}</td><td><button type="button" data-action="remove">Remove</button></td></tr>`
});
rows.set(items);                            // same key and same object: kept; a new object: only that row is drawn
rows.set(rows.items().filter((x) => x.id !== id));   // remove: only that row goes
```

- Make a new object when an item changes. If you changed one in place, call `rows.refresh(key)`.
- Each row carries `data-vf-key`; a delegated handler finds the item with `e.target.closest('[data-vf-key]')`.
- Inside a component, mark the container with `data-vf-keep` so the component's render leaves the rows alone, create the list in `onMount` and call `rows.destroy()` in `onDestroy`. A `vf.attach` target without render works too.
- `render` returns one element built with `vf.html`. A plain string is escaped as text and does not become a row.

## IE11 / Edge IE mode

One engine, several files. `vfunc.legacy.min.js` is transpiled to ES5 with a single Promise polyfill (about 10 KB gzip).

- **Your app code must be ES5 too**: no arrow functions, `const`/`let`, template literals or classes. Build markup with `vf.tpl('<b>{name}</b>', data)`.
- Use the `hash` router mode and plain CSS values (IE11 has no CSS variables).
- Polyfill anything else your app needs (`fetch`, `Object.assign`, …) yourself.
- Public sites use `<script type="module">` together with `<script nomodule>`. Open example 16 in Edge IE mode to check.
