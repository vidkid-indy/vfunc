### Sign-up form validation

`REQUEST`: Add client-side validation to the published sign-up form (`form#signup`). There is no server yet: a valid form only shows a welcome message. Keep the form markup; add what the rules below need.

**Rules and messages** (use these texts exactly)

| Field | Valid when | Message |
|---|---|---|
| `#email` | the trimmed value matches `^[^\s@]+@[^\s@]+\.[^\s@]+$` | `Enter a valid email address.` |
| `#password` | at least 8 characters and at least one digit | `Use at least 8 characters, including a number.` |
| `#confirm` | not empty and equal to the password | `Passwords do not match.` |
| `#terms` | checked | `Accept the terms to continue.` |

**Behaviour**
- Each field has a message element with `id="<field id>-error"` (`email-error`, `password-error`, `confirm-error`, `terms-error`), and the field's `aria-describedby` contains that id. The message element is empty while the field is valid.
- A text field is validated when it loses focus. Once it has shown an error, it is validated again on every input, so the message goes away as soon as the value is fixed. The checkbox is validated when it changes.
- A validated field has `aria-invalid="true"` or `aria-invalid="false"`. Before its first validation it has no `aria-invalid` or `"false"`.
- Submitting validates every field. If any is invalid, the focus moves to the first invalid field (in the order of the table) and nothing else happens.
- A valid submit hides the form with the `hidden` attribute and shows `Welcome, <email>!` (trimmed email, shown as text) in an element with `data-ref="done"`.
- The password never appears in the page (other than inside its input) and never in the console.
