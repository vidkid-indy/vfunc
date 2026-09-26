# Components

Layer 2 (`vfunc-ui`) is a set of components without classes, built on the engine. Use them where they save work and keep plain HTML everywhere else. From 1.0.0 it ships in the `vfunc` package.

## Loading

```html
<link rel="stylesheet" href="css/vfunc.tokens.css">
<link rel="stylesheet" href="css/vfunc-ui.css">

<script src="dist/vfunc.min.js"></script>
<script src="dist/vfunc-ui.min.js"></script>
<!-- when you need the grid and charts -->
<script src="dist/vfunc-ui-data.min.js"></script>
<!-- built-in Korean texts -->
<script src="dist/vfunc-ui.locale.ko.js"></script>
```

- With ES modules, `import 'vfunc/ui'` (and `import 'vfunc/ui/data'` for the grid and charts) after `import vf from 'vfunc'` adds the members to `vf`.
- IE11 uses `vfunc-ui.legacy.min.js`, `vfunc-ui-data.legacy.min.js` and `vfunc-ui.legacy.css`. `vfunc-all.legacy.min.js` holds the engine, the core and the data file in one file.

## How to use them

- `vf.vs*(props)` returns markup (SafeHtml). Put it in `vf.html` or `render` as is; it is not escaped twice.
- `vf.vf*(props)` returns an instance. Attach it with `.mount(el)` or put it in a parent component's `childs`. Callbacks receive `{ sender, event, data }`.
- Every `vs*` takes `id`, `ref` (`data-ref`), `action` (`data-action`), `className` and `describedBy`. Give a form control `label`, `hint` or `error` and it is wrapped in a linked field.
- Every string prop is escaped. Pass markup with `vf.html`.
- The slots of `vs*` (vsCard `body` and the like) take markup only. For a working component inside one, leave an empty element with an `id` and add `{ targetId, component }` to your component's `childs`. The content of vfTabs, vfAccordion, vfCarousel, vfPopover, vfModal and vfDrawer takes an instance as is and keeps it alive across re-renders.
- Delegate events on `data-action`; the `vf-*` classes are for design only.
- Built-in texts are message keys. Change them with props or `vf.i18n.add`.

```js
const save = vf.vfunc({
  render: () => vf.html`
    ${vf.vsInput({ name: 'email', type: 'email', label: 'Email', required: true })}
    ${vf.vsButton({ label: 'Save', variant: 'primary', action: 'save' })}`,
  delegates: [{ selector: '[data-action="save"]', eventType: 'click', onEvent: async () => {
    if (await confirmSave.open()) toast.show({ message: 'Saved', variant: 'success' });
  } }]
});
const confirmSave = vf.vfConfirm({ title: 'Save the changes?' });
const toast = vf.vfToast();
save.mount('#app');
```

## List

Tier is S (`vs*` only), P (`vs*` + `vf*`; the `vf*` renders with the `vs*`) or F (`vf*` only).

{{components}}

## Gallery

Try every component on one page: the [component gallery](../layer2/examples/gallery/index.html). You can switch between English and Korean; the dark theme follows your OS.

## List for AI tools

The full list with props and methods is [ai/en/components.md](../ai/en/components.md). The build generates it from the catalog and the type declarations, so it always matches the code. Give it to your AI tool together with llms.txt.

## Other libraries

AG Grid, Tabulator, Chart.js and ECharts have official adapters. For a library that is not on the list, follow [Third-party integration](third-party.md).
