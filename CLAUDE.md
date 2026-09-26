# CLAUDE.md

이 파일은 AI 에이전트(Claude Code 등)가 이 저장소에서 작업할 때 따르는 규칙입니다. 기여자와 기여자의 AI 도구도 같은 규칙을 따릅니다. `AGENTS.md`는 다른 에이전트용 진입점이며 이 파일을 정본으로 가리킵니다.

메인테이너 전용 규칙(기록 절차, 내부 문서)은 비공개 저장소에 있으며, 작업 폴더에 `internal/`이 있을 때만 아래 줄로 불러옵니다. 없으면 무시합니다.

@internal/CLAUDE.md

## 언어

- 대화 응답과 커밋 메시지는 **한국어**로 씁니다. 코드 식별자와 기술 용어는 영어를 유지합니다. 외부 기여자는 영어로 써도 됩니다.
- **공개 산출물**(README, 사이트, 프롬프트, 샘플 주석)은 **한국어·영어 병기**입니다. 문서는 한국어를 원본으로 두고 영어판을 함께 갱신합니다.
- **소스 코드 주석과 엔진이 내는 콘솔 메시지는 영어**로 씁니다.

## 이 프로젝트는 무엇인가

**vfunc.js** — 빌드 도구가 필요 없는 순수 Vanilla JS UI 라이브러리입니다. Virtual DOM이 없고, `innerHTML`·이벤트 위임·`data-ref`로 DOM을 직접 다룹니다. 기본 개념은 **"HTML은 그대로 쓰고, 제어가 필요한 곳만 vfunc로 만든다"**입니다. 라이선스는 Apache-2.0입니다.

| 레이어 | 내용 | 산출물 | 단계 |
|---|---|---|---|
| layer1 | 엔진 `vf.vfunc` + 헬퍼(attach, html, router, store, i18n 등) | `vfunc.js` 단일 파일 (+ IE용 `vfunc.legacy.min.js`) | 1단계 |
| layer2 | 클래스를 쓰지 않는 `vs*`/`vf*` 컴포넌트, 기본 그리드·차트, 서드파티 어댑터 | `vfunc-ui.js`, `vfunc-ui.css`, 어댑터 파일 | 2단계 |
| layer3 | VClass 계열, 템플릿, VApplication, 도구 | 미정 | 3단계 |

## 저장소 구조

| 경로 | 용도 |
|---|---|
| `layer1/` | `src/vfunc.js`(단일 소스), `types/`, `dist/`(생성물), `examples/`, `ai/`(LLM 레퍼런스와 프롬프트), `css/`, `starter/`, `plugins/`, `test/` |
| `layer2/` | `src/`(단일 진입 `index.js`, `components/`, `locales/`, `_internal/`은 비공개), `css/`, `types/vfunc-ui.d.ts`, `catalog.json`(컴포넌트 목록 단일 원본), `dist/`(생성물), `test/` |
| `layer3/` | 3단계에서 채웁니다 |
| `site/` | 홈페이지와 문서(정적 페이지 + vfunc 섬, GitHub Pages). **사용자용 API 레퍼런스는 `site/content/*/api.md`** |
| `build/` | 배포 전용 빌드 스크립트 |
| `third-party.json` | 서드파티 라이선스 단일 원본 |
| `internal/` | 메인테이너 전용(비공개 저장소, 공개 저장소는 무시) |

## 규칙

> 번호는 메인테이너 규칙과 이어집니다. 비어 있는 번호(1~14)는 메인테이너 전용 규칙이거나 이 저장소에 적용하지 않는 번호입니다.

### 15. 빌드 원칙
- **사용자는 빌드가 필요 없습니다.** 배포 파일(`dist/`)은 우리가 미리 만들어 둡니다.
- 저장소에 허용되는 도구는 다음뿐입니다. 그 밖의 번들러·트랜스파일러·테스트 러너를 추가하지 않습니다.
  - 배포 전용: esbuild, Babel + es-check(legacy 빌드), postcss-custom-properties·postcss-logical(2단계 legacy CSS)
  - 테스트 전용: happy-dom, Playwright
