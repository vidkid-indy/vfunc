# DESIGN.md — `<제품 이름>`

> 이 프로젝트 디자인의 단일 원본입니다(기획 K-3). `styles/tokens.css`는 아래 `tokens` 블록에서 파생됩니다. 이 파일을 먼저 고친 뒤 토큰을 다시 만드세요(프롬프트 `prompt-apply-design.md`).
> vfunc.js 1.0용 템플릿입니다. 아래 값은 `vfunc.tokens.css`의 중립 기본값입니다. 추정한 값은 `TBD:`로 표시하세요.

## 1. 브랜드와 톤
- 성격: `<차분함, 정확함, 친근함 …>`
- 사용자와 맥락: `<데스크톱의 사무직, 태블릿의 현장 직원 …>`
- 화면 문구에서 피할 말: `<…>`

## 2. 토큰
기계가 읽는 블록입니다. 키는 `--vf-*` 변수와 1:1로 대응합니다. `light`는 필수, `dark`는 선택입니다(다크 테마가 없으면 `"same as light"`로 쓰거나 생략).

```tokens
{
  "light": {
    "--vf-color-primary": "#2563eb",
    "--vf-color-primary-hover": "#1d4ed8",
    "--vf-color-primary-active": "#1e40af",
    "--vf-color-primary-soft": "#eff6ff",
    "--vf-color-on-primary": "#ffffff",
    "--vf-color-success": "#059669", "--vf-color-success-soft": "#ecfdf5", "--vf-color-success-text": "#047857",
    "--vf-color-warning": "#d97706", "--vf-color-warning-soft": "#fffbeb", "--vf-color-warning-text": "#b45309",
    "--vf-color-danger": "#dc2626", "--vf-color-danger-soft": "#fef2f2", "--vf-color-danger-text": "#b91c1c",
    "--vf-color-info": "#2563eb", "--vf-color-info-soft": "#eff6ff", "--vf-color-info-text": "#1d4ed8",
    "--vf-color-bg": "#f8fafc",
    "--vf-color-surface": "#ffffff",
    "--vf-color-surface-muted": "#f1f5f9",
    "--vf-color-overlay": "rgba(15, 23, 42, 0.5)",
    "--vf-color-text": "#0f172a",
    "--vf-color-text-muted": "#475569",
    "--vf-color-text-disabled": "#94a3b8",
    "--vf-color-text-inverse": "#ffffff",
    "--vf-color-border": "#e2e8f0",
    "--vf-color-border-strong": "#cbd5e1",
    "--vf-color-focus": "#3b82f6",
    "--vf-focus-ring": "0 0 0 3px rgba(59, 130, 246, 0.35)",
    "--vf-chart-1": "#2563eb", "--vf-chart-2": "#d97706", "--vf-chart-3": "#059669", "--vf-chart-4": "#dc2626",
    "--vf-chart-5": "#7c3aed", "--vf-chart-6": "#0891b2", "--vf-chart-7": "#db2777", "--vf-chart-8": "#65a30d",
    "--vf-shadow-1": "0 1px 2px rgba(15, 23, 42, 0.06)",
    "--vf-shadow-2": "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
    "--vf-shadow-3": "0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
    "--vf-radius-sm": "4px", "--vf-radius-md": "6px", "--vf-radius-lg": "10px", "--vf-radius-full": "9999px",
    "--vf-space-1": "4px", "--vf-space-2": "8px", "--vf-space-3": "12px", "--vf-space-4": "16px",
    "--vf-space-5": "24px", "--vf-space-6": "32px", "--vf-space-7": "48px",
    "--vf-font-body": "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans KR\", \"Malgun Gothic\", sans-serif",
    "--vf-font-mono": "ui-monospace, \"Cascadia Code\", Consolas, \"D2Coding\", monospace",
    "--vf-font-size-xs": "12px", "--vf-font-size-sm": "13px", "--vf-font-size-md": "14px",
    "--vf-font-size-lg": "16px", "--vf-font-size-xl": "20px", "--vf-font-size-2xl": "24px",
    "--vf-font-weight-normal": "400", "--vf-font-weight-strong": "600", "--vf-line-height": "1.5",
    "--vf-duration-fast": "0.15s", "--vf-duration-base": "0.2s", "--vf-easing": "ease",
    "--vf-z-dropdown": "1000", "--vf-z-popover": "1100", "--vf-z-drawer": "1200", "--vf-z-modal": "1300", "--vf-z-toast": "1400"
  },
  "dark": {
    "--vf-color-primary": "#60a5fa", "--vf-color-primary-hover": "#93c5fd", "--vf-color-primary-active": "#bfdbfe",
    "--vf-color-primary-soft": "#172554", "--vf-color-on-primary": "#0f172a",
    "--vf-color-bg": "#0f172a", "--vf-color-surface": "#1e293b", "--vf-color-surface-muted": "#273449",
    "--vf-color-text": "#f1f5f9", "--vf-color-text-muted": "#94a3b8", "--vf-color-text-disabled": "#64748b",
    "--vf-color-text-inverse": "#0f172a", "--vf-color-border": "#334155", "--vf-color-border-strong": "#475569",
    "--vf-color-focus": "#60a5fa"
  }
}
```

