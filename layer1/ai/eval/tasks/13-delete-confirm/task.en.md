### Delete with a confirmation

`REQUEST`: List the files of `FILES` (in `app.js`) and let the user delete them after a confirmation, with the layer 2 overlays (`components.md`). The page already loads `lib/vfunc-ui.js` and `lib/vfunc-ui.css`.

**List**
- `ul#files` has one `<li>` per file with its name and a button with the text `Delete`, `id="delete-<id>"`, `data-action="delete"` and `aria-label="Delete <name>"`.
- `[data-ref="count"]` shows `<n> files` (`1 file` for one).

**Deleting**
- A Delete button opens a `vf.vfConfirm` with the variant `danger`, the title `Delete <name>?`, the message `This cannot be undone.` and the confirm label `Delete` (the cancel button keeps its built-in text `Cancel`).
- Cancel, Escape or the close button change nothing, and the focus goes back to that Delete button.
- Confirming removes the file from the list, updates the count and shows the toast `Deleted <name>` from one `vf.vfToast` created once for the page. The focus then moves to the Delete button of the next file, or else of the previous file, or else to the heading `#files-title` (it has `tabindex="-1"`).
- Do not use `window.confirm`.
