// SPDX-License-Identifier: Apache-2.0
// 05 composition — build a layout from components with `childs` and slots (targetId).
// childs와 슬롯(targetId)으로 컴포넌트를 조립합니다.

// A small, self-contained child. / 독립된 작은 자식 컴포넌트
function makeCounter(label) {
  return vf.vfunc({
    state: { count: 0 },
    render: (s) => vf.html`
      <div class="card">
        <h3 class="card__title">${label}</h3>
        <div class="row">
          <button class="btn" type="button" data-action="inc">+1</button>
          <strong data-ref="value">${s.count}</strong>
        </div>
      </div>`,
    delegates: [{ selector: '[data-action="inc"]', eventType: 'click', onEvent: (e) => { e.sender.count++; } }]
  });
}

const menu = vf.vfunc({
  innerHTML: '<nav class="card" aria-label="Sections"><ul class="list">' +
    '<li class="list__item">Dashboard</li><li class="list__item">Reports</li><li class="list__item">Settings</li></ul></nav>'
});

const first = makeCounter('Visitors / 방문자');
const second = makeCounter('Orders / 주문');

const layout = vf.vfunc({
  state: { title: 'Dashboard', collapsed: false },
  render: (s) => vf.html`
    <div class="layout" data-state="${s.collapsed ? 'collapsed' : 'open'}">
      <header class="layout__top card">
        <strong data-ref="title">${s.title}</strong>
        <div class="row">
          <button class="btn" type="button" data-action="rename">Rename layout / 제목 바꾸기</button>
          <button class="btn" type="button" data-action="collapse" aria-pressed="${s.collapsed ? 'true' : 'false'}">Toggle menu / 메뉴</button>
        </div>
      </header>
      <aside class="layout__side" id="side"></aside>
      <section class="layout__main" id="main"></section>
    </div>`,
  // Slots: each child goes into the element with that id, again after every refresh.
  // 슬롯: 각 자식은 해당 id 요소에 붙고, refresh 뒤에도 다시 옮겨 붙습니다.
  childs: [
    { targetId: 'side', component: menu },
    { targetId: 'main', component: first },
    { targetId: 'main', component: second }
  ],
  delegates: [
    { selector: '[data-action="rename"]', eventType: 'click', onEvent: (e) => { e.sender.title = e.sender.title === 'Dashboard' ? 'Overview' : 'Dashboard'; } },
    { selector: '[data-action="collapse"]', eventType: 'click', onEvent: (e) => { e.sender.collapsed = !e.sender.collapsed; } }
  ],
  // The engine does not destroy children for you. / 엔진은 자식을 자동으로 정리하지 않습니다.
  onDestroy: () => { menu.destroy(); first.destroy(); second.destroy(); }
});

layout.mount('#app');