## 3. 타이포그래피
| 역할 | 크기 토큰 | 굵기 | 쓰임 |
|---|---|---|---|
| 페이지 제목 | `--vf-font-size-2xl` | strong | 화면마다 하나 |
| 섹션 제목 | `--vf-font-size-lg` | strong | 카드, 패널 |
| 본문 | `--vf-font-size-md` | normal | 기본 텍스트 |
| 작은 글자 | `--vf-font-size-sm` | normal | 도움말, 표의 부가 정보 |

## 4. 간격, 모서리, 그림자, 브레이크포인트
- 간격 척도: `--vf-space-1..7`. 카드 안쪽 여백 `--vf-space-4`, 섹션 사이 `--vf-space-5`.
- 모서리: 입력과 버튼 `--vf-radius-md`, 카드 `--vf-radius-lg`, 알약 모양 `--vf-radius-full`.
- 그림자: 놓인 카드 `--vf-shadow-1`, 떠 있는 패널 `--vf-shadow-2`, 대화상자·토스트 `--vf-shadow-3`.
- 브레이크포인트: `<600px 휴대폰 · 900px 태블릿>`(CSS 미디어 쿼리에서만, JS는 읽지 않음).

## 5. 컴포넌트 규칙
| 컴포넌트 | 변형(속성) | 상태(속성) | 비고 |
|---|---|---|---|
| 버튼 | `data-variant="primary \| danger"` | `:disabled`, `aria-pressed` | 영역마다 primary 하나 |
| 입력 | — | `aria-invalid="true"` | 오류 문구는 입력칸 아래 |
| 카드 | — | — | surface + border + `--vf-shadow-1` |
| 표 | — | `aria-sort`, `aria-selected` | 행 높이 `TBD:` |
| 내비게이션 | — | `aria-current="page"` | |
| 대화상자 | — | `aria-modal` | `--vf-z-modal` |
| 안내·토스트 | `data-state="info \| success \| warning \| error"` | — | soft 배경 + text 토큰 |

## 6. 레이아웃 패턴
`<앱 골격: 상단 바 + 옆 내비게이션 + 본문, 본문 폭 …>`

## 7. 아이콘과 이미지
`<아이콘 세트, 크기(px), 선 굵기, 이미지 비율, 대체 텍스트 규칙>`

## 8. 모션
hover·focus는 `--vf-duration-fast`, 패널은 `--vf-duration-base`. `prefers-reduced-motion`을 존중합니다.

## 9. 접근성
- 모든 테마에서 글자 대비 4.5:1 이상, 큰 글자와 UI 요소 3:1 이상(WCAG AA). `primary` 위 `on-primary`, `*-soft` 위 `*-text`, `surface` 위 `text-muted`를 확인합니다.
- 포커스가 보여야 합니다(`--vf-focus-ring`). 대체 없이 outline을 없애지 않습니다.
- 상태를 색만으로 표시하지 않습니다(아이콘, 텍스트, 모양을 함께).

## 10. 해야 할 것 / 하지 말 것
| 해야 할 것 | 하지 말 것 |
|---|---|
| 모든 CSS 규칙에서 토큰 사용 | `tokens.css` 밖의 hex·px 값 |
| 상태는 `aria-*` / `data-state`로 | JS에서 상태용 클래스 토글 |
| 영역마다 primary 버튼 하나 | 서로 경쟁하는 여러 primary 동작 |
