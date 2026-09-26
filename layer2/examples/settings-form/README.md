# settings-form — settings form / 설정 폼

vs* fields in one form component, validation with the `error` prop, vfConfirm before a reset, vfToast after saving, in English and Korean. / 폼 하나에 vs* 필드, error prop으로 검증, 초기화 전 vfConfirm, 저장 뒤 vfToast, 한국어·영어.

- **Values live outside the component.** `render` draws from a plain `values` object that `input` / `change` listeners keep current, so a re-render (errors, language) never loses what was typed. / 값은 컴포넌트 밖에 두어 다시 그려도 입력이 남습니다.
- **`vfChipsInput` stays alive through `childs`** (`{ targetId, component }`): the form re-renders around it. / childs로 붙인 인스턴스는 다시 그려도 유지됩니다.
- The listeners sit on the form itself (`events` without `id`): no selector on tags or classes. / 리스너는 폼 자체에 둡니다.
- App texts are messages in two languages; the components' own texts (Cancel, OK, Close) come from `vfunc-ui.locale.ko.js`. / 앱 문구는 앱 메시지, 컴포넌트 문구는 내장 번들.
- A real app sends the values to its server and checks them there again. / 실제 앱은 서버에서 다시 검증합니다.
