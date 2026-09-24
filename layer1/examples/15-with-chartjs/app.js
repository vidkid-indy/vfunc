// SPDX-License-Identifier: Apache-2.0
// 15 with-chartjs — a third-party widget without an adapter (integration level L0).
// This is the shape the layer 2 adapters (vf.vfChartChartjs) will formalize.
// 어댑터 없이 서드파티 위젯을 붙이는 방법(통합 수준 L0). 2단계 어댑터의 원형입니다.

const DATA = {
  visits: { label: 'Visits / 방문', values: [120, 190, 150, 220, 260, 240] },
  orders: { label: 'Orders / 주문', values: [12, 19, 11, 25, 31, 28] }
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Colors come from CSS tokens at run time; JS holds no color values (rule 21). / 색은 토큰에서 읽습니다. */
function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

let chart = null; // the Chart.js instance, owned by the component below / 아래 컴포넌트가 소유

const dashboard = vf.vfunc({
  state: { metric: 'visits', values: DATA.visits.values.slice() },
  render: (s) => vf.html`
    <div class="row" role="group" aria-label="Metric">
      <button class="btn" type="button" data-action="metric" data-metric="visits" aria-pressed="${s.metric === 'visits' ? 'true' : 'false'}">Visits</button>
      <button class="btn" type="button" data-action="metric" data-metric="orders" aria-pressed="${s.metric === 'orders' ? 'true' : 'false'}">Orders</button>
      <button class="btn" type="button" data-action="add" data-variant="primary">Add a month / 한 달 추가</button>
    </div>
    <p class="muted" data-ref="summary">${DATA[s.metric].label}: ${s.values.length} months, last ${s.values[s.values.length - 1]}</p>
    <!-- Chart.js draws in here; data-vf-keep keeps this element across renders. / 이 요소는 렌더 사이에 유지됩니다 -->
    <div class="chart" data-vf-keep="chart">
      <canvas data-ref="canvas" role="img" aria-label="Chart"></canvas>
    </div>`,
  delegates: [
    {
      selector: '[data-action="metric"]',
      eventType: 'click',
      onEvent: (e) => {
        const metric = e.target.getAttribute('data-metric');
        e.sender.setState({ metric: metric, values: DATA[metric].values.slice() });
      }
    },
    {
      selector: '[data-action="add"]',
      eventType: 'click',
      onEvent: (e) => {
        const last = e.sender.values[e.sender.values.length - 1];
        e.sender.values = e.sender.values.concat(Math.round(last * (0.9 + Math.random() * 0.3)));
      }
    }
  ],
  // 1) Create the widget once the element is in the page. / 요소가 페이지에 들어간 뒤 생성
  onMount: (inst) => {
    chart = new Chart(inst.refs.canvas, {
      type: 'line',
      data: { labels: [], datasets: [{ label: '', data: [], borderColor: token('--vf-chart-1'), backgroundColor: token('--vf-chart-1'), tension: 0.3 }] },
      options: {
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { ticks: { color: token('--vf-color-text-muted') }, grid: { color: token('--vf-color-border') } },
          y: { ticks: { color: token('--vf-color-text-muted') }, grid: { color: token('--vf-color-border') } }
        },
        plugins: { legend: { labels: { color: token('--vf-color-text') } } }
      }
    });
    syncChart(inst);
  },
  // 2) After every render, push the new state into the widget. / 렌더 뒤 상태를 위젯에 반영
  onUpdate: (inst) => syncChart(inst),
  // 3) Release the widget before the element goes away. / 요소가 사라지기 전에 정리
  onDestroy: () => { if (chart) chart.destroy(); chart = null; }
});

function syncChart(inst) {
  if (!chart) return;
  chart.data.labels = inst.values.map((v, i) => MONTHS[i % 12]);
  chart.data.datasets[0].label = DATA[inst.metric].label;
  chart.data.datasets[0].data = inst.values.slice();
  chart.update();
  // A kept element keeps its old attributes too, so update them here. / keep 요소는 속성도 그대로라 여기서 갱신
  inst.refs.canvas.setAttribute('aria-label', DATA[inst.metric].label + ' chart');
}

dashboard.mount('#app');
