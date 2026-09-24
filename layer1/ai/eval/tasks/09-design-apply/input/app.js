// Settings — works today with the neutral design. A design task must not change this file.
import vf from './lib/vfunc.esm.js';

const TOPICS = [
  { id: 'weekly', name: 'Weekly report', on: true },
  { id: 'billing', name: 'Billing alerts', on: false },
  { id: 'security', name: 'Security notices', on: true }
];

vf.attach('#settings', {
  state: { notify: true, saved: false },
  render: (s) => vf.html`
    <h1 class="card__title">Settings</h1>
    <p class="card__text">Choose what we send you.</p>
    <button class="toggle" type="button" data-action="notify" aria-pressed="${s.notify}">Notifications</button>
    <ul class="list">${TOPICS.map((t) => vf.html`
      <li class="list__item" data-id="${t.id}">
        <span class="list__name">${t.name}</span>
        <span class="badge" data-state="${t.on ? 'on' : 'off'}">${t.on ? 'On' : 'Off'}</span>
      </li>`)}</ul>
    <div class="card__actions">
      <button class="button" type="button" data-action="cancel">Cancel</button>
      <button class="button" type="button" data-action="save" data-variant="primary">Save</button>
    </div>
    ${s.saved ? vf.html`<p class="notice" data-ref="notice" data-state="success" role="status">Saved.</p>` : ''}`,
  delegates: [
    { selector: '[data-action="notify"]', eventType: 'click', onEvent: (e) => e.sender.setState({ notify: !e.sender.notify, saved: false }) },
    { selector: '[data-action="save"]', eventType: 'click', onEvent: (e) => e.sender.setState({ saved: true }) },
    { selector: '[data-action="cancel"]', eventType: 'click', onEvent: (e) => e.sender.setState({ notify: true, saved: false }) }
  ]
});
