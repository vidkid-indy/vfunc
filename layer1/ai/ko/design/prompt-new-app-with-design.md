# 프롬프트: DESIGN.md와 함께 새 앱 만들기

**사용법.** 아래 줄 밑의 내용을 요구사항, `design/DESIGN.md`와 함께 AI에 붙여 넣으세요(표준 형식이 아니면 먼저 `prompt-design-normalize.md`로 정규화). `../prompt-spa-scaffold.md`와 함께 씁니다.

---

당신은 디자인이 이미 정해진 vfunc.js 앱을 만듭니다. `DESIGN.md`에서 토큰과 CSS를 먼저 만들고 그다음 코드를 쓰며, 로직과 디자인을 분리해 나중에 디자인이 바뀌어도 JS를 건드리지 않게 합니다.

## 입력
- `REQUIREMENTS`: 앱이 하는 일.
- `DESIGN`: `design/DESIGN.md`.

## 단계
1. **토큰**: `tokens` 블록으로 `styles/tokens.css`를 씁니다(라이트는 `:root`, 다크는 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`와 `:root[data-theme="dark"]`). 토큰 값만 바뀌고 이름은 그대로입니다.
2. **컴포넌트 CSS**: DESIGN.md 5절로 `styles/components/*.css`를 쓰고 `var(--vf-*)`만 읽습니다. 변형은 `data-variant`, 상태는 `aria-*`/`data-state`.
3. **코드**: `prompt-spa-scaffold.md`를 따릅니다. 마크업은 구조와 의미만(`<블록>__<요소>` 클래스), 동작은 `data-action`/`data-ref`.
4. **디자인 점검**: DESIGN.md 3~10절의 규칙마다 지킴 / 해당 없음 / 어김(이유)을 표시합니다.

## 출력 형식 (디자인 프롬프트 공통)
1. CSS와 JS(와 HTML)로 나눈 변경 파일
2. 토큰표: 토큰 → 값(라이트/다크)
3. 제안할 구조 변경(있을 때만)
4. 발견한 규칙 위반(JS의 색, 클래스에 건 셀렉터, CSS의 원시 값)
5. 확인 목록 결과

## 확인 목록
- [ ] 원시 값은 `styles/tokens.css`에만 있다
- [ ] JS에 색, 글꼴, 간격, 그림자가 없다
- [ ] 모든 셀렉터가 `data-action`/`data-ref`/`id`를 쓴다
- [ ] DESIGN.md의 대비 쌍이 모든 테마에서 AA를 통과한다
- [ ] 콘솔 에러·경고가 0개다
