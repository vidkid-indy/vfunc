# 로드맵

| 단계 | 내용 | 상태 |
|---|---|---|
| 1단계 | 엔진 `vf.vfunc`와 헬퍼, 라우터, store, 다국어, IE legacy 파일, 토큰, update 플러그인, 예제, 스타터, AI 프롬프트 킷, 이 사이트 | 1.0 릴리스 후보 |
| 2단계 | 클래스 없는 컴포넌트 `vf.vs*`(문자열)·`vf.vf*`(인스턴스), 기본 그리드와 차트, 서드파티 어댑터(AG Grid, Tabulator, Chart.js, ECharts), 컴포넌트 갤러리, 테마 빌더 | 계획 |
| 3단계 | 클래스 기반 `vf.VClass` 계열, 템플릿, 도구 | 계획 |

## 이름 규칙

한 개의 전역 `vf` 아래에서 이름의 모양으로 종류를 구분합니다.

| 모양 | 뜻 | 예 |
|---|---|---|
| 소문자 | 1단계 기능 | `vf.vfunc`, `vf.attach`, `vf.router` |
| `vs*` | 항상 문자열을 돌려주는 컴포넌트(2단계) | `vf.vsButton` |
| `vf*` | 항상 인스턴스를 돌려주는 컴포넌트(2단계) | `vf.vfButton` |
| `vf` + 종류 + 벤더 | 서드파티 어댑터(2단계) | `vf.vfGridAg`, `vf.vfChartEcharts` |
| PascalCase | 클래스(3단계) | `vf.VClass` |
| `vf.ext.*` | 사용자 확장 | `vf.ext.company` |

## 참여

- 질문과 아이디어는 GitHub Discussions(저장소 공개 후)에, 버그와 기능 요청은 Issues에 남겨 주세요.
- 기여 방법은 저장소의 `CONTRIBUTING.md`, 확장 규칙은 `EXTENDING.md`에 있습니다.
