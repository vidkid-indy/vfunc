// SPDX-License-Identifier: Apache-2.0
// 13 with-tailwind — classes never change with state: state goes to aria-* / data-state and
// Tailwind variants style it. / 상태는 속성으로, Tailwind 변형(aria-pressed:, data-[state=done]:)이 꾸밉니다.

const BUTTON = 'rounded-md border border-line px-3 py-1 text-sm aria-pressed:bg-primary aria-pressed:text-on-primary';

const habits = vf.vfunc({
  state: {
    view: 'all',
    items: [
      { id: 1, text: 'Drink water / 물 마시기', done: true },
      { id: 2, text: 'Walk 20 minutes / 20분 걷기', done: false },
      { id: 3, text: 'Read / 독서', done: false }
    ]
  },
  render: (s) => {
    const shown = s.items.filter((h) => s.view === 'all' || (s.view === 'done') === h.done);
    return vf.html`
      <div class="mb-4 flex gap-2" role="group" aria-label="Filter">
        ${['all', 'open', 'done'].map((v) => vf.html`
          <button type="button" class="${BUTTON}" data-action="view" data-view="${v}" aria-pressed="${s.view === v ? 'true' : 'false'}">${v}</button>`)}
      </div>
      <ul class="divide-y divide-line" data-ref="list">
        ${shown.map((h) => vf.html`
          <li class="group flex items-center gap-3 py-2" data-id="${h.id}" data-state="${h.done ? 'done' : 'open'}">
            <input type="checkbox" id="habit-${h.id}" data-action="toggle" class="size-4 accent-primary" ${h.done ? 'checked' : ''}>
            <label for="habit-${h.id}" class="flex-1 group-data-[state=done]:text-muted group-data-[state=done]:line-through">${h.text}</label>
          </li>`)}
      </ul>
      <p class="mt-3 text-sm text-muted" data-ref="summary">${s.items.filter((h) => h.done).length} / ${s.items.length} done</p>`;
  },
  delegates: [
    { selector: '[data-action="view"]', eventType: 'click', onEvent: (e) => { e.sender.view = e.target.getAttribute('data-view'); } },
    {
      selector: '[data-action="toggle"]',
      eventType: 'change',
      onEvent: (e) => {
        const id = Number(e.target.closest('[data-id]').getAttribute('data-id'));
        e.sender.items = e.sender.items.map((h) => (h.id === id ? { id: h.id, text: h.text, done: !h.done } : h));
      }
    }
  ]
});

habits.mount('#app');
