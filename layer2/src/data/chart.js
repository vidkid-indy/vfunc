// SPDX-License-Identifier: Apache-2.0
//
// Chart — vsChart (static SVG) and vfChart (instance), data file (D-031, D-033). New code: the
// pilot had no chart of its own. Types: bar, line, area, pie, donut, sparkline (vsSparkline).
// Colors never live in JS: every mark has data-series="n" and CSS gives it var(--vf-chart-n+1),
// so the dark theme follows (rule 21). The SVG is role="img" with a label; an optional data table
// (vsTable, visually hidden) gives the numbers to screen readers.
// vfChart adds focusable marks with a tooltip, legend buttons that hide and show series, a fade-in
// when the data changes (not under reduced motion) and redraws at the element's width
// (ResizeObserver, or window resize where it is missing). G-1 chart contract: setData, setType,
// resize, destroy, .instance (null: there is no vendor object).

import vf from '../_internal/ui.js';
import { attrs } from '../_internal/attrs.js';
import { oneOf } from '../_internal/props.js';
import { msg } from '../_internal/messages.js';
import { cls, present, extend, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';
import { niceTicks, arcPath, r2 } from './geometry.js';

const html = vf.html;

const TYPES = ['bar', 'line', 'area', 'pie', 'donut', 'sparkline'];
const COLORS = 8; // --vf-chart-1 … --vf-chart-8
// Plot margins in SVG user units, for the axis labels (geometry, not design: rule 21 is about CSS values).
const PAD = { top: 12, right: 12, bottom: 28, left: 48 };

function normalize(data) {
  const d = data || {};
  const labels = d.labels || [];
  const series = [];
  const list = d.series || [];
  for (let i = 0; i < list.length; i++) {
    const values = [];
    const raw = (list[i] && list[i].data) || [];
    for (let j = 0; j < raw.length; j++) values.push(Number(raw[j]) || 0);
    series.push({ name: list[i] && list[i].name != null ? String(list[i].name) : String(i + 1), data: values, index: i });
  }
  return { labels: labels, series: series };
}

function color(i) {
  return String(i % COLORS);
}

function markAttrs(s, series, index, label, value, className) {
  const text = msg('chart.point', null, { series: series.name, label: label, value: vf.fmt.number(value, s.valueFormat) });
  return {
    class: className,
    'data-series': color(series.index),
    'data-s': series.index,
    'data-index': index,
    'data-action': s.interactive ? 'mark' : null,
    tabindex: s.interactive ? 0 : null,
    'aria-label': s.interactive ? text : null
  };
}

function cartesian(s, d, visible, W, H) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < visible.length; i++) {
    for (let j = 0; j < visible[i].data.length; j++) {
      lo = Math.min(lo, visible[i].data[j]);
      hi = Math.max(hi, visible[i].data[j]);
    }
  }
  const axis = niceTicks(lo === Infinity ? 0 : lo, hi === -Infinity ? 1 : hi, 5);
  const y = function (v) { return r2(PAD.top + plotH - ((v - axis.min) / (axis.max - axis.min)) * plotH); };
  const n = Math.max(1, d.labels.length);
  const band = plotW / n;
  const out = [];
  for (let t = 0; t < axis.ticks.length; t++) {
    const ty = y(axis.ticks[t]);
    out.push(html`<line class="vf-chart__gridline" x1="${PAD.left}" x2="${W - PAD.right}" y1="${ty}" y2="${ty}"></line><text class="vf-chart__tick" x="${PAD.left - 6}" y="${ty}" text-anchor="end" dominant-baseline="middle">${vf.fmt.number(axis.ticks[t], s.valueFormat)}</text>`);
  }
  const every = Math.ceil(n / Math.max(1, Math.floor(plotW / 48)));
  for (let i = 0; i < d.labels.length; i += every) {
    out.push(html`<text class="vf-chart__label" x="${r2(PAD.left + band * (i + 0.5))}" y="${H - 8}" text-anchor="middle">${d.labels[i]}</text>`);
  }
  const zero = y(Math.max(axis.min, Math.min(0, axis.max)));
  if (s.type === 'bar') {
    const inner = (band * 0.8) / Math.max(1, visible.length);
    for (let k = 0; k < visible.length; k++) {
      const series = visible[k];
      for (let i = 0; i < n && i < series.data.length; i++) {
        const v = series.data[i];
        const top = Math.min(y(v), zero);
        const x = r2(PAD.left + band * i + band * 0.1 + inner * k);
        out.push(html`<rect ${attrs(markAttrs(s, series, i, d.labels[i], v, 'vf-chart__mark vf-chart__bar'))} x="${x}" y="${top}" width="${r2(Math.max(inner - 1, 1))}" height="${r2(Math.max(Math.abs(y(v) - zero), 0.5))}"></rect>`);
      }
    }
  } else {
    for (let k = 0; k < visible.length; k++) {
      const series = visible[k];
      const pts = [];
      for (let i = 0; i < n && i < series.data.length; i++) pts.push([r2(PAD.left + band * (i + 0.5)), y(series.data[i])]);
      if (!pts.length) continue;
      let line = 'M ' + pts[0][0] + ' ' + pts[0][1];
      for (let i = 1; i < pts.length; i++) line += ' L ' + pts[i][0] + ' ' + pts[i][1];
      if (s.type === 'area') {
        const area = line + ' L ' + pts[pts.length - 1][0] + ' ' + zero + ' L ' + pts[0][0] + ' ' + zero + ' Z';
        out.push(html`<path class="vf-chart__area" data-series="${color(series.index)}" d="${area}"></path>`);
      }
      out.push(html`<path class="vf-chart__line" data-series="${color(series.index)}" d="${line}"></path>`);
      for (let i = 0; i < pts.length; i++) {
        out.push(html`<circle ${attrs(markAttrs(s, series, i, d.labels[i], series.data[i], 'vf-chart__mark vf-chart__point'))} cx="${pts[i][0]}" cy="${pts[i][1]}" r="4"></circle>`);
      }
    }
  }
  return out;
}

