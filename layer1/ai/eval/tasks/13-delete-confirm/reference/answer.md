Reference answer for the grader tests (not part of any bundle).

### app.js

```js
// Files — the page script.
const FILES = [
  { id: 'f1', name: 'report.pdf' },
  { id: 'f2', name: 'photo.png' },
  { id: 'f3', name: 'notes.txt' }
];

(function () {
  'use strict';

  let files = FILES.slice();
  const toast = vf.vfToast();
  const countText = (n) => n + (n === 1 ? ' file' : ' files');

  const list = vf.attach('#files', {
    render: () => vf.html`${files.map((f) => vf.html`<li class="files__item"><span>${f.name}</span>${vf.vsButton({
      label: 'Delete', id: 'delete-' + f.id, action: 'delete', size: 'sm', ariaLabel: 'Delete ' + f.name
    })}</li>`)}`,
    onUpdate: () => { vf.$('[data-ref="count"]').textContent = countText(files.length); },
    delegates: [{
      selector: '[data-action="delete"]',
      eventType: 'click',
      onEvent: (e) => { remove(e.target.id.slice('delete-'.length)); }
    }]
  });
  vf.$('[data-ref="count"]').textContent = countText(files.length);

  async function remove(id) {
    const index = files.findIndex((f) => f.id === id);
    if (index < 0) return;
    const file = files[index];
    const dialog = vf.vfConfirm({ title: 'Delete ' + file.name + '?', message: 'This cannot be undone.', confirmLabel: 'Delete', variant: 'danger' });
    const ok = await dialog.open();
    dialog.destroy();
    if (!ok) return; // vfConfirm already returned the focus to the button
    files = files.filter((f) => f.id !== id);
    list.refresh();
    toast.show({ message: 'Deleted ' + file.name, variant: 'success' });
    const next = files[index] || files[index - 1];
    (next ? document.getElementById('delete-' + next.id) : document.getElementById('files-title')).focus();
  }
}());
```

### REPORT.md

Reference answer: vf.attach renders the list with vsButton; each delete awaits a vfConfirm (danger) and destroys it; one vfToast; the focus moves to the next, previous or the heading.
