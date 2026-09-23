# vfunc.js

**UI를 평범한 함수로. 빌드도, 가상 DOM도 없이 — 스크립트 파일 하나로.**

[English](README.md)

> **상태: 개발 중 (Phase 0).** 첫 공개 버전(1.0)을 준비하고 있습니다. 아래 API는 계획 단계이며 1.0 전까지 바뀔 수 있습니다.

vfunc.js는 인터랙티브한 페이지와 SPA를 만드는 작은 바닐라 자바스크립트 라이브러리입니다.
핵심 개념은 **"HTML은 그대로 쓰고, 제어가 필요한 곳만 vfunc 컴포넌트로 만든다"**입니다.

- **빌드 없음** — `<script>` 하나로 시작합니다. 번들러도, JSX도, 트랜스파일러도 필요 없습니다.
- **퍼블리싱 HTML과 함께** — 디자이너나 퍼블리셔가 만든 마크업에 동작만 붙입니다.
- **AI가 작성하기 쉬움** — 작고 명시적인 API(`state`, `render`, `delegates`, `methods`)라서 AI가 정확하게 생성합니다. 프롬프트와 `llms.txt` 레퍼런스를 함께 제공합니다.
- **SPA 지원** — 작은 라우터, 스토어, 다국어(i18n)가 들어 있습니다.
- **디자인과 분리** — 로직과 디자인이 나뉘어 있어서, 디자인은 나중에 CSS 토큰만 바꿔 적용할 수 있습니다.

## 사용 예 (계획)

```html
<div id="counter"></div>
<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0/dist/vfunc.min.js"
        integrity="sha384-..." crossorigin="anonymous"></script>
<script src="app.js"></script>
```

```js
// app.js
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`<button data-action="inc">${s.count}번 클릭</button>`,
  delegates: [{ selector: '[data-action="inc"]', eventType: 'click',
                onEvent: (e) => e.sender.setState({ count: e.sender.state.count + 1 }) }]
});
counter.mount(document.getElementById('counter'));
```

## 레이어

| 레이어 | 내용 | 상태 |
|---|---|---|
| layer1 | 엔진 `vf.vfunc`와 헬퍼(`attach`, `html`, `router`, `store`, `i18n`) | 개발 중 |
| layer2 | 클래스 없는 컴포넌트(`vs*`는 문자열, `vf*`는 인스턴스 반환), 그리드, 차트, 서드파티 어댑터 | 계획 |
| layer3 | 클래스 기반 프레임워크(`VClass`)와 도구 | 계획 |

## 지원 브라우저

Chrome, Edge, Firefox, Safari 최신 버전. Internet Explorer 11과 Edge IE 모드용 별도 빌드(`vfunc.legacy.min.js`)를 준비하고 있습니다.

## 기여와 보안

- [CONTRIBUTING.md](CONTRIBUTING.md) — 기여는 DCO(`Signed-off-by`) 방식으로 받습니다.
- [EXTENDING.md](EXTENDING.md) — vfunc를 고치지 않고 확장하는 방법.
- [SECURITY.md](SECURITY.md) — 취약점은 공개 이슈가 아니라 비공개로 제보해 주세요.

## 라이선스

[Apache License 2.0](LICENSE). vfunc.js를 재배포할 때는 배포 파일의 헤더 주석과 [NOTICE](NOTICE) 파일을 유지해 주세요.