function radial(s, d, W, H) {
  const series = d.series[0] || { name: '', data: [], index: 0 };
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.max(1, Math.min(W, H) / 2 - 8);
  const inner = s.type === 'donut' ? r2(radius * 0.6) : 0;
  let total = 0;
  for (let i = 0; i < series.data.length; i++) if (s.hidden.indexOf(i) < 0) total += Math.max(0, series.data[i]);
  const out = [];
  let a = 0;
  for (let i = 0; i < series.data.length; i++) {
    const v = Math.max(0, series.data[i]);
    if (s.hidden.indexOf(i) >= 0 || !v || !total) continue;
    const a1 = a + (v / total) * Math.PI * 2;
    const slice = { name: d.labels[i] != null ? String(d.labels[i]) : series.name, index: i };
    out.push(html`<path ${attrs(markAttrs(s, slice, i, d.labels[i], v, 'vf-chart__mark vf-chart__slice'))} d="${arcPath(cx, cy, r2(radius), inner, a, a1)}"></path>`);
    a = a1;
  }
  return out;
}

function legend(s, d) {
  const radialType = s.type === 'pie' || s.type === 'donut';
  const names = [];
  if (radialType) for (let i = 0; i < d.labels.length; i++) names.push({ name: d.labels[i], index: i });
  else for (let i = 0; i < d.series.length; i++) names.push({ name: d.series[i].name, index: i });
  if (names.length < 2 && !radialType) return '';
  const items = [];
  for (let i = 0; i < names.length; i++) {
    const shown = s.hidden.indexOf(names[i].index) < 0;
    const swatch = html`<span class="vf-chart__swatch" data-series="${color(names[i].index)}" aria-hidden="true"></span>`;
    items.push(s.interactive
      ? html`<li><button ${attrs({ type: 'button', class: 'vf-chart__toggle', 'data-action': 'toggle-series', 'data-index': names[i].index, 'aria-pressed': shown })}>${swatch}${names[i].name}</button></li>`
      : html`<li class="vf-chart__entry">${swatch}${names[i].name}</li>`);
  }
  return html`<ul class="vf-chart__legend" aria-label="${msg('chart.legend')}">${items}</ul>`;
}

