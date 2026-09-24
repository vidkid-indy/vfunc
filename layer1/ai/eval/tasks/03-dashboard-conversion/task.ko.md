### 퍼블리싱 대시보드 변환

`SOURCE`: 아래 퍼블리셔의 `index.html`과 `dashboard.css`입니다. 프롬프트대로 이 페이지를 변환하세요. 서버는 없습니다. 게시된 주문 세 건과 KPI 값은 그대로 둡니다.

`BEHAVIOUR`(괄호 안은 추가할 훅, 채점기가 사용):
1. **사용자 메뉴.** 이름 버튼(`data-action="menu"`, `aria-expanded` 포함)이 메뉴 `<ul id="userMenu">`를 열고 닫습니다. 메뉴는 `hidden` 속성을 쓰고 닫힌 상태로 시작합니다. Escape와 메뉴 바깥 클릭으로도 닫힙니다.
2. **로그아웃.** "Sign out" 링크(`data-action="sign-out"`)는 메뉴를 닫고 이름 버튼의 문구를 `Signed out`으로 바꿉니다. 실제 요청, alert, `javascript:` URL은 없습니다.
3. **요약 탭.** 탭 버튼 두 개(`data-action="tab"`, `data-tab="week"` / `data-tab="month"`, `aria-selected` 포함)가 원래 스크립트의 문구를 `#summary`에 보여 줍니다. 활성 탭은 모양을 위해 `tabs__tab--active` 클래스도 유지합니다.
4. **검색.** 상단 바의 검색창(`data-action="search"`)은 입력하는 동안 주문 번호(`1041` 또는 `#1041`)나 고객 이름으로 표의 행을 거릅니다. 대소문자는 구분하지 않고, 포커스는 검색창에 남습니다.
5. **상태 필터.** 선택 상자(`data-action="filter"`)가 상태로 행을 거릅니다. 검색과 상태 필터는 함께 적용됩니다.
6. **결과 없음.** 맞는 행이 없으면 표 본문에 문구가 `No orders match.`인 행 하나를 보여 줍니다.
7. `dashboard.css`는 한 바이트도 바뀌지 않아야 하고, 페이지의 보이는 문구와 클래스는 모두 유지합니다.
