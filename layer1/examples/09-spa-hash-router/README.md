# 09 spa-hash-router

`vf.router` basics, as an ES module. / ES 모듈로 쓰는 `vf.router` 기본.

- Routes: `'/'`, `'/users/:id'` (`ctx.params.id`, `ctx.query.tab`), `'/about'`, and `notFound`. / 라우트, 파라미터, 쿼리, notFound.
- Links are ordinary `<a data-link href="#/users/1">`; the router intercepts them. `r.href(path)` builds the address for the current mode. / 링크는 평범한 `<a data-link>`이고 라우터가 가로챕니다.
- Each page is a function returning a component; `show()` destroys the previous page before mounting the next. / 페이지는 컴포넌트를 돌려주는 함수이며 이전 페이지를 정리합니다.
- `focus: '#view'` moves focus to the new page for screen readers; `onChange` sets `aria-current` and the title. / 이동 후 포커스, 현재 탭 표시.
- Hash mode needs no server setup. For `history` mode the server must return `index.html` for every app path. / 해시 모드는 서버 설정이 필요 없습니다.
- ⚠️ Client routes are not access control. / 클라이언트 라우트는 접근 제어가 아닙니다.

With npm: `import vf from 'vfunc'`. Script tag: see [01 hello](../01-hello/README.md).
