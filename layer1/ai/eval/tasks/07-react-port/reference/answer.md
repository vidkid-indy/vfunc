Reference answer for the grader tests (not part of any bundle).

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'">
  <title>Products</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./lib/vfunc.tokens.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <main class="page" id="app"></main>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

### app.js

```js
// ProductFilter, ported from React: state → state, useEffect → onMount, useMemo → computed in render.
import vf from './lib/vfunc.esm.js';

const CATEGORIES = [['all', 'All'], ['keyboard', 'Keyboards'], ['mouse', 'Mice'], ['monitor', 'Monitors']];
const SORTS = [['name', 'Name'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];
const ORDER = {
  name: (a, b) => a.name.localeCompare(b.name, 'en'),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price
};

const options = (list, current) => list.map((o) => vf.html`<option value="${o[0]}" ${current === o[0] ? 'selected' : ''}>${o[1]}</option>`);

function visibleItems(s) {
  const q = s.query.trim().toLowerCase();
  return s.items
    .filter((p) => s.category === 'all' || p.category === s.category)
    .filter((p) => !s.inStock || p.stock > 0)
    .filter((p) => !q || p.name.toLowerCase().indexOf(q) >= 0)
    .sort(ORDER[s.sort]);
}

const productFilter = vf.vfunc({
  state: { status: 'loading', items: [], query: '', category: 'all', inStock: false, sort: 'name' },
  render: (s) => {
    if (s.status === 'loading') return vf.html`<p class="pf__note" data-ref="status" role="status">Loading products…</p>`;
    if (s.status === 'error') return vf.html`<p class="pf__note" data-ref="status" data-state="error" role="alert">Could not load products.</p>`;
    const shown = visibleItems(s);
    return vf.html`
      <section class="pf">
        <div class="pf__controls">
          <label class="pf__field">Search <input class="pf__input" id="pf-search" type="search" data-action="search" value="${s.query}"></label>
          <label class="pf__field">Category <select class="pf__input" id="pf-category" data-action="category">${options(CATEGORIES, s.category)}</select></label>
          <label class="pf__check"><input id="pf-stock" type="checkbox" data-action="in-stock" ${s.inStock ? 'checked' : ''}> In stock only</label>
          <label class="pf__field">Sort <select class="pf__input" id="pf-sort" data-action="sort">${options(SORTS, s.sort)}</select></label>
        </div>
        <p class="pf__count" data-ref="count">${shown.length === 1 ? '1 product' : shown.length + ' products'}</p>
        ${shown.length === 0
          ? vf.html`<p class="pf__empty" data-ref="empty">No products found.</p>`
          : vf.html`<ul class="pf__list" data-ref="list">${shown.map((p) => vf.html`
              <li class="pf__item" data-id="${p.id}" data-state="${p.stock === 0 ? 'out' : 'in'}">
                <span class="pf__name" data-ref="name">${p.name}</span>
                <span class="pf__price" data-ref="price">${vf.fmt.currency(p.price, 'USD')}</span>
                ${p.stock === 0 ? vf.html`<span class="pf__badge">Sold out</span>` : ''}
              </li>`)}</ul>`}
      </section>`;
  },
  delegates: [
    { selector: '[data-action="search"]', eventType: 'input', onEvent: (e) => e.sender.setState({ query: e.target.value }) },
    { selector: '[data-action="category"]', eventType: 'change', onEvent: (e) => e.sender.setState({ category: e.target.value }) },
    { selector: '[data-action="in-stock"]', eventType: 'change', onEvent: (e) => e.sender.setState({ inStock: e.target.checked }) },
    { selector: '[data-action="sort"]', eventType: 'change', onEvent: (e) => e.sender.setState({ sort: e.target.value }) }
  ],
  onMount: async (inst) => {
    try {
      const response = await fetch(new URL('./data/products.json', import.meta.url));
      if (!response.ok) throw new Error('HTTP ' + response.status);
      inst.setState({ status: 'ready', items: await response.json() });
    } catch (err) {
      inst.setState({ status: 'error' });
    }
  }
});

productFilter.mount('#app');
```

### style.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.page { max-width: 44rem; margin: var(--vf-space-6) auto; padding: 0 var(--vf-space-4); }
.pf { display: grid; gap: var(--vf-space-3); }
.pf__controls { display: flex; flex-wrap: wrap; gap: var(--vf-space-3); align-items: end; }
.pf__field { display: grid; gap: var(--vf-space-1); font-size: var(--vf-font-size-sm); color: var(--vf-color-text-muted); }
.pf__input { padding: var(--vf-space-1) var(--vf-space-2); border: 1px solid var(--vf-color-border-strong); border-radius: var(--vf-radius-md); font: inherit; }
.pf__check { display: flex; gap: var(--vf-space-1); align-items: center; font-size: var(--vf-font-size-sm); }
.pf__count, .pf__note, .pf__empty { color: var(--vf-color-text-muted); }
.pf__note[data-state="error"] { color: var(--vf-color-danger-text); }
.pf__list { list-style: none; margin: 0; padding: 0; }
.pf__item { display: flex; gap: var(--vf-space-3); padding: var(--vf-space-2) 0; border-top: 1px solid var(--vf-color-border); }
.pf__item[data-state="out"] .pf__name { color: var(--vf-color-text-disabled); }
.pf__price { margin-left: auto; font-variant-numeric: tabular-nums; }
.pf__badge { padding: 0 var(--vf-space-2); border-radius: var(--vf-radius-full); background: var(--vf-color-danger-soft); color: var(--vf-color-danger-text); font-size: var(--vf-font-size-xs); }
```

### REPORT.md

Reference solution.
