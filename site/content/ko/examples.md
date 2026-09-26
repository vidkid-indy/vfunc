# 예제

엔진 예제 21종(layer1)과 컴포넌트 예제 7종(layer2)은 모두 빌드 없이 동작하고, 각 폴더의 README에 설명이 있습니다. 모든 예제가 CSP 메타 태그, 외부 스크립트, `data-action`/`data-ref`, `vf.html`, 토큰만 쓰는 CSS 규칙을 지키며, 저장소의 브라우저 테스트가 콘솔 에러·경고 0개와 핵심 동작을 확인합니다.

{{examples}}

- layer1의 12·13·15와 layer2의 dashboard·third-party-custom은 Bootstrap·Tailwind·Chart.js·Tabulator·Leaflet을 CDN에서 정확한 버전과 SRI로 불러옵니다(인터넷 필요).
- layer1의 16과 layer2의 legacy-ie는 IE11·Edge IE 모드용입니다. Edge에서 IE 모드로 다시 열어 확인해 보세요. legacy-ie는 IE에서도 layer2 인스턴스를 쓰는 대시보드입니다.
- layer1의 14는 퍼블리싱 대시보드를 AI 프롬프트로 변환한 결과이며, `before/`는 전달받은 원본 그대로입니다.
- layer2의 custom-component는 공식 컴포넌트를 감싼 내 컴포넌트(확장 수준 C3)입니다.

저장소를 받아 직접 실행하려면 저장소 루트에서 `python -m http.server 8080`을 실행하고 `http://localhost:8080/layer1/examples/`와 `http://localhost:8080/layer2/examples/`를 여세요.
