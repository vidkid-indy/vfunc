Reference answer for the grader tests (not part of any bundle).

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
  <title>ACME Admin — Dashboard</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./dashboard.css">
</head>
<body>
  <header class="topbar">
    <a class="topbar__logo" href="../">ACME Admin</a>
    <input class="topbar__search" type="search" placeholder="Search orders…" id="order-search" data-action="search" aria-label="Search orders">
    <div class="topbar__user" id="user-menu">
      <button class="topbar__user-btn" type="button" data-action="menu" data-ref="menu-button" aria-expanded="false" aria-controls="userMenu">Jiwoo Lee ▾</button>
      <ul class="topbar__menu" id="userMenu" hidden>
        <li><a href="#">Profile</a></li>
        <li><a href="#">Settings</a></li>
        <li><a href="#" data-action="sign-out">Sign out</a></li>
      </ul>
    </div>
  </header>

  <div class="layout">
    <nav class="sidebar">
      <a class="sidebar__link sidebar__link--active" href="#">Dashboard</a>
      <a class="sidebar__link" href="#">Orders</a>
      <a class="sidebar__link" href="#">Customers</a>
      <a class="sidebar__link" href="#">Reports</a>
    </nav>

    <main class="content">
      <h1 class="content__title">Dashboard</h1>

      <section class="kpis">
        <div class="kpi"><p class="kpi__label">Revenue</p><p class="kpi__value">₩12,480,000</p><p class="kpi__delta kpi__delta--up">+8.2%</p></div>
        <div class="kpi"><p class="kpi__label">Orders</p><p class="kpi__value">342</p><p class="kpi__delta kpi__delta--up">+3.1%</p></div>
        <div class="kpi"><p class="kpi__label">Refunds</p><p class="kpi__value">7</p><p class="kpi__delta kpi__delta--down">-1.4%</p></div>
        <div class="kpi"><p class="kpi__label">New customers</p><p class="kpi__value">58</p><p class="kpi__delta kpi__delta--up">+12.0%</p></div>
      </section>

      <section class="panel" id="summary-panel">
        <div class="panel__head">
          <h2 class="panel__title">Summary</h2>
          <div class="tabs" role="tablist">
            <button class="tabs__tab tabs__tab--active" type="button" data-action="tab" data-tab="week" role="tab" aria-selected="true">This week</button>
            <button class="tabs__tab" type="button" data-action="tab" data-tab="month" role="tab" aria-selected="false">This month</button>
          </div>
        </div>
        <div class="panel__body" id="summary" role="tabpanel">
          <p data-ref="summary-text">Orders are up this week. Most sales came from the keyboard line.</p>
        </div>
      </section>

      <section class="panel" id="orders-panel">
        <div class="panel__head">
          <h2 class="panel__title">Recent orders</h2>
          <select class="panel__filter" id="order-status" data-action="filter" aria-label="Status">
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <table class="orders">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Status</th><th class="orders__num">Total</th></tr>
          </thead>
          <tbody id="orders-body">
            <tr><td>#1042</td><td>Minsu Kim</td><td><span class="badge badge--paid">Paid</span></td><td class="orders__num">₩59,000</td></tr>
            <tr><td>#1041</td><td>Seoyeon Park</td><td><span class="badge badge--shipped">Shipped</span></td><td class="orders__num">₩329,000</td></tr>
            <tr><td>#1040</td><td>Jiho Choi</td><td><span class="badge badge--refunded">Refunded</span></td><td class="orders__num">₩29,000</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>

  <footer class="footer">© ACME — a fictional company for this sample</footer>

  <script src="./lib/vfunc.js"></script>
  <script src="./app.js"></script>
</body>
</html>
```

### app.js

```js
// The published HTML stays; four areas get behaviour.
const SUMMARY = {
  week: 'Orders are up this week. Most sales came from the keyboard line.',
  month: 'This month: 1,204 orders, 3.4% refunds.'
};
const LABELS = { paid: 'Paid', shipped: 'Shipped', refunded: 'Refunded' };

// User menu — adopted.
function setMenu(inst, open) {
  inst.ids.userMenu.hidden = !open;
  inst.refs['menu-button'].setAttribute('aria-expanded', open ? 'true' : 'false');
}
let closeOutside = null;
vf.attach('#user-menu', {
  delegates: [
    { selector: '[data-action="menu"]', eventType: 'click', onEvent: (e) => setMenu(e.sender, e.sender.ids.userMenu.hidden) },
    {
      selector: '[data-action="sign-out"]',
      eventType: 'click',
      onEvent: (e) => {
        e.event.preventDefault();
        setMenu(e.sender, false);
        e.sender.refs['menu-button'].textContent = 'Signed out';
      }
    }
  ],
  onMount: (inst) => {
    closeOutside = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'click' && inst.$node.contains(event.target)) return;
      setMenu(inst, false);
    };
    document.addEventListener('click', closeOutside);
    document.addEventListener('keydown', closeOutside);
  },
  onDestroy: () => {
    document.removeEventListener('click', closeOutside);
    document.removeEventListener('keydown', closeOutside);
  }
});

// Summary tabs — adopted; the class is toggled for looks only.
vf.attach('#summary-panel', {
  delegates: [{
    selector: '[data-action="tab"]',
    eventType: 'click',
    onEvent: (e) => {
      const name = e.target.getAttribute('data-tab');
      vf.$$('[data-action="tab"]', e.sender.$node).forEach((tab) => {
        const on = tab === e.target;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.classList.toggle('tabs__tab--active', on);
      });
      e.sender.refs['summary-text'].textContent = SUMMARY[name];
    }
  }]
});

// Orders — the published tbody stays; render fills its rows.
const orders = vf.attach('#orders-body', {
  state: {
    q: '',
    status: '',
    items: [
      { id: 1042, customer: 'Minsu Kim', status: 'paid', total: '₩59,000' },
      { id: 1041, customer: 'Seoyeon Park', status: 'shipped', total: '₩329,000' },
      { id: 1040, customer: 'Jiho Choi', status: 'refunded', total: '₩29,000' }
    ]
  },
  render: (s) => {
    const q = s.q.trim().toLowerCase().replace(/^#/, '');
    const shown = s.items.filter((o) => (!s.status || o.status === s.status) &&
      (!q || String(o.id).indexOf(q) >= 0 || o.customer.toLowerCase().indexOf(q) >= 0));
    return vf.html`${shown.length === 0
      ? vf.html`<tr><td colspan="4">No orders match.</td></tr>`
      : shown.map((o) => vf.html`<tr data-id="${o.id}"><td>#${o.id}</td><td>${o.customer}</td><td><span class="${'badge badge--' + o.status}" data-state="${o.status}">${LABELS[o.status]}</span></td><td class="orders__num">${o.total}</td></tr>`)}`;
  }
});

vf.attach('#orders-panel', {
  delegates: [{ selector: '[data-action="filter"]', eventType: 'change', onEvent: (e) => orders.setState({ status: e.target.value }) }]
});
vf.attach('#order-search', {
  events: [{ eventType: 'input', onEvent: (e) => orders.setState({ q: e.target.value }) }]
});
```

### REPORT.md

Reference solution.
