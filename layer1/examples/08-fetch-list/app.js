// SPDX-License-Identifier: Apache-2.0
// 08 fetch-list — status: 'idle' | 'loading' | 'error' | 'ready'. / 상태 값 하나로 화면을 결정합니다.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function view(s) {
  if (s.status === 'loading') return vf.html`<p class="notice" data-state="info" data-ref="status" role="status">Loading… / 불러오는 중…</p>`;
  if (s.status === 'error') {
    return vf.html`<div class="notice" data-state="error" data-ref="status" role="alert">
      Could not load the list. / 목록을 불러오지 못했습니다. <span class="muted">(${s.error})</span>
      <button class="btn" type="button" data-action="load">Retry / 다시 시도</button></div>`;
  }
  if (s.status === 'ready' && s.users.length === 0) return vf.html`<p class="muted" data-ref="status">No users. / 사용자가 없습니다.</p>`;
  if (s.status === 'ready') {
    // Data from the server is escaped like any other value (see the 4th row). / 서버 데이터도 이스케이프됩니다.
    return vf.html`<ul class="list" data-ref="list">${s.users.map((u) => vf.html`
      <li class="list__item" data-id="${u.id}">
        <span class="list__text"><strong>${u.name}</strong> · ${u.team}</span>
        <span class="muted">${vf.fmt.date(u.joined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </li>`)}</ul>`;
  }
  return vf.html`<p class="muted" data-ref="status">Press "Load". / "불러오기"를 누르세요.</p>`;
}

const users = vf.vfunc({
  state: { status: 'idle', users: [], error: '', crash: false, recovered: false },
  render: (s) => {
    // A render bug on purpose, to show onError. / onError를 보여 주려는 일부러 만든 렌더 오류
    if (s.crash) throw new Error('render crashed on purpose');
    return vf.html`
      <div class="row">
        <button class="btn" type="button" data-action="load" data-variant="primary">Load / 불러오기</button>
        <button class="btn" type="button" data-action="load-broken">Load broken data / 깨진 데이터</button>
        <button class="btn" type="button" data-action="load-empty">Load empty / 빈 목록</button>
        <button class="btn" type="button" data-action="crash" data-variant="danger">Crash render / 렌더 오류</button>
      </div>
      <p class="notice" data-state="warning" data-ref="recovered" ${s.recovered ? '' : 'hidden'}>
        onError caught a render error and the app recovered. / onError가 렌더 오류를 받고 앱이 복구했습니다.</p>
      ${view(s)}`;
  },
  methods: {
    async load(url) {
      this.setState({ status: 'loading', error: '' });
      try {
        await wait(300);  // so the loading state is visible / 로딩 상태가 보이도록
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        this.setState({ status: 'ready', users: Array.isArray(data) ? data : [] });
      } catch (err) {
        this.setState({ status: 'error', error: err.message });
      }
    }
  },
  delegates: [
    { selector: '[data-action="load"]', eventType: 'click', onEvent: (e) => e.sender.load('./data/users.json') },
    { selector: '[data-action="load-broken"]', eventType: 'click', onEvent: (e) => e.sender.load('./data/broken.json') },
    { selector: '[data-action="load-empty"]', eventType: 'click', onEvent: (e) => e.sender.setState({ status: 'ready', users: [] }) },
    { selector: '[data-action="crash"]', eventType: 'click', onEvent: (e) => e.sender.setState({ crash: true }) }
  ],
  // The engine reports and does not recover; the app decides. / 엔진은 알리기만 하고, 복구는 앱이 정합니다.
  onError: () => { users.setState({ crash: false, recovered: true }); }
});

users.mount('#app');
