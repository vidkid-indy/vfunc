### Counter and greeting

Build a small page from scratch: `index.html`, `app.js` and, if you want, `style.css`. It has two widgets.

**Greeting**
- A text input with `id="name"` and a visible label "Your name".
- An element with `data-ref="greeting"` shows `Hello, <name>!` with the trimmed input. When the input is empty, it shows `Hello, stranger!`.
- The greeting follows every keystroke. Typing never loses the focus, the caret or characters.
- The name is shown as text: typing `<b>Kim</b>` shows the tags themselves.

**Counter**
- An element with `data-ref="count"` shows the count, starting at `0`.
- Three buttons: `data-action="inc"` (text `+1`), `data-action="dec"` (text `−1`), `data-action="reset"` (text `Reset`).
- The count never goes below 0. The `dec` button has the `disabled` attribute while the count is 0.
- The count element has `data-state="zero"` when the count is 0 and `data-state="positive"` otherwise.
