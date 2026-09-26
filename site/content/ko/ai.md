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

## 평가 세트

위의 주장을 숫자로 확인하려고, AI 모델에 과제 14개를 주고 답을 자동으로 채점합니다. 엔진 과제 10개는 카운터와 인사, 할 일 목록, 퍼블리싱 대시보드 변환, 가입 폼, 신뢰할 수 없는 데이터가 든 서버 목록, SPA 뼈대, React 컴포넌트 이식, Chart.js, JS를 건드리지 않는 `DESIGN.md` 적용, 버그 일곱 개 고치기입니다. 컴포넌트(layer2) 과제 4개는 관리자 대시보드(`vfGrid`, `vfChart`), 프로필 폼(`vs*` 필드), 확인을 거치는 삭제(`vfConfirm`, `vfToast`), Leaflet 앱 래퍼이고, 킷에 [컴포넌트 목록](components.md)이 더해집니다.

- 모델은 과제마다 파일 하나를 받습니다. 킷(`AGENTS.md`, `llms.txt`, 과제의 프롬프트), 과제, 입력 파일이 들어 있습니다. 모델은 추가 질문 없이 한 번에 답하고, 답은 받은 그대로 저장합니다.
- 채점기는 결과를 Chromium, Firefox, WebKit에서 열어 과제의 검사를 돌리고, 콘솔이 깨끗해야 합니다. 킷이 경고하는 실수도 찾습니다: 인라인 핸들러, `javascript:` URL, 클래스 셀렉터, `vf.html` 밖의 HTML 문자열, CSP 누락, 빈 `aria-*` 값.
- 과제는 세 엔진에서 모든 검사를 통과하고 규칙 위반이 없어야 통과입니다.

과제, 채점기, 저장한 답은 모두 [layer1/ai/eval](https://github.com/vidkid-indy/vfunc/tree/main/layer1/ai/eval)에 있습니다. 누구나 다른 모델로 과제를 돌려 볼 수 있습니다.

{{eval}}
