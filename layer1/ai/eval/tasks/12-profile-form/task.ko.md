### vs* 필드로 만드는 프로필 폼

`REQUEST`: layer2 필드 컴포넌트(`components.md`)로 `form#profile` 안에 프로필 폼을 만드세요. 페이지는 이미 `lib/vfunc-ui.js`와 `lib/vfunc-ui.css`를 불러옵니다. 페이지 코드는 `app.js`에 씁니다.

**필드**는 이 순서입니다(id, name, 문구를 그대로 씀).

| id / name | 컴포넌트 | 라벨 | 규칙과 메시지 |
|---|---|---|---|
| `name` | `vf.vsInput` | `Name` | 필수: 앞뒤 공백을 뺀 값이 비어 있지 않음 — `Enter your name.` |
| `email` | `vf.vsInput`(`type: 'email'`), 힌트 `We never share it.` | `Email` | 필수: 앞뒤 공백을 뺀 값이 `^[^\s@]+@[^\s@]+\.[^\s@]+$`에 맞음 — `Enter a valid email address.` |
| `role` | `vf.vsSelect` | `Role` | 옵션 `admin`, `editor`, `viewer`, 라벨 `Admin`, `Editor`, `Viewer`, 처음은 `viewer` |
| `newsletter` | `vf.vsSwitch` | `Newsletter` | 처음은 꺼짐 |

그다음 `vf.vsButton`으로 만든 제출 버튼: 글자 `Save`, `type: 'submit'`, 변형 `primary`.

**동작**
- 오류는 제출한 뒤에만, 필드의 `error` prop으로 보입니다(필드는 `aria-invalid="true"`가 되고 `aria-describedby`가 메시지를 가리킴). 올바른 필드에는 오류가 없습니다.
- 오류가 있는 제출은 첫 번째 잘못된 필드(표 순서)로 포커스를 옮깁니다. 사용자가 입력하거나 고른 값은 모든 필드에 그대로 남습니다.
- 올바른 제출은 `[data-ref="saved"]`에 `Saved: <name> (<role>)`(앞뒤 공백을 뺀 이름을 텍스트로, 역할 값)를 보이고, 페이지에 한 번 만든 `vf.vfToast`로 알림 `Profile saved`를 띄웁니다. 필드는 값을 유지합니다.
