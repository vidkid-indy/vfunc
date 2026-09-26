# 프롬프트: 서드파티 라이브러리를 vfunc.js로 가져오기

**사용법.** 선 아래 전체를 AI에 붙여 넣고, 라이브러리 이름과 버전, 공식 문서 링크나 타입 정의, 원하는 수준을 함께 줍니다. AI에게는 `llms.txt`(layer 1)와 어댑터 템플릿 `layer2/adapters/_template/vfunc-kind-vendor.js`도 주세요.

---

vfunc.js 앱에서 쓸 수 있도록 서드파티 브라우저 라이브러리(지도, 에디터, 날짜 선택기, 차트, 그리드 등)를 감쌉니다. 단계를 순서대로 따르고 검사를 건너뛰지 마세요.

## 입력
- `LIBRARY`: 이름과 **정확한 버전**(예: `leaflet@1.9.4`).
- `DOCS`: 공식 문서 URL이나 타입 정의. 거기서 보이는 API만 씁니다. 없는 것이 있으면 물어봅니다.
- `LEVEL`: L0, L1, L2(아래 표). 주어지지 않았으면 하나를 권하고 기다립니다.
- `KIND`(L2만): `grid`, `chart`, `editor`, 또는 다른 종류(기본 계약만).

## 수준
| 수준 | 언제 | 결과물 |
|---|---|---|
| L0 직접 사용 | 화면 한 곳 | 벤더 객체를 직접 만드는 `vf.vfunc({ onMount, onUpdate, onDestroy })` 컴포넌트 |
| L1 앱 전용 래퍼 | 한 앱의 여러 화면 | 앱에 필요한 props를 받는 앱의 팩토리 `vfXxx(props)` |
| L2 계약 어댑터 | 이름만 바꿔 엔진 교체, 또는 공식 기여 | 종류별 계약을 지키고 계약 테스트를 통과하는 `vf<Kind><Vendor>` |

## 단계
1. **라이선스.** MIT, Apache-2.0, BSD, ISC는 쓸 수 있습니다. GPL/LGPL/AGPL은 앱 배포 조건을 바꾸므로 그렇다고 말하고 멈춥니다. 매출 조건부나 상용 전용은 제외합니다. 앱의 NOTICE에 라이브러리를 적으라고 안내합니다.
2. **버전과 로드 방식.** 정확한 버전과 `integrity`(SRI), `crossorigin`을 붙인 CDN `<script>`, 또는 ES 모듈 import. 라이브러리는 `props.lib`을 먼저, 없으면 전역에서 가져옵니다. 비동기로 로드되면 기다립니다.
3. **호스트 요소.** 벤더는 `data-vf-keep`이 붙은 요소 안에만 그립니다. 벤더 DOM을 `render` 결과에 섞지 않습니다.
4. **생성**은 `onMount`에서(요소가 페이지에 있을 때), props를 벤더 옵션으로 바꿔서 합니다.
5. **갱신**은 벤더 API로 합니다(`setData` → 벤더의 update 호출). 벤더 객체를 다시 만들지 않습니다. 벤더가 제자리에서 바꿀 수 없는 것만 예외로 두고, 무엇을 왜 그런지 적습니다.
6. **이벤트.** 벤더 이벤트를 props 콜백으로 잇고, 콜백은 `{ sender, event, data }`를 받습니다.
7. **정리**는 `onDestroy`에서: 벤더의 destroy 호출, 그리고 추가한 리스너·옵저버·구독·타이머 전부.
8. **크기.** 호스트에 `ResizeObserver`, 없으면 `window` resize로 벤더의 resize를 부릅니다.
9. **테마.** 색과 글꼴은 `--vf-*` 토큰에서 읽어 벤더에 줍니다(`getComputedStyle(document.documentElement).getPropertyValue(...)`). JS에 색 값을 쓰지 않습니다.
10. **다국어.** `vf.i18n.subscribe` → 벤더 로케일이나 문구. 화면 문구는 메시지 키에서 가져옵니다.
11. **XSS.** 벤더가 HTML 문자열을 받는 곳(셀, 툴팁, 팝업, 라벨)에는 `vf.esc(text)`나 `vf.html` 마크업으로 만든 DOM 노드를 넘기고, 원본 데이터를 그대로 넘기지 않습니다.
12. **`.instance`.** 벤더 객체를 노출하고(`state.instance`), 그 기능은 계약 밖이라고 적습니다.
13. **브라우저.** 벤더의 지원 범위를 적습니다. 요즘 라이브러리는 대부분 IE11을 지원하지 않습니다(IE 사용자에게는 기본 `vf.vfGrid` / `vf.vfChart`를 안내).
14. **검증.** L2: `layer2/adapters/_contract`의 계약 테스트(작은 모의 라이브러리로 node에서, 실제 라이브러리로 브라우저의 `contract.html`에서). 모든 수준: 콘솔 오류 없는 샘플 페이지, 생성·파괴 100회에 누수 없음.

