# vfunc.js — HTML은 그대로, 제어가 필요한 곳만

vfunc.js는 빌드가 필요 없는 순수 JavaScript UI 라이브러리입니다. Virtual DOM 없이 `innerHTML`과 이벤트 위임으로 화면을 그리고, 이미 있는 HTML에 동작만 붙일 수도 있습니다. 파일 하나(gzip 약 9KB)로 컴포넌트, 라우터, 공용 상태, 다국어까지 갖췄습니다.

{{demo}}

## 세 가지 약속

### 빌드 없음, VDOM 없음, 파일 하나
`<script>` 한 줄이면 시작합니다. 번들러, 트랜스파일러, `node_modules`가 필요 없습니다. 브라우저 개발자 도구에 보이는 코드가 여러분이 쓴 코드 그대로입니다.

### AI가 쓰기 쉬운 구조
컴포넌트는 `state`, `render`, `delegates`, `methods`라는 평범한 객체입니다. 규칙이 적고 이름만 보고도 역할을 알 수 있어서, AI가 틀리게 쓸 여지가 적습니다. [AI와 작업하기](ai.md)에 규칙 파일과 프롬프트가 있습니다.

### 퍼블리싱 HTML을 그대로
퍼블리셔가 만든 페이지를 다시 쓰지 않고, 검색창이나 표처럼 **동작이 필요한 부분에만** `vf.attach`로 기능을 붙입니다. 이 사이트도 정적 HTML이고, 테마 전환·복사 버튼·검색·위 데모만 vfunc가 제어합니다.

## 한눈에 보기

```js
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`<button type="button" data-action="inc">${s.count}</button>`,
  delegates: [{ selector: '[data-action="inc"]', eventType: 'click',
                onEvent: (e) => { e.sender.count++; } }]
});
counter.mount('#app');
```

- `vf.html`은 값이 들어가는 위치에 맞게 이스케이프합니다. `onclick="${…}"`나 `javascript:` 주소는 막힙니다.
- 이벤트는 `data-action`에 겁니다. CSS 클래스가 바뀌어도 동작이 깨지지 않습니다.
- 상태를 바꾸면 한 tick에 한 번만 다시 그립니다.

## 설치

{{install}}

더 자세한 내용은 [시작하기](getting-started.md)를 보세요. IE11·Edge IE 모드용 파일도 함께 제공합니다.

## 무엇이 들어 있나

| 기능 | API |
|---|---|
| 컴포넌트 | `vf.vfunc`, 라이프사이클 `onMount`·`onUpdate`·`onDestroy`, `refs`, `data-vf-keep` |
| 기존 HTML 제어 | `vf.attach` |
| 안전한 HTML | `vf.html`, `vf.tpl`(ES5), `vf.safeUrl`, `vf.esc` |
| SPA | `vf.router`(hash·history), `vf.store` |
| 다국어 | `vf.i18n`, `vf.t`, `vf.fmt` |
| 확장 | `vf.use`, `vf.ext`, 공식 update 플러그인 |
| 디자인 | 선택형 토큰 CSS(라이트·다크), `DESIGN.md` 흐름 |

[예제 21종](examples.md)과 [스타터 템플릿](getting-started.md#스타터로-시작하기)으로 바로 시작할 수 있습니다.
