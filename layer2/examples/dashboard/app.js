// SPDX-License-Identifier: Apache-2.0
//
// Admin dashboard: key figures (vsStatCard), an order grid and a sales chart. The engine switch
// swaps vf.vfGrid / vf.vfChart for the Tabulator and Chart.js adapters by name only: the props are
// the same (the G-1 contracts). Callbacks write to the log, which the browser test reads
// (layer2/test/e2e/examples.e2e.js).
/* global vf */

(function () {
  'use strict';

  const html = vf.html;
  const log = (text) => { vf.$('#log').textContent = text; };

  // --- data ------------------------------------------------------------------------------------

  const CUSTOMERS = ['Ada', 'Grace', 'Alan', 'Barbara', 'Edsger', 'Katherine', 'Linus', 'Margaret'];
  const REGIONS = ['Seoul', 'Busan', 'Tokyo', 'Berlin'];
  const STATUS = [
    { value: 'paid', tone: 'success' },
    { value: 'pending', tone: 'warning' },
    { value: 'refunded', tone: 'neutral' }
  ];
  const ORDERS = [];
  for (let n = 0; n < 30; n++) {
    ORDERS.push({
      id: 'A' + (1001 + n),
      customer: CUSTOMERS[n % CUSTOMERS.length],
      region: REGIONS[(n * 3) % REGIONS.length],
      amount: 40 + ((n * 37) % 260),
      status: STATUS[(n * 5) % 3].value
    });
  }
  const SALES = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [{ name: '2025', data: [12, 19, 15, 22, 18, 25] }, { name: '2026', data: [14, 21, 24, 20, 28, 31] }]
  };
  const toneOf = (status) => STATUS.filter((s) => s.value === status)[0].tone;

  // --- key figures (vs* markup in a vf.attach island) ------------------------------------------

  const paid = ORDERS.filter((o) => o.status === 'paid');
  vf.attach('#stats', {
    render: () => html`
      ${vf.vsStatCard({ label: 'Revenue', value: paid.reduce((sum, o) => sum + o.amount, 0),
        format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }, delta: 12.5, deltaLabel: 'vs last month' })}
      ${vf.vsStatCard({ label: 'Orders', value: ORDERS.length, delta: 4 })}
      ${vf.vsStatCard({ label: 'Pending', value: ORDERS.length - paid.length, delta: -2, description: 'Waiting for payment' })}`
  });

  // --- the grid and the chart: the same props for both engines ---------------------------------

  const ENGINES = {
    builtin: { grid: vf.vfGrid, chart: vf.vfChart },
    vendor: { grid: vf.vfGridTabulator, chart: vf.vfChartChartjs }
  };

  const gridProps = {
    id: 'orders',
    caption: 'Recent orders',
    data: ORDERS,
    pageSize: 8,
    selectable: 'multiple',
    columns: [
      { key: 'id', label: 'Order' },
      { key: 'customer', label: 'Customer', sortable: true },
      { key: 'region', label: 'Region', sortable: true },
      { key: 'amount', label: 'Amount', sortable: true, align: 'end', render: (row) => vf.fmt.currency(row.amount, 'USD') },
      { key: 'status', label: 'Status', render: (row) => vf.vsBadge({ label: row.status, variant: toneOf(row.status) }) }
    ],
    onSelect: (e) => log('selected ' + e.data.keys.join(',')),
    onSort: (e) => log('sort ' + e.data.key + ' ' + e.data.dir),
    onRowClick: (e) => log('row ' + e.data.key)
  };

  let chartType = 'bar';
  const chartProps = () => ({
    id: 'sales',
    type: chartType,
    label: 'Monthly sales',
    height: 280,
    data: SALES,
    onClick: (e) => log('chart ' + e.data.series + ' ' + e.data.label + ' ' + e.data.value)
  });

  let grid = null;
  let chart = null;
  function use(engine) {
    if (grid) grid.destroy();
    if (chart) chart.destroy();
    grid = ENGINES[engine].grid(gridProps);
    chart = ENGINES[engine].chart(chartProps());
    grid.mount('#grid');
    chart.mount('#chart');
  }
  use('builtin');

  vf.vfSelectButton({
    id: 'engines', label: 'Engine', value: 'builtin',
    options: [{ value: 'builtin', label: 'Built-in' }, { value: 'vendor', label: 'Tabulator · Chart.js' }],
    onChange: (e) => { use(e.data.value); log('engine ' + e.data.value); }
  }).mount('#engine');

  vf.vfSelectButton({
    id: 'chart-types', ariaLabel: 'Chart type', value: chartType, size: 'sm',
    options: ['bar', 'line', 'area'],
    onChange: (e) => { chartType = e.data.value; chart.setType(chartType); log('chart type ' + chartType); }
  }).mount('#chart-type');
}());
