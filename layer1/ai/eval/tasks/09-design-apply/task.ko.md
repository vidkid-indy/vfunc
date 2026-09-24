### JS를 건드리지 않고 DESIGN.md 적용

`DESIGN`: 아래 `design/DESIGN.md`("Pine" 디자인). `SCOPE`: 앱 전체(화면 하나). 앱은 지금 중립 토큰으로 동작합니다. 프롬프트대로 디자인을 적용하세요.

- `app.js`와 `design/DESIGN.md`는 한 바이트도 바뀌지 않아야 합니다.
- `styles/tokens.css`는 `tokens` 블록에서 파생합니다: 라이트 값, OS 다크 테마(`prefers-color-scheme: dark`)의 다크 값, 그리고 `<html data-theme="dark">`용 같은 다크 값. 블록에 없는 토큰은 지금 값을 유지합니다.
- 디자인 3~5절을 `styles/app.css`에 적용합니다. 이 파일은 `var(--vf-*)` 토큰만 읽어야 합니다. `tokens.css` 밖에 hex, `rgb()`, 2px보다 큰 픽셀 값을 두지 않습니다.
- `design/STATUS.md`를 갱신합니다.

채점기는 라이트 테마, OS 다크 테마, `data-theme="dark"`에서 계산된 스타일(색, 글꼴, 모서리, 그림자, 여백)을 디자인과 비교하고, 앱이 여전히 동작하는지 확인합니다.
