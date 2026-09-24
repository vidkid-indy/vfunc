### To-do list

`REQUEST`: Add a to-do list to the page, inside `<section id="todo">`. The list starts empty and lives only in memory.

**Adding**
- A form with `data-action="add"` holds a text input with `data-ref="input"` (visible label `New task`) and a submit button `Add`.
- Enter or the button adds the trimmed text. Empty or space-only text adds nothing.
- After adding, the input is empty and has the focus, ready for the next task.
- The text is shown as text: `<img src=x onerror=alert(1)>` shows those characters.

**The list**
- The list element has `data-ref="list"`. Each task is one element inside it with a unique `data-id` and `data-state="open"` or `data-state="done"`.
- Inside each task: a checkbox with `data-action="toggle"` and `id="todo-<data-id>"`, the text in an element with `data-ref="text"`, and a button `data-action="remove"` with the text `Remove`.
- Toggling with the keyboard (Space on the focused checkbox) keeps the focus on that checkbox.

**Filter and count**
- Three buttons with `data-action="filter"` and `data-filter="all"`, `"open"`, `"done"` (texts `All`, `Open`, `Done`). The current one has `aria-pressed="true"`, the others `aria-pressed="false"`. The default is `all`.
- An element with `data-ref="left"` shows the number of open tasks as a bare number (`2`).
- When the current filter shows no task, an element with `data-ref="empty"` shows `Nothing here.`; otherwise that element is absent or hidden.
