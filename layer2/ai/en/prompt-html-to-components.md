# Prompt: replace hand-written UI with vs* / vf* components

**How to use.** Paste everything below the line into your AI with the HTML (published markup or the `render` of your vfunc components) and its CSS. The AI should also have `llms.txt` and `ai/en/components.md` (the layer 2 component list).

---

You are replacing hand-written UI pieces of a vfunc.js app with the layer 2 components (`vf.vs*`, `vf.vf*`). The goal is less code to maintain and better keyboard and screen reader support, not a new design. Change only what a component does better; keep everything else as HTML.

## Inputs
- `HTML`: the markup, or the vfunc components that render it.
- `CSS`: the page's styles. Say whether the published look must stay exactly as it is.
- `LOCALES` (optional): the languages of the app.

## Rules
- **Use only names, props and methods that are in `components.md`.** If a piece needs something the components do not have, keep it as HTML and say so.
- **`vs*` or `vf*`:** `vs*` for markup without state (it goes into `render` or `vf.html`); `vf*` when the piece has its own state or behavior (open/close, selection, typing, paging). Never both for the same piece.
- **Replace a piece only when the component brings something:** keyboard and ARIA (tabs, menus, dialogs, carousel), linked field texts (label, hint, error), state (paging, selection), or the same markup repeated many times. A plain `<div>` or `<section>` for layout stays HTML.
- **Hooks survive:** keep every `id`, `data-ref` and `data-action` the app code uses, through the `id`, `ref` and `action` props. Delegates stay on `data-action`; never select by the `vf-*` classes.
- **Text:** pass visible text through props (escaped) or `vf.html`; do not pass HTML as a plain string. Where the app has messages, use `vf.t(...)` in the props. Built-in texts (close, cancel, pagination) come from the component's message keys.
- **Design:** the components are styled by `vfunc-ui.css` from the `--vf-*` tokens. If the published look must stay, map its colors, fonts, radius and spacing to tokens (DESIGN.md) instead of overriding `.vf-*` rules. If it must stay pixel-exact, leave that piece as HTML and attach behavior with `vf.attach` (layer 1).
- **Overlays:** a hand-written modal, confirm box, toast, dropdown or popover becomes `vfModal`, `vfConfirm` (`await confirm.open()`), `vfToast` (one region per app), `vfDropdown` or `vfPopover`. Remove the old markup, its show/hide code and its focus code.
- **Tables and charts:** a static or app-sorted table becomes `vsTable` (+ `vfPagination`, `vfSearchInput`); a table with built-in sorting, paging and selection becomes `vfGrid` (data file). A chart becomes `vfChart`; keep a vendor chart through its adapter only if the app already uses that vendor.
- **Security:** no `vf.unsafeHtml`, no inline `style` or `<script>` (CSP), URLs through the components (`href`, `src` pass `vf.safeUrl`).

## Steps
1. List the UI pieces of the input: element, what it does, the hooks the code uses.
2. For each piece, choose: a component (name and why) or HTML (why). Put this in a table first.
3. Rewrite the markup: `vs*` calls in `render`; `vf*` instances created once and put in `childs` or mounted into a container.
4. Move the behavior: callbacks (`onChange`, `onSelect` …) read `e.data`; delete the event code the components now handle.
5. Delete the CSS the components replace. Keep the page layout CSS; values become tokens.
6. Load the files: `vfunc-ui.js` (+ `vfunc-ui-data.js` for `vfGrid` / `vsChart` / `vfChart`, + `vfunc-ui.locale.ko.js` for Korean) and `vfunc-ui.css` after `vfunc.tokens.css`.
7. Check: the page works with the keyboard only, no console errors, and every `id` / `data-ref` / `data-action` the app uses still exists.

## Output format
1. The mapping table: piece → component or HTML, and the reason
2. The rewritten files, complete
3. The deleted code and CSS (a short list)
4. What stayed HTML, what you could not map, and what the user should test by hand

## Checklist
- [ ] Only names and props from `components.md`
- [ ] `vs*` for markup, `vf*` for pieces with state; never both for one piece
- [ ] Hooks (`id`, `data-ref`, `data-action`) kept; no selector on `vf-*` classes
- [ ] Text through props or `vf.html`; built-in texts left to message keys
- [ ] Old overlay, focus and show/hide code removed
- [ ] CSS the components replace removed; no raw values added
- [ ] `vfunc-ui` files loaded in order; the data file only when needed
- [ ] Keyboard only works; no console errors
