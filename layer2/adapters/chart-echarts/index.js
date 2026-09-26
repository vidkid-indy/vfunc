// SPDX-License-Identifier: Apache-2.0
//
// vfChartEcharts — the G-1 chart contract on Apache ECharts (Apache-2.0). The vendor is not bundled
// (rule 23): load echarts 6.x (dist/echarts.min.js → global echarts) or pass the library as `lib`.
// Drawn with the SVG renderer and ECharts' aria option (a generated description). Colors come from
// the --vf-chart-* tokens. setData and setType update the same chart (setOption, notMerge).
// No IE11: use vf.vfChart there.

import vf from '../../src/_internal/vf.js';
import { extend, emit } from '../../src/_internal/common.js';
import { stateOf, instance } from '../../src/_internal/instance.js';
import { vendorLib, hostMarkup, hostOf, chartColors, chartType, chartData, reducedMotion, watchSize, register } from '../../src/_internal/adapter.js';

function option(s, extra) {
  const type = chartType(s.type);
  const d = chartData(s.data);
  const radial = type === 'pie' || type === 'donut';
  const base = {
    color: chartColors(),
    animation: !reducedMotion(),
    aria: { enabled: true, label: { description: s.label || vf.t('chart.label') } },
    tooltip: { trigger: radial ? 'item' : 'axis' },
    legend: radial || d.series.length > 1 ? {} : { show: false }
  };
  if (radial) {
    const first = d.series[0] || { name: '', data: [] };
    const points = [];
    for (let i = 0; i < d.labels.length; i++) points.push({ name: String(d.labels[i]), value: first.data[i] });
    base.series = [{ type: 'pie', name: first.name, radius: type === 'donut' ? ['45%', '70%'] : '70%', data: points }];
  } else {
    base.xAxis = { type: 'category', data: d.labels };
    base.yAxis = { type: 'value' };
    base.series = [];
    for (let i = 0; i < d.series.length; i++) {
      base.series.push({ type: type === 'bar' ? 'bar' : 'line', name: d.series[i].name, data: d.series[i].data, areaStyle: type === 'area' ? {} : undefined });
    }
  }
  return extend(base, extra);
}

/** vf.vfChart's props on ECharts; `options` is merged into the ECharts option. */
export function vfChartEcharts(props) {
  const p = props || {};
  let chart = null;
  let stopWatch = null;
  const state = stateOf(p, 'chart-echarts', { type: chartType(p.type), data: chartData(p.data), instance: null });
  delete state.lib;
  delete state.options;

  return instance({
    state: state,
    render: function (s) { return hostMarkup(s, 'vf-chart-echarts'); },
    methods: {
      setData: function (data) {
        this.state.data = chartData(data);
        if (chart) chart.setOption(option(this.state, p.options), true);
      },
      setType: function (type) {
        this.state.type = chartType(type);
        if (chart) chart.setOption(option(this.state, p.options), true);
      },
      resize: function () { if (chart) chart.resize(); },
      getValue: function () { return this.state.data; },
      setValue: function (data) { this.setData(data); }
    },
    onMount: function (self) {
      const lib = vendorLib(p, 'echarts', 'vfChartEcharts');
      const host = hostOf(self);
      host.style.height = (Number(self.state.height) || 240) + 'px';
      chart = lib.init(host, null, { renderer: 'svg' });
      chart.setOption(option(self.state, p.options), true);
      chart.on('click', function (params) {
        const s = self.state;
        const d = chartData(s.data);
        const radial = s.type === 'pie' || s.type === 'donut';
        const series = d.series[radial ? 0 : params.seriesIndex];
        emit(p.onClick, self, params.event && params.event.event ? params.event.event : null, {
          series: series ? series.name : null,
          index: params.dataIndex,
          label: d.labels[params.dataIndex],
          value: series ? series.data[params.dataIndex] : null
        });
      });
      self.state.instance = chart;
      stopWatch = watchSize(host, function () { if (chart) chart.resize(); });
    },
    onDestroy: function (self) {
      if (stopWatch) stopWatch();
      if (chart) chart.dispose();
      chart = null;
      stopWatch = null;
      self.state.instance = null;
    }
  });
}

register({ vfChartEcharts: vfChartEcharts });

export default vfChartEcharts;
