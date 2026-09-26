### Profile form with vs* fields

`REQUEST`: Build the profile form inside `form#profile` with the layer 2 field components (`components.md`). The page already loads `lib/vfunc-ui.js` and `lib/vfunc-ui.css`. Write the page code in `app.js`.

**Fields**, in this order (use these ids, names and texts exactly)

| id / name | Component | Label | Rule and message |
|---|---|---|---|
| `name` | `vf.vsInput` | `Name` | required: the trimmed value is not empty — `Enter your name.` |
| `email` | `vf.vsInput` with `type: 'email'`, hint `We never share it.` | `Email` | required: the trimmed value matches `^[^\s@]+@[^\s@]+\.[^\s@]+$` — `Enter a valid email address.` |
| `role` | `vf.vsSelect` | `Role` | options `admin`, `editor`, `viewer` with the labels `Admin`, `Editor`, `Viewer`; `viewer` at the start |
| `newsletter` | `vf.vsSwitch` | `Newsletter` | off at the start |

Then a submit button made with `vf.vsButton`: text `Save`, `type: 'submit'`, variant `primary`.

**Behaviour**
- Errors appear only after a submit, through the fields' `error` prop (the field then has `aria-invalid="true"` and its `aria-describedby` points to the message). A valid field shows no error.
- A submit with errors moves the focus to the first invalid field (table order). What the user typed or chose stays in every field.
- A valid submit shows `Saved: <name> (<role>)` in `[data-ref="saved"]` (the trimmed name, shown as text; the role value) and the toast `Profile saved` from one `vf.vfToast` created once for the page. The fields keep their values.