- 미니파이만 하고 난독화는 하지 않습니다. `keep_names`를 끄지 않습니다.
- `dist/`와 생성 파일(`THIRD_PARTY_LICENSES.txt` 등)은 손으로 고치지 않습니다.

### 16. 레이어 의존 방향
- layer1은 아무것도 import하지 않습니다. layer2는 layer1만, layer3는 layer1과 layer2만 import합니다. 역방향은 금지입니다.
- layer2 이상은 layer1의 **공개 API만** 사용합니다(`types/vfunc.d.ts`에 있는 것). `_`로 시작하는 멤버는 내부용입니다.

### 17. 네임스페이스
- 단일 전역 `vf`. 이름의 모양으로 레이어와 반환 타입을 구분합니다.
  - layer1: 소문자 (`vf.vfunc`, `vf.attach`, `vf.html`, `vf.router`)
  - layer2: `vs*` = **항상 문자열**(`SafeHtml`: 문자열처럼 쓰이고 `vf.html`에 넣어도 이중 이스케이프되지 않음), `vf*` = **항상 인스턴스** (`vf.vsButton`, `vf.vfTabs`)
  - layer2 어댑터: `vf` + 종류 + 벤더 (`vf.vfGridAg`, `vf.vfChartEcharts`)
  - layer3: PascalCase 클래스 (`vf.VClass`)
- props에 따라 반환 타입이 바뀌는 **auto-sensing 함수는 금지**입니다.
- 새 컴포넌트는 Tier를 먼저 정합니다: S(`vs*`만) / P(`vs*`+`vf*`, `vf*`는 `vs*`를 render로 재사용) / F(`vf*`만).
- `vf.*` 루트는 공식 예약 영역입니다. 레이어 파일은 같은 `window.vf`에 합류하되 기존 키를 덮어쓰지 않습니다. 사용자 확장은 `vf.ext.*`.

### 18. 공개 API 변경
- 공개 API(`d.ts`, CSS 토큰 이름 포함)는 semver를 따릅니다.
- 변경 시 `CHANGELOG.md`, `types/vfunc.d.ts`, `layer1/ai/llms.txt`(두 언어), `EXTENDING.md`, 사이트 문서(두 언어의 `api.md`와 관련 가이드)를 **함께** 갱신합니다.
- 제거는 최소 한 번의 MINOR 동안 deprecated 경고를 거친 뒤 MAJOR에서만 합니다.
- 크기 예산: `vfunc.min.js` gzip 10KB 이하, `vfunc.legacy.min.js` 14KB 이하. layer2는 `vfunc-ui.min.js` 24KB, `vfunc-ui.legacy.min.js` 30KB, `vfunc-ui.css` 12KB 이하.

### 19. IE 호환
- 엔진 소스는 하나이고 배포 파일만 나눕니다(`vfunc.min.js` / `vfunc.legacy.min.js`).
- layer1·layer2 소스에서 폴리필할 수 없는 API(Proxy, WeakRef, 정규식 lookbehind 등)를 쓰지 않습니다.
- 새 브라우저 API를 쓰면 legacy 폴리필 목록과 `third-party.json`을 함께 갱신합니다.

### 20. 보안
- 동적 HTML은 `vf.html` 또는 `vf.tpl`로만 만듭니다. `vf.unsafeHtml`은 사유 주석과 함께만 씁니다.
- URL은 `vf.safeUrl`을 거칩니다. `on*` 속성, `<script>`/`<style>` 안, 따옴표 없는 속성에 값을 보간하지 않습니다.
- `eval`, `new Function`, 문자열 `setTimeout`은 금지입니다.
- 외부 JSON을 `setState`나 병합에 쓸 때는 엔진의 안전 병합을 거칩니다(`__proto__`·`constructor`·`prototype`·예약어 차단).
- 권한 검사는 서버에서 합니다. 클라이언트 라우트 가드는 UX일 뿐입니다.
- 프론트엔드 코드에 비밀값을 넣지 않습니다. 샘플의 인증은 HttpOnly 쿠키를 기본으로 안내합니다.
- CDN 스크립트는 정확한 버전 고정 + `integrity`(SRI) + `crossorigin`을 붙입니다. 폴리필을 외부 CDN에서 불러오지 않습니다.
- 페이지에는 CSP 메타 태그를 두고, `script-src`에 `'unsafe-inline'`을 넣지 않습니다(인라인 스크립트는 외부 파일로).
- `Event.prototype` 등 네이티브 객체와 엔진 prototype을 몽키패치하지 않습니다. 이벤트 위임은 `closest(selector)` + `$node.contains(target)` 경계 검사로 합니다.
- `escapeHtml`을 로컬에 다시 구현하지 않고 공용 구현(`vf.esc`)을 씁니다.

