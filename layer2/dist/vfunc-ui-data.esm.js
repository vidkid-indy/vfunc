/*! vfunc-ui (vfunc.js layer 2) v1.0.0-rc.8 | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// layer2/src/_internal/ui.js
import "./vfunc-ui.esm.js";
import { default as default2 } from "../../layer1/dist/vfunc.esm.js";

// layer2/src/_internal/dev.js
var DEV = false ? true : true;
function warn(message) {
  if (typeof console !== "undefined" && console.warn) console.warn("[vfunc-ui] " + message);
}
__name(warn, "warn");

// layer2/src/_internal/vf.js
import { default as default3 } from "../../layer1/dist/vfunc.esm.js";

// layer2/src/_internal/attrs.js
var ATTR_NAME = /^(?:id|name|class|title|role|type|value|for|form|href|src|alt|label|datetime|scope|placeholder|autocomplete|inputmode|pattern|min|max|step|minlength|maxlength|rows|cols|tabindex|disabled|readonly|required|checked|selected|multiple|hidden|lang|dir|aria-[a-z]+|data-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
var URL_ATTR = /^(?:href|src)$/;
var hasOwn = Object.prototype.hasOwnProperty;
function attrs(map) {
  const out = [];
  for (const name in map) {
    if (!hasOwn.call(map, name)) continue;
    if (!ATTR_NAME.test(name)) {
      if (DEV) warn('attribute "' + name + '" is not allowed in component markup.');
      continue;
    }
    const value = map[name];
    if (value == null || value === false || value === "") {
      if (value === false && /^(aria|data)-/.test(name)) out.push(name + '="false"');
      continue;
    }
    if (value === true) out.push(/^(aria|data)-/.test(name) ? name + '="true"' : name);
    else out.push(name + '="' + default3.esc(URL_ATTR.test(name) ? default3.safeUrl(value) : value) + '"');
  }
  return default3.unsafeHtml(out.join(" "));
}
__name(attrs, "attrs");

// layer2/src/_internal/messages.js
function msg(key, override, params) {
  if (override != null && override !== "") return override;
  return default3.t(key, params);
}
__name(msg, "msg");

// layer2/src/_internal/common.js
var counter = 0;
function uid(prefix) {
  counter += 1;
  return "vf-" + prefix + "-" + counter;
}
__name(uid, "uid");
function present(value) {
  return value != null && value !== "" && value !== false;
}
__name(present, "present");
function extend(target) {
  for (let i = 1; i < arguments.length; i++) {
    const source = arguments[i];
    if (!source) continue;
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
    }
  }
  return target;
}
__name(extend, "extend");
function cls(block, className) {
  return present(className) ? block + " " + className : block;
}
__name(cls, "cls");
function hasValue(value, v) {
  if (value == null) return false;
  if (Object.prototype.toString.call(value) === "[object Array]") {
    for (let i = 0; i < value.length; i++) if (String(value[i]) === v) return true;
    return false;
  }
  return String(value) === v;
}
__name(hasValue, "hasValue");
function emit(callback, sender, event, data) {
  if (typeof callback === "function") callback({ sender, event: event || null, data: data || {} });
}
__name(emit, "emit");

// layer2/src/_internal/instance.js
function stateOf(p, prefix, extra) {
  const state = {};
  for (const key in p) {
    if (Object.prototype.hasOwnProperty.call(p, key) && typeof p[key] !== "function") state[key] = p[key];
  }
  state.id = present(p.id) ? String(p.id) : uid(prefix);
  return extend(state, extra);
}
__name(stateOf, "stateOf");
function instance(spec) {
  const methods = extend({
    getValue: /* @__PURE__ */ __name(function() {
      return this.state.value;
    }, "getValue"),
    setValue: /* @__PURE__ */ __name(function(value) {
      this.setState({ value });
    }, "setValue")
  }, spec.methods);
  for (const name in methods) {
    if (Object.prototype.hasOwnProperty.call(methods, name) && Object.prototype.hasOwnProperty.call(spec.state, name)) {
      delete spec.state[name];
    }
  }
  return default3.vfunc({
    replaceRoot: true,
    state: spec.state,
    render: spec.render,
    delegates: spec.delegates || [],
    events: spec.events,
    childs: spec.childs,
    methods,
    onMount: spec.onMount,
    onUpdate: spec.onUpdate,
    onDestroy: spec.onDestroy
  });
}
__name(instance, "instance");

