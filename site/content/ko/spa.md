# SPA: 라우터, store, 다국어

## 앱 구조

```
index.html       <div id="app"> + <script type="module" src="app.js">
app.js           레이아웃 + 라우터 + 페이지 전환 (모든 페이지를 아는 유일한 곳)
store.js         vf.store와 그것을 바꾸는 함수
api.js           모든 서버 호출
pages/*.js       화면마다 (ctx, router) => component
components/*.js  재사용 부품
```

[스타터](getting-started.md#스타터로-시작하기)와 예제 10이 이 구조입니다.

## 라우터 — `vf.router`

```js
const router = vf.router({
  mode: 'hash',                                 // 기본. 어떤 정적 서버·IE에서도 동작
  routes: {
    '/': (ctx) => show(homePage(ctx, router)),
    '/orders/:id': (ctx) => show(orderPage(ctx.params.id, ctx.query.tab))
  },
  notFound: (ctx) => show(notFoundPage(ctx)),
  onChange: (ctx) => { document.title = ctx.route || 'Not found'; },
  focus: '#view'                                // 이동 후 포커스(스크린리더)
});
router.start();
```

- 링크는 평범한 `<a data-link href="${router.href('/orders/7')}">`이고 라우터가 가로챕니다. 새 창, 다운로드, 외부 주소는 브라우저에 맡깁니다.
- `router.go(path)`는 `/`로 시작하는 앱 경로만 받습니다. `javascript:`나 다른 사이트 주소는 거부합니다.
- `history` 모드는 서버가 모든 앱 경로에 `index.html`을 돌려줘야 합니다.
- 페이지를 바꿀 때 이전 페이지를 `destroy()`하세요. 리스너와 구독이 정리됩니다.

> 클라이언트 라우트는 접근 제어가 아닙니다. 관리자 화면을 숨겨도 권한은 서버에서 검사해야 합니다.

## 공용 상태 — `vf.store`

```js
export const cart = vf.store({ items: [] });
export function add(item) { cart.set((s) => ({ items: s.items.concat(item) })); }

// 컴포넌트에서
onMount: (inst) => { off = cart.subscribe((s) => inst.setState({ count: s.items.length })); },
onDestroy: () => off()
```

- 같은 tick의 여러 `set`은 구독자에게 한 번만 알립니다.
- 상태는 `store.js`의 함수로만 바꾸세요. 토큰 같은 비밀값은 두지 않습니다(세션은 HttpOnly 쿠키).

## 다국어 — `vf.i18n`, `vf.t`, `vf.fmt`

```js
await vf.i18n.setup({
  locales: ['ko', 'en'], fallback: 'en',
  load: (l) => fetch(new URL('./locales/' + l + '.json', import.meta.url)).then((r) => r.json()),
  persist: true
});
vf.t('cart.items', { count: 3 });       // { zero, one, other } 중에서 복수형 선택
vf.fmt.currency(12900, 'KRW');           // 현재 로케일의 Intl 포맷
vf.i18n.apply();                         // 퍼블리싱 HTML의 data-i18n / data-i18n-attr 번역
```

- 로케일은 허용 목록(`locales`)과 형식 검사를 모두 통과해야 불러옵니다.
- `vf.t`의 결과는 평문이고 `vf.html`이 이스케이프합니다. `data-i18n`도 텍스트로만 넣습니다.
- **컴포넌트는 만들 때 렌더합니다.** `vf.t`를 쓰는 컴포넌트는 `setup()`이 끝난 뒤에 만드세요.
- 로케일이 바뀌면 `vf.i18n.subscribe(() => …)`에서 다시 그리고 `apply()`를 다시 부릅니다. `<html lang>`은 자동으로 바뀝니다.
