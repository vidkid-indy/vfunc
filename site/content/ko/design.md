# 디자인: 토큰과 DESIGN.md

디자인이 언제 오든 로직은 건드리지 않는 것이 목표입니다. 예제 19는 같은 앱에 스킨 세 개를 입히면서 JavaScript를 한 줄도 바꾸지 않습니다.

## 분리 규칙

1. 동작은 `data-action`·`data-ref`·`id`에, 모양은 클래스(`<블록>__<요소>`)에 겁니다.
2. 상태는 `aria-*`나 `data-state`로 쓰고 CSS가 그 속성을 보고 꾸밉니다.
3. JavaScript에는 색·글꼴·간격·그림자를 넣지 않습니다.
4. CSS는 `var(--vf-*)` 토큰만 읽습니다. 원시 값은 토큰 파일에만 둡니다.
5. `DESIGN.md`가 원본이고 토큰 파일은 거기서 파생됩니다.
6. 디자인 작업에서는 로직을 바꾸지 않습니다.

## 토큰 — `css/vfunc.tokens.css`

선택형 중립 스킨이며 라이트·다크 테마를 담습니다. 토큰 이름은 공개 API입니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/css/vfunc.tokens.css">
<link rel="stylesheet" href="./brand.css">   <!-- 여기서 토큰을 덮어씁니다 -->
```

| 분류 | 예 |
|---|---|
| 색 | `--vf-color-primary`, `--vf-color-surface`, `--vf-color-text-muted`, `--vf-color-danger-soft` |
| 차트 | `--vf-chart-1` … `--vf-chart-8` |
| 모양 | `--vf-space-1..7`, `--vf-radius-md`, `--vf-shadow-2` |
| 글꼴 | `--vf-font-body`, `--vf-font-size-md`, `--vf-font-weight-strong` |

- 다크 테마는 OS 설정을 따르고, `<html data-theme="dark">`로 강제합니다. 저장된 테마는 `<head>`의 외부 스크립트에서 첫 화면 전에 적용합니다.
- 기본 스킨의 주요 글자·배경 쌍은 라이트·다크 모두 WCAG AA를 넘습니다.
- 차트처럼 라이브러리에 색을 넘겨야 할 때는 `getComputedStyle(document.documentElement).getPropertyValue('--vf-chart-1')`로 토큰을 읽습니다.

## DESIGN.md 흐름

| 상황 | 할 일 |
|---|---|
| 디자인 자료가 제각각 | `prompt-design-normalize`로 표준 `DESIGN.md`로 정리 |
| 새 앱 + 디자인 | `prompt-new-app-with-design`: 토큰과 CSS를 먼저, 코드는 그다음 |
| 나중에 디자인 적용 | `prompt-apply-design`: 토큰·CSS만 바꾸고 JS 변경 0 확인, 화면 단위 `--scope` |
| 개발된 화면에 퍼블리싱 HTML 도착 | `prompt-merge-published-html`: render 마크업만 바꾸고 훅 매핑표 작성 |

프롬프트와 `DESIGN.md` 템플릿은 [AI와 작업하기](ai.md)에 있습니다. Tailwind를 쓴다면 `@theme`을 토큰에 연결하세요(예제 13).

## 디자인 검사 — `design-check`

스타터의 `tools/design-check.mjs`는 위 규칙을 빌드·의존성 없이 검사합니다(선택 사항). 문제가 있으면 종료 코드 1로 끝나므로 커밋 전이나 CI에 넣을 수 있습니다.

```bash
node tools/design-check.mjs          # 이 프로젝트
node tools/design-check.mjs ../other --tokens css/vfunc.tokens.css
```

- 토큰 선언(`--x: …`) 밖의 원시 색(CSS·JS)
- 클래스로 요소를 찾는 JS 셀렉터(`selector: '.x'`, `querySelector('.x')`, `closest`, `vf.$`)
- 사유 주석 없는 `vf.unsafeHtml`
- 토큰 대비(WCAG AA): 글자 4.5:1, 포커스 색 3:1, 라이트·다크 모두. 앱 CSS의 `:root` 덮어쓰기도 반영합니다.
- 의도한 곳은 이유와 함께 줄에 `design-check-ignore`, 파일 전체는 `design-check-ignore-file`을 적습니다.
