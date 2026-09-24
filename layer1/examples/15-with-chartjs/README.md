# 15 with-chartjs — integration level L0 / 통합 수준 L0

Any library can live inside a vfunc component with four pieces. / 네 가지로 어떤 라이브러리든 붙입니다.

| Piece / 요소 | Job / 역할 |
|---|---|
| `data-vf-keep="chart"` | The widget's element is **moved, not rebuilt**, on every render, so the drawing survives. / 렌더 때 새로 만들지 않고 옮깁니다 |
| `onMount` | Create the widget once the element is in the page. / 페이지에 들어간 뒤 생성 |
| `onUpdate` | Push the new state into the widget after each render. / 렌더 뒤 상태 반영 |
| `onDestroy` | Release the widget (timers, listeners, canvas). / 정리 |

- Colors are read from `--vf-chart-*` tokens at run time; JS holds no color values. / 색은 토큰에서 읽습니다.
- A kept element keeps **its old attributes** as well: values that change (here the canvas `aria-label`) are updated in `onUpdate`. / keep 요소는 속성도 그대로이므로 바뀌는 값은 onUpdate에서 갱신합니다.
- Chart.js 4.5.1 (MIT) is loaded from jsDelivr with an exact version and SRI; vfunc does not bundle or redistribute it. / 번들하지 않고 CDN에서 불러옵니다.
- This is the shape of the layer 2 adapters (`vf.vfChartChartjs`, `vf.vfChartEcharts`), which add a common contract on top. / 2단계 어댑터의 원형입니다.
