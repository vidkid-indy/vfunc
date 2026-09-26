# third-party-custom — Leaflet at three levels / Leaflet 세 수준

The same Leaflet map as L0 (direct use in one component), L1 (an app wrapper) and L2 (a contract adapter made from the template). / 같은 Leaflet 지도를 L0(컴포넌트에서 직접), L1(앱 래퍼), L2(템플릿에서 만든 계약 어댑터)로 보입니다.

- `l0.js`: `onMount` creates the map, `onDestroy` removes it. / onMount에서 만들고 onDestroy에서 지웁니다.
- `l1.js`: `vfPlacesMap(props)` for this app's screens. / 이 앱 화면용 래퍼.
- `vfunc-map-leaflet.js`: the adapter template's `TODO(n)` steps filled in; it passes the base contract (layer2/test/third-party.test.js). / 템플릿의 TODO 단계를 채운 어댑터로 기본 계약을 통과합니다.
- No tile server: circle markers only, so the sample needs no external map tiles or their usage policy. Leaflet 1.9.4 (BSD-2-Clause) comes from jsDelivr with SRI. / 타일 없이 원형 마커만 씁니다. 네트워크가 필요합니다.
- Guide: the website's "Third-party integration" page and `ai/*/prompt-integrate-third-party.md`. / 가이드와 프롬프트.
