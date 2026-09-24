# 10 spa-app — the standard SPA structure / SPA 표준 구조

```
index.html          <div id="app"> + <script type="module" src="app.js">
app.js              layout + router + page switching / 레이아웃·라우터·페이지 전환
store.js            vf.store and the functions that change it / 공용 상태와 변경 함수
api.js              data access / 데이터 접근
components/header.js
pages/home.js  products.js  product.js  cart.js  not-found.js
styles/app.css      tokens only / 토큰만
data/products.json
```

- A page is a function `(ctx, router) => component`. `show()` destroys the previous page (listeners, subscriptions) and mounts the next, so `onMount` runs and loads data. / 페이지는 함수이고, 이전 페이지를 정리한 뒤 새 페이지를 mount합니다.
- Shared state lives in `store.js` and changes only through its functions (`addToCart`, `removeFromCart`). Components subscribe in `onMount` and unsubscribe in `onDestroy`. / 공용 상태는 store 함수로만 바꾸고, 구독은 onMount·onDestroy에서.
- `onMount` is not called for `childs`; that is why the header is mounted directly. / `childs`의 자식에는 onMount가 불리지 않아 헤더를 직접 mount합니다.
- The starter template (coming with the AI prompt kit) uses this structure. / 스타터 템플릿이 이 구조를 따릅니다.
- ⚠️ Keep secrets out of the store; use HttpOnly cookies for sessions. Client routes are not access control. / 비밀값은 store에 두지 말고, 권한은 서버에서 검사하세요.