// layer2/src/data/grid.js
var html = default2.html;
function keyOf(row, index, rowKey) {
  const k = rowKey || "id";
  return row != null && typeof row === "object" && row[k] != null ? String(row[k]) : String(index);
}
__name(keyOf, "keyOf");
function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
}
__name(compare, "compare");
function prepared(s) {
  const out = [];
  const data = s.data || [];
  const q = present(s.query) ? String(s.query).toLowerCase() : "";
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (q && s.mode !== "server") {
      let hit = false;
      for (let c = 0; c < s.columns.length && !hit; c++) {
        const v = row == null ? null : row[s.columns[c].key];
        if (v != null && String(v).toLowerCase().indexOf(q) >= 0) hit = true;
      }
      if (!hit) continue;
    }
    out.push({ row, key: keyOf(row, i, s.rowKey), order: i });
  }
  if (s.sort && s.sort.key && s.mode !== "server") {
    const k = s.sort.key;
    const dir = s.sort.dir === "desc" ? -1 : 1;
    out.sort(function(x, y) {
      return dir * compare(x.row && x.row[k], y.row && y.row[k]) || x.order - y.order;
    });
  }
  return out;
}
__name(prepared, "prepared");
function pagesOf(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize));
}
__name(pagesOf, "pagesOf");
function view(s) {
  const all = prepared(s);
  const size = Math.max(1, Math.floor(Number(s.pageSize) || 10));
  const total = s.mode === "server" ? Math.max(0, Number(s.total) || 0) : all.length;
  const page = Math.max(1, Math.min(pagesOf(total, size), Math.floor(Number(s.page) || 1)));
  const rows = s.mode === "server" ? all : all.slice((page - 1) * size, page * size);
  return { rows, total, page, size };
}
__name(view, "view");
function render(s) {
  const v = view(s);
  const multiple = s.selectable === "multiple";
  const single = s.selectable === "single";
  const keys = [];
  const data = [];
  for (let i = 0; i < v.rows.length; i++) {
    keys.push(v.rows[i].key);
    data.push(extend({}, v.rows[i].row, { __vfKey: v.rows[i].key }));
  }
  let allOn = keys.length > 0;
  for (let i = 0; i < keys.length; i++) if (!hasValue(s.selected, keys[i])) allOn = false;
  const columns = [];
  if (multiple || single) {
    columns.push({
      key: "",
      label: multiple ? html`<input ${attrs({ type: "checkbox", class: "vf-grid__check", "data-action": "select-all", "aria-label": msg("grid.selectAll"), checked: allOn })}>` : html`<span class="vf-visually-hidden">${msg("grid.select")}</span>`,
      render: /* @__PURE__ */ __name(function(row, index) {
        const key = row.__vfKey;
        return html`<input ${attrs({
          type: multiple ? "checkbox" : "radio",
          class: "vf-grid__check",
          name: single ? s.id + "-select" : null,
          "data-action": "select-row",
          "data-value": key,
          "aria-label": msg("grid.selectRow", null, { index: index + 1 }),
          checked: hasValue(s.selected, key)
        })}>`;
      }, "render")
    });
  }
  for (let c = 0; c < s.columns.length; c++) columns.push(s.columns[c]);
  const from = v.total ? (v.page - 1) * v.size + 1 : 0;
  const to = v.rows.length ? Math.min(v.total, from + v.rows.length - 1) : from;
  const pager = v.total > v.size ? default2.vsPagination({ total: v.total, page: v.page, pageSize: v.size, id: s.id + "-pages" }) : "";
  return html`<div ${attrs({ class: cls("vf-grid", s.className), id: s.id, "data-ref": s.ref, "data-mode": s.mode })}><div ${attrs({ class: "vf-grid__scroll", id: s.id + "-scroll", "data-height": present(s.height) ? true : null })}>${default2.vsTable({
    columns,
    data,
    sort: s.sort,
    rowKey: "__vfKey",
    selected: s.selected,
    rowAction: "row",
    caption: s.caption,
    emptyText: s.emptyText,
    loading: s.loading,
    indexBase: (v.page - 1) * v.size
  })}</div><div class="vf-grid__footer"><p class="vf-grid__range" aria-live="polite">${msg("grid.range", null, {
    from: default2.fmt.number(from),
    to: default2.fmt.number(Math.max(to, 0)),
    total: default2.fmt.number(v.total)
  })}</p>${pager}</div></div>`;
}
__name(render, "render");
function vfGrid(props) {
  const p = props || {};
  function rowsByKey(s, keys) {
    const out = [];
    const data = s.data || [];
    for (let i = 0; i < data.length; i++) if (hasValue(keys, keyOf(data[i], i, s.rowKey))) out.push(data[i]);
    return out;
  }
  __name(rowsByKey, "rowsByKey");
  function select(sender, event, keys) {
    sender.setState({ selected: keys });
    emit(p.onSelect, sender, event, { keys: keys.slice(), rows: rowsByKey(sender.state, keys) });
  }
  __name(select, "select");
  function applyHeight(self) {
    const box = self.ids[self.state.id + "-scroll"];
    const h = self.state.height;
    if (box && present(h)) box.style.maxHeight = typeof h === "number" ? h + "px" : String(h);
  }
  __name(applyHeight, "applyHeight");
  const selectable = p.selectable === true ? "multiple" : p.selectable === "single" || p.selectable === "multiple" ? p.selectable : "none";
  const state = stateOf(p, "grid", {
    columns: (p.columns || []).slice(),
    data: (p.data || []).slice(),
    mode: p.mode === "server" ? "server" : "client",
    selectable,
    selected: [],
    page: Math.max(1, Math.floor(Number(p.page) || 1)),
    sort: p.sort || null,
    instance: null
  });
  delete state.options;
  delete state.lib;
  return instance({
    state,
    render,
    delegates: [
      {
        selector: '[data-action="sort"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const key = e.target.getAttribute("data-value");
          const now = e.sender.state.sort;
          const dir = now && now.key === key && now.dir === "asc" ? "desc" : "asc";
          e.sender.setState({ sort: { key, dir }, page: 1 });
          emit(p.onSort, e.sender, e.event, { key, dir });
        }, "onEvent")
      },
      {
        selector: '[data-action="page"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const page = Number(e.target.getAttribute("data-page"));
          if (page === e.sender.state.page) return;
          e.sender.setState({ page });
          emit(p.onPage, e.sender, e.event, { page });
        }, "onEvent")
      },
      {
        selector: '[data-action="select-row"]',
        eventType: "change",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const key = e.target.getAttribute("data-value");
          const s = e.sender.state;
          let keys;
          if (s.selectable === "single") keys = [key];
          else {
            keys = [];
            for (let i = 0; i < s.selected.length; i++) if (s.selected[i] !== key) keys.push(s.selected[i]);
            if (e.target.checked) keys.push(key);
          }
          select(e.sender, e.event, keys);
        }, "onEvent")
      },
      {
        selector: '[data-action="select-all"]',
        eventType: "change",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const s = e.sender.state;
          const pageKeys = [];
          const v = view(s);
          for (let i = 0; i < v.rows.length; i++) pageKeys.push(v.rows[i].key);
          const keys = [];
          for (let i = 0; i < s.selected.length; i++) if (pageKeys.indexOf(s.selected[i]) < 0) keys.push(s.selected[i]);
          if (e.target.checked) for (let i = 0; i < pageKeys.length; i++) keys.push(pageKeys[i]);
          select(e.sender, e.event, keys);
        }, "onEvent")
      },
      {
        selector: '[data-action="row"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          for (let node = e.event.target; node && node !== e.target; node = node.parentNode) {
            if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL)$/.test(node.tagName)) return;
          }
          const key = e.target.getAttribute("data-value");
          const index = Number(e.target.getAttribute("data-index"));
          const rows = rowsByKey(e.sender.state, [key]);
          emit(p.onRowClick, e.sender, e.event, { row: rows[0] || null, key, index });
        }, "onEvent")
      }
    ],
    methods: {
      setData: /* @__PURE__ */ __name(function(data) {
        const s = this.state;
        const next = (data || []).slice();
        const keys = [];
        for (let i = 0; i < next.length; i++) keys.push(keyOf(next[i], i, s.rowKey));
        const kept = [];
        for (let i = 0; i < s.selected.length; i++) if (keys.indexOf(s.selected[i]) >= 0) kept.push(s.selected[i]);
        this.setState({ data: next, selected: kept, page: s.mode === "server" ? s.page : 1, loading: false });
      }, "setData"),
      getData: /* @__PURE__ */ __name(function() {
        return this.state.data.slice();
      }, "getData"),
      setColumns: /* @__PURE__ */ __name(function(columns) {
        this.setState({ columns: (columns || []).slice() });
      }, "setColumns"),
      getSelection: /* @__PURE__ */ __name(function() {
        return rowsByKey(this.state, this.state.selected);
      }, "getSelection"),
      clearSelection: /* @__PURE__ */ __name(function() {
        this.setState({ selected: [] });
      }, "clearSelection"),
      setPage: /* @__PURE__ */ __name(function(page) {
        this.setState({ page: Math.max(1, Math.floor(Number(page) || 1)) });
      }, "setPage"),
      setQuery: /* @__PURE__ */ __name(function(query) {
        this.setState({ query, page: 1 });
      }, "setQuery"),
      setLoading: /* @__PURE__ */ __name(function(loading) {
        this.setState({ loading: !!loading });
      }, "setLoading"),
      setTotal: /* @__PURE__ */ __name(function(total) {
        this.setState({ total });
      }, "setTotal"),
      getValue: /* @__PURE__ */ __name(function() {
        return this.state.selected.slice();
      }, "getValue"),
      setValue: /* @__PURE__ */ __name(function(keys) {
        this.setState({ selected: (keys || []).slice() });
      }, "setValue")
    },
    onMount: applyHeight,
    onUpdate: applyHeight
  });
}
__name(vfGrid, "vfGrid");

