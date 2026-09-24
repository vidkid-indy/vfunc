// SPDX-License-Identifier: Apache-2.0
// 03 todo — delegates, lists, vf.html escaping. / 위임, 목록, 이스케이프.
// One listener on the root handles every row: never create an instance per row.
// 루트의 리스너 하나가 모든 행을 처리합니다. 행마다 인스턴스를 만들지 마세요.

let nextId = 3;

const row = (item) => vf.html`
  <li class="list__item" data-id="${item.id}" data-state="${item.done ? 'done' : 'open'}">
    <input type="checkbox" id="todo-${item.id}" data-action="toggle" aria-label="Done" ${item.done ? 'checked' : ''}>
    <span class="list__text">${item.text}</span>
    <button class="btn" type="button" data-action="remove" data-variant="danger">Remove / 삭제</button>
  </li>`;

const todo = vf.vfunc({
  state: {
    items: [
      { id: 1, text: 'Read the manual / 매뉴얼 읽기', done: true },
      { id: 2, text: 'Build something / 무언가 만들기', done: false }
    ]
  },
  render: (s) => {
    const left = s.items.filter((item) => !item.done).length;
    return vf.html`
      <form class="row" data-action="add">
        <input class="field__input" name="text" data-ref="input" placeholder="What needs doing? / 할 일" autocomplete="off" required>
        <button class="btn" type="submit" data-variant="primary">Add / 추가</button>
      </form>
      <ul class="list" data-ref="list">${s.items.map(row)}</ul>
      <p class="muted"><span data-ref="left">${left}</span> left / 남음</p>`;
  },
  methods: {
    add(text) {
      const value = String(text || '').trim();
      if (!value) return;
      // Render now (not scheduled) so the new, empty input can take the focus for the next item.
      // 바로 렌더해서 새로 생긴 빈 입력칸에 포커스를 줍니다(연속 입력).
      this.state.items = this.items.concat({ id: nextId++, text: value, done: false });
      this.refresh();
      this.refs.input.focus();
    },
    toggle(id) {
      this.setState({ items: this.items.map((item) => (item.id === id ? { id: item.id, text: item.text, done: !item.done } : item)) });
    },
    remove(id) {
      this.setState({ items: this.items.filter((item) => item.id !== id) });
    }
  },
  delegates: [
    {
      selector: '[data-action="add"]',
      eventType: 'submit',
      onEvent: (e) => {
        e.event.preventDefault();
        e.sender.add(e.sender.refs.input.value);
      }
    },
    {
      selector: '[data-action="toggle"]',
      eventType: 'change',
      onEvent: (e) => e.sender.toggle(Number(e.target.closest('[data-id]').getAttribute('data-id')))
    },
    {
      selector: '[data-action="remove"]',
      eventType: 'click',
      onEvent: (e) => e.sender.remove(Number(e.target.closest('[data-id]').getAttribute('data-id')))
    }
  ]
});

todo.mount('#app');
