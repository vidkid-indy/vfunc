// Step 1: one component. When the state changes, the screen is drawn again.
const hello = vf.vfunc({
  state: { name: '' },
  render: (s) => vf.html`
    <label class="todo__label" for="name">Name</label>
    <input class="todo__input" id="name" data-action="rename" value="${s.name}"
           placeholder="Type your name" autocomplete="off">
    <p class="todo__greeting" data-ref="greeting">Hello, ${s.name || 'guest'}!</p>`,
  delegates: [{
    selector: '[data-action="rename"]',
    eventType: 'input',
    onEvent: (e) => { e.sender.name = e.target.value; }
  }]
});

hello.mount('#app');
