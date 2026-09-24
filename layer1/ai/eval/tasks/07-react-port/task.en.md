### Port a React component

`SOURCE`: `ProductFilter.jsx` and `ProductFilter.css` below (reference files; they are not in the project). Rewrite the component with vfunc.js as a page of its own: `index.html`, `app.js` and a CSS file. The data file `data/products.json` is in the project (products `{ id, name, category, price, stock }`).

Keep every behaviour of the source: loading and error states, search while typing (case-insensitive, by name), category, "In stock only", the three sort orders, the count, the empty message, the "Sold out" badge and USD prices (`$49.00`). The app has one language: keep the English texts of the source (no i18n setup). The CSS uses tokens instead of the raw values.

Hooks the grader uses:

| Element | Hook |
|---|---|
| loading / error message | `data-ref="status"` (texts of the source) |
| search input | `data-action="search"`; keeps the focus while typing |
| category select | `data-action="category"` (values `all`, `keyboard`, `mouse`, `monitor`) |
| "In stock only" checkbox | `data-action="in-stock"` |
| sort select | `data-action="sort"` (values `name`, `price-asc`, `price-desc`) |
| count | `data-ref="count"` (`1 product`, `4 products`) |
| list | `data-ref="list"`; each product is one element with `data-id` = product id and `data-state="in"` or `"out"` (stock 0) |
| in each product | name `data-ref="name"`, price `data-ref="price"`, the badge text `Sold out` only when out of stock |
| empty message | `data-ref="empty"` (`No products found.`), absent or hidden when there are products |
