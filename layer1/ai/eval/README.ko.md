# vfunc.js LLM 평가 세트

AI 모델이 AI 킷만 보고 vfunc.js 코드를 얼마나 잘 쓰는지 보여 주는 과제 14개(엔진 10개, layer2 컴포넌트 4개)입니다. 세 브라우저 엔진에서 자동으로 채점합니다. 영어: [README.md](README.md). 결과는 사이트(AI와 작업하기 → 평가 세트)에 공개합니다.

| # | 과제 | 킷 프롬프트 | 주로 확인하는 것 |
|---|---|---|---|
| 01 | 카운터와 인사 | — | 이스케이프, 입력 중 포커스와 커서, `disabled` |
| 02 | 할 일 목록 | add-feature | 위임, 키보드 포커스, `aria-pressed` 값 |
| 03 | 퍼블리싱 대시보드 변환 | html-to-vfunc | 채택과 `attach` + `render`, CSS·마크업 유지, CSP |
| 04 | 가입 폼 검증 | add-feature | `aria-invalid` / `aria-describedby`, 포커스, 비밀번호 노출 없음 |
| 05 | 서버 목록 | add-feature | 로딩·오류·빈 상태, 신뢰할 수 없는 데이터, `vf.safeUrl` |
| 06 | SPA 뼈대 | spa-scaffold | 라우터, `aria-current`, 포커스, `store.set` 병합, en/ko |
| 07 | React 컴포넌트 이식 | migrate-from-react-vue | 같은 동작, React 흔적 없음, 토큰 |
| 08 | 컴포넌트 안의 Chart.js | add-feature | `onMount` / `onUpdate` / `onDestroy`, `data-vf-keep`, 토큰 색 |
| 09 | DESIGN.md 적용 | design/apply-design | JS 변경 없음, 라이트·다크의 계산된 스타일 |
| 10 | 버그 일곱 개 고치기 | debug | 앞선 독립 실행에서 드러난 함정 |
| 11 | 관리자 대시보드(layer2) | add-feature | `vfSearchInput`, `vfGrid`(정렬·검색·선택), 데이터 표가 있는 `vfChart` |
| 12 | 프로필 폼(layer2) | add-feature | `vs*` 필드 props(`label`, `hint`, `error`), 오류를 다시 그려도 남는 값 |
| 13 | 확인을 거치는 삭제(layer2) | add-feature | `vfConfirm`(`danger`, Escape), `vfToast` 하나, 삭제 뒤 포커스 |
| 14 | 앱 래퍼로 쓰는 Leaflet(layer2 킷) | integrate-third-party | `app`의 L1 래퍼, `data-vf-keep`, `map.remove()`, 이스케이프한 툴팁(CDN) |

layer2 과제는 `task.json`에 `"layer": 2`가 있습니다. 묶음은 킷에 `components.md`를 더하고 `lib/`의 layer2 파일을 안내하며, 채점기는 그 파일을 `layer2/dist`에서 복사합니다. 킷 프롬프트는 `layer2/ai`에서 올 수도 있습니다.

## 동작 방식

- **과제마다 파일 하나(묶음).** `node layer1/ai/eval/tools/bundle.mjs`가 `build/out/eval/bundles/{en,ko}/<과제>.md`를 만듭니다. 평가 머리말(조건과 출력 규칙), 킷(`AGENTS.template.md`, `llms.txt` 또는 `llms.ko.txt`, 과제의 프롬프트), 과제문, 입력 파일이 들어 있습니다. 기준 답안과 검사는 묶음에 넣지 않습니다. 묶음은 생성물이라 커밋하지 않습니다.
- **과제마다 답 하나.** 모델은 파일마다 `### 경로` + 코드 블록 하나로 내고 `### REPORT.md`로 끝냅니다. 머리말이 승인을 기다리지 말라고 하므로 한 번에 답합니다.
- **자동 채점.** `node layer1/ai/eval/tools/grade.mjs <실행 폴더>`가 답을 `build/out/eval/<실행>/<과제>/`에 꺼내고(과제 파일 → 그 위에 답 → `layer1/dist`의 `lib/`), 정적 검사를 한 뒤, 폴더를 서빙해 Chromium, Firefox, WebKit에서 과제의 검사를 돌립니다. 검사마다 새 페이지를 열고, 콘솔에 오류·경고가 없어야 하며, DOM의 `aria-*` 값이 올바르고 id가 겹치지 않고 `undefined`가 보이지 않아야 합니다.
- **과제 통과**는 세 엔진 모두에서 모든 검사를 통과하고 정적 오류가 없을 때입니다.

## 모델을 손으로 실행하기

