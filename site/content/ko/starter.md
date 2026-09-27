# 스타터와 AI로 앱 만들기

스타터는 복사해서 바로 쓰는 vfunc 앱 골격입니다. 이 페이지는 스타터를 받아 AI 코딩 도구(Claude Code, Cursor, Codex, Copilot, 채팅형 AI)에게 기능을 시키는 방법과 연습 과제 10개를 안내합니다. [따라하기](tutorial.md)를 먼저 해 보면 AI가 만든 코드를 읽기 쉽습니다.

## 스타터에 들어 있는 것

| 경로 | 내용 |
|---|---|
| `index.html` | CSP 보안 줄, 스타일, `app.js` 하나 |
| `app.js` | 레이아웃, 라우터(화면 전환), update 플러그인. 새 화면은 여기에 라우트 한 줄 |
| `pages/*.js` | 화면마다 파일 하나: `(ctx, router) => component` |
| `store.js` · `api.js` | 공용 상태와 그것을 바꾸는 함수 · 모든 서버 호출 |
| `locales/{en,ko}.json` | 한국어·영어 문구 |
| `styles/tokens.css` | 디자인 토큰(라이트·다크). 원본은 `design/DESIGN.md` |
| `AGENTS.md` · `AGENTS.ko.md` | **AI가 읽는 규칙.** 구조·보안·디자인 규칙이 적혀 있습니다 |
| `docs/llms.txt` · `docs/llms-full.txt` | AI용 vfunc 레퍼런스 |
| `tools/design-check.mjs` | 디자인 규칙 검사(원시 색, 클래스 셀렉터, 대비) |
| `tools/release.mjs` · `deploy/` | 버전 폴더 배포와 서버 캐시 설정 |
| `lib/` | vfunc 파일 사본. 고치지 않습니다 |

AI에게 필요한 것이 폴더 안에 모두 있습니다. 규칙은 `AGENTS.md`에, API는 `docs/llms.txt`에 있고, 구조는 이미 정해져 있습니다. AI는 정해진 자리에 코드를 채우기만 하면 됩니다.

## 스타터 받기

Node.js가 있으면 명령 하나로 받습니다(`my-app`은 원하는 이름으로).

```bash
npx degit vidkid-indy/vfunc/layer1/starter my-app
cd my-app
python -m http.server 8080
```

