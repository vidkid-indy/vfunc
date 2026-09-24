// SPDX-License-Identifier: Apache-2.0
// 01 hello (ES module). With npm: `import vf from 'vfunc'`. / npm이라면 import vf from 'vfunc'.
import vf from '../../dist/vfunc.esm.js';

const hello = vf.vfunc({
  state: { name: 'vfunc' },
  render: (s) => vf.html`
    <p data-ref="greeting">Hello, <strong>${s.name || 'stranger'}</strong>!</p>
    <label class="field">
      <span class="field__label">Your name / 이름</span>
      <input class="field__input" id="name" value="${s.name}" data-action="rename" autocomplete="off">
    </label>`,
  delegates: [{
    selector: '[data-action="rename"]',
    eventType: 'input',
    onEvent: (e) => { e.sender.name = e.target.value; }
  }]
});

hello.mount('#app');
