# vfunc.js

**UI를 평범한 함수로. 빌드도, 가상 DOM도 없이 — 스크립트 파일 하나로.**

[English](README.md) · [웹사이트](https://vidkid-indy.github.io/vfunc/ko/) · [토론 게시판](https://github.com/vidkid-indy/vfunc/discussions)

> **상태: 1.0 릴리스 후보(`1.0.0-rc.5`).** 1.0 API는 완성되었고, 1.0.0 전의 변경은 릴리스 후보 피드백에서만 나옵니다.

vfunc.js는 인터랙티브한 페이지와 SPA를 만드는 작은 바닐라 자바스크립트 라이브러리입니다.
핵심 개념은 **"HTML은 그대로 쓰고, 제어가 필요한 곳만 vfunc 컴포넌트로 만든다"**입니다.

- **빌드 없음** — `<script>` 하나로 시작합니다. 번들러도, JSX도, 트랜스파일러도 필요 없습니다. min+gzip 8.8KB.
- **퍼블리싱 HTML과 함께** — `vf.attach`로 디자이너나 퍼블리셔가 만든 마크업에 동작만 붙입니다.
- **기본이 안전** — `vf.html`은 모든 값을 위치에 맞게 이스케이프하고, `on*` 속성·따옴표 없는 값·`javascript:` URL을 거부합니다.
- **AI가 작성하기 쉬움** — 작고 명시적인 API(`state`, `render`, `delegates`, `methods`). `llms.txt` 레퍼런스, `AGENTS.md` 템플릿, 프롬프트가 패키지에 들어 있습니다.
- **SPA 지원** — 라우터, 스토어, 다국어, 숫자·날짜 포맷이 들어 있습니다.
- **디자인과 분리** — 로직과 디자인이 나뉘어 있어서, 디자인은 나중에 CSS 토큰만 바꿔 적용할 수 있습니다.

## 설치

스크립트 태그(정확한 버전과 SRI 해시를 그대로 둡니다):

```html
<div id="counter"></div>
<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0-rc.5/dist/vfunc.min.js"
        integrity="sha384-XVwq6bBMZad0alIKEG7vuAoxb0oNsyXYdIX6MxQGyF/NYfvVQjhzD8gJIStaZ2a/"
        crossorigin="anonymous"></script>
<script src="app.js"></script>
```

```js
// app.js
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`<button type="button" data-action="inc">${s.count}번 클릭</button>`,
  delegates: [{ selector: '[data-action="inc"]', eventType: 'click',
                onEvent: (e) => { e.sender.count++; } }]
});
counter.mount('#counter');
```

npm(ES 모듈, 브라우저에서도 번들러 없이 씁니다):

```bash
npm install vfunc@next
```

```js
import vf from 'vfunc';
```

| 파일 | 용도 |
|---|---|
| `dist/vfunc.min.js` | 운영용, 전역 `vf` |
| `dist/vfunc.js` | 개발용, 경고 포함 |
| `dist/vfunc.esm.min.js`, `dist/vfunc.esm.js` | ES 모듈 |
| `dist/vfunc.legacy.min.js` | IE11과 Edge IE 모드(ES5, 같은 API) |
| `css/vfunc.tokens.css` | 선택 사항인 중립 디자인 토큰(`--vf-*`) |
| `ai/` | `llms.txt`, `llms-full.txt`, `AGENTS.md` 템플릿, 프롬프트, 디자인 템플릿 |

## 배우기

- [웹사이트](https://vidkid-indy.github.io/vfunc/ko/) — 시작하기, 가이드, API 레퍼런스, AI 프롬프트.
- [예제](https://vidkid-indy.github.io/vfunc/layer1/examples/) — 빌드 없이 실행하는 샘플 21종([소스](layer1/examples/)).
- [스타터](layer1/starter/) — 라우터, 스토어, 다국어, 테마, 버전 폴더 배포가 들어 있는 프로젝트 뼈대.
- [AI 킷](layer1/ai/) — `llms.txt`와 `AGENTS.template.md`를 AI 어시스턴트에게 주세요.
- [확장](EXTENDING.md) — vfunc를 고치지 않고 `vf.use`로 플러그인을 붙이는 방법.

## 지원 브라우저

| 빌드 | 브라우저 |
|---|---|
| `vfunc.min.js`, ESM | Chrome, Edge, Firefox, Safari 최신 버전(데스크톱·모바일). 변경할 때마다 Chromium, Firefox, WebKit에서 테스트합니다 |
| `vfunc.legacy.min.js` | Internet Explorer 11과 Edge IE 모드. 앱 코드도 ES5로 써야 합니다 |

## 레이어

| 레이어 | 내용 | 상태 |
|---|---|---|
| layer1 | 엔진 `vf.vfunc`와 헬퍼(`attach`, `html`, `router`, `store`, `i18n`, `fmt`) | 1.0 릴리스 후보 |
| layer2 | 클래스 없는 컴포넌트(`vs*`는 문자열, `vf*`는 인스턴스 반환), 그리드, 차트, 서드파티 어댑터 | 계획 |
| layer3 | 클래스 기반 프레임워크(`VClass`)와 도구 | 계획 |

## 기여와 보안

- [CONTRIBUTING.md](CONTRIBUTING.md) — 기여는 DCO(`Signed-off-by`) 방식으로 받습니다.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md) — 취약점은 공개 이슈가 아니라 비공개로 제보해 주세요.

## 라이선스

[Apache License 2.0](LICENSE). vfunc.js를 재배포할 때는 배포 파일의 헤더 주석과 [NOTICE](NOTICE) 파일을 유지해 주세요.
