Reference answer for the grader tests (not part of any bundle).

### app.js

```js
// Users screen — the page script. USERS, MONTHS and MONTH_LABELS come from data.js.
(function () {
  'use strict';

  const selected = vf.$('[data-ref="selected"]');

  const grid = vf.vfGrid({
    id: 'users-grid',
    caption: 'Users',
    data: USERS,
    rowKey: 'id',
    pageSize: 10,
    selectable: 'multiple',
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (row) => vf.vsBadge({ label: row.role }) },
      { key: 'joined', label: 'Joined', sortable: true }
    ],
    onSelect: (e) => { selected.textContent = e.data.keys.length + ' selected'; }
  });
  grid.mount('#users');

  // Search by name only: the grid keeps the filtered rows and goes back to page 1.
  vf.vfSearchInput({
    id: 'q',
    label: 'Search users',
    onSearch: (e) => {
      const q = e.data.value.trim().toLowerCase();
      grid.setData(q ? USERS.filter((u) => u.name.toLowerCase().indexOf(q) >= 0) : USERS);
      grid.setPage(1);
    }
  }).mount('#search');

  const counts = MONTHS.map((m) => USERS.filter((u) => u.joined.indexOf(m) === 0).length);
  vf.vfChart({
    id: 'signups-chart',
    type: 'bar',
    label: 'Sign-ups per month',
    dataTable: true,
    data: { labels: MONTH_LABELS, series: [{ name: 'Sign-ups', data: counts }] }
  }).mount('#signups');
}());
```

### REPORT.md

Reference answer: vfSearchInput filters with setData and setPage(1) (name only, as the task asks); vfGrid keeps the selection count in onSelect; vfChart counts sign-ups per month with its data table.
