// SPDX-License-Identifier: Apache-2.0
//
// Template of a layer 2 adapter (level L2 of the third-party guide): copy this file, rename it
// vfunc-<kind>-<vendor>.js and the function vf<Kind><Vendor>, then work through the TODO(n) steps.
// They follow the 14 steps of the site guide "Third-party integration". The official adapters
// (layer2/adapters/grid-ag, grid-tabulator, chart-chartjs, chart-echarts) are finished examples.
//
// 어댑터 템플릿입니다. 파일을 복사해 이름을 바꾸고 TODO(n)을 차례로 채웁니다. 번호는 사이트 가이드
// "서드파티 통합"의 14단계와 같습니다.
//
// This file uses the public API only (rule 16): vf.vfunc, vf.html, vf.t, vf.i18n, vf.esc.

// TODO(1) License: MIT, Apache-2.0, BSD or ISC can be used as they are. GPL/LGPL/AGPL change how you
//         may ship your app; revenue-based or commercial-only licenses are out. Add the library to
//         your app's NOTICE.
// TODO(2) Pin the version and choose how it loads: a CDN <script> with an exact version, integrity
//         (SRI) and crossorigin, or an ES module import. Take the library from `props.lib` first,
//         then from its global. Wait for it if it loads asynchronously.

/* global vf */

export function vfKindVendor(props) {
  const p = props || {};
  let widget = null;      // the vendor object
  let stopSize = null;    // TODO(8)
  let stopLocale = null;  // TODO(10)

  function lib() {
    const found = p.lib || (typeof window !== 'undefined' ? window.VendorGlobal : null); // TODO(2) the vendor's global
    if (!found) throw new Error('[my-app] vfKindVendor: load the vendor library first or pass it as `lib`.');
    return found;
  }

  function toVendorOptions(state) {
    // TODO(4) Turn the props into the vendor's options. Keep functions (callbacks) out of state.
    // TODO(9) Theme: read the --vf-* tokens the vendor needs, e.g.
    //         getComputedStyle(document.documentElement).getPropertyValue('--vf-color-primary').
    // TODO(11) XSS: when the vendor takes HTML strings (cells, tooltips, labels), give it vf.esc(text)
    //          or a DOM node built from vf.html markup, never raw data.
    return { data: state.data };
  }

  function emit(callback, event, data) {
    // TODO(6) Callbacks receive { sender, event, data } (the base contract).
    if (typeof callback === 'function') callback({ sender: instance, event: event || null, data: data || {} });
  }

  const instance = vf.vfunc({
    replaceRoot: true,
    // TODO(3) The host element: the vendor draws only inside data-vf-keep, so a refresh of this
    //         component or of its parent keeps the vendor DOM. Never mix vendor DOM into render.
    state: { id: p.id || 'my-widget', data: p.data || [], instance: null },
    render: (s) => vf.html`<div class="my-widget" id="${s.id}"><div class="my-widget__host" data-vf-keep="host"></div></div>`,
    methods: {
      // TODO(5) Update through the vendor's API; do not create the vendor object again.
      setData(data) {
        this.state.data = data || [];
        if (widget) widget.update(toVendorOptions(this.state)); // the vendor's update call
      }
    },
    onMount(self) {
      const host = self.$node.querySelector('[data-vf-keep="host"]');
      // TODO(4) Create the vendor object here, when the element is in the page.
      widget = lib().create(host, toVendorOptions(self.state)); // the vendor's constructor
      // TODO(12) Expose the vendor object as .instance: advanced features are the app's, outside the contract.
      self.state.instance = widget;
      // TODO(6) Vendor events → props callbacks.
      widget.on('click', (e) => emit(p.onClick, e, { item: e.item }));
      // TODO(8) Size: ResizeObserver, or window resize where it is missing (IE11).
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => widget && widget.resize());
        observer.observe(host);
        stopSize = () => observer.disconnect();
      } else {
        const onResize = () => widget && widget.resize();
        window.addEventListener('resize', onResize);
        stopSize = () => window.removeEventListener('resize', onResize);
      }
      // TODO(10) Locale: follow vf.i18n and give the vendor its own locale or texts.
      stopLocale = vf.i18n.subscribe(() => widget && widget.setLocale(vf.i18n.locale()));
    },
    onDestroy(self) {
      // TODO(7) Destroy the vendor object and release every listener and timer you added.
      if (stopLocale) stopLocale();
      if (stopSize) stopSize();
      if (widget) widget.destroy();
      widget = null;
      self.state.instance = null;
    }
  });
  return instance;
}

// TODO(13) Say which browsers the vendor supports (most current libraries do not support IE11; point
//          IE users to the built-in vf.vfGrid / vf.vfChart).
// TODO(14) Check it: run the contract suites (layer2/adapters/_contract, node + happy-dom with a mock
//          library, and contract.html in browsers with the real one), make a sample page, and create
//          and destroy it 100 times to look for leaks (the base contract does this).
