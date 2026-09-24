Reference answer for the grader tests (not part of any bundle).

### api.js

```js
// Every server call of the page.
export async function getServers() {
  const response = await fetch('./data/servers.json', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
```

### app.js

```js
// Servers — the page script (an ES module).
import vf from './lib/vfunc.esm.js';
import { getServers } from './api.js';

const STATUS = { up: 'Up', down: 'Down', maintenance: 'Maintenance' };
const FILTERS = [['all', 'All'], ['up', 'Up'], ['down', 'Down'], ['maintenance', 'Maintenance']];
const statusOf = (s) => (Object.prototype.hasOwnProperty.call(STATUS, s) ? s : 'unknown');
const linkOf = (url) => (/^https?:\/\//i.test(String(url)) ? String(url) : null);

function statusText(s, shown) {
  if (s.status === 'loading') return 'Loading servers…';
  if (s.status === 'error') return 'Could not load servers.';
  if (s.items.length === 0) return 'No servers yet.';
  return 'Showing ' + shown.length + ' of ' + s.items.length;
}

const busy = (inst) => inst.$node.setAttribute('aria-busy', inst.state.status === 'loading' ? 'true' : 'false');

async function load(inst) {
  inst.setState({ status: 'loading' });
  try {
    inst.setState({ status: 'ready', items: await getServers() });
  } catch (err) {
    inst.setState({ status: 'error', items: [] });
  }
}

vf.attach('#servers', {
  state: { status: 'loading', items: [], filter: 'all' },
  render: (s) => {
    const shown = s.items.filter((x) => s.filter === 'all' || statusOf(x.status) === s.filter);
    return vf.html`
      <div class="servers__bar">
        <label class="servers__label" for="status-filter">Status</label>
        <select class="servers__filter" id="status-filter" data-action="status-filter">
          ${FILTERS.map((f) => vf.html`<option value="${f[0]}" ${s.filter === f[0] ? 'selected' : ''}>${f[1]}</option>`)}
        </select>
      </div>
      <p class="servers__status" data-ref="status" role="status">${statusText(s, shown)}</p>
      ${s.status === 'error' ? vf.html`<button class="servers__retry" type="button" data-action="retry">Retry</button>` : ''}
      <ul class="servers__list" data-ref="list">${shown.map((x) => vf.html`
        <li class="server" data-id="${x.id}">
          <span class="server__name" data-ref="name">${x.name}</span>
          <span class="server__region">${x.region}</span>
          <span class="server__badge" data-ref="badge" data-state="${statusOf(x.status)}">${STATUS[statusOf(x.status)] || 'Unknown'}</span>
          ${linkOf(x.url) ? vf.html`<a class="server__link" data-ref="link" href="${linkOf(x.url)}" rel="noopener">Open</a>` : vf.html`<span class="server__link" data-ref="link">Open</span>`}
        </li>`)}</ul>`;
  },
  delegates: [
    { selector: '[data-action="status-filter"]', eventType: 'change', onEvent: (e) => e.sender.setState({ filter: e.target.value }) },
    { selector: '[data-action="retry"]', eventType: 'click', onEvent: (e) => load(e.sender) }
  ],
  onMount: (inst) => { busy(inst); load(inst); },
  onUpdate: busy
});
```

### style.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.page { max-width: 44rem; margin: var(--vf-space-6) auto; padding: 0 var(--vf-space-4); }
.page__title { font-size: var(--vf-font-size-2xl); font-weight: var(--vf-font-weight-strong); }
.servers { padding: var(--vf-space-4); background: var(--vf-color-surface); border: 1px solid var(--vf-color-border); border-radius: var(--vf-radius-lg); }
.servers__bar { display: flex; gap: var(--vf-space-2); align-items: center; }
.servers__list { list-style: none; margin: 0; padding: 0; }
.server { display: flex; gap: var(--vf-space-3); padding: var(--vf-space-2) 0; border-top: 1px solid var(--vf-color-border); }
.server__region { color: var(--vf-color-text-muted); }
.server__badge[data-state="up"] { color: var(--vf-color-success-text); }
.server__badge[data-state="down"] { color: var(--vf-color-danger-text); }
.server__badge[data-state="maintenance"] { color: var(--vf-color-warning-text); }
```

### REPORT.md

Reference solution.
