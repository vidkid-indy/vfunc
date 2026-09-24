### 할 일 목록

`REQUEST`: 페이지의 `<section id="todo">` 안에 할 일 목록을 추가해 주세요. 목록은 비어 있는 상태로 시작하고 메모리에만 둡니다.

**추가**
- `data-action="add"`인 폼 안에 `data-ref="input"`인 텍스트 입력칸(보이는 레이블 `New task`)과 제출 버튼 `Add`가 있습니다.
- Enter나 버튼으로 앞뒤 공백을 뺀 텍스트를 추가합니다. 비었거나 공백뿐이면 추가하지 않습니다.
- 추가한 뒤 입력칸은 비고 포커스를 가져, 바로 다음 할 일을 입력할 수 있습니다.
- 텍스트는 텍스트로 보입니다. `<img src=x onerror=alert(1)>`을 입력하면 그 글자가 그대로 보입니다.

**목록**
- 목록 요소는 `data-ref="list"`입니다. 할 일 하나가 그 안의 요소 하나이고, 고유한 `data-id`와 `data-state="open"` 또는 `data-state="done"`을 가집니다.
- 할 일마다: `data-action="toggle"`이고 `id="todo-<data-id>"`인 체크박스, `data-ref="text"`인 요소 안의 텍스트, 문구가 `Remove`인 `data-action="remove"` 버튼
- 키보드로 토글해도(포커스된 체크박스에서 Space) 포커스가 그 체크박스에 남습니다.

**필터와 개수**
- `data-action="filter"`이고 `data-filter="all"`, `"open"`, `"done"`인 버튼 세 개(문구 `All`, `Open`, `Done`). 현재 필터는 `aria-pressed="true"`, 나머지는 `aria-pressed="false"`입니다. 기본값은 `all`입니다.
- `data-ref="left"`인 요소가 남은(open) 할 일 수를 숫자만으로 보여 줍니다(`2`).
- 현재 필터에 보이는 할 일이 없으면 `data-ref="empty"`인 요소가 `Nothing here.`를 보여 줍니다. 그렇지 않으면 이 요소는 없거나 숨겨져 있습니다.
