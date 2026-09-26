// SPDX-License-Identifier: Apache-2.0
//
// vfChartChartjs — the G-1 chart contract on Chart.js (MIT; load chart.js 4.x yourself).
//   <script>: vfunc.js, the Chart.js UMD script, then vfunc-chart-chartjs.js
//   ES modules: import { vfChartChartjs } from 'vfunc/adapters/chart-chartjs'

import type { VfuncInstance } from '../../../layer1/types/vfunc';
import type { VfChartProps, VfChartMethods } from '../vfunc-ui-data';

export interface VfChartChartjsProps extends VfChartProps {
  /** The Chart class; default the global `Chart`. */
  lib?: unknown;
  /** Chart.js options, merged over the adapter's. */
  options?: Record<string, unknown>;
}

/** `.instance` is the Chart.js chart; setType replaces it (Chart.js cannot change a chart's type). */
export declare function vfChartChartjs(props: VfChartChartjsProps): VfuncInstance & VfChartMethods;
export default vfChartChartjs;

declare module '../../../layer1/types/vfunc' {
  interface Vf {
    readonly vfChartChartjs: typeof vfChartChartjs;
  }
}
