# 서드파티 통합

지도, 에디터, 차트, 그리드처럼 이미 있는 라이브러리를 vfunc 앱에서 쓰는 방법입니다. 공식 어댑터 4종이 있고, 목록에 없는 라이브러리는 아래 절차대로 직접 가져옵니다. 어댑터는 1.0.0부터 `vfunc` 패키지에 함께 들어 있습니다(`vfunc/adapters/*`).

## 통합 수준

| 수준 | 언제 | 결과물 |
|---|---|---|
| L0 직접 사용 | 화면 한 곳 | `vf.vfunc({ onMount, onUpdate, onDestroy })` 안에서 벤더 객체를 직접 생성 |
| L1 앱 전용 래퍼 | 한 앱의 여러 화면 | 앱에 필요한 props를 받는 내 앱의 `vfXxx(props)` 팩토리 |
| L2 계약 어댑터 | 이름만 바꿔 엔진 교체, 공식 기여 | 종류별 계약을 지키고 계약 테스트를 통과하는 `vf{종류}{벤더}` |

세 수준을 한 페이지에 나란히 둔 Leaflet 샘플이 `layer2/examples/third-party-custom/`에 있습니다.

## 공식 어댑터

기본 `vf.vfGrid`·`vf.vfChart`와 같은 계약이라 이름만 바꾸면 교체됩니다. 벤더 라이브러리는 번들하지 않으므로 앱이 먼저 불러옵니다(`lib`으로 넘기거나 전역).

| 어댑터 | 파일 | 벤더(확인한 버전) | 라이선스 | IE11 |
|---|---|---|---|---|
| `vf.vfGridAg` | `vfunc-grid-ag.js` | AG Grid Community 36.2.0 | MIT | 아니요 |
| `vf.vfGridTabulator` | `vfunc-grid-tabulator.js` | Tabulator 6.5.3 | MIT | 아니요 |
| `vf.vfChartChartjs` | `vfunc-chart-chartjs.js` | Chart.js 4.5.1 | MIT | 아니요 |
| `vf.vfChartEcharts` | `vfunc-chart-echarts.js` | Apache ECharts 6.1.0 | Apache-2.0 | 아니요 |

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js"
        integrity="sha384-C2iskrW/uPW46KzOjrvJIQo4YkV8lkD+QS0CrDN18IIPIpT/g2USu8bTP3nvmIAD" crossorigin="anonymous"></script>
