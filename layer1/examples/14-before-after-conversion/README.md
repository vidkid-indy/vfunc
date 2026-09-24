# 14 before-after-conversion

The AI prompt kit in action: `layer1/ai/en/prompt-html-to-vfunc.md` (Korean: `ko/`) applied to a publisher's dashboard. / AI 프롬프트 킷의 실제 적용 예입니다.

| Folder / 폴더 | What / 내용 |
|---|---|
| `before/` | the page as delivered: inline `<script>`, `onclick`, `javascript:` link, inline style, hard-coded numbers / 전달받은 그대로 |
| `after/` | the same markup with hook attributes, a CSP meta tag and `app.js`; data from `data/dashboard.json` / 훅 속성, CSP, app.js |
| `CONVERSION.md` | the prompt's output: area table, HTML diff, removed unsafe items, token suggestions, assumptions, checklist / 프롬프트 출력 |

- Six dynamic areas (see the area table); everything else is untouched. The unit test undoes the listed HTML changes and checks that `after/index.html` equals `before/index.html`, and that `dashboard.css` is the same file. / 단위 테스트가 HTML 변경을 되돌려 원본과 같은지 확인합니다.
- **Adopted** (markup and values kept): user menu, summary tabs, status filter, search box. **Replaced** with `render`: KPI cards, table body. / 채택 4곳, 대체 2곳을 함께 보여 줍니다.
- The publisher's CSS keeps its raw values and state classes; `CONVERSION.md` lists the token replacements to agree on. / 퍼블리셔 CSS는 그대로 두고 토큰 치환을 제안만 합니다.
- This run found two gaps in the prompt (inline styles, state classes) and they were fixed in the prompt — see the end of `CONVERSION.md`. / 이번 실행으로 프롬프트의 빈틈 두 가지를 찾아 고쳤습니다.

Note: `after/` was made by the maintainers' AI assistant following the prompt step by step. / `after/`는 메인테이너의 AI 어시스턴트가 프롬프트 단계를 따라 만든 것입니다.

## Independent runs / 독립 실행 (2026-09-24, 1.0.0-rc.4)

A separate AI session (Claude Sonnet) got only three kit files — `AGENTS.template.md`, `llms.txt`, `prompt-html-to-vfunc.md` — and `before/`, with no access to this repository or the web. It ran twice: before and after the kit fixes below. / 별도의 AI 세션(Claude Sonnet)에 킷 파일 3개와 `before/`만 주고, 이 저장소와 웹은 볼 수 없게 해서 두 번 실행했습니다(킷 수정 전과 후).

- Both results work: 18 of 18 behaviour checks passed in Chromium, Firefox and WebKit (menu, outside click, sign-out, tabs, search, status filter, empty result, no markup injection, focus kept, no console errors). They took different routes — one re-renders the table, the other hides rows of the published table — and both kept the HTML changes to hook and state attributes, `hidden` and a CSP tag. / 두 결과 모두 세 엔진에서 동작 검사 18개를 통과했습니다. 방식은 달랐고(표 다시 그리기 / 기존 행 숨기기), HTML 변경은 훅·상태 속성, `hidden`, CSP뿐이었습니다.
- Gaps the runs found in the kit, now fixed in both languages / 실행이 찾은 킷의 빈틈(두 언어 모두 수정):
  - the prompt allowed only hook attributes but also asked for `aria-*` / `data-state` / 프롬프트가 훅 속성만 허용하면서 `aria-*`·`data-state`를 요구함
  - `llms.txt` did not say that `vf.attach` takes the options of `vf.vfunc`, where `events` without `id` listen, or how to keep the original element's tag, `id` and classes when replacing it / `vf.attach`의 옵션, `id` 없는 `events`, 대체할 때 원래 태그·`id`·클래스를 지키는 법이 없었음
  - `store.set` merge rules, importing a copied ESM file, and that `vf.html` turns `false` into an empty attribute value (`aria-selected="${on}"` is wrong; write `${on ? 'true' : 'false'}` — both runs had this bug on the inactive tab, which the behaviour checks did not catch) / `store.set` 병합, 복사한 ESM 파일 import, 속성 안의 `false`가 빈 값이 된다는 점(두 실행 모두 비활성 탭에서 이 버그가 있었고, 동작 검사로는 잡히지 않음)
  - adding your own `_name` properties to an instance / 인스턴스에 직접 속성을 붙이지 말 것
- The first run read the library source to fill the `vf.attach` gaps; the second run was not allowed to. / 첫 실행은 빈틈을 메우려고 라이브러리 소스를 읽었고, 두 번째 실행은 금지했습니다.
