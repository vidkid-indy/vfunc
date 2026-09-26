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

  // layer2/adapters/chart-chartjs/index.js
  var TYPES = { bar: "bar", line: "line", area: "line", pie: "pie", donut: "doughnut" };
  function config(s) {
    const type = chartType(s.type);
    const d = chartData(s.data);
    const colors = chartColors();
    const radial = type === "pie" || type === "donut";
    const pick = /* @__PURE__ */ __name(function(i) {
      return colors.length ? colors[i % colors.length] : void 0;
    }, "pick");
    const datasets = [];
    for (let i = 0; i < d.series.length; i++) {
      const perPoint = [];
      if (radial) for (let j = 0; j < d.labels.length; j++) perPoint.push(pick(j));
      datasets.push({
        label: d.series[i].name,
        data: d.series[i].data,
        backgroundColor: radial ? perPoint : pick(i),
        borderColor: radial ? void 0 : pick(i),
        fill: type === "area"
      });
    }
    return { type: TYPES[type], data: { labels: d.labels, datasets } };
  }
  __name(config, "config");
  function vfChartChartjs(props) {
    const p = props || {};
    let chart = null;
    let lib = null;
    let canvas = null;
    const state = stateOf(p, "chart-chartjs", { type: chartType(p.type), data: chartData(p.data), instance: null });
    delete state.lib;
    delete state.options;
    function create(self) {
      const c = config(self.state);
      c.options = extend({
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion() ? false : void 0,
        onClick: /* @__PURE__ */ __name(function(event, elements) {
          const el = elements && elements[0];
          if (!el) return;
          const d = chartData(self.state.data);
          const radial = self.state.type === "pie" || self.state.type === "donut";
          const series = d.series[radial ? 0 : el.datasetIndex];
          emit(p.onClick, self, event && event.native ? event.native : null, {
            series: series ? series.name : null,
            index: el.index,
            label: d.labels[el.index],
            value: series ? series.data[el.index] : null
          });
        }, "onClick")
      }, p.options);
      chart = new lib(canvas, c);
      self.state.instance = chart;
    }
    __name(create, "create");
    return instance({
      state,
      render: /* @__PURE__ */ __name(function(s) {
        return hostMarkup(s, "vf-chart-chartjs");
      }, "render"),
      methods: {
        setData: /* @__PURE__ */ __name(function(data) {
          this.state.data = chartData(data);
          if (!chart) return;
          chart.data = config(this.state).data;
          chart.update();
        }, "setData"),
        setType: /* @__PURE__ */ __name(function(type) {
          this.state.type = chartType(type);
          if (!chart) return;
          chart.destroy();
          create(this);
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
        lib = vendorLib(p, "Chart", "vfChartChartjs");
        const host = hostOf(self);
        host.style.height = (Number(self.state.height) || 240) + "px";
        canvas = document.createElement("canvas");
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", self.state.label || vf_default.t("chart.label"));
        host.appendChild(canvas);
        create(self);
      }, "onMount"),
      onDestroy: /* @__PURE__ */ __name(function(self) {
        if (chart) chart.destroy();
        chart = null;
        canvas = null;
        self.state.instance = null;
      }, "onDestroy")
    });
  }
  __name(vfChartChartjs, "vfChartChartjs");
  register({ vfChartChartjs });
  var index_default = vfChartChartjs;
})();
//# sourceMappingURL=vfunc-chart-chartjs.js.map
