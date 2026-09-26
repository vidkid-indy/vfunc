# dashboard — admin dashboard / 관리자 대시보드

Key figures, an order grid and a sales chart; one switch swaps the built-in grid and chart for the Tabulator and Chart.js adapters. / 핵심 수치, 주문 그리드, 매출 차트. 스위치 하나로 기본 그리드·차트와 Tabulator·Chart.js 어댑터를 바꿉니다.

| Piece / 요소 | Component |
|---|---|
| Key figures / 핵심 수치 | `vsStatCard` in a `vf.attach` island |
| Orders / 주문 | `vf.vfGrid` ↔ `vf.vfGridTabulator` (sort, paging, selection, `vsBadge` cells) |
| Sales / 매출 | `vf.vfChart` ↔ `vf.vfChartChartjs`, type switch with `vfSelectButton` |

- **Only the name changes.** Both engines take the same props (the grid and chart contracts), so `app.js` keeps one `gridProps` and one `chartProps`. / 두 엔진의 props가 같아 이름만 바꿉니다.
- Tabulator 6.5.3 and Chart.js 4.5.1 (MIT) come from jsDelivr with exact versions and SRI; vfunc bundles neither. The CSP keeps `style-src` without `'unsafe-inline'` (AG Grid would need it on a static page, decision D-035). / 벤더는 CDN(정확한 버전·SRI)에서 불러오며, CSP의 style-src도 엄격하게 유지합니다.
- Needs network access for the vendor files. / 벤더 파일 때문에 네트워크가 필요합니다.