// layer2/src/_internal/props.js
function oneOf(prop, value, allowed) {
  if (value == null || value === "") return allowed[0];
  if (allowed.indexOf(value) >= 0) return value;
  if (DEV) warn(prop + ' "' + value + '" is not one of ' + allowed.join(", ") + '; using "' + allowed[0] + '".');
  return allowed[0];
}
__name(oneOf, "oneOf");

// layer2/src/data/geometry.js
function r2(n) {
  return Math.round(n * 100) / 100;
}
__name(r2, "r2");
function niceStep(span, count) {
  const raw = span / Math.max(1, count);
  const power = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
  const f = raw / power;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * power;
}
__name(niceStep, "niceStep");
function niceTicks(lo, hi, count) {
  let min = Math.min(0, lo);
  let max = Math.max(0, hi);
  if (min === max) max = min + 1;
  const step = niceStep(max - min, count || 5);
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return { min, max, ticks };
}
__name(niceTicks, "niceTicks");
function point(cx, cy, radius, angle) {
  return r2(cx + radius * Math.sin(angle)) + " " + r2(cy - radius * Math.cos(angle));
}
__name(point, "point");
function arcPath(cx, cy, radius, inner, a0, a1) {
  if (a1 - a0 >= Math.PI * 2 - 1e-6) {
    const mid = a0 + Math.PI;
    return arcPath(cx, cy, radius, inner, a0, mid) + " " + arcPath(cx, cy, radius, inner, mid, a0 + Math.PI * 2);
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const outer = "M " + point(cx, cy, radius, a0) + " A " + radius + " " + radius + " 0 " + large + " 1 " + point(cx, cy, radius, a1);
  if (!inner) return outer + " L " + r2(cx) + " " + r2(cy) + " Z";
  return outer + " L " + point(cx, cy, inner, a1) + " A " + inner + " " + inner + " 0 " + large + " 0 " + point(cx, cy, inner, a0) + " Z";
}
__name(arcPath, "arcPath");

// layer2/src/data/chart.js
var html2 = default2.html;
var TYPES = ["bar", "line", "area", "pie", "donut", "sparkline"];
var COLORS = 8;
var PAD = { top: 12, right: 12, bottom: 28, left: 48 };
function normalize(data) {
  const d = data || {};
  const labels = d.labels || [];
  const series = [];
  const list = d.series || [];
  for (let i = 0; i < list.length; i++) {
    const values = [];
    const raw = list[i] && list[i].data || [];
    for (let j = 0; j < raw.length; j++) values.push(Number(raw[j]) || 0);
    series.push({ name: list[i] && list[i].name != null ? String(list[i].name) : String(i + 1), data: values, index: i });
  }
  return { labels, series };
}
__name(normalize, "normalize");
function color(i) {
  return String(i % COLORS);
}
__name(color, "color");
function markAttrs(s, series, index, label, value, className) {
  const text = msg("chart.point", null, { series: series.name, label, value: default2.fmt.number(value, s.valueFormat) });
  return {
    class: className,
    "data-series": color(series.index),
    "data-s": series.index,
    "data-index": index,
    "data-action": s.interactive ? "mark" : null,
    tabindex: s.interactive ? 0 : null,
    "aria-label": s.interactive ? text : null
  };
}
__name(markAttrs, "markAttrs");
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
  const y = /* @__PURE__ */ __name(function(v) {
    return r2(PAD.top + plotH - (v - axis.min) / (axis.max - axis.min) * plotH);
  }, "y");
  const n = Math.max(1, d.labels.length);
  const band = plotW / n;
  const out = [];
  for (let t = 0; t < axis.ticks.length; t++) {
    const ty = y(axis.ticks[t]);
    out.push(html2`<line class="vf-chart__gridline" x1="${PAD.left}" x2="${W - PAD.right}" y1="${ty}" y2="${ty}"></line><text class="vf-chart__tick" x="${PAD.left - 6}" y="${ty}" text-anchor="end" dominant-baseline="middle">${default2.fmt.number(axis.ticks[t], s.valueFormat)}</text>`);
  }
  const every = Math.ceil(n / Math.max(1, Math.floor(plotW / 48)));
  for (let i = 0; i < d.labels.length; i += every) {
    out.push(html2`<text class="vf-chart__label" x="${r2(PAD.left + band * (i + 0.5))}" y="${H - 8}" text-anchor="middle">${d.labels[i]}</text>`);
  }
  const zero = y(Math.max(axis.min, Math.min(0, axis.max)));
  if (s.type === "bar") {
    const inner = band * 0.8 / Math.max(1, visible.length);
    for (let k = 0; k < visible.length; k++) {
      const series = visible[k];
      for (let i = 0; i < n && i < series.data.length; i++) {
        const v = series.data[i];
        const top = Math.min(y(v), zero);
        const x = r2(PAD.left + band * i + band * 0.1 + inner * k);
        out.push(html2`<rect ${attrs(markAttrs(s, series, i, d.labels[i], v, "vf-chart__mark vf-chart__bar"))} x="${x}" y="${top}" width="${r2(Math.max(inner - 1, 1))}" height="${r2(Math.max(Math.abs(y(v) - zero), 0.5))}"></rect>`);
      }
    }
  } else {
    for (let k = 0; k < visible.length; k++) {
      const series = visible[k];
      const pts = [];
      for (let i = 0; i < n && i < series.data.length; i++) pts.push([r2(PAD.left + band * (i + 0.5)), y(series.data[i])]);
      if (!pts.length) continue;
      let line = "M " + pts[0][0] + " " + pts[0][1];
      for (let i = 1; i < pts.length; i++) line += " L " + pts[i][0] + " " + pts[i][1];
      if (s.type === "area") {
        const area = line + " L " + pts[pts.length - 1][0] + " " + zero + " L " + pts[0][0] + " " + zero + " Z";
        out.push(html2`<path class="vf-chart__area" data-series="${color(series.index)}" d="${area}"></path>`);
      }
      out.push(html2`<path class="vf-chart__line" data-series="${color(series.index)}" d="${line}"></path>`);
      for (let i = 0; i < pts.length; i++) {
        out.push(html2`<circle ${attrs(markAttrs(s, series, i, d.labels[i], series.data[i], "vf-chart__mark vf-chart__point"))} cx="${pts[i][0]}" cy="${pts[i][1]}" r="4"></circle>`);
      }
    }
  }
  return out;
}
__name(cartesian, "cartesian");
function radial(s, d, W, H) {
  const series = d.series[0] || { name: "", data: [], index: 0 };
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.max(1, Math.min(W, H) / 2 - 8);
  const inner = s.type === "donut" ? r2(radius * 0.6) : 0;
  let total = 0;
  for (let i = 0; i < series.data.length; i++) if (s.hidden.indexOf(i) < 0) total += Math.max(0, series.data[i]);
  const out = [];
  let a = 0;
  for (let i = 0; i < series.data.length; i++) {
    const v = Math.max(0, series.data[i]);
    if (s.hidden.indexOf(i) >= 0 || !v || !total) continue;
    const a1 = a + v / total * Math.PI * 2;
    const slice = { name: d.labels[i] != null ? String(d.labels[i]) : series.name, index: i };
    out.push(html2`<path ${attrs(markAttrs(s, slice, i, d.labels[i], v, "vf-chart__mark vf-chart__slice"))} d="${arcPath(cx, cy, r2(radius), inner, a, a1)}"></path>`);
    a = a1;
  }
  return out;
}
__name(radial, "radial");
function legend(s, d) {
  const radialType = s.type === "pie" || s.type === "donut";
  const names = [];
  if (radialType) for (let i = 0; i < d.labels.length; i++) names.push({ name: d.labels[i], index: i });
  else for (let i = 0; i < d.series.length; i++) names.push({ name: d.series[i].name, index: i });
  if (names.length < 2 && !radialType) return "";
  const items = [];
  for (let i = 0; i < names.length; i++) {
    const shown = s.hidden.indexOf(names[i].index) < 0;
    const swatch = html2`<span class="vf-chart__swatch" data-series="${color(names[i].index)}" aria-hidden="true"></span>`;
    items.push(s.interactive ? html2`<li><button ${attrs({ type: "button", class: "vf-chart__toggle", "data-action": "toggle-series", "data-index": names[i].index, "aria-pressed": shown })}>${swatch}${names[i].name}</button></li>` : html2`<li class="vf-chart__entry">${swatch}${names[i].name}</li>`);
  }
  return html2`<ul class="vf-chart__legend" aria-label="${msg("chart.legend")}">${items}</ul>`;
}
__name(legend, "legend");
function dataTable(s, d) {
  const columns = [{ key: "label", label: "" }];
  for (let i = 0; i < d.series.length; i++) columns.push({ key: "s" + i, label: d.series[i].name, align: "end" });
  const rows = [];
  for (let j = 0; j < d.labels.length; j++) {
    const row = { id: String(j), label: d.labels[j] };
    for (let i = 0; i < d.series.length; i++) row["s" + i] = default2.fmt.number(d.series[i].data[j] || 0, s.valueFormat);
    rows.push(row);
  }
  return html2`<div class="vf-visually-hidden">${default2.vsTable({ columns, data: rows, caption: s.label || msg("chart.label") })}</div>`;
}
__name(dataTable, "dataTable");
function draw(s) {
  const type = oneOf("vsChart type", s.type, TYPES);
  const d = normalize(s.data);
  if (type === "sparkline") {
    return default2.vsSparkline({ data: d.series[0] ? d.series[0].data : [], label: s.label, format: s.valueFormat, id: s.id, className: s.className });
  }
  const st = extend({}, s, { type, hidden: s.hidden || [] });
  const W = Math.max(120, Math.round(Number(s.width) || 600));
  const H = Math.max(80, Math.round(Number(s.height) || 240));
  const visible = [];
  for (let i = 0; i < d.series.length; i++) if (st.hidden.indexOf(i) < 0) visible.push(d.series[i]);
  const marks = type === "pie" || type === "donut" ? radial(st, d, W, H) : cartesian(st, d, visible, W, H);
  const tooltip = s.interactive ? html2`<div ${attrs({ class: "vf-chart__tooltip", id: s.id + "-tooltip", "aria-hidden": true, hidden: true })}></div>` : "";
  return html2`<figure ${attrs({
    class: cls("vf-chart", s.className),
    id: s.id,
    "data-ref": s.ref,
    "data-type": type,
    "data-animate": s.animate ? true : null
  })}><svg ${attrs({ class: "vf-chart__svg", role: "img", "aria-label": present(s.label) ? s.label : msg("chart.label") })} viewBox="0 0 ${W} ${H}" focusable="false">${marks}</svg>${s.legend === false ? "" : legend(st, d)}${s.dataTable ? dataTable(st, d) : ""}${tooltip}</figure>`;
}
__name(draw, "draw");
function vsChart(props) {
  return draw(extend({}, props || {}, { interactive: false, animate: false }));
}
__name(vsChart, "vsChart");
function vfChart(props) {
  const p = props || {};
  let observer = null;
  let onResize = null;
  function measure(self) {
    const width = self.$node.clientWidth;
    if (width > 0 && Math.abs(width - (self.state.width || 0)) > 1) self.setState({ width });
  }
  __name(measure, "measure");
  function tip(self, mark, show) {
    const tooltip = self.ids[self.state.id + "-tooltip"];
    if (!tooltip) return;
    if (!show) {
      tooltip.hidden = true;
      return;
    }
    tooltip.textContent = mark.getAttribute("aria-label");
    tooltip.hidden = false;
    const root = self.$node.getBoundingClientRect();
    const r = mark.getBoundingClientRect();
    tooltip.style.left = Math.round(r.left - root.left + r.width / 2) + "px";
    tooltip.style.top = Math.round(r.top - root.top) + "px";
  }
  __name(tip, "tip");
  const state = stateOf(p, "chart", {
    type: oneOf("vfChart type", p.type, TYPES),
    data: p.data || { labels: [], series: [] },
    hidden: [],
    interactive: true,
    animate: true,
    width: 0,
    instance: null
  });
  return instance({
    state,
    render: draw,
    delegates: [
      { selector: '[data-action="mark"]', eventType: "mouseover", onEvent: /* @__PURE__ */ __name(function(e) {
        tip(e.sender, e.target, true);
      }, "onEvent") },
      { selector: '[data-action="mark"]', eventType: "focusin", onEvent: /* @__PURE__ */ __name(function(e) {
        tip(e.sender, e.target, true);
      }, "onEvent") },
      { selector: '[data-action="mark"]', eventType: "mouseout", onEvent: /* @__PURE__ */ __name(function(e) {
        tip(e.sender, e.target, false);
      }, "onEvent") },
      { selector: '[data-action="mark"]', eventType: "focusout", onEvent: /* @__PURE__ */ __name(function(e) {
        tip(e.sender, e.target, false);
      }, "onEvent") },
      {
        selector: '[data-action="mark"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const s = e.sender.state;
          const d = normalize(s.data);
          const si = Number(e.target.getAttribute("data-s"));
          const i = Number(e.target.getAttribute("data-index"));
          const radialType = s.type === "pie" || s.type === "donut";
          const series = radialType ? d.series[0] : d.series[si];
          emit(p.onClick, e.sender, e.event, {
            series: series ? series.name : null,
            index: i,
            label: d.labels[i],
            value: series ? series.data[i] : null
          });
        }, "onEvent")
      },
      {
        selector: '[data-action="toggle-series"]',
        eventType: "click",
        onEvent: /* @__PURE__ */ __name(function(e) {
          const i = Number(e.target.getAttribute("data-index"));
          const hidden = e.sender.state.hidden.slice();
          const at = hidden.indexOf(i);
          if (at >= 0) hidden.splice(at, 1);
          else hidden.push(i);
          e.sender.setState({ hidden, animate: false });
        }, "onEvent")
      }
    ],
    methods: {
      setData: /* @__PURE__ */ __name(function(data) {
        this.setState({ data: data || { labels: [], series: [] }, hidden: [], animate: true });
      }, "setData"),
      setType: /* @__PURE__ */ __name(function(type) {
        this.setState({ type: oneOf("vfChart type", type, TYPES), hidden: [], animate: true });
      }, "setType"),
      resize: /* @__PURE__ */ __name(function() {
        measure(this);
      }, "resize"),
      getValue: /* @__PURE__ */ __name(function() {
        return this.state.data;
      }, "getValue"),
      setValue: /* @__PURE__ */ __name(function(data) {
        this.setData(data);
      }, "setValue")
    },
    onMount: /* @__PURE__ */ __name(function(self) {
      measure(self);
      if (typeof window === "undefined") return;
      if (typeof window.ResizeObserver === "function") {
        observer = new window.ResizeObserver(function() {
          measure(self);
        });
        observer.observe(self.$node);
      } else {
        onResize = /* @__PURE__ */ __name(function() {
          measure(self);
        }, "onResize");
        window.addEventListener("resize", onResize);
      }
    }, "onMount"),
    onUpdate: /* @__PURE__ */ __name(function(self) {
      self.state.animate = false;
      if (observer) {
        observer.disconnect();
        observer.observe(self.$node);
      }
    }, "onUpdate"),
    onDestroy: /* @__PURE__ */ __name(function() {
      if (observer) observer.disconnect();
      if (onResize) window.removeEventListener("resize", onResize);
      observer = null;
      onResize = null;
    }, "onDestroy")
  });
}
__name(vfChart, "vfChart");

// layer2/src/data.js
var members = {
  vfGrid,
  vsChart,
  vfChart
};
var hasOwn2 = Object.prototype.hasOwnProperty;
var conflicts = [];
for (const key in members) {
  if (!hasOwn2.call(members, key)) continue;
  if (hasOwn2.call(default2, key)) {
    if (default2[key] !== members[key]) conflicts.push(key);
    continue;
  }
  Object.defineProperty(default2, key, { value: members[key], enumerable: true, writable: false, configurable: false });
}
if (DEV && conflicts.length) warn("vf already has " + conflicts.join(", ") + "; the existing members were kept.");
var data_default = members;
export {
  data_default as default,
  vfChart,
  vfGrid,
  vsChart
};
//# sourceMappingURL=vfunc-ui-data.esm.js.map
