# vfunc.js 금지 패턴

**사용법.** `llms.txt`와 함께 AI에 주거나, 리뷰 확인 목록으로 쓰세요. 항목마다 대신 할 일을 적었습니다.

---

## 보안
1. **문자열로 HTML 만들기** — `'<li>' + name + '</li>'`, `el.innerHTML = data`. → `vf.html\`<li>${name}</li>\``.
2. **데이터에 `vf.unsafeHtml`** — 사용자, 서버, URL에서 온 모든 것. → `vf.html`. `unsafeHtml`은 저장소에서 쓴 마크업에만, 주석과 함께.
3. **핸들러나 스크립트에 보간** — `onclick="${fn}"`, `<script>var x = ${json}</script>`. → `data-action` + `delegates`, 데이터는 state나 `data-*` 속성으로.
4. **따옴표 없는 속성** — `class=${x}`. → `class="${x}"`.
5. **`eval`, `new Function`, `setTimeout('code')`**. → 진짜 함수.
6. **클라이언트 라우트로 권한을 막았다고 믿기** — 관리자 페이지를 숨기는 것은 보호가 아닙니다. → 서버에서 검사.
7. **프론트엔드의 비밀값** — API 키, `store`나 `localStorage`의 토큰, 폼 값 로그. → HttpOnly 쿠키, 서버 쪽 키, `skipPassword`.
8. **CSP 페이지의 인라인 스크립트·스타일** — `<script>…</script>`, `style="…"`. → 파일로.
9. **버전을 고정하지 않은 CDN 파일** — `vfunc@1`, `integrity` 없음. → 정확한 버전 + SRI.

## 구조
10. **몽키패치** — `Event.prototype`, `Element.prototype`, `vf.*` 멤버 변경. → `vf.ext` 아래의 `vf.use` 플러그인.
11. **`lib/`의 vfunc 파일 수정**. → 공개 API로 확장하고, 버그는 원 저장소에 보고.
12. **목록의 행마다 인스턴스**. → 목록에 컴포넌트 하나와 위임 하나(`closest('[data-id]')`).
13. **바깥 컨테이너의 `innerHTML`을 손으로 다시 쓰기**(자식, 리스너, 서드파티 위젯이 사라짐). → `setState`/`refresh`, `childs` 슬롯, `data-vf-keep`.
14. **`render`에서 서드파티 위젯 만들기**. → `onMount` + `data-vf-keep`, 정리는 `onDestroy`.
15. **정리 누락** — 떠난 페이지의 store 구독, 타이머, window 리스너. → `onDestroy`.
16. **평범한 입력칸에서 키마다 `setState`**. → 값을 저장하고 제출·blur 때 렌더.
17. **`vf.i18n.setup()`이 끝나기 전에 `vf.t`를 쓰는 컴포넌트 만들기**. → `setup().then(…)` 안에서.
18. **인자에 따라 문자열이나 인스턴스를 돌려주는 auto-sensing 헬퍼**. → 반환 타입이 하나인 함수로 나누기.
19. **죽은 코드** — 주석 처리한 블록, 쓰지 않는 헬퍼. → 삭제. 이력은 git에 있습니다.

## 디자인
20. **CSS 클래스에 셀렉터** — `delegates: [{ selector: '.btn-save' }]`. → `data-action="save"`.
21. **JS에 색·글꼴·간격** — `el.style.color = '#f00'`. → `data-state`/`aria-*` + 토큰을 쓰는 CSS.
22. **컴포넌트 CSS의 원시 값** — `color: #2563eb`. → `var(--vf-color-primary)`. 원시 값은 `tokens.css`에만.
23. **디자인 작업 중 로직 변경**. → CSS와 토큰만. 필요한 마크업 변경은 "구조 변경"으로 따로 보고.
24. **vfunc 마크업에서 상태를 클래스 토글로** — `class="${on ? 'is-on' : ''}"`. → `aria-pressed`/`data-state`(Bootstrap처럼 클래스가 필요한 프레임워크는 예외이되, 그 클래스에 동작을 걸지 않기).

## 배포
25. **`index.html` 캐시**, `version.json` 누락, 기본으로 Service Worker 추가. → `no-cache` 헤더, 릴리스마다 올리기, SW는 결정한 경우에만.
26. **IE11 앱 코드에 모던 문법**. → ES5 + `vf.tpl` + `vfunc.legacy.min.js`.
