# 예제

예제 21종은 모두 빌드 없이 동작하고, 각 폴더의 README에 설명이 있습니다. 모든 예제가 CSP 메타 태그, 외부 스크립트, `data-action`/`data-ref`, `vf.html`, 토큰만 쓰는 CSS 규칙을 지키며, 저장소의 브라우저 테스트가 콘솔 에러·경고 0개와 핵심 동작을 확인합니다.

{{examples}}

- 12·13·15는 Bootstrap·Tailwind·Chart.js를 CDN에서 정확한 버전과 SRI로 불러옵니다(인터넷 필요).
- 16은 IE11·Edge IE 모드용입니다. Edge에서 IE 모드로 다시 열어 확인해 보세요.
- 14는 퍼블리싱 대시보드를 AI 프롬프트로 변환한 결과이며, `before/`는 전달받은 원본 그대로입니다.

저장소를 받아 직접 실행하려면 저장소 루트에서 `python -m http.server 8080`을 실행하고 `http://localhost:8080/layer1/examples/`를 여세요.