### 21. 디자인 분리
- 이벤트 위임 셀렉터, `ids`, `refs`는 `data-action`, `data-ref`, `id`에만 겁니다. **CSS 클래스에는 걸지 않습니다.**
- render 마크업은 구조와 의미만 담습니다. 클래스는 `<블록>__<요소>`, 상태는 `aria-*` 또는 `data-state`.
- JS에 색상·폰트·간격·그림자 값을 넣지 않습니다. 인라인 `style`은 인스턴스마다 달라지는 수치에만 씁니다.
- CSS는 `var(--vf-*)` 토큰만 참조합니다. 원시 값은 `tokens.css`에만 둡니다.
- `DESIGN.md`가 디자인 단일 원본이고 `tokens.css`는 파생물입니다.
- 디자인 적용 작업은 로직(state, methods, delegates, router, store)을 바꾸지 않습니다. 구조 변경이 필요하면 따로 보고하고 커밋도 분리합니다.

### 22. 다국어
- layer2 컴포넌트는 사용자에게 보이는 문자열을 하드코딩하지 않고 메시지 키(`<컴포넌트>.<키>`)를 씁니다.
- 새 키를 추가하면 `en`과 `ko` 번들을 함께 갱신합니다. 날짜와 숫자는 `vf.fmt`로 포맷합니다.

### 23. 서드파티와 라이선스
- 서드파티를 도입하면 `third-party.json`에 항목을 추가합니다(`name, version, license, copyright, url, usedIn, bundled, licenseFile`). `THIRD_PARTY_LICENSES.txt`, 사이트 `/licenses`, `NOTICE`의 서드파티 섹션은 빌드 스크립트가 생성합니다.
- 허용 라이선스: MIT, Apache-2.0, BSD, ISC, OFL. 매출 조건부·비OSI 라이선스(예: ApexCharts v5)는 채택하지 않습니다. CI에 쓰는 도구도 같습니다.
- 어댑터는 벤더 라이브러리를 번들하거나 재배포하지 않습니다(`lib` 주입 또는 전역). 공식 어댑터는 `_template`에서 시작하고 `_contract` 계약 테스트를 통과해야 병합합니다. 벤더 DOM은 `data-vf-keep` 영역에만 둡니다.

### 24. 배포와 캐시
- `index.html`과 `version.json`은 캐시하지 않습니다(`Cache-Control: no-cache`).
- 릴리스할 때마다 `version.json`을 올립니다. 버전 폴더 배포를 권장합니다.
- Service Worker는 명시적으로 결정한 경우에만 씁니다.
- 공개 설치 예시는 운영용으로 정확한 버전을 안내합니다(`vfunc@1.0.3`).

### 25. 공개 저장소 위생
- 비밀값, 로컬 경로의 사용자 계정명, 개인 메일, 내부 문서를 커밋하지 않습니다. CI에서 gitleaks로 검사합니다.
- 공개 파일에서 `internal/` 경로를 링크하지 않습니다.
- 커밋에는 DCO sign-off(`git commit -s`)를 넣습니다(`CONTRIBUTING.md`).

## 실행 방법

```bash
# 예제와 사이트 서빙 (저장소 루트에서)
python -m http.server 8080
```

