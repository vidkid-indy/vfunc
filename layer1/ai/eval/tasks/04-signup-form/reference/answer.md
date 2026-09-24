Reference answer for the grader tests (not part of any bundle).

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'">
  <title>Sign up</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./lib/vfunc.tokens.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <main class="page">
    <form class="signup" id="signup" novalidate>
      <h1 class="signup__title">Create your account</h1>
      <div class="field">
        <label class="field__label" for="email">Email</label>
        <input class="field__input" id="email" name="email" type="email" autocomplete="email" aria-describedby="email-error">
        <p class="field__error" id="email-error"></p>
      </div>
      <div class="field">
        <label class="field__label" for="password">Password</label>
        <input class="field__input" id="password" name="password" type="password" autocomplete="new-password" aria-describedby="password-error">
        <p class="field__error" id="password-error"></p>
      </div>
      <div class="field">
        <label class="field__label" for="confirm">Confirm password</label>
        <input class="field__input" id="confirm" name="confirm" type="password" autocomplete="new-password" aria-describedby="confirm-error">
        <p class="field__error" id="confirm-error"></p>
      </div>
      <div class="field field--check">
        <input class="field__check" id="terms" name="terms" type="checkbox" aria-describedby="terms-error">
        <label class="field__label" for="terms">I accept the terms</label>
        <p class="field__error" id="terms-error"></p>
      </div>
      <button class="signup__submit" type="submit">Sign up</button>
    </form>
    <p class="signup__done" data-ref="done" role="status"></p>
  </main>
  <script src="./lib/vfunc.js"></script>
  <script src="./app.js"></script>
</body>
</html>
```

### app.js

```js
// Sign up — client-side validation of the published form (adopted: the inputs are never re-rendered).
const RULES = [
  ['email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()), 'Enter a valid email address.'],
  ['password', (v) => v.password.length >= 8 && /\d/.test(v.password), 'Use at least 8 characters, including a number.'],
  ['confirm', (v) => v.confirm !== '' && v.confirm === v.password, 'Passwords do not match.'],
  ['terms', (v) => v.terms === true, 'Accept the terms to continue.']
];
const shown = {}; // fields that have shown an error: they are checked on every input

function check(form, name) {
  const rule = RULES.filter((r) => r[0] === name)[0];
  const ok = rule[1](vf.form.values(form));
  form.querySelector('#' + name).setAttribute('aria-invalid', ok ? 'false' : 'true');
  document.getElementById(name + '-error').textContent = ok ? '' : rule[2];
  if (!ok) shown[name] = true;
  return ok;
}

vf.attach('#signup', {
  delegates: [
    { selector: '#email, #password, #confirm', eventType: 'focusout', onEvent: (e) => check(e.sender.$node, e.target.id) },
    { selector: '#email, #password, #confirm', eventType: 'input', onEvent: (e) => { if (shown[e.target.id]) check(e.sender.$node, e.target.id); } },
    { selector: '#terms', eventType: 'change', onEvent: (e) => check(e.sender.$node, 'terms') },
    {
      selector: '#signup',
      eventType: 'submit',
      onEvent: (e) => {
        e.event.preventDefault();
        const form = e.sender.$node;
        const bad = RULES.map((r) => r[0]).filter((name) => !check(form, name));
        if (bad.length) {
          form.querySelector('#' + bad[0]).focus();
          return;
        }
        const email = vf.form.values(form, { skipPassword: true }).email.trim();
        form.hidden = true;
        document.querySelector('[data-ref="done"]').textContent = 'Welcome, ' + email + '!';
      }
    }
  ]
});
```

### style.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.page { max-width: 26rem; margin: var(--vf-space-6) auto; padding: 0 var(--vf-space-4); }
.signup { display: grid; gap: var(--vf-space-3); padding: var(--vf-space-5); background: var(--vf-color-surface); border: 1px solid var(--vf-color-border); border-radius: var(--vf-radius-lg); }
.signup__title { margin: 0; font-size: var(--vf-font-size-xl); }
.field { display: grid; gap: var(--vf-space-1); }
.field--check { display: flex; flex-wrap: wrap; align-items: center; gap: var(--vf-space-2); }
.field__input { padding: var(--vf-space-2); border: 1px solid var(--vf-color-border-strong); border-radius: var(--vf-radius-md); font: inherit; }
.field__input[aria-invalid="true"] { border-color: var(--vf-color-danger); }
.field__error { margin: 0; color: var(--vf-color-danger-text); font-size: var(--vf-font-size-sm); }
.field__error:empty { display: none; }
.signup__submit { padding: var(--vf-space-2) var(--vf-space-4); border: 0; border-radius: var(--vf-radius-md); background: var(--vf-color-primary); color: var(--vf-color-on-primary); font: inherit; }
```

### REPORT.md

Reference solution.
