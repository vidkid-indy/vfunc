// SPDX-License-Identifier: Apache-2.0
// 01 hello — the global `vf` comes from dist/vfunc.js. / 전역 vf는 dist/vfunc.js가 만듭니다.

const hello = vf.vfunc({
  state: { name: 'vfunc' },
  // vf.html escapes every value: try typing <b>bold</b>. / 값은 모두 이스케이프됩니다.
  render: (s) => vf.html`
    <p data-ref="greeting">Hello, <strong>${s.name || 'stranger'}</strong>!</p>
    <label class="field">
      <span class="field__label">Your name / 이름</span>
      <input class="field__input" id="name" value="${s.name}" data-action="rename" autocomplete="off">
    </label>`,
  delegates: [{
    selector: '[data-action="rename"]',
    eventType: 'input',
    // Assigning a state key schedules one render; focus and caret are restored.
    // 상태를 대입하면 렌더가 예약되고, 포커스와 커서 위치는 복원됩니다.
    onEvent: (e) => { e.sender.name = e.target.value; }
  }]
});

hello.mount('#app');
