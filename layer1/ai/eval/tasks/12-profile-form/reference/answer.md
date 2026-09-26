Reference answer for the grader tests (not part of any bundle).

### app.js

```js
// Profile — the page script.
(function () {
  'use strict';

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // The values live outside the markup, so drawing the errors keeps what was typed.
  const values = { name: '', email: '', role: 'viewer', newsletter: false };
  let errors = {};
  const toast = vf.vfToast();

  function validate() {
    const out = {};
    if (!values.name.trim()) out.name = 'Enter your name.';
    if (!EMAIL.test(values.email.trim())) out.email = 'Enter a valid email address.';
    return out;
  }

  vf.attach('#profile', {
    render: () => vf.html`
      ${vf.vsInput({ id: 'name', name: 'name', label: 'Name', required: true, value: values.name, error: errors.name })}
      ${vf.vsInput({ id: 'email', name: 'email', type: 'email', label: 'Email', hint: 'We never share it.', required: true, value: values.email, error: errors.email })}
      ${vf.vsSelect({ id: 'role', name: 'role', label: 'Role', value: values.role,
        options: [{ value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' }] })}
      ${vf.vsSwitch({ id: 'newsletter', name: 'newsletter', label: 'Newsletter', checked: values.newsletter })}
      ${vf.vsButton({ label: 'Save', type: 'submit', variant: 'primary' })}`,
    events: [
      { eventType: 'input', onEvent: (e) => read(e.event.target) },
      { eventType: 'change', onEvent: (e) => read(e.event.target) },
      {
        eventType: 'submit',
        onEvent: (e) => {
          e.event.preventDefault();
          errors = validate();
          e.sender.refresh();
          const first = ['name', 'email'].filter((k) => errors[k])[0];
          if (first) { document.getElementById(first).focus(); return; }
          vf.$('[data-ref="saved"]').textContent = 'Saved: ' + values.name.trim() + ' (' + values.role + ')';
          toast.show({ message: 'Profile saved', variant: 'success' });
        }
      }
    ]
  });

  function read(field) {
    if (!Object.prototype.hasOwnProperty.call(values, field.name)) return;
    values[field.name] = field.type === 'checkbox' ? field.checked : field.value;
  }
}());
```

### REPORT.md

Reference answer: one vf.attach island renders the vs* fields from a values object kept outside the markup; errors through the error prop after a submit; one vfToast for the page.
