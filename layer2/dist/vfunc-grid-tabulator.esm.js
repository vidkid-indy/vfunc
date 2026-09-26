/*! vfunc-ui (vfunc.js layer 2) v1.0.0 | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// layer2/src/_internal/vf.js
import { default as default2 } from "../../layer1/dist/vfunc.esm.js";

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
  return default2.vfunc({
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
    else out.push(name + '="' + default2.esc(URL_ATTR.test(name) ? default2.safeUrl(value) : value) + '"');
  }
  return default2.unsafeHtml(out.join(" "));
}
__name(attrs, "attrs");

// layer2/src/_internal/adapter.js
var html = default2.html;
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
function textOf(value) {
  if (value == null) return "";
  if (value instanceof default2.SafeHtml) {
    const el = default2.node(default2.html`<span>${value}</span>`);
    return el ? el.textContent : "";
  }
  return String(value);
}
__name(textOf, "textOf");
function cellNode(column, row, index) {
  const value = column.render(row, index);
  const span = document.createElement("span");
  span.appendChild(value instanceof default2.SafeHtml ? default2.frag(value) : document.createTextNode(value == null ? "" : String(value)));
  return span;
}
__name(cellNode, "cellNode");
function register(members) {
  for (const key in members) {
    if (!Object.prototype.hasOwnProperty.call(members, key) || Object.prototype.hasOwnProperty.call(default2, key)) continue;
    Object.defineProperty(default2, key, { value: members[key], enumerable: true, writable: false, configurable: false });
  }
}
__name(register, "register");
function rowKeyOf(row, rowKey) {
  const k = rowKey || "id";
  return row != null && row[k] != null ? String(row[k]) : "";
}
__name(rowKeyOf, "rowKeyOf");

// layer2/adapters/grid-tabulator/index.js
var ALIGN = { start: "left", center: "center", end: "right" };
function columnDefs(columns) {
  const out = [];
  for (let i = 0; i < (columns || []).length; i++) {
    const c = columns[i];
    out.push({
      title: textOf(c.label),
      field: c.key,
      headerSort: !!c.sortable,
      hozAlign: ALIGN[c.align] || void 0,
      formatter: typeof c.render === "function" ? /* @__PURE__ */ (function(col) {
        return function(cell) {
          return cellNode(col, cell.getData(), cell.getRow().getPosition());
        };
      })(c) : void 0
    });
  }
  return out;
}
__name(columnDefs, "columnDefs");
function vfGridTabulator(props) {
  const p = props || {};
  let table = null;
  let built = false;
  let pending = [];
  let unsubscribe = null;
  let lastSort = "";
  const state = stateOf(p, "grid-tabulator", {
    columns: (p.columns || []).slice(),
    data: (p.data || []).slice(),
    selectable: p.selectable === true ? "multiple" : p.selectable === "single" || p.selectable === "multiple" ? p.selectable : "none",
    instance: null
  });
  delete state.lib;
  delete state.options;
  function whenBuilt(fn) {
    if (table && built) return fn(table);
    pending.push(fn);
    return void 0;
  }
  __name(whenBuilt, "whenBuilt");
  return instance({
    state,
    render: /* @__PURE__ */ __name(function(s) {
      return hostMarkup(s, "vf-grid-tabulator");
    }, "render"),
    methods: {
      setData: /* @__PURE__ */ __name(function(data) {
        this.state.data = (data || []).slice();
        const rows = this.state.data;
        return whenBuilt(function(t) {
          return t.setData(rows);
        });
      }, "setData"),
      getData: /* @__PURE__ */ __name(function() {
        return this.state.data.slice();
      }, "getData"),
      setColumns: /* @__PURE__ */ __name(function(columns) {
        this.state.columns = (columns || []).slice();
        const defs = columnDefs(this.state.columns);
        return whenBuilt(function(t) {
          return t.setColumns(defs);
        });
      }, "setColumns"),
      getSelection: /* @__PURE__ */ __name(function() {
        return table && built ? table.getSelectedData() : [];
      }, "getSelection"),
      clearSelection: /* @__PURE__ */ __name(function() {
        whenBuilt(function(t) {
          t.deselectRow();
        });
      }, "clearSelection"),
      setPage: /* @__PURE__ */ __name(function(page) {
        const n = Math.max(1, Math.floor(Number(page) || 1));
        return whenBuilt(function(t) {
          return t.setPage(n);
        });
      }, "setPage"),
      getValue: /* @__PURE__ */ __name(function() {
        const rows = this.getSelection();
        const keys = [];
        for (let i = 0; i < rows.length; i++) keys.push(rowKeyOf(rows[i], this.state.rowKey));
        return keys;
      }, "getValue")
    },
    onMount: /* @__PURE__ */ __name(function(self) {
      const Lib = vendorLib(p, "Tabulator", "vfGridTabulator");
      const s = self.state;
      const options = extend({
        data: s.data,
        index: s.rowKey || "id",
        columns: columnDefs(s.columns),
        layout: "fitColumns",
        height: s.height != null ? s.height : false,
        pagination: true,
        paginationSize: Math.max(1, Math.floor(Number(s.pageSize) || 10)),
        selectableRows: s.selectable === "multiple" ? true : s.selectable === "single" ? 1 : false,
        placeholder: default2.t("emptyState.title")
      }, p.options);
      table = new Lib(hostOf(self), options);
      self.state.instance = table;
      table.on("tableBuilt", function() {
        built = true;
        const queue = pending;
        pending = [];
        for (let i = 0; i < queue.length; i++) queue[i](table);
      });
      table.on("rowClick", function(e, row) {
        emit(p.onRowClick, self, e, { row: row.getData(), key: String(row.getIndex()), index: row.getPosition() });
      });
      table.on("rowSelectionChanged", function(data) {
        if (!built) return;
        const keys = [];
        for (let i = 0; i < data.length; i++) keys.push(rowKeyOf(data[i], s.rowKey));
        emit(p.onSelect, self, null, { keys, rows: data });
      });
      table.on("dataSorted", function(sorters) {
        const first = sorters && sorters[0];
        const now = first ? first.field + " " + first.dir : "";
        if (!first || now === lastSort) return;
        lastSort = now;
        emit(p.onSort, self, null, { key: first.field, dir: first.dir });
      });
      unsubscribe = default2.i18n.subscribe(function() {
        whenBuilt(function(t) {
          if (t.options) t.options.placeholder = default2.t("emptyState.title");
        });
      });
    }, "onMount"),
    onDestroy: /* @__PURE__ */ __name(function(self) {
      if (unsubscribe) unsubscribe();
      if (table) table.destroy();
      table = null;
      built = false;
      pending = [];
      unsubscribe = null;
      self.state.instance = null;
    }, "onDestroy")
  });
}
__name(vfGridTabulator, "vfGridTabulator");
register({ vfGridTabulator });
var index_default = vfGridTabulator;
export {
  index_default as default,
  vfGridTabulator
};
//# sourceMappingURL=vfunc-grid-tabulator.esm.js.map