```bash
npm install        # devDependencies (빌드용 esbuild, 테스트용 happy-dom)
npm test           # layer1·layer2 단위·dist·타입 테스트 + 빌드 스크립트 테스트 (node --test + happy-dom)
npm run build      # layer1/dist·layer2/dist + 소스맵, 라이선스 파일, llms-full, 스타터 사본, npm 패키지 조립(build/out/npm/)
npm run build:check  # 메모리에서 빌드해 커밋된 생성 파일이 최신인지 검사 (CI용)
npm run licenses   # third-party.json → THIRD_PARTY_LICENSES.txt, NOTICE 서드파티 절, site/data/licenses.json
npm run pack:dry   # 게시될 npm 패키지 내용 확인 (실제 publish는 메인테이너만)
npx playwright install chromium firefox webkit   # 처음 한 번: 브라우저 테스트용 엔진 3종
npm run test:examples             # 예제·스타터·사이트 브라우저 테스트 (Playwright, 콘솔 에러·경고 0 + 핵심 동작)
# 다른 엔진: PowerShell은 $env:VF_BROWSER='firefox' (또는 'webkit') 후 실행. CI는 세 엔진 모두 실행
npm run site       # 사이트 → build/out/site/. 미리 보기: python -m http.server 8080 --directory build/out/site
node layer1/ai/eval/tools/bundle.mjs              # LLM 평가 묶음 → build/out/eval/bundles/{en,ko}/
node layer1/ai/eval/tools/grade.mjs <결과 폴더>    # 저장한 답 채점 → results.json, results.md (layer1/ai/eval/README.ko.md)
node layer1/starter/tools/design-check.mjs         # 디자인 규칙·토큰 대비 검사(스타터용, layer2 예제는 경로와 --tokens를 줌)
```

