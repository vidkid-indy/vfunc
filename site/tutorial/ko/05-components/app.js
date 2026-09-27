// 5단계: 컴포넌트 쓰기(vfunc-ui). 버튼·빈 화면은 vs*(마크업), 알림·확인 창은 vf*(인스턴스)입니다.
const KEY = 'vfunc-tutorial-todo';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) || [];
    return saved.map((item) => ({ id: Number(item.id), text: String(item.text), done: item.done === true }));
  } catch (err) {
    return [];
  }
}

const saved = load();
let nextId = saved.reduce((max, item) => Math.max(max, item.id), 0) + 1;
let toast;   // 알림 영역. 페이지에 하나만 만듭니다(아래 맨 끝).

const row = (item) => vf.html`
  <li class="todo__item" data-id="${item.id}" data-state="${item.done ? 'done' : 'open'}">
    <input type="checkbox" id="done-${item.id}" data-action="toggle" ${item.done ? 'checked' : ''}>
    <label class="todo__text" for="done-${item.id}">${item.text}</label>
    ${vf.vsButton({ label: '삭제', variant: 'ghost', size: 'sm', action: 'remove' })}
  </li>`;

const idOf = (e) => Number(e.target.closest('[data-id]').getAttribute('data-id'));

const todo = vf.vfunc({
  state: { items: saved },
  render: (s) => {
    const left = s.items.filter((item) => !item.done).length;
    return vf.html`
      <form class="todo__form" data-action="add">
        <input class="todo__input" name="text" data-ref="input" aria-label="할 일"
               placeholder="할 일을 입력하세요" autocomplete="off" required>
        ${vf.vsButton({ label: '추가', type: 'submit', variant: 'primary' })}
      </form>
      ${s.items.length
        ? vf.html`<ul class="todo__list">${s.items.map(row)}</ul>
                  <p class="todo__footer">남은 일 <strong data-ref="left">${left}</strong>개</p>`
        : vf.vsEmptyState({ title: '할 일이 없습니다', description: '위 입력칸에 할 일을 적고 추가를 누르세요.' })}`;
  },
  onUpdate: (inst) => {
    localStorage.setItem(KEY, JSON.stringify(inst.items));
  },
  methods: {
    add(text) {
      this.items = this.items.concat({ id: nextId++, text: text, done: false });
      toast.show({ message: '추가했습니다: ' + text, variant: 'success' });
    },
    toggle(id) {
      this.items = this.items.map((item) => (item.id === id ? { id: item.id, text: item.text, done: !item.done } : item));
    },
    // 지우기 전에 한 번 묻습니다. open()은 사용자의 답(true/false)을 기다립니다.
    async remove(id) {
      const item = this.items.find((x) => x.id === id);
      const dialog = vf.vfConfirm({ title: '삭제할까요?', message: item.text, variant: 'danger', confirmLabel: '삭제' });
      const ok = await dialog.open();
      dialog.destroy();
      if (!ok) return;
      this.items = this.items.filter((x) => x.id !== id);
      toast.show({ message: '삭제했습니다' });
    }
  },
  delegates: [
    {
      selector: '[data-action="add"]',
      eventType: 'submit',
      onEvent: (e) => {
        e.event.preventDefault();
        const text = e.sender.refs.input.value.trim();
        if (text) e.sender.add(text);
      }
    },
    { selector: '[data-action="toggle"]', eventType: 'change', onEvent: (e) => e.sender.toggle(idOf(e)) },
    { selector: '[data-action="remove"]', eventType: 'click', onEvent: (e) => e.sender.remove(idOf(e)) }
  ]
});

// 컴포넌트의 기본 문구(취소, 닫기 등)를 한국어로 바꾼 뒤 시작합니다.
vf.i18n.set('ko').then(() => {
  toast = vf.vfToast();
  todo.mount('#app');
});
