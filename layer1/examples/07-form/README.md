# 07 form

- `vf.form.values(form)` reads every control with an id: text as string, checkbox as boolean. / id가 있는 컨트롤의 값을 읽습니다.
- `vf.form.values(form, { skipPassword: true })` leaves passwords out — for showing or logging values. **Never log form values in real apps.** / 값을 보이거나 기록할 때 비밀번호를 뺍니다.
- `vf.form.reset(form)` clears the inputs, keeps hidden inputs and returns selects to their `user-default` index. / 입력은 비우고 hidden은 유지, select는 `user-default`로 돌립니다.
- The form is adopted with `vf.attach` and **never re-rendered**: errors are shown with `aria-invalid` and text only, so typed values and the caret never jump. / 폼을 다시 그리지 않고 `aria-invalid`와 텍스트만 바꿉니다.
- Client checks are for the user's convenience; the server must validate again. / 클라이언트 검사는 편의용이며 서버에서 다시 검사해야 합니다.

Production CDN and ESM lines: see [01 hello](../01-hello/README.md).