## 계약 (L2)
- **기본(모든 종류):** `.instance`, `refresh()`, `destroy()`(두 번 불러도 안전), `lib` 주입, `{ sender, event, data }` 콜백, destroy 뒤 남는 것 없음, 부모 refresh 뒤에도 유지.
- **Grid:** props `columns [{ key, label, align, sortable, render(row) }]`, `data`, `pageSize`, `selectable`, `height`, `onRowClick`, `onSelect`, `onSort`, `options`, `lib`, 메서드 `setData`, `getData`, `setColumns`, `getSelection`, `clearSelection`, `setPage`, `refresh`, `destroy`.
- **Chart:** props `type ('bar' | 'line' | 'area' | 'pie' | 'donut')`, `data { labels, series: [{ name, data }] }`, `height`, `onClick`, `options`, `lib`, 메서드 `setData`, `setType`, `resize`, `destroy`. 색은 `--vf-chart-1 … 8`.
- **Editor:** `getValue`, `setValue`, `setReadOnly`, `focus`, `onChange`.

## 흔한 함정
- 부모가 refresh되면 벤더 DOM이 사라짐 → `data-vf-keep` 안에 있지 않음.
- 두 번째 마운트에서 두 번 초기화됨 → `onMount`에서만, 마운트마다 한 번만 만듭니다.
- `document` 리스너나 타이머가 `destroy` 뒤에도 남음.
- 라이브러리 로드가 끝나기 전에 벤더 객체를 만듦.
- HTML을 받는 벤더 렌더러나 툴팁을 통한 XSS.
- `<style>`이나 글꼴을 주입하는 라이브러리(예: AG Grid 33 이상)를 엄격한 CSP가 막음: 페이지에 필요한 CSP 지시어를 적습니다. 라이브러리가 nonce 옵션을 받으면(AG Grid: noStyle판과 `styleNonce`) nonce 구성을 먼저 보입니다. `script-src`에는 `'unsafe-inline'`을 넣지 않습니다.

## 출력 형식
1. 라이선스 판단과 수준(요청 또는 권장)
2. 로드 코드(SRI가 붙은 CDN 태그, 또는 import)
3. 컴포넌트나 어댑터 파일 전체(단계 번호를 주석으로)
4. 그것을 쓰는 샘플 페이지(CSP 메타 태그, 외부 스크립트)
5. L2: `layer2/adapters/_contract`용 계약 테스트 설정(모의 라이브러리, 조작 함수)
6. 보고: 체크리스트 결과와 확인하지 못한 것

## 체크리스트
- [ ] 허용 라이선스이고 이름을 적음, NOTICE 안내
- [ ] CDN 태그에 정확한 버전, SRI, `crossorigin`
- [ ] 벤더 DOM은 `data-vf-keep` 안에만, 생성은 `onMount`, 정리는 `onDestroy`
- [ ] 다시 만들지 않고 갱신(예외는 설명)
- [ ] 콜백이 `{ sender, event, data }`를 받음
- [ ] 색은 토큰에서, 화면 문구는 메시지 키에서
- [ ] 벤더에 주는 HTML은 이스케이프하거나 `vf.html`로 만듦
- [ ] `.instance` 노출, 브라우저 지원 범위 명시
- [ ] 콘솔 오류·경고 없음, 생성·파괴 100회 깨끗함
