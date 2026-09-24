Reference answer for the grader tests (not part of any bundle).

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'">
  <title>Counter and greeting</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./lib/vfunc.tokens.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <main class="page">
    <section class="card" id="greeter">
      <label class="field__label" for="name">Your name</label>
      <input class="field__input" id="name" type="text" autocomplete="off">
      <p class="card__text" data-ref="greeting">Hello, stranger!</p>
    </section>
    <section class="card" id="counter"></section>
  </main>
  <script src="./lib/vfunc.js"></script>
  <script src="./app.js"></script>
</body>
</html>
```

### app.js

```js
// Greeting: the markup is in index.html; attach adds the behaviour only.
vf.attach('#greeter', {
  events: [{
    id: 'name',
    eventType: 'input',
    onEvent: (e) => {
      const name = e.target.value.trim();
      e.sender.refs.greeting.textContent = 'Hello, ' + (name || 'stranger') + '!';
    }
  }]
});

// Counter: a component that renders from its state.
const counter = vf.vfunc({
  state: { count: 0 },
  render: (s) => vf.html`
    <p class="counter__value" data-ref="count" data-state="${s.count === 0 ? 'zero' : 'positive'}">${s.count}</p>
    <div class="counter__buttons">
      <button class="counter__button" type="button" data-action="dec" ${s.count === 0 ? 'disabled' : ''}>−1</button>
      <button class="counter__button" type="button" data-action="inc">+1</button>
      <button class="counter__button" type="button" data-action="reset">Reset</button>
    </div>`,
  delegates: [
    { selector: '[data-action="inc"]', eventType: 'click', onEvent: (e) => { e.sender.count++; } },
    { selector: '[data-action="dec"]', eventType: 'click', onEvent: (e) => { if (e.sender.count > 0) e.sender.count--; } },
    { selector: '[data-action="reset"]', eventType: 'click', onEvent: (e) => { e.sender.count = 0; } }
  ]
});
counter.mount('#counter');
```

### style.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); }
.page { display: grid; gap: var(--vf-space-4); max-width: 30rem; margin: var(--vf-space-6) auto; }
.card { padding: var(--vf-space-4); background: var(--vf-color-surface); border: 1px solid var(--vf-color-border); border-radius: var(--vf-radius-lg); }
.field__label { display: block; margin-bottom: var(--vf-space-1); }
.field__input { padding: var(--vf-space-2); border: 1px solid var(--vf-color-border-strong); border-radius: var(--vf-radius-md); }
.counter__value { font-size: var(--vf-font-size-2xl); }
.counter__value[data-state="zero"] { color: var(--vf-color-text-muted); }
.counter__buttons { display: flex; gap: var(--vf-space-2); }
```

### REPORT.md

```markdown
Reference solution. Checked by the grader in Chromium, Firefox and WebKit.
```
