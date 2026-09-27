// 1단계: 컴포넌트 하나. 상태(state)를 바꾸면 화면이 다시 그려집니다.
const hello = vf.vfunc({
  state: { name: '' },
  render: (s) => vf.html`
    <label class="todo__label" for="name">이름</label>
    <input class="todo__input" id="name" data-action="rename" value="${s.name}"
           placeholder="이름을 입력하세요" autocomplete="off">
    <p class="todo__greeting" data-ref="greeting">안녕하세요, ${s.name || '손님'}님!</p>`,
  delegates: [{
    selector: '[data-action="rename"]',
    eventType: 'input',
    onEvent: (e) => { e.sender.name = e.target.value; }
  }]
});

hello.mount('#app');
