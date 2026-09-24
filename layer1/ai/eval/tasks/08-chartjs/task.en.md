### Chart.js inside a component

`REQUEST`: Show monthly sales as a Chart.js line chart inside `<section id="sales">`. Chart.js 4.5.1 is already loaded by `index.html` as the global `Chart` (do not change that tag). Use this data (in `app.js`):

```js
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SERIES = {
  revenue: { label: 'Revenue', values: [120, 135, 150, 142, 168, 181, 175, 190, 205, 198, 220, 236] },
  orders: { label: 'Orders', values: [30, 32, 35, 33, 40, 44, 41, 46, 50, 48, 53, 57] }
};
```

**The sales component**
- It starts with the `revenue` series and the first 6 months.
- Two buttons `data-action="series"` with `data-series="revenue"` / `"orders"` (texts `Revenue`, `Orders`) switch the series; the current one has `aria-pressed="true"`, the other `"false"`.
- A button `data-action="add-month"` (text `Add month`) shows one more month; it has the `disabled` attribute once all 12 months are shown.
- An element with `data-ref="summary"` shows `<label>: <n> months, last <value>` (for example `Revenue: 6 months, last 181`).
- The chart is drawn on `<canvas data-ref="chart">`. Its labels are the shown months, its one dataset has the series `label` and the shown values, and its line color (`borderColor`) is the value of the token `--vf-chart-1` for revenue and `--vf-chart-2` for orders.
- Updates change the existing chart: the same canvas element and the same Chart.js instance stay for the component's whole life.

**Hide and show**
- The button `data-action="toggle-chart"` in the page header hides the chart by destroying the sales component: no chart canvas and no Chart.js instance remain, and the button text becomes `Show chart`. Clicking again creates a new component in its initial state (revenue, 6 months) and the text goes back to `Hide chart`.