function dataTable(s, d) {
  const columns = [{ key: 'label', label: '' }];
  for (let i = 0; i < d.series.length; i++) columns.push({ key: 's' + i, label: d.series[i].name, align: 'end' });
  const rows = [];
  for (let j = 0; j < d.labels.length; j++) {
    const row = { id: String(j), label: d.labels[j] };
    for (let i = 0; i < d.series.length; i++) row['s' + i] = vf.fmt.number(d.series[i].data[j] || 0, s.valueFormat);
    rows.push(row);
  }
  return html`<div class="vf-visually-hidden">${vf.vsTable({ columns: columns, data: rows, caption: s.label || msg('chart.label') })}</div>`;
}

/** The markup of a chart from normalized state (vsChart props plus hidden, interactive, width). */
function draw(s) {
  const type = oneOf('vsChart type', s.type, TYPES);
  const d = normalize(s.data);
  if (type === 'sparkline') {
    return vf.vsSparkline({ data: d.series[0] ? d.series[0].data : [], label: s.label, format: s.valueFormat, id: s.id, className: s.className });
  }
  const st = extend({}, s, { type: type, hidden: s.hidden || [] });
  const W = Math.max(120, Math.round(Number(s.width) || 600));
  const H = Math.max(80, Math.round(Number(s.height) || 240));
  const visible = [];
  for (let i = 0; i < d.series.length; i++) if (st.hidden.indexOf(i) < 0) visible.push(d.series[i]);
  const marks = type === 'pie' || type === 'donut' ? radial(st, d, W, H) : cartesian(st, d, visible, W, H);
  const tooltip = s.interactive ? html`<div ${attrs({ class: 'vf-chart__tooltip', id: s.id + '-tooltip', 'aria-hidden': true, hidden: true })}></div>` : '';
  return html`<figure ${attrs({
    class: cls('vf-chart', s.className),
    id: s.id,
    'data-ref': s.ref,
    'data-type': type,
    'data-animate': s.animate ? true : null
  })}><svg ${attrs({ class: 'vf-chart__svg', role: 'img', 'aria-label': present(s.label) ? s.label : msg('chart.label') })} viewBox="0 0 ${W} ${H}" focusable="false">${marks}</svg>${s.legend === false ? '' : legend(st, d)}${s.dataTable ? dataTable(st, d) : ''}${tooltip}</figure>`;
}

/**
 * A static SVG chart.
 * @param {Object} props
 * @param {'bar'|'line'|'area'|'pie'|'donut'|'sparkline'} [props.type='bar'] - `data-type`
 * @param {{labels: Array, series: Array<{name: string, data: number[]}>}} props.data - pie/donut use series[0]
 * @param {string} [props.label] - the chart's accessible name; replaces `chart.label`
 * @param {number} [props.height=240] - SVG units; the element is as wide as its container
 * @param {number} [props.width=600] - SVG units (the aspect ratio)
 * @param {Intl.NumberFormatOptions} [props.valueFormat] - axis, table and point numbers
 * @param {boolean} [props.legend=true] - shown when there are two series or more (and for pie/donut)
 * @param {boolean} [props.dataTable] - the numbers as a visually hidden table
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsChart(props) {
  return draw(extend({}, props || {}, { interactive: false, animate: false }));
}

/**
 * vsChart with tooltips, legend toggles, a fade-in on new data and redrawing at its width.
 * @param {Object} props - vsChart props, plus:
 * @param {function} [props.onClick] - a mark: ({ sender, event, data: { series, index, label, value } })
 * @param {*} [props.options] - accepted for the chart contract (vendor options); not used here
 * @param {*} [props.lib] - accepted for the chart contract (vendor library); not used here
 * @returns {Object} instance with setData(data), setType(type), resize(), .instance (null)
 */
