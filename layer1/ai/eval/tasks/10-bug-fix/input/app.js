// Team board — the page script.
import vf from './lib/vfunc.esm.js';
import { store, setTheme, setLang, toggleTask, removeTask } from './store.js';

// Preferences: theme and language.
const prefs = vf.attach('#prefs', {
  render: () => {
    const p = store.get('prefs');
    return vf.html`
      <p class="prefs__row">Theme: <span data-ref="theme">${p.theme}</span>
        <button class="prefs__button" type="button" data-action="theme">Switch theme</button></p>
      <p class="prefs__row">Language: <span data-ref="lang">${p.lang}</span>
        <button class="prefs__button" type="button" data-action="lang" data-lang="en">English</button>
        <button class="prefs__button" type="button" data-action="lang" data-lang="ko">한국어</button></p>`;
  },
  delegates: [
    { selector: '[data-action="theme"]', eventType: 'click', onEvent: () => setTheme(store.get('prefs').theme === 'dark' ? 'light' : 'dark') },
    { selector: '[data-action="lang"]', eventType: 'click', onEvent: (e) => setLang(e.target.getAttribute('data-lang')) }
  ]
});

// Notice: how many tasks are open.
const notice = vf.attach('#notice', {
  render: () => {
    const open = store.get('tasks').filter((t) => !t.done).length;
    return vf.html`<section class="notice" id="notice" aria-live="polite"><p class="notice__text">Open tasks: ${open}</p></section>`;
  }
});

// Details: a disclosure.
vf.attach('#details-panel', {
  state: { open: false },
  delegates: [{
    selector: '[data-action="details"]',
    eventType: 'click',
    onEvent: (e) => {
      const open = !e.sender.state.open;
      e.sender.state.open = open;
      e.sender.ids.details.hidden = !open;
      e.target.setAttribute('aria-expanded', open ? 'true' : '');
    }
  }],
  onMount: (inst) => inst.$node.querySelector('[data-action="details"]').setAttribute('aria-expanded', '')
});

// Tasks.
const tasks = vf.attach('#tasks', {
  render: () => vf.html`
    <h2 class="panel__title">Tasks</h2>
    <ul class="tasks">${store.get('tasks').map((t) => vf.html`
      <li class="task" data-id="${t.id}" data-state="${t.done ? 'done' : 'open'}">
        <input type="checkbox" data-action="toggle" aria-label="Done" ${t.done ? 'checked' : ''}>
        <span class="task__title">${t.title}</span>
        <button class="task__delete" type="button" data-action="remove">Remove</button>
      </li>`)}</ul>`,
  delegates: [
    { selector: '[data-action="toggle"]', eventType: 'change', onEvent: (e) => toggleTask(e.target.closest('[data-id]').getAttribute('data-id')) },
    { selector: '.task__remove', eventType: 'click', onEvent: (e) => removeTask(e.target.closest('[data-id]').getAttribute('data-id')) }
  ]
});

// Comments.
const comments = [];
vf.attach('#comments', {
  delegates: [{
    selector: '[data-action="comment"]',
    eventType: 'submit',
    onEvent: (e) => {
      e.event.preventDefault();
      const text = e.sender.refs.comment.value.trim();
      if (!text) return;
      comments.push(text);
      e.sender.refs['comment-list'].innerHTML = comments.map((c) => '<li class="comments__item">' + c + '</li>').join('');
      e.sender.refs.comment.value = '';
    }
  }]
});

// Footer: how often the clock has updated.
const footer = vf.attach('#footer', {
  state: { updates: 0 },
  render: (s) => vf.html`Clock updates: <span data-ref="updates">${s.updates}</span>`
});

// Clock, with a close button.
const clock = vf.vfunc({
  state: { now: new Date() },
  render: (s) => vf.html`
    <p class="clock">Time: <span data-ref="time">${vf.fmt.date(s.now, { timeStyle: 'medium' })}</span>
      <button class="clock__close" type="button" data-action="close-clock">Close clock</button></p>`,
  delegates: [{ selector: '[data-action="close-clock"]', eventType: 'click', onEvent: (e) => e.sender.destroy() }],
  onMount: (inst) => {
    inst._timer = setInterval(() => {
      inst.setState({ now: new Date() });
      footer.setState({ updates: footer.state.updates + 1 });
    }, 250);
  },
  onDestroy: (inst) => clearInterval(inst.timer)
});
clock.mount('#clock-slot');

store.subscribe(() => {
  prefs.refresh();
  notice.refresh();
  tasks.refresh();
});
