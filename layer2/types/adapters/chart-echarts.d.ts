// SPDX-License-Identifier: Apache-2.0
//
// vfChartEcharts — the G-1 chart contract on Apache ECharts (Apache-2.0; load echarts 6.x yourself).
//   <script>: vfunc.js, the ECharts script, then vfunc-chart-echarts.js
//   ES modules: import { vfChartEcharts } from 'vfunc/adapters/chart-echarts'

import type { VfuncInstance } from '../../../layer1/types/vfunc';
import type { VfChartProps, VfChartMethods } from '../vfunc-ui-data';

export interface VfChartEchartsProps extends VfChartProps {
  /** The echarts namespace; default the global `echarts`. */
  lib?: unknown;
  /** An ECharts option, merged over the adapter's. */
  options?: Record<string, unknown>;
}

/** `.instance` is the ECharts instance (SVG renderer, aria on); setData and setType keep it. */
export declare function vfChartEcharts(props: VfChartEchartsProps): VfuncInstance & VfChartMethods;
export default vfChartEcharts;

declare module '../../../layer1/types/vfunc' {
  interface Vf {
    readonly vfChartEcharts: typeof vfChartEcharts;
  }
}
