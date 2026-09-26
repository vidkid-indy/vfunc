// SPDX-License-Identifier: Apache-2.0
//
// vfChartChartjs — the G-1 chart contract on Chart.js (MIT). The vendor is not bundled (rule 23):
// load chart.js 4.x (dist/chart.umd.min.js → global Chart) or pass the library as `lib`.
// Colors come from the --vf-chart-* tokens. Chart.js cannot change the type of a chart, so setType
// creates a new chart (D-034 6); setData updates the same one. No IE11: use vf.vfChart there.

import vf from '../../src/_internal/vf.js';
import { extend, emit } from '../../src/_internal/common.js';
import { stateOf, instance } from '../../src/_internal/instance.js';
import { vendorLib, hostMarkup, hostOf, chartColors, chartType, chartData, reducedMotion, register } from '../../src/_internal/adapter.js';

const TYPES = { bar: 'bar', line: 'line', area: 'line', pie: 'pie', donut: 'doughnut' };

function config(s) {
  const type = chartType(s.type);
  const d = chartData(s.data);
  const colors = chartColors();
  const radial = type === 'pie' || type === 'donut';
  const pick = function (i) { return colors.length ? colors[i % colors.length] : undefined; };
  const datasets = [];
  for (let i = 0; i < d.series.length; i++) {
    const perPoint = [];
    if (radial) for (let j = 0; j < d.labels.length; j++) perPoint.push(pick(j));
    datasets.push({
      label: d.series[i].name,
      data: d.series[i].data,
      backgroundColor: radial ? perPoint : pick(i),
      borderColor: radial ? undefined : pick(i),
      fill: type === 'area'
    });
  }
  return { type: TYPES[type], data: { labels: d.labels, datasets: datasets } };
}

/** vf.vfChart's props on Chart.js; `options` is merged into the Chart.js options. */
export function vfChartChartjs(props) {
  const p = props || {};
  let chart = null;
  let lib = null;
  let canvas = null;
  const state = stateOf(p, 'chart-chartjs', { type: chartType(p.type), data: chartData(p.data), instance: null });
  delete state.lib;
  delete state.options;

  function create(self) {
    const c = config(self.state);
    c.options = extend({
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion() ? false : undefined,
      onClick: function (event, elements) {
        const el = elements && elements[0];
        if (!el) return;
        const d = chartData(self.state.data);
        const radial = self.state.type === 'pie' || self.state.type === 'donut';
        const series = d.series[radial ? 0 : el.datasetIndex];
        emit(p.onClick, self, event && event.native ? event.native : null, {
          series: series ? series.name : null, index: el.index, label: d.labels[el.index], value: series ? series.data[el.index] : null
        });
      }
    }, p.options);
    chart = new lib(canvas, c);
    self.state.instance = chart;
  }

  return instance({
    state: state,
    render: function (s) { return hostMarkup(s, 'vf-chart-chartjs'); },
    methods: {
      setData: function (data) {
        this.state.data = chartData(data);
        if (!chart) return;
        chart.data = config(this.state).data;
        chart.update();
      },
      setType: function (type) {
        this.state.type = chartType(type);
        if (!chart) return;
        chart.destroy();
        create(this);
      },
      resize: function () { if (chart) chart.resize(); },
      getValue: function () { return this.state.data; },
      setValue: function (data) { this.setData(data); }
    },
    onMount: function (self) {
      lib = vendorLib(p, 'Chart', 'vfChartChartjs');
      const host = hostOf(self);
      host.style.height = (Number(self.state.height) || 240) + 'px';
      canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', self.state.label || vf.t('chart.label'));
      host.appendChild(canvas);
      create(self);
    },
    onDestroy: function (self) {
      if (chart) chart.destroy();
      chart = null;
      canvas = null;
      self.state.instance = null;
    }
  });
}

register({ vfChartChartjs: vfChartChartjs });

export default vfChartChartjs;