- CI(`.github/workflows/ci.yml`): `npm test`, `build:check`, `npm audit --omit=dev`, 세 엔진의 `test:examples`, gitleaks(실행 파일, 버전·체크섬 고정). 새 브라우저 테스트는 세 엔진에서 모두 통과해야 합니다. 엔진 차이로 실패하면 사용자 관점의 조작(키보드 등)으로 검사하고 제품 코드를 엔진별로 분기하지 않습니다.
- 버전을 올리면 `npm run build` 뒤 `npm test`를 실행합니다. `build/versions.test.js`가 CDN 예시의 버전과 SRI가 어긋난 파일을 모두 알려 줍니다.
- 예제를 추가하면 `layer1/examples/index.html`에 링크하고 `layer1/test/e2e/checks.mjs`에 검사를 추가합니다(없으면 테스트가 실패). 예제는 CSP 메타 태그, 외부 스크립트, `data-action`/`data-ref`, 토큰만 쓰는 CSS를 지킵니다.
- 토큰 이름(`css/vfunc.tokens.css`)은 공개 API입니다. 바꾸면 `layer1/test/tokens.test.js`의 목록, llms.txt, `DESIGN.template.md`의 `tokens` 블록(두 언어), 사이트 `design.md`를 함께 고칩니다.
- AI 프롬프트 킷(`layer1/ai/en`, `layer1/ai/ko`)은 같은 이름의 파일 쌍으로 두고, 한쪽을 고치면 다른 쪽도 같은 절 구성으로 고칩니다(`ai-kit.test.js`가 검사). `llms-full.txt`는 `llms.txt` + 사이트 영어 문서 + d.ts로 빌드가 생성합니다.
- 스타터(`layer1/starter`)의 `lib/`, `styles/tokens.css`, `AGENTS*.md`, `design/DESIGN.md`, `docs/`는 빌드가 넣는 사본입니다. 원본을 고치고 `npm run build`를 실행합니다.
- 사이트 문서의 원본은 `site/content/ko/*.md`(한국어)이고 `site/content/en/*.md`는 번역입니다. 두 언어는 같은 파일·같은 `##` 절·같은 `{{블록}}`을 가집니다(`build/site.test.js`). 페이지 목록은 `site/pages.json`. API 페이지는 d.ts의 모든 이름을 `### \`vf.이름\`` 제목으로 가져야 합니다.
- 사이트의 마크다운은 `build/markdown.mjs`가 모두 이스케이프합니다. 원시 HTML은 쓸 수 없고, 생성 블록(`{{install}}`, `{{examples}}`, `{{prompts}}`, `{{licenses}}`, `{{eval}}`, `{{demo}}`)과 `@VERSION@`만 빌드가 채웁니다.
- LLM 평가 세트(`layer1/ai/eval`)는 npm 패키지와 사이트 `/ai/`에 넣지 않습니다. 과제의 검사를 바꾸면 기준 답안이 세 엔진에서 통과해야 합니다(`eval.e2e.js`). `results/`의 답과 결과는 고치지 않고, 킷이 바뀌면 새 폴더로 다시 실행합니다.
- 사이트의 동작은 `site/assets/site.js`의 `vf.attach` 섬으로만 붙입니다. 배포는 `.github/workflows/pages.yml`(수동 실행, Actions는 SHA 고정)입니다.
- 엔진 소스(`layer1/src/`)를 고치면 `npm run build`로 `dist/`를 다시 만들어 함께 커밋합니다. `dist/` 테스트는 커밋된 파일을 검사합니다.
- layer2 컴포넌트를 추가하면 `layer2/src/index.js`, `layer2/catalog.json`, `layer2/types/vfunc-ui.d.ts`, 메시지(`locales/en.js`·`ko.js`)를 함께 고칩니다(`catalog.test.js`). 선택 속성은 `_internal/attrs.js`로만 만들고, `rules.test.js`가 클래스 셀렉터·JS 속 디자인 값·토큰 밖 CSS·물리 방향 속성을 막습니다. legacy CSS는 `build/ui-css.mjs`가 변환합니다. 슬롯을 가진 `vf*`는 `_internal/slots.js`로 인스턴스를 `childs`에 붙입니다(`slots.test.js`). `layer2/ai/{en,ko}/components.md`는 catalog와 d.ts에서 빌드가 생성하므로 손으로 고치지 않고, `llms.txt` 두 언어의 컴포넌트 목록과 사이트 `components` 표는 `build/components.test.js`가 검사합니다.
- layer2 킷(`layer2/ai/{en,ko}`)은 npm 패키지와 사이트에서 layer1 킷과 같은 `ai/<언어>/` 폴더에 합쳐지므로 파일 이름이 layer1과 겹치면 안 됩니다(`layer2/test/ai-kit.test.js`).
- layer2 예제(`layer2/examples/<이름>/`)는 README(첫 설명 줄 "영어 / 한국어", 사이트 목록에 쓰임), `layer2/examples/index.html` 링크, `layer2/test/e2e/examples.e2e.js` 검사를 함께 둡니다. `design-check`도 통과해야 합니다(`layer1/test/design-check.test.js`).
- 빌드는 `vfunc.min.js` gzip 10KB 초과, min 파일에 남은 개발 경고, `third-party.json`에 없는 번들 모듈이 있으면 실패합니다.
- npm 패키지는 `build/out/npm/`에서 조립합니다. 루트 `package.json`은 개발용이라 `"private": true`를 유지합니다.
- 개발용 경고는 `if (DEV) warn(...)`으로 씁니다. 운영 빌드에서 문구까지 제거됩니다. 보안 차단 로직을 `DEV`에 의존시키지 않습니다.
- legacy 빌드(`vfunc.legacy.min.js`)는 gzip 14KB 초과, ES5가 아닌 문법, 폴리필 목록 밖의 ES2015+ 내장 API(es-check `--checkFeatures`), IIFE 밖의 코드(전역 헬퍼)가 있으면 실패합니다. 새 브라우저 API를 쓰면 `layer1/src/polyfills/`와 `build/build.mjs`의 `LEGACY_POLYFILLED`를 함께 갱신합니다(규칙 19).
- 브라우저 테스트: 위 서버를 띄우고 `http://localhost:8080/layer1/test/browser.html`(IE 모드 절차는 `layer1/test/BROWSER-TESTS.md`).

## 어디서 찾아볼지

- API 레퍼런스 → 사이트 `site/content/ko/api.md`(영어는 `en/api.md`), 타입 `layer1/types/vfunc.d.ts`, AI용 요약 `layer1/ai/llms.txt`
- 사용자 확장 규칙 → `EXTENDING.md`
- 기여 방법 → `CONTRIBUTING.md`, 보안 → `SECURITY.md`
- 메인테이너 문서(현재 상태, 결정 기록, 기획) → `internal/CLAUDE.md`의 "어디서 찾아볼지"