1. `npm install`, 그리고 처음 한 번 `npx playwright install chromium firefox webkit`
2. `node layer1/ai/eval/tools/bundle.mjs`(또는 `--lang en` / `--lang ko`, 과제 번호)
3. 과제마다 **새 대화**를 열고 묶음 전체를 붙여 넣어 보냅니다. 다른 말은 덧붙이지 않습니다.
4. 모델이 답하지 않고 질문하면 정확히 `Proceed with your best assumptions and list them.`(한국어 묶음은 `가장 타당한 가정으로 진행하고 가정을 적어 주세요.`)로 답하고 추가 질문 1회로 셉니다. 그 밖의 말은 보내지 않습니다.
5. 모델의 답 전체를 고치지 말고 `results/<yyyymmdd>-<모델>-<언어>/answers/<NN>.md`로 저장합니다(예: `answers/03.md`). 답이 잘리면 `Continue.`를 한 번 보내 나머지를 이어 붙이고 메모에 적습니다.
6. 같은 폴더에 `run.json`(아래)을 쓰고 채점합니다: `node layer1/ai/eval/tools/grade.mjs layer1/ai/eval/results/<실행>`. 빨리 보려면 `--engines chromium`을 붙입니다. 공개하는 결과는 세 엔진을 모두 씁니다. 과제 08은 네트워크가 필요합니다(CDN의 Chart.js).
7. `results.md`와 답의 `REPORT.md`를 읽고, 수동 점수(각 `task.json`의 `rubric`, 항목마다 0~2점)와 메모를 `run.json`에 적은 뒤 `grade.mjs <실행 폴더> --report`로 다시 채점하지 않고 `results.md`만 새로 만듭니다.

세 엔진에서 과제 14개를 채점하는 데 좋은 답은 5분쯤, 실패한 검사가 많으면 15분까지 걸립니다(실패한 검사는 제한 시간까지 기다립니다).

```json
{
  "model": "Example Model",
  "modelVersion": "2026-09",
  "service": "chat web app | API | Claude Code subagent",
  "date": "2026-09-24",
  "lang": "en",
  "kit": "1.0.0-rc.5",
  "settings": "default settings, extended thinking on",
  "tasks": {
    "01": { "followUps": 0, "manual": { "spec": 2, "idiom": 2, "report": 1 }, "notes": "" }
  }
}
```

`kit`은 묶음을 만든 vfunc.js 버전(그때의 `package.json`)입니다. 결과는 나중에 고치지 않습니다. 킷이 바뀌면 새 폴더로 다시 실행합니다.

## 파일

| 경로 | 내용 |
|---|---|
| `header.en.md`, `header.ko.md` | 모든 묶음의 머리에 붙는 조건과 출력 규칙 |
| `tasks/index.json` | 과제 순서 |
| `tasks/NN-name/task.json` | 프롬프트, 시작 페이지, 프로젝트·참고 파일, 바꾸면 안 되는 파일, 정적 검사 옵션, 수동 채점표 |
| `tasks/NN-name/task.en.md`, `task.ko.md` | 과제문. 검사가 쓰는 훅과 문구를 고정합니다 |
| `tasks/NN-name/input/` | 입력 파일(과제 03은 샘플 14 `before/`를 직접 읽음) |
| `tasks/NN-name/checks.mjs` | 동작 검사(Playwright) |
| `tasks/NN-name/reference/answer.md` | 답 형식으로 쓴 기준 답안. 테스트에만 씁니다 |
| `tools/` | `bundle.mjs`, `extract.mjs`, `static.mjs`, `grade.mjs`, `report.mjs`, `helpers.mjs` |
| `results/<실행>/` | `run.json`, `answers/NN.md`, `results.json`, `results.md` |

## 테스트

- `layer1/test/eval.test.js`(`npm test`): 두 언어의 과제 폴더, 킷이 들어 있고 기준 답안은 없는 묶음, 답 파싱, 정적 규칙, 보고서, 커밋한 결과
- `layer1/test/e2e/eval.e2e.js`(`npm run test:examples`, CI에서는 모든 엔진): 기준 답안이 모두 통과하고, 고치지 않은 과제 10은 버그 검사 7개에서 모두 떨어짐
- 커밋한 모델 답은 CI에서 채점하지 않습니다. 그때의 킷으로 만든 답이기 때문입니다.

## 과제를 추가하거나 바꿀 때

- 두 언어를 같은 훅으로 씁니다. 검사가 쓰는 훅과 문구는 모두 과제문에 있어야 합니다.
- 검사는 `id`, `data-action`, `data-ref`와 그 밖의 `data-*` 속성으로 요소를 고릅니다(퍼블리셔 클래스를 유지하는지 보는 검사라면 클래스를 읽어도 됩니다).
- 기준 답안은 세 엔진에서 통과해야 하고, 아무것도 바꾸지 않은 답은 떨어져야 합니다.
- 채점에는 저장소가 허용한 도구(Playwright)만 씁니다. API 키는 쓰지 않습니다.
