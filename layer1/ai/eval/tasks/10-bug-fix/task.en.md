### Fix seven bugs

The "Team board" page below works in part. Users and testers reported the problems in the table. Find the cause of each, fix it with as few changes as possible, and keep every hook (`id`, `data-action`, `data-ref`, `data-id`) and text as it is. Where a fix needs a new attribute, add it.

`SYMPTOM` and `CONSOLE`

| # | Report |
|---|---|
| 1 | "The notice box ('Open tasks: …') is drawn inside a second box, and after ticking a task the page has two elements with `id="notice"`." Console: `[vfunc] attach: render returned the target element itself (id "notice"). Render only its inside, or pass replaceRoot: true.` |
| 2 | Accessibility review: "The Details button has `aria-expanded=""` while the panel is closed. It must say `false`." |
| 3 | "When I switch the language to 한국어, the theme goes back to light." |
| 4 | "After I click 'Close clock', the 'Clock updates' counter at the bottom keeps growing." |
| 5 | "Since the last design update, the Remove buttons of the tasks do nothing." (The designer renamed the class `task__remove` to `task__delete`.) |
| 6 | Security: "A comment `<b>hi</b>` shows bold text. A comment can run script." |
| 7 | "Keyboard users lose the focus after ticking a task with Space." |

Expected behaviour after the fixes:
- `#notice` is one element whose text is `Open tasks: <n>` and follows the tasks.
- The Details button has `aria-expanded="false"` when closed and `"true"` when open, and `#details` is hidden when closed.
- The theme (`data-ref="theme"`) and the language (`data-ref="lang"`) change independently.
- Closing the clock stops its timer.
- Remove (`data-action="remove"`) removes the task.
- Comments are shown as text.
- After Space on a task's checkbox (`data-action="toggle"`), the focus stays on that checkbox.