<script src="vfunc.min.js"></script>
<script src="vfunc-chart-echarts.min.js"></script>
```

- IE11이 필요하면 기본 `vfGrid`·`vfChart`를 쓰세요. 네 벤더의 현재 버전은 IE11을 지원하지 않습니다.
- AG Grid Enterprise 기능은 AG Grid의 상용 라이선스가 따로 필요합니다. 어댑터는 Community만 씁니다.
- AG Grid 33 이상은 `<style>`을 스스로 주입하고 테마 아이콘을 `data:` 이미지로 씁니다. 페이지의 CSP는 경우에 따라 고릅니다. 어느 경우든 `script-src`에는 `'unsafe-inline'`을 넣지 않습니다.
  - **서버가 응답마다 nonce를 만들 수 있을 때(엄격 유지):** 스크립트 로드 때 스타일을 넣지 않는 `ag-grid-community.min.noStyle.js`를 쓰고, 같은 nonce를 `options: { styleNonce: nonce }`로 넘깁니다. CSP는 `style-src 'self' 'nonce-…'; img-src 'self' data:`입니다. nonce는 요청마다 새로 만들고 고정값을 쓰지 않습니다.
  - **정적 페이지(nonce를 만들 수 없음):** `ag-grid-community.min.js`와 `style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:`. 이 파일은 로드될 때 legacy 테마 CSS와 아이콘 글꼴도 넣습니다.
  - **정적 페이지인데 `style-src`도 엄격해야 할 때:** AG Grid 대신 `vf.vfGridTabulator`나 기본 `vf.vfGrid`를 쓰세요.
- Chart.js는 차트 종류를 제자리에서 바꾸지 못해 `setType`이 차트를 새로 만듭니다. `.instance`는 항상 현재 객체입니다.
- 색은 `--vf-chart-1`~`8` 토큰에서 읽으므로 다크 테마를 따라갑니다.

## 가져오는 절차

어댑터 템플릿 `layer2/adapters/_template/vfunc-kind-vendor.js`의 `TODO(n)` 번호와 같습니다.

1. **라이선스:** MIT, Apache-2.0, BSD, ISC는 바로 씁니다. GPL 계열은 앱 배포 조건에 영향을 줍니다. 매출 조건부·상용 전용은 제외합니다. 앱의 NOTICE에 적습니다.
2. **버전과 로드:** CDN이면 정확한 버전, `integrity`(SRI), `crossorigin`. 라이브러리는 `lib` prop, 없으면 전역. 비동기 로드는 기다립니다.
3. **호스트 요소:** 벤더가 그릴 요소에 `data-vf-keep`을 붙입니다. 벤더 DOM을 `render` 결과에 섞지 않습니다.
4. **생성:** `onMount`에서 props를 벤더 옵션으로 바꿔 만듭니다.
5. **갱신:** `setData` 같은 메서드가 벤더의 update API를 부릅니다. 다시 만들지 않습니다.
6. **이벤트:** 벤더 이벤트를 props 콜백으로 잇고 `{ sender, event, data }`로 넘깁니다.
7. **정리:** `onDestroy`에서 벤더의 destroy, 추가한 리스너·옵저버·구독·타이머를 해제합니다.
8. **크기:** `ResizeObserver`(없으면 window resize)로 벤더의 resize를 부릅니다.
9. **테마:** `--vf-*` 토큰을 읽어 벤더 색·글꼴로 넘깁니다. JS에 색 값을 쓰지 않습니다.
10. **다국어:** `vf.i18n.subscribe`로 벤더 로케일을 바꿉니다.
11. **XSS:** 벤더가 HTML 문자열을 받는 곳에는 `vf.esc`나 `vf.html`로 만든 노드를 넘깁니다.
12. **`.instance`:** 벤더 원본 객체를 노출합니다. 계약 밖의 기능이라고 적습니다.
13. **브라우저:** 벤더의 지원 범위를 그대로 적습니다.
14. **검증:** 계약 테스트를 통과시키고, 샘플 페이지를 만들고, 생성·파괴 100회로 누수를 확인합니다.

## 흔한 함정

- 부모가 refresh될 때 벤더 DOM이 사라짐 → `data-vf-keep`으로 해결
- 다시 마운트할 때 두 번 초기화됨
- destroy 뒤에도 document 리스너나 타이머가 남음
- 라이브러리 로드가 끝나기 전에 생성을 시도함
- 벤더 렌더러·툴팁을 통한 XSS
- 스타일이나 글꼴을 주입하는 라이브러리를 엄격한 CSP가 막음

## 계약 테스트

`layer2/adapters/_contract/`의 `base`·`grid`·`chart` 스위트에 팩토리와 UI 조작 함수를 넘기면 계약을 지키는지 검사합니다. 기본 계약은 `.instance`, `refresh`, `destroy`(두 번), `lib` 주입, 콜백 모양, 생성·파괴 100회 뒤 남는 리스너·타이머, 부모 refresh 뒤 유지, 오류 로그 없음을 봅니다.

- node + happy-dom: 벤더를 흉내 낸 작은 모의 라이브러리로 어댑터의 연결을 검사합니다.
- 브라우저: `contract.html`이 CDN의 실제 벤더로 같은 스위트를 돌립니다. 공식 어댑터는 Chromium·Firefox·WebKit에서 통과합니다.

## AI로 가져오기

프롬프트 `layer2/ai/ko/prompt-integrate-third-party.md`(영어판 `layer2/ai/en/…`)에 라이브러리 이름과 정확한 버전, 문서 링크, 원하는 수준을 주면 위 절차대로 컴포넌트나 어댑터, 샘플 페이지, 계약 테스트 설정을 만들어 줍니다. 결과는 계약 테스트로 확인하세요.