Node.js가 없으면 [저장소](https://github.com/vidkid-indy/vfunc)에서 **Code → Download ZIP**을 받아 압축을 풀고, `layer1/starter` 폴더만 원하는 곳에 복사합니다. 그 폴더에서 서버를 켜고 `http://localhost:8080/`을 열면 홈·목록·설정 화면이 있는 앱이 뜹니다.

## 처음 설정

1. **`AGENTS.md`의 0절을 채웁니다.** 앱 한 줄 설명, 응답 언어, 대상 브라우저입니다. 한국어로 작업하려면 `AGENTS.ko.md`를 `AGENTS.md`로 바꿔 써도 됩니다.
2. **도구에 맞게 규칙 파일을 연결합니다.**
   - Codex, Cursor 등은 `AGENTS.md`를 바로 읽습니다.
   - Claude Code는 `AGENTS.md`를 `CLAUDE.md`로 복사합니다.
   - GitHub Copilot은 `.github/copilot-instructions.md`로 복사합니다.
3. (선택) **디자인을 정합니다.** `design/DESIGN.md`에 색·글꼴·모양을 적고 AI에게 `styles/tokens.css`를 다시 만들게 합니다. 디자인 프롬프트는 [AI 킷](ai.md)에 있습니다.
4. 앱 이름과 첫 화면 문구를 `locales/ko.json`·`en.json`에서 바꿉니다.

## AI에게 맡기기

**폴더를 여는 AI 도구**(Claude Code, Cursor, Codex, Copilot 에이전트)라면 스타터 폴더를 열고 아래처럼 시작합니다. AI가 `AGENTS.md`와 `docs/llms.txt`를 스스로 읽습니다.

```text
이 폴더는 vfunc.js 스타터입니다. AGENTS.md와 docs/llms.txt를 먼저 읽고 규칙을 지키세요.

만들 앱: <한 줄 설명>
화면: <화면 목록과 각 화면에서 하는 일>
데이터: <어디에 저장하는지. 예: 브라우저 localStorage / sql.js>

작업 방식:
- 먼저 만들 파일과 화면 구성을 계획으로 보여 주고 내 확인을 받은 뒤 코드를 쓰세요.
- 새 화면은 pages/ 파일 + app.js 라우트 한 줄. 문구는 locales의 ko·en 두 곳에 모두.
완료 조건:
- python -m http.server 8080 으로 열었을 때 브라우저 콘솔에 오류·경고가 없음
- node tools/design-check.mjs 통과(Node가 있을 때)
- 한국어·영어 전환과 라이트·다크 테마에서 모두 동작
```

**채팅형 AI**(웹의 ChatGPT, Claude 등)라면 `AGENTS.md`, `docs/llms.txt`, 고칠 파일(`app.js`, 관련 `pages/*.js`)을 첨부하고 같은 요청을 붙여 넣습니다. 답에는 **파일 전체**를 달라고 하세요. 조각만 받으면 붙여 넣다 틀리기 쉽습니다.

- 한 번에 앱 전체를 시키기보다 **화면 하나씩** 시키면 결과가 좋습니다.
- 자주 하는 작업(화면 추가, 기존 HTML 변환, React·Vue에서 옮기기, 디버그, 배포 설정)은 [AI 킷](ai.md)의 프롬프트를 붙여 넣으면 됩니다.
- AI가 지어낸 API를 쓰면 콘솔 오류가 납니다. 그 오류 문구를 그대로 AI에게 주고 고치게 합니다.

## 결과 확인하기

| 확인 | 방법 |
|---|---|
| 콘솔이 깨끗한가 | F12 → Console에 빨간 오류·노란 경고가 없어야 합니다(개발용 vfunc가 실수를 경고로 알려 줌) |
| 화면이 다 되는가 | 모든 버튼·입력을 한 번씩. 새로고침, 뒤로 가기, 주소 직접 입력도 |
| 두 언어·두 테마 | 헤더의 언어 전환, OS 다크 모드 |
| 디자인 규칙 | `node tools/design-check.mjs` — 토큰 밖 색, 클래스로 요소 찾기, 대비 부족을 알려 줌 |
| 보안 규칙 | 코드에 `innerHTML =`, `onclick=`, `eval`이 없는지. `vf.unsafeHtml`에는 이유 주석이 있는지 |
| 입력 이스케이프 | 입력칸에 `<img src=x onerror=alert(1)>`를 넣어도 글자로 보여야 함 |

틀린 곳을 찾으면 [AI 킷](ai.md)의 디버그 프롬프트와 함께 증상을 AI에게 줍니다. AI가 자주 하는 실수 목록(anti-patterns)도 킷에 있습니다.

## 컴포넌트(vfunc-ui) 더하기

스타터에는 엔진만 들어 있습니다. 표·차트·확인 창 같은 [컴포넌트](components.md)가 필요하면 파일을 `lib/`에 더합니다.

1. 아래 파일을 받아 저장합니다(브라우저에서 열고 **다른 이름으로 저장**). 모두 같은 버전이어야 합니다.
   - `lib/`에: `https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/dist/vfunc-ui.esm.js`, 한국어 문구 `…/dist/vfunc-ui.locale.ko.esm.js`, 그리드·차트가 필요하면 `…/dist/vfunc-ui-data.esm.js`
   - `styles/`에: `https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/css/vfunc-ui.css`
2. `lib/vf.js`에서 컴포넌트를 불러옵니다. 이 파일들은 같은 폴더의 `vfunc.esm.js`를 가져오므로 엔진이 하나로 유지됩니다.
3. `index.html`에서 `tokens.css` 다음 줄에 `vfunc-ui.css`를 연결합니다.

```js
// lib/vf.js
import './vfunc-ui.esm.js';
import './vfunc-ui.locale.ko.esm.js';
export { default } from './vfunc.esm.js';
```

- 운영에서는 엔진과 컴포넌트를 **함께** min 파일(`vfunc.esm.min.js`, `vfunc-ui.esm.min.js`)로 바꿉니다. 한쪽만 바꾸면 엔진이 두 번 로드됩니다.
- 플러그인(list, shortcut)도 같은 방식으로 받습니다: `…/dist/plugins/list.esm.js`를 `lib/plugins/`에 두고 `vf.use`로 등록합니다(스타터의 update 플러그인과 같음).
- AI에게는 "lib/에 vfunc-ui가 있다"고 알려 주고, 컴포넌트 목록 `ai/ko/components.md`(npm 패키지 또는 [AI 킷](ai.md))도 함께 줍니다.

## 데이터베이스가 필요할 때 (sql.js)

과제 중 ◆ 표시는 SQLite를 씁니다. 서버 없이 브라우저 안에서 SQLite를 돌리는 [sql.js](https://github.com/sql-js/sql.js)(MIT 라이선스)를 안내합니다. vfunc에 들어 있지 않으므로 앱이 직접 불러옵니다.

1. sql.js의 `sql-wasm.js`와 `sql-wasm.wasm`을 같은 버전으로 받아 `lib/sql/`에 둡니다(npm 패키지 `sql.js`의 `dist/` 또는 GitHub 릴리스). 라이선스 파일도 함께 둡니다.
2. `index.html`에서 `app.js`보다 먼저 `<script src="./lib/sql/sql-wasm.js"></script>`를 불러옵니다. 전역 `initSqlJs`가 생깁니다.
3. CSP의 `script-src`에 `'wasm-unsafe-eval'`을 더합니다. WebAssembly 실행만 허용하는 값이고 `'unsafe-eval'`과는 다릅니다.

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
```

AI에게는 이렇게 요청합니다.

```text
데이터는 sql.js(lib/sql/sql-wasm.js, 전역 initSqlJs)로 브라우저 안의 SQLite에 저장합니다.
- db.js 모듈 하나에 초기화(initSqlJs({ locateFile: (f) => new URL('./lib/sql/' + f, location.href).href })),
  테이블 생성, 조회·저장 함수를 모으고, 화면은 store.js를 통해서만 씁니다.
- 변경할 때마다 db.export()를 IndexedDB에 저장하고, 시작할 때 불러옵니다.
- SQL에는 값을 이어 붙이지 말고 항상 바인딩(?)을 씁니다.
- 가져오기·내보내기: .sqlite 파일 열기와 저장 버튼.
```

- sql.js의 DB는 메모리에 있습니다. 저장하지 않으면 새로고침 때 사라집니다. 위 요청의 IndexedDB 저장이 그 역할입니다.
- 같은 버전의 `.js`와 `.wasm`을 써야 합니다. CDN에서 불러오려면 버전을 고정하고 `integrity`를 붙이며, CSP에 그 주소를 더합니다.

## 연습 과제 10개

모두 프런트엔드만으로 만듭니다. 난이도는 ★(쉬움)~★★★입니다. 요청문의 "만들 앱·화면·데이터"에 아래 내용을 옮겨 적으면 됩니다.

| # | 과제 | 난이도 | 화면과 기능 | 연습하는 것 |
|---|---|---|---|---|
| 1 | **Markdown 뷰어** | ★★ | `.md` 파일 열기·끌어 놓기, 목차, 코드 블록, 다크 모드 | 파일 API, 서드파티(marked + DOMPurify), 안전한 HTML |
| 2 | **칸반 보드** | ★★ | 할 일·진행·완료 열, 카드 추가·이동(버튼과 끌기), localStorage | 상태, 이벤트 위임, list 플러그인 |
| 3 | **가계부** ◆ | ★★★ | 수입·지출 입력, 월별 합계, 분류별 차트, CSV 내보내기 | 폼, `vf.fmt` 통화, vfChart, sql.js |
| 4 | **메모장** ◆ | ★★ | 메모 목록·편집, 태그, 검색, 마크다운 미리보기 | 라우터, store, sql.js |
| 5 | **CSV·JSON 뷰어** | ★★ | 파일을 열어 표로, 정렬·필터·페이지, 내보내기 | vfGrid, 파일 API |
| 6 | **포모도로 타이머** | ★ | 25/5분 타이머, 오늘 기록, 알림 소리 | 타이머 정리(`onDestroy`), 단축키 플러그인 |
| 7 | **단어장·플래시카드** ◆ | ★★ | 단어 추가, 카드 뒤집기, 퀴즈, 틀린 단어 다시 보기 | 화면 전환, 상태 흐름, sql.js |
| 8 | **사진 갤러리** | ★★ | 로컬 이미지 열기, 격자, 라이트박스, 화살표 키 이동 | vfModal, 키보드 접근성, `URL.createObjectURL` |
| 9 | **설문 만들기** ◆ | ★★★ | 문항 편집 → 응답 화면 → 결과 차트 | 동적 폼, vfChart, sql.js |
| 10 | **GitHub 저장소 대시보드** | ★★ | 저장소 이름으로 별·이슈·언어를 카드와 차트로 | fetch, 로딩·오류 상태, CSP `connect-src` |

과제별로 AI에게 덧붙일 것:

- **1 Markdown 뷰어**: 마크다운을 HTML로 바꾼 결과는 DOMPurify로 정리한 뒤에만 `vf.unsafeHtml`로 넣고, 그 이유를 주석으로 남기라고 합니다. 두 라이브러리는 버전을 고정하고 `lib/`에 두거나 CDN + `integrity`로 불러옵니다.
- **2 칸반**: 카드 이동은 끌기뿐 아니라 버튼(←, →)으로도 되게 합니다(키보드 사용자).
- **5 CSV·JSON 뷰어**: 큰 파일(1만 행)에서도 멈추지 않게 페이지 단위로 보여 달라고 합니다.
- **6 타이머**: 화면을 떠날 때 타이머를 멈추고(`onDestroy`), 탭이 숨겨졌다 돌아와도 시간이 맞게 합니다.
- **8 갤러리**: 사진은 서버로 보내지 않고 브라우저 안에서만 다룹니다.
- **10 대시보드**: GitHub API는 로그인 없이 시간당 요청 수가 제한됩니다. 결과를 잠시 저장(캐시)하고, 제한에 걸리면 안내 문구를 보여 달라고 합니다. CSP `connect-src`에 `https://api.github.com`을 더합니다.
- **◆ 과제**: 위 "데이터베이스가 필요할 때"의 요청문을 함께 붙입니다.

## 써 보고 알려 주세요

스타터와 AI로 만들어 본 결과를 [GitHub Discussions](https://github.com/vidkid-indy/vfunc/discussions)에 남겨 주세요. 다음을 적어 주면 킷을 고치는 데 큰 도움이 됩니다.

- 사용한 AI 도구와 모델, 고른 과제
- 처음 요청문과, 고치기까지 주고받은 횟수
- AI가 틀린 곳(콘솔 오류 문구, 지어낸 API, 규칙 위반)
- 완성한 화면 캡처나 저장소 주소(선택)
