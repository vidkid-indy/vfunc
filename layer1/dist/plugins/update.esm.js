/*! vfunc.js update plugin (vfunc v1.0.0-rc.3) | Apache-2.0 | (c) 2026 vidkid | https://github.com/vidkid-indy/vfunc */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// layer1/plugins/update.js
var DEFAULTS = {
  url: "./version.json",
  current: "",
  // the running version; empty = the first version read becomes the baseline
  policy: "next-navigation",
  // 'next-navigation' | 'prompt' | 'immediate'
  interval: 10,
  // minutes between periodic checks; 0 turns them off
  minGap: 30,
  // seconds; checks closer together than this are skipped
  onAvailable: null,
  // function (info, apply) for the 'prompt' policy
  onError: null
  // function (error) when version.json cannot be read
};
var POLICIES = { "next-navigation": 1, prompt: 1, immediate: 1 };
function readVersion(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    var separator = url.indexOf("?") >= 0 ? "&" : "?";
    request.open("GET", url + separator + "t=" + (/* @__PURE__ */ new Date()).getTime(), true);
    request.onreadystatechange = function() {
      if (request.readyState !== 4) return;
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("update: " + url + " answered " + request.status));
        return;
      }
      try {
        var data = JSON.parse(request.responseText);
        var version = data && typeof data.version === "string" ? data.version : "";
        if (!version) throw new Error("update: " + url + ' has no "version" string');
        resolve(version);
      } catch (err) {
        reject(err);
      }
    };
    request.send(null);
  });
}
__name(readVersion, "readVersion");
function install(vf, options) {
  var o = {};
  var key;
  for (key in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) o[key] = DEFAULTS[key];
  for (key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key) && Object.prototype.hasOwnProperty.call(DEFAULTS, key)) o[key] = options[key];
  }
  if (!Object.prototype.hasOwnProperty.call(POLICIES, o.policy)) o.policy = DEFAULTS.policy;
  if (o.policy === "prompt" && typeof o.onAvailable !== "function") o.policy = "next-navigation";
  var reload = typeof options.reload === "function" ? options.reload : function() {
    window.location.reload();
  };
  var state = { current: o.current || "", latest: "", pending: false, lastCheck: 0, checking: null, reloading: false };
  var timer = null;
  function apply() {
    if (state.reloading) return;
    state.reloading = true;
    reload();
  }
  __name(apply, "apply");
  function found(latest) {
    state.latest = latest;
    if (!state.current) {
      state.current = latest;
      return;
    }
    if (latest === state.current || state.pending) return;
    state.pending = true;
    var info = { current: state.current, latest, policy: o.policy };
    if (o.policy === "immediate") apply();
    else if (o.policy === "prompt") o.onAvailable(info, apply);
  }
  __name(found, "found");
  function check(force) {
    var now = (/* @__PURE__ */ new Date()).getTime();
    if (state.checking) return state.checking;
    if (!force && state.lastCheck && now - state.lastCheck < o.minGap * 1e3) return Promise.resolve(status());
    state.lastCheck = now;
    state.checking = readVersion(o.url).then(function(latest) {
      state.checking = null;
      found(latest);
      return status();
    }, function(err) {
      state.checking = null;
      if (typeof o.onError === "function") o.onError(err);
      return status();
    });
    return state.checking;
  }
  __name(check, "check");
  function navigated() {
    if (state.pending && o.policy === "next-navigation") apply();
    else check(false);
  }
  __name(navigated, "navigated");
  function onVisibility() {
    if (document.visibilityState === "visible") check(false);
  }
  __name(onVisibility, "onVisibility");
  function status() {
    return { current: state.current, latest: state.latest, pending: state.pending, policy: o.policy };
  }
  __name(status, "status");
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    window.removeEventListener("hashchange", navigated);
    window.removeEventListener("popstate", navigated);
    document.removeEventListener("visibilitychange", onVisibility);
  }
  __name(stop, "stop");
  window.addEventListener("hashchange", navigated);
  window.addEventListener("popstate", navigated);
  document.addEventListener("visibilitychange", onVisibility);
  if (o.interval > 0) timer = setInterval(function() {
    check(false);
  }, o.interval * 60 * 1e3);
  check(true);
  return { check, navigated, apply, status, stop };
}
__name(install, "install");
var vfUpdate = { name: "update", version: "1.0.0", requires: "^1.0.0", install };
var update_default = vfUpdate;
export {
  update_default as default
};
//# sourceMappingURL=update.esm.js.map
