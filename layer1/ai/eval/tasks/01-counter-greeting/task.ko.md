### 카운터와 인사

작은 페이지를 처음부터 만드세요: `index.html`, `app.js`, 필요하면 `style.css`. 위젯이 두 개 있습니다.

**인사**
- `id="name"`인 텍스트 입력칸과, 눈에 보이는 레이블 "Your name"
- `data-ref="greeting"`인 요소가 앞뒤 공백을 뺀 입력값으로 `Hello, <이름>!`을 보여 줍니다. 입력칸이 비면 `Hello, stranger!`를 보여 줍니다.
- 인사말은 키를 누를 때마다 바뀝니다. 입력 중에 포커스, 커서 위치, 글자를 잃지 않아야 합니다.
- 이름은 텍스트로 보입니다. `<b>Kim</b>`을 입력하면 태그가 글자 그대로 보입니다.

**카운터**
- `data-ref="count"`인 요소가 0에서 시작하는 값을 보여 줍니다.
- 버튼 세 개: `data-action="inc"`(문구 `+1`), `data-action="dec"`(문구 `−1`), `data-action="reset"`(문구 `Reset`)
- 값은 0 아래로 내려가지 않습니다. 값이 0인 동안 `dec` 버튼에 `disabled` 속성이 있습니다.
- 값이 0이면 값 요소에 `data-state="zero"`, 아니면 `data-state="positive"`가 있습니다.