export function vfChart(props) {
  const p = props || {};
  let observer = null;
  let onResize = null;

  function measure(self) {
    const width = self.$node.clientWidth;
    if (width > 0 && Math.abs(width - (self.state.width || 0)) > 1) self.setState({ width: width });
  }
  function tip(self, mark, show) {
    const tooltip = self.ids[self.state.id + '-tooltip'];
    if (!tooltip) return;
    if (!show) {
      tooltip.hidden = true;
      return;
    }
    tooltip.textContent = mark.getAttribute('aria-label');
    tooltip.hidden = false;
    const root = self.$node.getBoundingClientRect();
    const r = mark.getBoundingClientRect();
    tooltip.style.left = Math.round(r.left - root.left + r.width / 2) + 'px';
    tooltip.style.top = Math.round(r.top - root.top) + 'px';
  }
  const state = stateOf(p, 'chart', {
    type: oneOf('vfChart type', p.type, TYPES),
    data: p.data || { labels: [], series: [] },
    hidden: [],
    interactive: true,
    animate: true,
    width: 0,
    instance: null
  });
  return instance({
    state: state,
    render: draw,
    delegates: [
      { selector: '[data-action="mark"]', eventType: 'mouseover', onEvent: function (e) { tip(e.sender, e.target, true); } },
      { selector: '[data-action="mark"]', eventType: 'focusin', onEvent: function (e) { tip(e.sender, e.target, true); } },
      { selector: '[data-action="mark"]', eventType: 'mouseout', onEvent: function (e) { tip(e.sender, e.target, false); } },
      { selector: '[data-action="mark"]', eventType: 'focusout', onEvent: function (e) { tip(e.sender, e.target, false); } },
      {
        selector: '[data-action="mark"]',
        eventType: 'click',
        onEvent: function (e) {
          const s = e.sender.state;
          const d = normalize(s.data);
          const si = Number(e.target.getAttribute('data-s'));
          const i = Number(e.target.getAttribute('data-index'));
          const radialType = s.type === 'pie' || s.type === 'donut';
          const series = radialType ? d.series[0] : d.series[si];
          emit(p.onClick, e.sender, e.event, {
            series: series ? series.name : null,
            index: i,
            label: d.labels[i],
            value: series ? series.data[i] : null
          });
        }
      },
      {
        selector: '[data-action="toggle-series"]',
        eventType: 'click',
        onEvent: function (e) {
          const i = Number(e.target.getAttribute('data-index'));
          const hidden = e.sender.state.hidden.slice();
          const at = hidden.indexOf(i);
          if (at >= 0) hidden.splice(at, 1);
          else hidden.push(i);
          e.sender.setState({ hidden: hidden, animate: false });
        }
      }
    ],
    methods: {
      setData: function (data) { this.setState({ data: data || { labels: [], series: [] }, hidden: [], animate: true }); },
      setType: function (type) { this.setState({ type: oneOf('vfChart type', type, TYPES), hidden: [], animate: true }); },
      resize: function () { measure(this); },
      getValue: function () { return this.state.data; },
      setValue: function (data) { this.setData(data); }
    },
    onMount: function (self) {
      measure(self);
      if (typeof window === 'undefined') return;
      if (typeof window.ResizeObserver === 'function') {
        observer = new window.ResizeObserver(function () { measure(self); });
        observer.observe(self.$node);
      } else {
        onResize = function () { measure(self); };
        window.addEventListener('resize', onResize);
      }
    },
    onUpdate: function (self) {
      // The fade-in plays once per new data or type, not on resize or legend toggles.
      self.state.animate = false;
      if (observer) {
        observer.disconnect();
        observer.observe(self.$node);
      }
    },
    onDestroy: function () {
      if (observer) observer.disconnect();
      if (onResize) window.removeEventListener('resize', onResize);
      observer = null;
      onResize = null;
    }
  });
}
