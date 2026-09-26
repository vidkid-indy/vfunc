# vfunc.js starter

A working vfunc.js app to copy and make your own: router, shared store, Korean/English messages, design tokens with light/dark themes, and the update plugin. **No build step.**
복사해서 시작하는 vfunc.js 앱입니다. 라우터, 공용 store, 한국어/영어 메시지, 라이트/다크 토큰, update 플러그인이 들어 있고 **빌드 단계가 없습니다.**

```bash
npx degit vidkid-indy/vfunc/layer1/starter my-app   # or download the zip / 또는 zip 다운로드
cd my-app
python -m http.server 8080                          # any static server / 아무 정적 서버
# open http://localhost:8080/
```

## Files / 파일

| Path | What / 내용 |
|---|---|
| `index.html` | CSP meta tag, styles, `app.js` |
| `app.js` | messages, layout, router, update plugin — add routes here / 라우트 추가 |
| `config.js` | `APP_VERSION`, locales |
| `store.js` · `api.js` | shared state · server calls (URLs resolved with `import.meta.url`) |
| `pages/*.js` · `components/*.js` | screens · parts |
| `locales/{en,ko}.json` | messages |
| `styles/tokens.css` | tokens, derived from `design/DESIGN.md` / DESIGN.md에서 파생 |
| `styles/base.css`, `components/`, `pages/` | CSS, tokens only / 토큰만 |
| `design/` | `DESIGN.md` (source of design), `STATUS.md`, `source/` (originals) |
| `design-preview.html` | every token and base element on one page / 스타일 가이드 |
| `lib/` | vfunc files (`vf.js` picks the development or minified build) — do not edit / 수정 금지 |
| `docs/llms.txt`, `docs/llms-full.txt` | the vfunc reference for AI tools / AI용 레퍼런스 |
| `AGENTS.md` (`AGENTS.ko.md`) | rules for AI agents — fill in section 0 / AI 규칙, 0절을 채우세요 |
| `version.json`, `tools/release.mjs`, `deploy/` | releases and cache headers / 릴리스와 캐시 |
| `tools/design-check.mjs` | design rules check (optional) / 디자인 규칙 검사(선택) |

## Working with AI / AI와 작업하기

Give your AI `AGENTS.md` and `docs/llms.txt`. Prompts for common tasks (scaffold, add a feature, convert published HTML, apply a design, deploy) are in the vfunc repository under `layer1/ai/en/` and `layer1/ai/ko/`, and in the npm package under `vfunc/ai/`.
AI에 `AGENTS.md`와 `docs/llms.txt`를 주세요. 자주 하는 작업의 프롬프트는 vfunc 저장소의 `layer1/ai/ko/`(영어는 `en/`)에 있습니다.

## Design check / 디자인 검사

```bash
node tools/design-check.mjs       # exit code 1 when something is wrong / 문제가 있으면 종료 코드 1
```

It reports raw colors outside the token file, JS selectors that find elements by class, `vf.unsafeHtml` without a comment saying why, and token colors below WCAG AA contrast in the light and dark themes. Add `design-check-ignore` to a line (or `design-check-ignore-file` to a file) that is right on purpose, with the reason.
토큰 파일 밖의 원시 색, 클래스로 요소를 찾는 JS 셀렉터, 사유 주석 없는 `vf.unsafeHtml`, WCAG AA에 못 미치는 토큰 대비(라이트·다크)를 알려 줍니다. 의도한 곳은 이유와 함께 `design-check-ignore`(파일 전체는 `design-check-ignore-file`)를 적습니다.

## Release / 릴리스

```bash
# 1. set APP_VERSION in config.js and version.json to 1.0.1 / 버전 올리기
node tools/release.mjs 1.0.1      # → dist/1.0.1/, dist/index.html, dist/version.json
# 2. upload dist/ with the cache headers from deploy/ / deploy/의 헤더로 업로드
```

Open pages pick up the release on the next screen change (`vf.ext.update`). / 열려 있는 페이지는 다음 화면 이동 때 새 버전을 받습니다.

For production, switch `lib/vf.js` to `vfunc.esm.min.js`. / 운영에서는 `lib/vf.js`를 min 파일로 바꾸세요.
