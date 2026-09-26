# Contributing / 기여 안내

Thank you for your interest in vfunc.js. / vfunc.js에 관심을 가져 주셔서 감사합니다.

## Before you start / 시작하기 전에

- Questions and ideas: use **GitHub Discussions**. Bug reports: use **Issues**.
  질문과 아이디어는 **Discussions**, 버그는 **Issues**에 올려 주세요.
- Security vulnerabilities: **do not open a public issue.** See [SECURITY.md](SECURITY.md).
  보안 취약점은 공개 이슈로 올리지 말고 [SECURITY.md](SECURITY.md)를 따라 주세요.
- To add features without changing vfunc itself, see [EXTENDING.md](EXTENDING.md).
  vfunc를 고치지 않고 기능을 더하려면 [EXTENDING.md](EXTENDING.md)를 보세요.

## Developer Certificate of Origin (DCO)

All commits must be signed off. By signing off, you certify that you wrote the change or have the right to submit it under the project's license ([developercertificate.org](https://developercertificate.org/)).

모든 커밋에 sign-off가 필요합니다. sign-off는 "이 변경을 직접 작성했거나 프로젝트 라이선스로 제출할 권리가 있다"는 확인입니다.

```bash
git commit -s -m "fix: ..."
# adds: Signed-off-by: Your Name <you@example.com>
```

## Rules for code / 코드 규칙

- Keep layer dependencies one-way: layer1 ← layer2 ← layer3. Layer 2 and above use only the public API of layer 1.
- `vs*` functions always return markup (SafeHtml: used like a string, not escaped again by `vf.html`); `vf*` functions always return an instance.
- Build dynamic HTML with `vf.html` (auto-escaping). Never interpolate into `on*` attributes.
- Bind events to `data-action` / `data-ref`, never to CSS classes.
- Use CSS tokens (`var(--vf-*)`) instead of raw colors and sizes.
- Add a test for every change. Public API changes also update `types/vfunc.d.ts`, `CHANGELOG.md` and the docs.
- Third-party code: add it to `third-party.json`. Only MIT, Apache-2.0, BSD, ISC or OFL licenses are accepted.

## Components / 컴포넌트 기여 (layer 2)

Open a Discussion first: the component list is kept small on purpose. When it is agreed, one pull request carries all of these (`layer2/test/catalog.test.js` checks that they match):
목록은 일부러 작게 유지하므로 먼저 Discussions에서 논의해 주세요. 합의되면 아래를 한 PR에 담습니다(`catalog.test.js`가 일치를 검사).

1. `layer2/src/components/<id>.js` — decide the tier first (S: `vs*` only, P: `vs*` + `vf*` that renders with the `vs*`, F: `vf*` only). Optional attributes go through `_internal/attrs.js`, form controls through `_internal/field.js`, `vf*` through `_internal/instance.js`. No ES2015+ built-ins (the legacy build polyfills only Promise).
2. `layer2/css/components/<id>.css` — tokens only, logical properties (`margin-inline-start`), classes `vf-<block>__<element>`, state in `aria-*` / `data-state`.
3. Messages in `layer2/src/locales/en.js` and `ko.js` (`<component>.<key>`); no hard-coded visible text.
4. An entry in `layer2/catalog.json` (tier, category, summary in both languages, example, message keys), the export in `layer2/src/index.js` in catalog order, and the declaration in `layer2/types/vfunc-ui.d.ts` (also in the `ui` and `Vf` lists at its end).
5. Tests in `layer2/test/` (markup, aria, events, escaping, no leak after `destroy`) and, for keyboard behavior, a check in the gallery's browser test. `npm run build` then regenerates `dist/` and `ai/*/components.md`.

`layer2/test/rules.test.js` rejects class selectors in JS, design values in JS, raw values in CSS and physical direction properties.
`rules.test.js`가 JS의 클래스 셀렉터·디자인 값, CSS의 원시 값·물리 방향 속성을 막습니다.

## Translations / 번역 기여

Built-in texts of layer 2 are in `layer2/src/locales/`. For a new language, add `<lang>.js` with every key of `en.js` (same structure) and say in the pull request who reviewed the wording; we add the build file (`vfunc-ui.locale.<lang>.js`). Dates and numbers come from `Intl` through `vf.fmt`, so they need no translation.
layer2의 내장 문구는 `layer2/src/locales/`에 있습니다. 새 언어는 `en.js`의 모든 키를 같은 구조로 담은 `<lang>.js`를 추가하고, 문구를 누가 검토했는지 PR에 적어 주세요. 빌드 파일은 우리가 추가합니다. 날짜와 숫자는 `vf.fmt`(Intl)가 처리합니다.

## Adapters / 어댑터 기여

Other adapters are welcome as separate packages named `vfunc-adapter-*`; we list them on the site. An **official** adapter (in this repository) follows these steps:
그 밖의 어댑터는 `vfunc-adapter-*` 이름의 별도 패키지로 만들어 주시면 사이트에 소개합니다. **공식** 어댑터(이 저장소)는 아래 절차를 따릅니다.

1. **License and support.** The vendor is MIT, Apache-2.0, BSD or ISC (no revenue-based or commercial-only terms). Pin the exact version; state its browser support. / 라이선스와 정확한 버전, 브라우저 지원.
2. **Template.** Copy `layer2/adapters/_template/vfunc-kind-vendor.js` to `layer2/adapters/<kind>-<vendor>/index.js` and fill in its `TODO(1)`–`TODO(14)`. The name is `vf` + kind + vendor (`vfGridAg`). The vendor is never bundled: `lib` prop or its global. / 템플릿에서 시작하고 벤더는 번들하지 않습니다.
3. **Node contract.** Add the adapter with a small mock of the vendor to `layer2/test/adapters.test.js` and pass the base and kind suites of `layer2/adapters/_contract`. / 모의 벤더로 node 계약 테스트.
4. **Browser contract.** Add it with the real vendor (jsDelivr, exact version, SRI) to `layer2/adapters/_contract/contract.html` / `contract-page.js`; it must pass in Chromium, Firefox and WebKit with no console errors (`npm run test:examples`). / 실제 벤더로 세 엔진 브라우저 계약 테스트.
5. **Records.** An entry in `third-party.json` (`bundled: false`), then `npm run licenses`; the types in `layer2/types/adapters/<kind>-<vendor>.d.ts`; a row in the adapter table of the site guide (both languages), including any CSP the vendor needs. / third-party.json, 타입, 사이트 가이드 표(CSP 포함).
6. **Build.** Add the three targets `vfunc-<kind>-<vendor>.{js,min.js,esm.js}` next to the other adapters in `build/build.mjs`, run `npm run build`, and commit `layer2/dist/`; `npm test` and `npm run build:check` pass. / build.mjs에 대상 세 개를 추가하고 빌드·테스트.
