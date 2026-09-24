# 시작하기

## 파일 하나로 시작하기

HTML 파일을 하나 만들고 vfunc를 불러옵니다. 빌드 단계는 없습니다.

{{install}}

```html
<div id="app"></div>
<script src="https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/dist/vfunc.js"></script>
<script src="./app.js"></script>
```

```js
// app.js
const hello = vf.vfunc({
  state: { name: 'vfunc' },
  render: (s) => vf.html`
    <p>Hello, <strong>${s.name}</strong>!</p>
    <input id="name" value="${s.name}" data-action="rename">`,
  delegates: [{ selector: '[data-action="rename"]', eventType: 'input',
                onEvent: (e) => { e.sender.name = e.target.value; } }]
});
hello.mount('#app');
```

- 개발할 때는 `vfunc.js`(개발 빌드)를 쓰세요. 실수를 콘솔 경고로 알려 줍니다. 운영에서는 위의 `vfunc.min.js` + SRI를 씁니다.
- 주소에는 정확한 버전(`vfunc@@VERSION@`)을 씁니다. `vfunc@1` 같은 범위 주소는 CDN 캐시 때문에 새 버전이 늦게 반영됩니다.
- 파일을 직접 열지 말고(`file://`) 정적 서버로 여세요: `python -m http.server 8080`.

## ES 모듈로 쓰기

```js
import vf from 'vfunc';                       // npm i vfunc
import { vfunc, html, router } from 'vfunc';  // 이름으로도 가져올 수 있습니다
```

ES 모듈은 전역 `window.vf`를 만들지 않습니다. 번들러의 운영 빌드는 경고가 없는 min 파일을 자동으로 고릅니다(`exports`의 `production` 조건).

## 스타터로 시작하기

라우터, 공용 상태, 한국어/영어, 테마, 배포 도구까지 갖춘 앱 골격입니다.

```bash
npx degit vidkid-indy/vfunc/layer1/starter my-app
cd my-app
python -m http.server 8080
```

| 경로 | 내용 |
|---|---|
| `app.js` | 메시지, 레이아웃, 라우터, update 플러그인. 새 화면은 여기에 라우트 한 줄 |
| `pages/*.js` | 화면마다 `(ctx, router) => component` 함수 하나 |
| `store.js` · `api.js` | 공용 상태와 변경 함수 · 모든 서버 호출 |
| `locales/{en,ko}.json` | 메시지 |
| `styles/tokens.css` | 디자인 토큰(`design/DESIGN.md`에서 파생) |
| `AGENTS.md` | AI 도구가 읽는 규칙(0절을 채우세요) |
| `tools/release.mjs`, `deploy/` | 버전 폴더 배포와 서버 캐시 설정 |

## 다음으로 읽을 것

- [핵심 개념](guide.md): 컴포넌트, 상태, 이벤트, 기존 HTML 제어, 안전한 HTML
- [SPA](spa.md): 라우터, store, 다국어
- [예제](examples.md): 21종, 모두 소스 링크가 있습니다
