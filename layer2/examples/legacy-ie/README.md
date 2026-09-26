# legacy-ie — IE11 dashboard / IE11 대시보드

A branch report in ES5 on `vfunc-all.legacy.min.js`: stat cards, vfGrid with a vfModal on row click, a vfChart, English and Korean. / vfunc-all.legacy.min.js 위의 ES5 지점 보고서: 수치 카드, 행을 누르면 vfModal이 뜨는 vfGrid, vfChart, 한국어·영어.

- **One file:** `vfunc-all.legacy.min.js` holds the engine, the components and the grid and charts. The CSS is `vfunc-ui.legacy.css` (light token values built in, no `@layer`, physical properties). / 엔진·컴포넌트·그리드·차트가 파일 하나에 있습니다.
- **ES5 app code:** no arrow functions, `const` / `let`, template literals or classes. Markup comes from `vf.tpl('{key}', data)` and vs* results (SafeHtml). / 앱 코드는 ES5, 마크업은 vf.tpl과 vs*.
- The page CSS uses plain values copied from the light tokens (IE11 has no CSS variables). / 페이지 CSS는 라이트 토큰 값을 고정값으로 씁니다.
- The adapters (AG Grid, Tabulator, Chart.js, ECharts) do not support IE11; the built-in grid and chart do. / 어댑터는 IE11을 지원하지 않고, 기본 그리드·차트는 지원합니다.
- Open it in Edge IE mode as well. For a public site, serve the modern files with `type="module"` and these with `nomodule` (see layer1 example 16). / Edge IE 모드에서도 열어 보세요.
