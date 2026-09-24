Reference answer for the grader tests (not part of any bundle).

### app.js

```js
// Sales — the page script. Chart.js is loaded as the global `Chart`.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SERIES = {
  revenue: { label: 'Revenue', values: [120, 135, 150, 142, 168, 181, 175, 190, 205, 198, 220, 236] },
  orders: { label: 'Orders', values: [30, 32, 35, 33, 40, 44, 41, 46, 50, 48, 53, 57] }
};
const COLOR_TOKEN = { revenue: '--vf-chart-1', orders: '--vf-chart-2' };

/** Colors come from the design tokens at run time. */
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function createSales() {
  let chart = null; // owned by this component

  function sync(inst) {
    const s = inst.state;
    const color = token(COLOR_TOKEN[s.series]);
    chart.data.labels = MONTHS.slice(0, s.months);
    chart.data.datasets[0].label = SERIES[s.series].label;
    chart.data.datasets[0].data = SERIES[s.series].values.slice(0, s.months);
    chart.data.datasets[0].borderColor = color;
    chart.data.datasets[0].backgroundColor = color;
    chart.update();
  }

  return vf.vfunc({
    state: { series: 'revenue', months: 6 },
    render: (s) => {
      const values = SERIES[s.series].values;
      return vf.html`
        <div class="sales__bar" role="group" aria-label="Series">
          <button class="sales__button" type="button" data-action="series" data-series="revenue" aria-pressed="${s.series === 'revenue'}">Revenue</button>
          <button class="sales__button" type="button" data-action="series" data-series="orders" aria-pressed="${s.series === 'orders'}">Orders</button>
          <button class="sales__button" type="button" data-action="add-month" ${s.months >= 12 ? 'disabled' : ''}>Add month</button>
        </div>
        <p class="sales__summary" data-ref="summary">${SERIES[s.series].label}: ${s.months} months, last ${values[s.months - 1]}</p>
        <div class="sales__chart" data-vf-keep="chart">
          <canvas data-ref="chart" role="img" aria-label="Sales chart"></canvas>
        </div>`;
    },
    delegates: [
      { selector: '[data-action="series"]', eventType: 'click', onEvent: (e) => e.sender.setState({ series: e.target.getAttribute('data-series') }) },
      { selector: '[data-action="add-month"]', eventType: 'click', onEvent: (e) => { if (e.sender.months < 12) e.sender.months++; } }
    ],
    onMount: (inst) => {
      chart = new Chart(inst.refs.chart, {
        type: 'line',
        data: { labels: [], datasets: [{ label: '', data: [], tension: 0.3 }] },
        options: { animation: false, maintainAspectRatio: false }
      });
      sync(inst);
    },
    onUpdate: (inst) => { if (chart) sync(inst); },
    onDestroy: () => {
      if (chart) chart.destroy();
      chart = null;
    }
  });
}

let sales = createSales();
sales.mount('#sales');

vf.attach('[data-action="toggle-chart"]', {
  events: [{
    eventType: 'click',
    onEvent: (e) => {
      if (sales) {
        sales.destroy();
        sales = null;
        e.target.textContent = 'Show chart';
      } else {
        sales = createSales();
        sales.mount('#sales');
        e.target.textContent = 'Hide chart';
      }
    }
  }]
});
```

### style.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.page { max-width: 48rem; margin: var(--vf-space-6) auto; padding: 0 var(--vf-space-4); }
.page__head { display: flex; align-items: center; justify-content: space-between; }
.page__title { font-size: var(--vf-font-size-2xl); }
.sales { padding: var(--vf-space-4); background: var(--vf-color-surface); border: 1px solid var(--vf-color-border); border-radius: var(--vf-radius-lg); }
.sales__bar { display: flex; gap: var(--vf-space-2); }
.sales__button[aria-pressed="true"] { background: var(--vf-color-primary-soft); }
.sales__chart { position: relative; height: 18rem; }
```

### REPORT.md

Reference solution.
