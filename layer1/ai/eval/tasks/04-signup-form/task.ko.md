### 가입 폼 검증

`REQUEST`: 퍼블리싱된 가입 폼(`form#signup`)에 클라이언트 검증을 추가해 주세요. 아직 서버가 없으므로, 올바른 폼은 환영 메시지만 보여 줍니다. 폼 마크업은 유지하고 아래 규칙에 필요한 것만 더하세요.

**규칙과 메시지**(문구를 그대로 씁니다)

| 필드 | 올바른 조건 | 메시지 |
|---|---|---|
| `#email` | 앞뒤 공백을 뺀 값이 `^[^\s@]+@[^\s@]+\.[^\s@]+$`에 맞음 | `Enter a valid email address.` |
| `#password` | 8자 이상이고 숫자가 하나 이상 | `Use at least 8 characters, including a number.` |
| `#confirm` | 비어 있지 않고 비밀번호와 같음 | `Passwords do not match.` |
| `#terms` | 체크됨 | `Accept the terms to continue.` |

**동작**
- 필드마다 `id="<필드 id>-error"`인 메시지 요소(`email-error`, `password-error`, `confirm-error`, `terms-error`)가 있고, 필드의 `aria-describedby`에 그 id가 들어 있습니다. 필드가 올바르면 메시지 요소는 비어 있습니다.
- 텍스트 필드는 포커스를 잃을 때 검증합니다. 한 번 오류를 보인 필드는 입력할 때마다 다시 검증해, 값을 고치는 즉시 메시지가 사라집니다. 체크박스는 바뀔 때 검증합니다.
- 검증한 필드는 `aria-invalid="true"` 또는 `aria-invalid="false"`를 가집니다. 처음 검증하기 전에는 `aria-invalid`가 없거나 `"false"`입니다.
- 제출하면 모든 필드를 검증합니다. 하나라도 틀리면 (표의 순서로) 첫 번째 틀린 필드로 포커스를 옮기고 다른 일은 하지 않습니다.
- 올바르게 제출하면 폼을 `hidden` 속성으로 숨기고, `data-ref="done"`인 요소에 `Welcome, <이메일>!`(앞뒤 공백을 뺀 이메일, 텍스트로 표시)을 보여 줍니다.
- 비밀번호는 (입력칸 안을 빼고) 페이지와 콘솔 어디에도 나타나지 않습니다.
