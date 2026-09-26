### Admin dashboard with layer 2

`REQUEST`: Build the users screen with the layer 2 components (`components.md`). The page already loads `lib/vfunc-ui.js`, `lib/vfunc-ui-data.js`, `lib/vfunc-ui.css` and `data.js` (`USERS`, `MONTHS`, `MONTH_LABELS`; do not change `data.js`). Write the page code in `app.js`.

**Search** — in `#search`: a `vf.vfSearchInput` whose input has `id="q"` and the label `Search users`. Searching keeps only the users whose name contains the text (ignoring case) and shows page 1; clearing the search shows every user again.

**Grid** — in `#users`: a `vf.vfGrid` with `id="users-grid"`, the caption `Users`, 10 rows per page, multiple selection and the row key `id`. Columns, in this order:

| Key | Label | |
|---|---|---|
| `name` | `Name` | sortable |
| `email` | `Email` | |
| `role` | `Role` | shown as a `vf.vsBadge` with the role text |
| `joined` | `Joined` | sortable |

**Selected** — `[data-ref="selected"]` shows `<n> selected` (`0 selected` at the start) and follows the grid's selection.

**Chart** — in `#signups`: a `vf.vfChart` with `id="signups-chart"`, type `bar`, label `Sign-ups per month` and its data table turned on (`dataTable: true`). Its labels are `MONTH_LABELS`; its one series `Sign-ups` has, for each month in `MONTHS`, the number of users whose `joined` date is in that month.

The grader uses the components' own markup: the grid's sort buttons (`data-action="sort"` with `data-value` = the column key), row checkboxes (`data-action="select-row"`), the rows of `#users-grid tbody`, and the chart's bars (`data-action="mark"`) and data table.
