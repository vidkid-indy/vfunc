// SPDX-License-Identifier: Apache-2.0
// 09 spa-hash-router — pages are functions that return a component; the router swaps them.
// 페이지는 컴포넌트를 돌려주는 함수이고, 라우터가 바꿔 끼웁니다.
import vf from '../../dist/vfunc.esm.js';

const USERS = { 1: { name: 'Kim Minsu', posts: ['Hello', 'Routing in vfunc'] }, 2: { name: 'Lee Jiwoo', posts: ['Design tokens'] } };

let current = null;

/** Replaces the page in #view and cleans up the previous one. / 이전 페이지를 정리하고 새 페이지로 교체 */
function show(page) {
  if (current) current.destroy();
  current = page;
  page.mount('#view');
}

const home = () => vf.vfunc({
  innerHTML: '<h2 class="card__title" data-ref="heading">Home</h2><p>Pick a page above. / 위에서 페이지를 고르세요.</p>'
});

const user = (id, tab) => {
  const data = USERS[id];
  return vf.vfunc({
    state: { tab: tab === 'posts' ? 'posts' : 'profile' },
    render: (s) => vf.html`
      <h2 class="card__title" data-ref="heading">${data.name}</h2>
      <div class="row">
        <a class="btn" data-link href="${r.href('/users/' + id)}" aria-current="${s.tab === 'profile' ? 'page' : 'false'}">Profile</a>
        <a class="btn" data-link href="${r.href('/users/' + id + '?tab=posts')}" aria-current="${s.tab === 'posts' ? 'page' : 'false'}">Posts</a>
      </div>
      ${s.tab === 'posts'
        ? vf.html`<ul class="list" data-ref="posts">${data.posts.map((p) => vf.html`<li class="list__item">${p}</li>`)}</ul>`
        : vf.html`<p data-ref="profile">User #${id}</p>`}`
  });
};

const about = () => vf.vfunc({
  innerHTML: '<h2 class="card__title" data-ref="heading">About</h2><p>Client routes are not access control: check permissions on the server. / ' +
    '클라이언트 라우트는 접근 제어가 아닙니다. 권한은 서버에서 검사하세요.</p>'
});

const notFound = (path) => vf.vfunc({
  render: () => vf.html`<h2 class="card__title" data-ref="heading">Not found / 없는 페이지</h2>
    <p><code>${path}</code> — <a data-link href="#/">Home</a></p>`
});

const r = vf.router({
  mode: 'hash',
  routes: {
    '/': () => show(home()),
    '/users/:id': (ctx) => (USERS[ctx.params.id] ? show(user(ctx.params.id, ctx.query.tab)) : show(notFound(ctx.path))),
    '/about': () => show(about())
  },
  notFound: (ctx) => show(notFound(ctx.path)),
  onChange: (ctx) => {
    document.getElementById('route').textContent = ctx.route || '(none)';
    document.title = (ctx.route || 'Not found') + ' — 09 spa-hash-router';
    // Mark the active tab for CSS and screen readers. / 현재 탭 표시(CSS·스크린리더)
    vf.$$('[data-link]', vf.$('#tabs')).forEach((a) => {
      if (a.getAttribute('href') === '#' + ctx.path + (ctx.query.tab ? '?tab=' + ctx.query.tab : '')) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  },
  focus: '#view'   // move focus to the new page (screen readers) / 이동 후 포커스
});

r.start();
