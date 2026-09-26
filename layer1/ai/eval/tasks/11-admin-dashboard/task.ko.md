### layer2로 만드는 관리자 대시보드

`REQUEST`: layer2 컴포넌트(`components.md`)로 사용자 화면을 만드세요. 페이지는 이미 `lib/vfunc-ui.js`, `lib/vfunc-ui-data.js`, `lib/vfunc-ui.css`, `data.js`(`USERS`, `MONTHS`, `MONTH_LABELS`, `data.js`는 고치지 않음)를 불러옵니다. 페이지 코드는 `app.js`에 씁니다.

**검색** — `#search`에 `vf.vfSearchInput`. 입력칸은 `id="q"`, 라벨은 `Search users`입니다. 검색하면 이름에 그 글자가 들어 있는(대소문자 무시) 사용자만 남기고 1쪽을 보여 줍니다. 검색을 지우면 모든 사용자가 다시 보입니다.

**그리드** — `#users`에 `vf.vfGrid`. `id="users-grid"`, 캡션 `Users`, 한 쪽에 10행, 여러 행 선택, 행 키 `id`. 열은 이 순서입니다.

| 키 | 라벨 | |
|---|---|---|
| `name` | `Name` | 정렬 가능 |
| `email` | `Email` | |
| `role` | `Role` | 역할 글자를 담은 `vf.vsBadge`로 표시 |
| `joined` | `Joined` | 정렬 가능 |

**선택 수** — `[data-ref="selected"]`는 `<n> selected`를 보여 주고(처음은 `0 selected`) 그리드의 선택을 따라갑니다.

**차트** — `#signups`에 `vf.vfChart`. `id="signups-chart"`, 종류 `bar`, 라벨 `Sign-ups per month`, 데이터 표 켜기(`dataTable: true`). 라벨은 `MONTH_LABELS`이고, 시리즈는 `Sign-ups` 하나로 `MONTHS`의 달마다 `joined` 날짜가 그 달인 사용자 수입니다.

채점기는 컴포넌트가 만드는 마크업을 씁니다: 그리드의 정렬 버튼(`data-action="sort"`, `data-value` = 열 키), 행 체크박스(`data-action="select-row"`), `#users-grid tbody`의 행, 차트의 막대(`data-action="mark"`)와 데이터 표.
