/*! vfunc-ui (vfunc.js layer 2) v1.0.0-rc.8 | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // layer2/src/_internal/vf.js
  var vf = typeof window !== "undefined" ? window.vf : void 0;
  if (!vf || typeof vf.vfunc !== "function") throw new Error("[vfunc-ui] load vfunc.js before this file.");
  var vf_default = vf;

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
    return vf_default.vfunc({
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

  // layer2/src/_internal/dev.js
  var DEV = false ? true : true;
  function warn(message) {
    if (typeof console !== "undefined" && console.warn) console.warn("[vfunc-ui] " + message);
  }
  __name(warn, "warn");

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
      else out.push(name + '="' + vf_default.esc(URL_ATTR.test(name) ? vf_default.safeUrl(value) : value) + '"');
    }
    return vf_default.unsafeHtml(out.join(" "));
  }
  __name(attrs, "attrs");

  // layer2/src/_internal/adapter.js
  var html = vf_default.html;
  function vendorLib(p, globalName, name) {
    const lib = p.lib || (typeof window !== "undefined" ? window[globalName] : null);
    if (!lib) throw new Error("[vfunc-ui] " + name + ": load the vendor library first (global " + globalName + ") or pass it as `lib`.");
    return lib;
  }
  __name(vendorLib, "vendorLib");
  function hostMarkup(s, block) {
    return html`<div ${attrs({ class: cls("vf-adapter " + block, s.className), id: s.id, "data-ref": s.ref })}><div class="vf-adapter__host" data-vf-keep="host"></div></div>`;
  }
  __name(hostMarkup, "hostMarkup");
  function hostOf(self) {
    return self.$node.querySelector('[data-vf-keep="host"]');
  }
  __name(hostOf, "hostOf");
  function token(name) {
    if (typeof window === "undefined" || !window.getComputedStyle) return "";
    return window.getComputedStyle(document.documentElement).getPropertyValue(name).replace(/^\s+|\s+$/g, "");
  }
  __name(token, "token");
  function chartColors() {
    const out = [];
    for (let i = 1; i <= 8; i++) {
      const c = token("--vf-chart-" + i);
      if (c) out.push(c);
    }
    return out;
  }
  __name(chartColors, "chartColors");
  function reducedMotion() {
    try {
      return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (err) {
      return false;
    }
  }
  __name(reducedMotion, "reducedMotion");
  function watchSize(el, fn) {
    if (typeof window === "undefined") return function() {
    };
    if (typeof window.ResizeObserver === "function") {
      const observer = new window.ResizeObserver(function() {
        fn();
      });
      observer.observe(el);
      return function() {
        observer.disconnect();
      };
    }
    window.addEventListener("resize", fn);
    return function() {
      window.removeEventListener("resize", fn);
    };
  }
  __name(watchSize, "watchSize");
  function register(members) {
    for (const key in members) {
      if (!Object.prototype.hasOwnProperty.call(members, key) || Object.prototype.hasOwnProperty.call(vf_default, key)) continue;
      Object.defineProperty(vf_default, key, { value: members[key], enumerable: true, writable: false, configurable: false });
    }
  }
  __name(register, "register");
  function chartType(type) {
    return /^(bar|line|area|pie|donut)$/.test(type) ? type : "bar";
  }
  __name(chartType, "chartType");
  function chartData(data) {
    const d = data || {};
    const series = [];
    for (let i = 0; i < (d.series || []).length; i++) {
      const s = d.series[i] || {};
      series.push({ name: s.name == null ? String(i + 1) : String(s.name), data: (s.data || []).slice() });
    }
    return { labels: (d.labels || []).slice(), series };
  }
  __name(chartData, "chartData");

  // layer2/adapters/chart-echarts/index.js
  function option(s, extra) {
    const type = chartType(s.type);
    const d = chartData(s.data);
    const radial = type === "pie" || type === "donut";
    const base = {
      color: chartColors(),
      animation: !reducedMotion(),
      aria: { enabled: true, label: { description: s.label || vf_default.t("chart.label") } },
      tooltip: { trigger: radial ? "item" : "axis" },
      legend: radial || d.series.length > 1 ? {} : { show: false }
    };
    if (radial) {
      const first = d.series[0] || { name: "", data: [] };
      const points = [];
      for (let i = 0; i < d.labels.length; i++) points.push({ name: String(d.labels[i]), value: first.data[i] });
      base.series = [{ type: "pie", name: first.name, radius: type === "donut" ? ["45%", "70%"] : "70%", data: points }];
    } else {
      base.xAxis = { type: "category", data: d.labels };
      base.yAxis = { type: "value" };
      base.series = [];
      for (let i = 0; i < d.series.length; i++) {
        base.series.push({ type: type === "bar" ? "bar" : "line", name: d.series[i].name, data: d.series[i].data, areaStyle: type === "area" ? {} : void 0 });
      }
    }
    return extend(base, extra);
  }
  __name(option, "option");
  function vfChartEcharts(props) {
    const p = props || {};
    let chart = null;
    let stopWatch = null;
    const state = stateOf(p, "chart-echarts", { type: chartType(p.type), data: chartData(p.data), instance: null });
    delete state.lib;
    delete state.options;
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return hostMarkup(s, "vf-chart-echarts");
      }, "render"),
      methods: {
        setData: /* @__PURE__ */ __name(function(data) {
          this.state.data = chartData(data);
          if (chart) chart.setOption(option(this.state, p.options), true);
        }, "setData"),
        setType: /* @__PURE__ */ __name(function(type) {
          this.state.type = chartType(type);
          if (chart) chart.setOption(option(this.state, p.options), true);
        }, "setType"),
        resize: /* @__PURE__ */ __name(function() {
          if (chart) chart.resize();
        }, "resize"),
        getValue: /* @__PURE__ */ __name(function() {
          return this.state.data;
        }, "getValue"),
        setValue: /* @__PURE__ */ __name(function(data) {
          this.setData(data);
        }, "setValue")
      },
      onMount: /* @__PURE__ */ __name(function(self) {
        const lib = vendorLib(p, "echarts", "vfChartEcharts");
        const host = hostOf(self);
        host.style.height = (Number(self.state.height) || 240) + "px";
        chart = lib.init(host, null, { renderer: "svg" });
        chart.setOption(option(self.state, p.options), true);
        chart.on("click", function(params) {
          const s = self.state;
          const d = chartData(s.data);
          const radial = s.type === "pie" || s.type === "donut";
          const series = d.series[radial ? 0 : params.seriesIndex];
          emit(p.onClick, self, params.event && params.event.event ? params.event.event : null, {
            series: series ? series.name : null,
            index: params.dataIndex,
            label: d.labels[params.dataIndex],
            value: series ? series.data[params.dataIndex] : null
          });
        });
        self.state.instance = chart;
        stopWatch = watchSize(host, function() {
          if (chart) chart.resize();
        });
      }, "onMount"),
      onDestroy: /* @__PURE__ */ __name(function(self) {
        if (stopWatch) stopWatch();
        if (chart) chart.dispose();
        chart = null;
        stopWatch = null;
        self.state.instance = null;
      }, "onDestroy")
    });
  }
  __name(vfChartEcharts, "vfChartEcharts");
  register({ vfChartEcharts });
  var index_default = vfChartEcharts;
})();
//# sourceMappingURL=vfunc-chart-echarts.js.map
