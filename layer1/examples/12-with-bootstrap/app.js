// SPDX-License-Identifier: Apache-2.0
// 12 with-bootstrap — Bootstrap classes are for looks only; behaviour hangs on data-action, id, data-ref.
// Bootstrap 클래스는 모양용입니다. 동작은 data-action·id·data-ref에만 겁니다.

// 1) Published Bootstrap markup, adopted without re-rendering. / 다시 그리지 않고 채택
vf.attach('#subscribe', {
  delegates: [{
    selector: '[data-action="subscribe"]',
    eventType: 'click',
    onEvent: (e) => {
      const inst = e.sender;
      const email = inst.ids.email.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      // Bootstrap expresses state with classes, so toggle its classes here. The selectors above never use them.
      // Bootstrap은 상태를 클래스로 표현하므로 여기서 토글합니다. 셀렉터는 이 클래스를 쓰지 않습니다.
      inst.ids.email.classList.toggle('is-invalid', !ok);
      inst.ids.email.setAttribute('aria-invalid', ok ? 'false' : 'true');
      inst.refs.error.textContent = ok ? '' : 'Enter a valid email. / 올바른 이메일을 입력하세요.';
      inst.refs.done.classList.toggle('d-none', !ok);
    }
  }]
});

// 2) A component whose render uses Bootstrap classes. / render에서 Bootstrap 클래스를 쓰는 컴포넌트
const tasks = vf.vfunc({
  state: { filter: 'all', items: [{ id: 1, text: 'Keep the markup', done: true }, { id: 2, text: 'Add behaviour', done: false }] },
  render: (s) => {
    const shown = s.items.filter((t) => s.filter === 'all' || (s.filter === 'done') === t.done);
    const tab = (value, label) => vf.html`
      <button type="button" class="${'btn btn-sm ' + (s.filter === value ? 'btn-primary' : 'btn-outline-primary')}"
              data-action="filter" data-filter="${value}" aria-pressed="${s.filter === value ? 'true' : 'false'}">${label}</button>`;
    return vf.html`
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Tasks</strong>
        <div class="btn-group" role="group" aria-label="Filter">${tab('all', 'All')}${tab('open', 'Open')}${tab('done', 'Done')}</div>
      </div>
      <ul class="list-group list-group-flush" data-ref="list">
        ${shown.map((t) => vf.html`
          <li class="list-group-item d-flex align-items-center gap-2" data-id="${t.id}">
            <input class="form-check-input mt-0" type="checkbox" id="task-${t.id}" data-action="toggle" ${t.done ? 'checked' : ''}>
            <label class="${'form-check-label ' + (t.done ? 'text-decoration-line-through text-secondary' : '')}" for="task-${t.id}">${t.text}</label>
          </li>`)}
      </ul>`;
  },
  delegates: [
    { selector: '[data-action="filter"]', eventType: 'click', onEvent: (e) => { e.sender.filter = e.target.getAttribute('data-filter'); } },
    {
      selector: '[data-action="toggle"]',
      eventType: 'change',
      onEvent: (e) => {
        const id = Number(e.target.closest('[data-id]').getAttribute('data-id'));
        e.sender.items = e.sender.items.map((t) => (t.id === id ? { id: t.id, text: t.text, done: !t.done } : t));
      }
    }
  ]
});

tasks.mount('#tasks');
