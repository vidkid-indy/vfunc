### 버그 일곱 개 고치기

아래 "Team board" 페이지는 일부만 동작합니다. 사용자와 테스터가 표의 문제를 보고했습니다. 각각의 원인을 찾아 가능한 한 적은 변경으로 고치고, 모든 훅(`id`, `data-action`, `data-ref`, `data-id`)과 문구는 그대로 두세요. 고치는 데 새 속성이 필요하면 추가합니다.

`SYMPTOM`과 `CONSOLE`

| # | 보고 |
|---|---|
| 1 | "알림 상자('Open tasks: …')가 상자 안에 한 번 더 그려지고, 할 일을 체크하면 `id="notice"`인 요소가 두 개가 됩니다." 콘솔: `[vfunc] attach: render returned the target element itself (id "notice"). Render only its inside, or pass replaceRoot: true.` |
| 2 | 접근성 검토: "패널이 닫혀 있을 때 Details 버튼이 `aria-expanded=""`입니다. `false`여야 합니다." |
| 3 | "언어를 한국어로 바꾸면 테마가 light로 돌아갑니다." |
| 4 | "'Close clock'을 누른 뒤에도 아래의 'Clock updates' 숫자가 계속 올라갑니다." |
| 5 | "지난 디자인 수정 뒤로 할 일의 Remove 버튼이 아무 동작도 하지 않습니다."(디자이너가 클래스 `task__remove`를 `task__delete`로 바꿨습니다.) |
| 6 | 보안: "댓글 `<b>hi</b>`가 굵게 보입니다. 댓글로 스크립트를 실행할 수 있습니다." |
| 7 | "키보드 사용자가 Space로 할 일을 체크하면 포커스가 다른 할 일의 체크박스로 넘어갑니다." |

고친 뒤 기대하는 동작:
- `#notice`는 요소 하나이고, 문구는 `Open tasks: <n>`이며 할 일에 따라 바뀝니다.
- Details 버튼은 닫혀 있으면 `aria-expanded="false"`, 열려 있으면 `"true"`이고, 닫혀 있을 때 `#details`는 숨겨져 있습니다.
- 테마(`data-ref="theme"`)와 언어(`data-ref="lang"`)는 서로 영향 없이 바뀝니다.
- 시계를 닫으면 시계의 타이머가 멈춥니다.
- Remove(`data-action="remove"`)가 할 일을 지웁니다.
- 댓글은 텍스트로 보입니다.
- 열린 할 일이 먼저 나오는 순서는 그대로입니다. 할 일의 체크박스(`data-action="toggle"`)에서 Space를 누른 뒤에도, 그 할 일이 어디로 옮겨 가든 포커스가 그 할 일의 체크박스에 남습니다.
