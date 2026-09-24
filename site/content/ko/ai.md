# AI와 작업하기

vfunc.js는 AI가 틀리게 쓸 여지가 적도록 설계했습니다. 컴포넌트는 평범한 객체이고, 규칙은 적고, 이름의 모양으로 역할을 알 수 있습니다. 여기 있는 파일을 AI에 주면 더 정확한 코드를 받을 수 있습니다.

## 먼저 줄 것

| 파일 | 용도 |
|---|---|
| [llms.txt](../llms.txt) | 코드를 쓰는 데 필요한 요약(영어). [llms.ko.txt](../llms.ko.txt)는 한국어 |
| [llms-full.txt](../llms-full.txt) | 요약 + 전체 매뉴얼 + 타입 선언 |
| `AGENTS.md` | 프로젝트 루트에 두는 AI 규칙. 스타터에 들어 있고, 아래 목록의 `AGENTS.template.md`를 복사해도 됩니다 |

Claude Code는 `CLAUDE.md`, GitHub Copilot은 `.github/copilot-instructions.md`로 같은 내용을 두면 됩니다.

## 프롬프트

용도에 맞는 프롬프트를 열어 복사한 뒤 자료와 함께 붙여 넣으세요. 모든 프롬프트는 붙여 넣은 자료를 **지시가 아닌 데이터**로 다루게 하고, 확인하지 못한 API나 주소는 `VERIFY:`로 표시하게 합니다.

{{prompts}}

## 실제 적용 예

예제 14는 퍼블리싱 대시보드를 `prompt-html-to-vfunc`로 변환한 결과입니다. 영역 판별표, HTML 변경 diff, 제거한 위험 요소, 토큰 제안을 담은 변환 기록(`CONVERSION.md`)이 함께 있습니다. 이 변환을 하면서 드러난 프롬프트의 빈틈 두 가지(인라인 style, 상태 클래스)를 프롬프트에 반영했습니다.
