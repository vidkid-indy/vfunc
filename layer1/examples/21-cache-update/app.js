// SPDX-License-Identifier: Apache-2.0
// 21 cache-update — the official update plugin (dist/plugins/update.min.js → global vfUpdate).
// Try it: keep this page open, change version.json to "1.0.1", press "Check now" (or wait),
// then move to another screen. / 페이지를 연 채 version.json을 1.0.1로 바꾸고 화면을 이동해 보세요.

const APP_VERSION = '1.0.0'; // bump together with version.json on every release / 릴리스마다 함께 올립니다

const POLICIES = { 'next-navigation': 1, prompt: 1, immediate: 1 };
const requested = (/[?&]policy=([a-z-]+)/.exec(location.search) || [])[1];
const policy = POLICIES.hasOwnProperty(requested) ? requested : 'next-navigation';

// The toast for the 'prompt' policy is the app's own UI; the plugin draws nothing.
// prompt 정책의 안내는 앱의 UI입니다. 플러그인은 화면을 그리지 않습니다.
const toast = vf.attach('#update-toast', {
  state: { info: null },
  render: (s) => vf.html`
    <div class="update-toast" id="update-toast" role="status" aria-live="polite">
      ${s.info ? vf.html`<div class="update-toast__box" data-ref="box">
        <span>New version ${s.info.latest} is ready. / 새 버전이 준비되었습니다.</span>
        <button class="btn" type="button" data-action="apply" data-variant="primary">Update now / 지금 업데이트</button>
        <button class="btn" type="button" data-action="later">Later / 나중에</button>
      </div>` : ''}
    </div>`,
  delegates: [
    { selector: '[data-action="apply"]', eventType: 'click', onEvent: () => update.apply() },
    { selector: '[data-action="later"]', eventType: 'click', onEvent: (e) => e.sender.setState({ info: null }) }
  ]
});

const update = vf.use(vfUpdate, {
  url: './version.json',
  current: APP_VERSION,
  policy: policy,
  interval: 1,          // minutes; also checks on tab return and on every route change
  minGap: 5,            // seconds between checks
  onAvailable: (info) => toast.setState({ info: info }),
  onError: () => status.refresh()
});

const status = vf.vfunc({
  render: () => {
    const st = update.status();
    return vf.html`
      <h2 class="card__title">vf.ext.update</h2>
      <dl class="status__grid">
        <dt>running / 실행 중</dt><dd data-ref="current">${st.current}</dd>
        <dt>on the server / 서버</dt><dd data-ref="latest">${st.latest || '…'}</dd>
        <dt>policy / 정책</dt><dd data-ref="policy">${st.policy}</dd>
        <dt>state / 상태</dt><dd data-ref="state" data-state="${st.pending ? 'pending' : 'current'}">${st.pending
          ? (st.policy === 'next-navigation' ? 'update waiting: move to another screen / 화면을 이동하면 교체' : 'update waiting / 대기 중')
          : 'up to date / 최신'}</dd>
      </dl>
      <p class="row"><button class="btn" type="button" data-action="check">Check now / 지금 확인</button></p>`;
  },
  delegates: [{ selector: '[data-action="check"]', eventType: 'click', onEvent: (e) => update.check(true).then(() => e.sender.refresh()) }]
});
status.mount('#status');
update.check(true).then(() => status.refresh());

let page = null;
function show(next) {
  if (page) page.destroy();
  page = next;
  page.mount('#view');
  status.refresh();
}
const pageOf = (title, text) => vf.vfunc({ render: () => vf.html`<h2 class="card__title" data-ref="heading">${title}</h2><p>${text}</p>` });

vf.router({
  routes: {
    '/': () => show(pageOf('Home', 'Work in progress on this screen is never lost: the reload waits for navigation. / 작업 중인 화면에서는 교체하지 않습니다.')),
    '/settings': () => show(pageOf('Settings', 'Serve index.html and version.json with Cache-Control: no-cache. / 두 파일은 no-cache로 서빙하세요.'))
  },
  notFound: () => show(pageOf('Not found', ''))
}).start();
