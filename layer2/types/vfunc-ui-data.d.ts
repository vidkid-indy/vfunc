// SPDX-License-Identifier: Apache-2.0
//
// vfunc-ui-data — the grid and the charts of layer 2 (D-031, D-033). Load it after vfunc-ui
// (<script>: vfunc.js, vfunc-ui.js, then vfunc-ui-data.js; ES modules: import 'vfunc/ui/data').
// Kept in sync with layer2/catalog.json ("file": "data") and the exports of layer2/src/data.js.
// The grid and chart props follow the G-1 contracts, so an adapter (vfGridAg, vfChartEcharts …)
// can replace them by name.

import type { SafeHtml, VfuncInstance } from '../../layer1/types/vfunc';
import type { VsContent, VsTableColumn, VfUiEvent } from './vfunc-ui';

// ---------------------------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------------------------

export interface VfGridProps<T = any> {
  columns: Array<VsTableColumn<T>>;
  data: T[];
  /** Default 10. */
  pageSize?: number;
  /** true means 'multiple'. Default 'none'. */
  selectable?: 'none' | 'single' | 'multiple' | boolean;
  /** A maximum height (number: px); the header stays on top while the rows scroll. */
  height?: number | string;
  /** The key of a row. Default 'id' (else its index). */
  rowKey?: string;
  /** server: `data` is one page and `total` counts every row; sort and page go to onSort / onPage. */
  mode?: 'client' | 'server';
  total?: number;
  /** Client mode: keep rows where a column contains this text. */
  query?: string;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  loading?: boolean;
  /** The table's accessible name. */
  caption?: VsContent;
  emptyText?: VsContent;
  /** Not for clicks on controls inside the row (links, buttons, inputs). */
  onRowClick?: (e: VfUiEvent<{ row: T | null; key: string; index: number }>) => void;
  onSelect?: (e: VfUiEvent<{ keys: string[]; rows: T[] }>) => void;
  onSort?: (e: VfUiEvent<{ key: string; dir: 'asc' | 'desc' }>) => void;
  onPage?: (e: VfUiEvent<{ page: number }>) => void;
  /** Vendor options (grid contract); not used by the built-in grid. */
  options?: unknown;
  /** Vendor library (grid contract); not used by the built-in grid. */
  lib?: unknown;
  id?: string;
  ref?: string;
  className?: string;
}

/** The G-1 grid contract. */
export interface VfGridMethods<T = any> {
  setData(data: T[]): void;
  getData(): T[];
  setColumns(columns: Array<VsTableColumn<T>>): void;
  /** The selected rows. */
  getSelection(): T[];
  clearSelection(): void;
  setPage(page: number): void;
  setQuery(query: string): void;
  setLoading(loading: boolean): void;
  /** Server mode. */
  setTotal(total: number): void;
  /** The selected keys. */
  getValue(): string[];
  setValue(keys: string[]): void;
  /** The vendor object; null for the built-in grid. */
  readonly instance: unknown;
}

/** A data grid on vsTable and vsPagination. */
export declare function vfGrid<T = any>(props: VfGridProps<T>): VfuncInstance & VfGridMethods<T>;

// ---------------------------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------------------------

export type VfChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'sparkline';

export interface VfChartData {
  labels: Array<string | number>;
  /** pie and donut use series[0]. Colors come from the --vf-chart-1 … 8 tokens. */
  series: Array<{ name: string; data: number[] }>;
}

export interface VsChartProps {
  /** `data-type`. Default 'bar'. */
  type?: VfChartType;
  data: VfChartData;
  /** The chart's accessible name; replaces `chart.label`. */
  label?: string;
  /** SVG units. Default 240; the element is as wide as its container. */
  height?: number;
  /** SVG units (the aspect ratio). Default 600. */
  width?: number;
  /** Axis, table and point numbers. */
  valueFormat?: Intl.NumberFormatOptions;
  /** Shown with two series or more, and for pie/donut. Default true. */
  legend?: boolean;
  /** The numbers as a visually hidden table. */
  dataTable?: boolean;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<figure class="vf-chart">` with an `<svg role="img">`. */
export declare function vsChart(props: VsChartProps): SafeHtml;

export interface VfChartProps extends VsChartProps {
  /** A mark (bar, point, slice). */
  onClick?: (e: VfUiEvent<{ series: string | null; index: number; label: string | number; value: number | null }>) => void;
  /** Vendor options (chart contract); not used by the built-in chart. */
  options?: unknown;
  /** Vendor library (chart contract); not used by the built-in chart. */
  lib?: unknown;
}

/** The G-1 chart contract. */
export interface VfChartMethods {
  setData(data: VfChartData): void;
  setType(type: VfChartType): void;
  /** Redraws at the element's width (also automatic on resize). */
  resize(): void;
  getValue(): VfChartData;
  setValue(data: VfChartData): void;
  /** The vendor object; null for the built-in chart. */
  readonly instance: unknown;
}

/** vsChart with focusable marks and a tooltip, legend toggles, a fade-in on new data, width tracking. */
export declare function vfChart(props: VfChartProps): VfuncInstance & VfChartMethods;

/** Every member of the data file; importing it also adds them to `vf`. */
declare const data: {
  readonly vfGrid: typeof vfGrid;
  readonly vsChart: typeof vsChart;
  readonly vfChart: typeof vfChart;
};
export default data;

declare module '../../layer1/types/vfunc' {
  interface Vf {
    readonly vfGrid: typeof vfGrid;
    readonly vsChart: typeof vsChart;
    readonly vfChart: typeof vfChart;
  }
}

